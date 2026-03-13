"""
Document processing pipeline.
Downloads file -> extracts text -> chunks -> embeds -> stores in pgvector.
"""

import os
import json
import tempfile
import logging
from datetime import datetime

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.services.extractors import extract_text
from app.services.embeddings import chunk_text, generate_embeddings_bulk, count_tokens

logger = logging.getLogger(__name__)
settings = get_settings()


def generate_cuid() -> str:
    """Generate a cuid-like ID compatible with Prisma's cuid()."""
    import time
    import random
    import string
    timestamp = hex(int(time.time() * 1000))[2:]
    random_part = "".join(random.choices(string.ascii_lowercase + string.digits, k=16))
    return f"c{timestamp}{random_part}"


async def download_file(url: str, dest_path: str) -> None:
    """Download a file from URL or S3 to local path."""
    if url.startswith("s3://"):
        import boto3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )
        bucket, key = url[5:].split("/", 1)
        s3.download_file(bucket, key, dest_path)
    elif url.startswith(("http://", "https://")):
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("GET", url) as response:
                response.raise_for_status()
                with open(dest_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)
    elif os.path.isfile(url):
        # Local file path - just use it directly
        import shutil
        shutil.copy2(url, dest_path)
    else:
        raise ValueError(f"Unsupported file URL scheme: {url}")


async def process_document(db: AsyncSession, document_id: str) -> dict:
    """
    Full processing pipeline for a single document:
    1. Download file
    2. Extract text
    3. Chunk text
    4. Generate embeddings (batch)
    5. Store chunks with pgvector embeddings
    """
    # Get document record
    result = await db.execute(
        text('SELECT * FROM "RagDocument" WHERE id = :id'),
        {"id": document_id},
    )
    doc = result.mappings().first()
    if not doc:
        raise ValueError(f"Document {document_id} not found")

    # Update status to processing
    await db.execute(
        text('UPDATE "RagDocument" SET status = :status, "updatedAt" = :now WHERE id = :id'),
        {"status": "processing", "now": datetime.utcnow(), "id": document_id},
    )
    await db.commit()

    try:
        # 1. Download file to temp location
        file_type = doc["fileType"]
        suffix = f".{file_type}"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_path = tmp.name

        try:
            await download_file(doc["fileUrl"], tmp_path)

            # 2. Extract text
            extracted_text, page_count = extract_text(
                tmp_path, file_type, settings.whisper_model
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        if not extracted_text.strip():
            await db.execute(
                text('UPDATE "RagDocument" SET status = :status, error = :error, "updatedAt" = :now WHERE id = :id'),
                {"status": "failed", "error": "No text extracted from document", "now": datetime.utcnow(), "id": document_id},
            )
            await db.commit()
            return {"success": False, "error": "No text extracted", "chunks_created": 0}

        # Get settings from DB
        settings_result = await db.execute(text('SELECT * FROM "RagSettings" LIMIT 1'))
        rag_settings = settings_result.mappings().first()

        chunk_size = rag_settings["chunkSize"] if rag_settings else settings.chunk_size
        chunk_overlap = rag_settings["chunkOverlap"] if rag_settings else settings.chunk_overlap
        embedding_model = rag_settings["embeddingModel"] if rag_settings else settings.embedding_model

        # 3. Delete existing chunks
        await db.execute(
            text('DELETE FROM "RagChunk" WHERE "documentId" = :doc_id'),
            {"doc_id": document_id},
        )

        # 4. Chunk the text
        chunks = chunk_text(extracted_text, chunk_size, chunk_overlap)
        logger.info(f"Document {document_id}: {len(chunks)} chunks from {page_count} pages")

        # 5. Generate embeddings in bulk batches
        embeddings = await generate_embeddings_bulk(
            chunks, model=embedding_model, batch_size=settings.batch_size
        )

        # 6. Store chunks with pgvector embeddings
        for i, (chunk_text_content, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = generate_cuid()
            token_count = count_tokens(chunk_text_content)
            vector_str = f"[{','.join(str(v) for v in embedding)}]"

            await db.execute(
                text("""
                    INSERT INTO "RagChunk" (id, "documentId", content, "chunkIndex", "tokenCount", embedding, embedding_vec, "createdAt")
                    VALUES (:id, :doc_id, :content, :idx, :tokens, :emb_json, CAST(:emb_vec AS vector), :now)
                """),
                {
                    "id": chunk_id,
                    "doc_id": document_id,
                    "content": chunk_text_content,
                    "idx": i,
                    "tokens": token_count,
                    "emb_json": json.dumps(embedding),
                    "emb_vec": vector_str,
                    "now": datetime.utcnow(),
                },
            )

        # 7. Update document status
        await db.execute(
            text("""
                UPDATE "RagDocument"
                SET status = :status, "pageCount" = :pages, error = NULL, "updatedAt" = :now
                WHERE id = :id
            """),
            {"status": "indexed", "pages": page_count, "now": datetime.utcnow(), "id": document_id},
        )
        await db.commit()

        logger.info(f"Document {document_id} indexed: {len(chunks)} chunks")
        return {"success": True, "chunks_created": len(chunks), "page_count": page_count}

    except Exception as e:
        logger.error(f"Document {document_id} processing failed: {e}")
        await db.rollback()
        await db.execute(
            text('UPDATE "RagDocument" SET status = :status, error = :error, "updatedAt" = :now WHERE id = :id'),
            {"status": "failed", "error": str(e)[:500], "now": datetime.utcnow(), "id": document_id},
        )
        await db.commit()
        return {"success": False, "error": str(e), "chunks_created": 0}
