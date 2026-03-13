"""
RAG query and retrieval API endpoints.
"""

import logging
import traceback
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.retriever import rag_query, retrieve_chunks

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["Query"])


class QueryRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    category: Optional[str] = None
    top_k: Optional[int] = None
    similarity_threshold: Optional[float] = None


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    similarity_threshold: float = 0.7
    category: Optional[str] = None


@router.post("/")
async def query_rag(request: QueryRequest, db: AsyncSession = Depends(get_db)):
    """
    Full RAG query: retrieves context from knowledge base and generates a response.
    This is the main endpoint consumed by the Next.js copilot chat.
    """
    if not request.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    result = await rag_query(
        db,
        user_query=request.query,
        user_id=request.user_id,
        category=request.category,
    )

    return result


@router.post("/search")
async def search_chunks(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    """
    Search for relevant chunks without generating a response.
    Useful for debugging and testing retrieval quality.
    """
    if not request.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    try:
        chunks = await retrieve_chunks(
            db,
            query=request.query,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold,
            category=request.category,
        )

        return {
            "query": request.query,
            "results": len(chunks),
            "chunks": chunks,
        }
    except Exception as e:
        logger.error(f"Search error: {traceback.format_exc()}")
        raise HTTPException(500, detail=str(e))
