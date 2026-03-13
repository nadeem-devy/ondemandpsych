"""Health check and stats endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check with DB connectivity test."""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {"status": "ok", "database": db_status}


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get RAG system statistics."""
    docs = await db.execute(
        text("""
            SELECT status, COUNT(*) as count
            FROM "RagDocument"
            GROUP BY status
        """)
    )
    doc_stats = {row["status"]: row["count"] for row in docs.mappings().all()}

    chunks = await db.execute(text('SELECT COUNT(*) FROM "RagChunk"'))
    chunk_count = chunks.scalar()

    embedded = await db.execute(
        text('SELECT COUNT(*) FROM "RagChunk" WHERE embedding_vec IS NOT NULL')
    )
    embedded_count = embedded.scalar()

    queries = await db.execute(text('SELECT COUNT(*) FROM "RagQueryLog"'))
    query_count = queries.scalar()

    return {
        "documents": doc_stats,
        "total_documents": sum(doc_stats.values()),
        "total_chunks": chunk_count,
        "embedded_chunks": embedded_count,
        "total_queries": query_count,
    }
