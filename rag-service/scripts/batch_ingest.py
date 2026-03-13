"""
Batch ingestion script for loading large document sets.
Usage:
    python scripts/batch_ingest.py /path/to/documents --category "clinical-guidelines"
    python scripts/batch_ingest.py /path/to/pdfs --category "pdfs" --extensions pdf
    python scripts/batch_ingest.py /path/to/videos --category "videos" --extensions mp4,mov,avi
"""

import os
import sys
import asyncio
import argparse
import logging
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session
from app.services.processor import process_document, generate_cuid
from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {
    "pdf", "pptx", "ppt", "docx", "doc", "txt", "csv",
    "mp4", "avi", "mov", "mkv", "webm", "mp3", "wav", "m4a",
}


async def ingest_directory(
    directory: str,
    category: str | None = None,
    tags: str | None = None,
    extensions: set[str] | None = None,
    max_concurrent: int = 3,
):
    """Scan a directory and ingest all supported documents."""
    dir_path = Path(directory)
    if not dir_path.is_dir():
        logger.error(f"Directory not found: {directory}")
        return

    # Collect files
    allowed = extensions or SUPPORTED_EXTENSIONS
    files = []
    for ext in allowed:
        files.extend(dir_path.rglob(f"*.{ext}"))
        files.extend(dir_path.rglob(f"*.{ext.upper()}"))

    # Deduplicate
    files = sorted(set(files))
    logger.info(f"Found {len(files)} files to ingest in {directory}")

    if not files:
        logger.warning("No supported files found")
        return

    # Track progress
    total = len(files)
    success = 0
    failed = 0
    skipped = 0

    semaphore = asyncio.Semaphore(max_concurrent)

    async def process_file(file_path: Path):
        nonlocal success, failed, skipped

        async with semaphore:
            ext = file_path.suffix.lstrip(".").lower()
            file_size = file_path.stat().st_size
            title = file_path.name

            async with async_session() as db:
                # Check if already ingested (by title match)
                existing = await db.execute(
                    text('SELECT id, status FROM "RagDocument" WHERE title = :title'),
                    {"title": title},
                )
                row = existing.mappings().first()

                if row and row["status"] == "indexed":
                    logger.info(f"SKIP (already indexed): {title}")
                    skipped += 1
                    return

                # Delete failed previous attempt
                if row:
                    await db.execute(
                        text('DELETE FROM "RagChunk" WHERE "documentId" = :id'),
                        {"id": row["id"]},
                    )
                    await db.execute(
                        text('DELETE FROM "RagDocument" WHERE id = :id'),
                        {"id": row["id"]},
                    )

                doc_id = generate_cuid()

                await db.execute(
                    text("""
                        INSERT INTO "RagDocument" (id, title, "fileType", "fileUrl", "fileSize", category, tags, status, "createdAt", "updatedAt")
                        VALUES (:id, :title, :type, :url, :size, :category, :tags, :status, :now, :now)
                    """),
                    {
                        "id": doc_id,
                        "title": title,
                        "type": ext,
                        "url": str(file_path.absolute()),
                        "size": file_size,
                        "category": category,
                        "tags": tags,
                        "status": "pending",
                        "now": datetime.utcnow(),
                    },
                )
                await db.commit()

                try:
                    result = await process_document(db, doc_id)
                    if result["success"]:
                        success += 1
                        logger.info(
                            f"OK [{success + failed}/{total}]: {title} "
                            f"({result['chunks_created']} chunks)"
                        )
                    else:
                        failed += 1
                        logger.error(f"FAIL [{success + failed}/{total}]: {title} - {result.get('error')}")
                except Exception as e:
                    failed += 1
                    logger.error(f"FAIL [{success + failed}/{total}]: {title} - {e}")

    # Process all files
    await asyncio.gather(*[process_file(f) for f in files])

    logger.info(f"\n{'='*60}")
    logger.info(f"Batch ingestion complete:")
    logger.info(f"  Total files: {total}")
    logger.info(f"  Success: {success}")
    logger.info(f"  Failed: {failed}")
    logger.info(f"  Skipped: {skipped}")
    logger.info(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description="Batch ingest documents into RAG system")
    parser.add_argument("directory", help="Path to directory containing documents")
    parser.add_argument("--category", help="Category tag for all documents")
    parser.add_argument("--tags", help="Comma-separated tags")
    parser.add_argument("--extensions", help="Comma-separated file extensions to process (e.g. pdf,pptx)")
    parser.add_argument("--concurrent", type=int, default=3, help="Max concurrent processing (default: 3)")

    args = parser.parse_args()

    extensions = None
    if args.extensions:
        extensions = {e.strip().lower() for e in args.extensions.split(",")}

    asyncio.run(
        ingest_directory(
            args.directory,
            category=args.category,
            tags=args.tags,
            extensions=extensions,
            max_concurrent=args.concurrent,
        )
    )


if __name__ == "__main__":
    main()
