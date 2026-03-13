"""
Document upload and management API endpoints.
Handles file upload, S3 storage, and triggers background processing.
"""

import os
import logging
from datetime import datetime
from typing import Optional

import boto3
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.services.processor import generate_cuid, process_document

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/documents", tags=["Documents"])


def upload_to_s3(file_path: str, s3_key: str) -> str:
    """Upload file to S3 and return the URL."""
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )
    s3.upload_file(file_path, settings.s3_bucket, s3_key)
    return f"s3://{settings.s3_bucket}/{s3_key}"


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    process_now: bool = Form(True),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a document (PDF, PPTX, DOCX, video) for RAG indexing.
    - Saves to S3 (or local temp)
    - Creates RagDocument record
    - Optionally triggers immediate processing or queues via Celery
    """
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    # Determine file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    supported = {"pdf", "pptx", "ppt", "docx", "doc", "txt", "csv",
                 "mp4", "avi", "mov", "mkv", "webm", "mp3", "wav", "m4a"}
    if ext not in supported:
        raise HTTPException(400, f"Unsupported file type: .{ext}. Supported: {', '.join(sorted(supported))}")

    # Save file temporarily
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        file_size = len(content)
        doc_title = title or file.filename

        # Upload to S3 if configured, otherwise use local path
        if settings.aws_access_key_id and settings.s3_bucket:
            doc_id = generate_cuid()
            s3_key = f"rag-documents/{doc_id}/{file.filename}"
            file_url = upload_to_s3(tmp_path, s3_key)
        else:
            doc_id = generate_cuid()
            # For local dev, keep the temp file
            import shutil
            local_dir = os.path.join(os.getcwd(), "uploads", doc_id)
            os.makedirs(local_dir, exist_ok=True)
            local_path = os.path.join(local_dir, file.filename)
            shutil.move(tmp_path, local_path)
            file_url = local_path
            tmp_path = None  # Don't delete, we moved it

        # Create document record
        await db.execute(
            text("""
                INSERT INTO "RagDocument" (id, title, "fileType", "fileUrl", "fileSize", category, tags, status, "createdAt", "updatedAt")
                VALUES (:id, :title, :type, :url, :size, :category, :tags, :status, :now, :now)
            """),
            {
                "id": doc_id,
                "title": doc_title,
                "type": ext,
                "url": file_url,
                "size": file_size,
                "category": category,
                "tags": tags,
                "status": "pending",
                "now": datetime.utcnow(),
            },
        )
        await db.commit()

        # Process document
        if process_now:
            try:
                result = await process_document(db, doc_id)
                return {
                    "id": doc_id,
                    "title": doc_title,
                    "status": "indexed" if result["success"] else "failed",
                    **result,
                }
            except Exception as e:
                logger.error(f"Processing failed: {e}")
                return {
                    "id": doc_id,
                    "title": doc_title,
                    "status": "failed",
                    "error": str(e),
                }
        else:
            # Queue for background processing via Celery
            try:
                from app.workers.celery_app import process_document_task
                task = process_document_task.delay(doc_id)
                return {
                    "id": doc_id,
                    "title": doc_title,
                    "status": "queued",
                    "task_id": task.id,
                }
            except Exception:
                # Celery not available, process inline
                result = await process_document(db, doc_id)
                return {"id": doc_id, "title": doc_title, **result}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.post("/upload-batch")
async def upload_batch(
    files: list[UploadFile] = File(...),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload multiple documents for batch processing.
    All files are queued for background processing via Celery.
    """
    results = []
    doc_ids = []

    for file in files:
        if not file.filename:
            continue

        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

        import tempfile
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            doc_id = generate_cuid()
            file_size = len(content)

            if settings.aws_access_key_id and settings.s3_bucket:
                s3_key = f"rag-documents/{doc_id}/{file.filename}"
                file_url = upload_to_s3(tmp_path, s3_key)
            else:
                local_dir = os.path.join(os.getcwd(), "uploads", doc_id)
                os.makedirs(local_dir, exist_ok=True)
                local_path = os.path.join(local_dir, file.filename)
                import shutil
                shutil.move(tmp_path, local_path)
                file_url = local_path
                tmp_path = None

            await db.execute(
                text("""
                    INSERT INTO "RagDocument" (id, title, "fileType", "fileUrl", "fileSize", category, tags, status, "createdAt", "updatedAt")
                    VALUES (:id, :title, :type, :url, :size, :category, :tags, :status, :now, :now)
                """),
                {
                    "id": doc_id,
                    "title": file.filename,
                    "type": ext,
                    "url": file_url,
                    "size": file_size,
                    "category": category,
                    "tags": tags,
                    "status": "pending",
                    "now": datetime.utcnow(),
                },
            )

            doc_ids.append(doc_id)
            results.append({"id": doc_id, "title": file.filename, "status": "queued"})

        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)

    await db.commit()

    # Queue all for background processing
    try:
        from app.workers.celery_app import process_document_task
        for doc_id in doc_ids:
            process_document_task.delay(doc_id)
    except Exception:
        # Celery not available - process inline
        for doc_id in doc_ids:
            await process_document(db, doc_id)

    return {"uploaded": len(results), "documents": results}


@router.get("/")
async def list_documents(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List all RAG documents with optional filters."""
    offset = (page - 1) * limit
    conditions = []
    params: dict = {"limit": limit, "offset": offset}

    if status:
        conditions.append('"status" = :status')
        params["status"] = status
    if category:
        conditions.append('"category" = :category')
        params["category"] = category

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    count_result = await db.execute(
        text(f'SELECT COUNT(*) as total FROM "RagDocument" {where}'),
        params,
    )
    total = count_result.scalar()

    result = await db.execute(
        text(f'''
            SELECT id, title, "fileType", "fileSize", category, tags, status, "pageCount", error, "createdAt", "updatedAt"
            FROM "RagDocument" {where}
            ORDER BY "createdAt" DESC
            LIMIT :limit OFFSET :offset
        '''),
        params,
    )

    docs = [dict(row) for row in result.mappings().all()]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "documents": docs,
    }


@router.get("/{document_id}")
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single document with its chunk count."""
    result = await db.execute(
        text('SELECT * FROM "RagDocument" WHERE id = :id'),
        {"id": document_id},
    )
    doc = result.mappings().first()
    if not doc:
        raise HTTPException(404, "Document not found")

    chunk_count = await db.execute(
        text('SELECT COUNT(*) FROM "RagChunk" WHERE "documentId" = :id'),
        {"id": document_id},
    )

    return {**dict(doc), "chunk_count": chunk_count.scalar()}


@router.post("/{document_id}/reprocess")
async def reprocess_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Re-process a document (re-extract, re-chunk, re-embed)."""
    result = await db.execute(
        text('SELECT id FROM "RagDocument" WHERE id = :id'),
        {"id": document_id},
    )
    if not result.first():
        raise HTTPException(404, "Document not found")

    try:
        from app.workers.celery_app import process_document_task
        task = process_document_task.delay(document_id)
        return {"status": "queued", "task_id": task.id}
    except Exception:
        result = await process_document(db, document_id)
        return result


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and all its chunks."""
    result = await db.execute(
        text('SELECT id FROM "RagDocument" WHERE id = :id'),
        {"id": document_id},
    )
    if not result.first():
        raise HTTPException(404, "Document not found")

    await db.execute(
        text('DELETE FROM "RagChunk" WHERE "documentId" = :id'),
        {"id": document_id},
    )
    await db.execute(
        text('DELETE FROM "RagDocument" WHERE id = :id'),
        {"id": document_id},
    )
    await db.commit()

    return {"deleted": True}
