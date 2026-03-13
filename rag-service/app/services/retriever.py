"""
RAG retrieval and query service.
Performs vector similarity search using pgvector and generates responses.
"""

import json
import time
import logging
from datetime import datetime

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.services.embeddings import generate_embedding
from app.services.processor import generate_cuid

logger = logging.getLogger(__name__)


async def retrieve_chunks(
    db: AsyncSession,
    query: str,
    top_k: int = 5,
    similarity_threshold: float = 0.7,
    category: str | None = None,
) -> list[dict]:
    """
    Retrieve top-K relevant chunks using pgvector cosine distance.
    Compatible with the existing HNSW index.
    """
    query_embedding = await generate_embedding(query)
    vector_str = f"[{','.join(str(v) for v in query_embedding)}]"
    distance_threshold = 1 - similarity_threshold

    # Build query with optional category filter
    category_filter = ""
    params = {
        "vec": vector_str,
        "threshold": distance_threshold,
        "limit": top_k,
    }

    if category:
        category_filter = 'AND d.category = :category'
        params["category"] = category

    result = await db.execute(
        text(f"""
            SELECT
                c.id, c."documentId", c.content, c."chunkIndex",
                c."tokenCount", c.metadata,
                (c.embedding_vec <=> CAST(:vec AS vector)) as distance,
                d.title as "docTitle", d.category as "docCategory"
            FROM "RagChunk" c
            JOIN "RagDocument" d ON d.id = c."documentId"
            WHERE c.embedding_vec IS NOT NULL
                AND (c.embedding_vec <=> CAST(:vec AS vector)) <= :threshold
                {category_filter}
            ORDER BY c.embedding_vec <=> CAST(:vec AS vector)
            LIMIT :limit
        """),
        params,
    )

    rows = result.mappings().all()
    return [
        {
            "id": row["id"],
            "documentId": row["documentId"],
            "content": row["content"],
            "chunkIndex": row["chunkIndex"],
            "tokenCount": row["tokenCount"],
            "metadata": row["metadata"],
            "similarity": 1 - float(row["distance"]),
            "document": {
                "title": row["docTitle"],
                "category": row["docCategory"],
            },
        }
        for row in rows
    ]


async def rag_query(
    db: AsyncSession,
    user_query: str,
    user_id: str | None = None,
    category: str | None = None,
) -> dict:
    """
    Full RAG query: retrieve context chunks, generate response with OpenAI.
    Matches the existing Next.js ragQuery() function behavior.
    """
    start = time.time()

    # Get active prompt and settings from DB
    prompt_result = await db.execute(
        text('SELECT * FROM "RagPrompt" WHERE "isActive" = true LIMIT 1')
    )
    active_prompt = prompt_result.mappings().first()

    settings_result = await db.execute(text('SELECT * FROM "RagSettings" LIMIT 1'))
    rag_settings = settings_result.mappings().first()

    top_k = rag_settings["retrievalLimit"] if rag_settings else 5
    threshold = rag_settings["similarityThreshold"] if rag_settings else 0.7
    model = rag_settings["chatModel"] if rag_settings else "gpt-4"
    temperature = rag_settings["temperature"] if rag_settings else 0.7
    max_tokens = rag_settings["maxTokens"] if rag_settings else 2000

    system_prompt = (
        active_prompt["systemPrompt"]
        if active_prompt
        else "You are a psychiatric clinical co-pilot. Use the provided context to answer questions accurately. If the context doesn't contain relevant information, say so."
    )

    # Retrieve relevant chunks
    chunks = await retrieve_chunks(db, user_query, top_k, threshold, category)

    context = "\n\n---\n\n".join(
        f"[Source {i + 1}: {c['document']['title']}]\n{c['content']}"
        for i, c in enumerate(chunks)
    )

    # Generate response
    messages = [
        {"role": "system", "content": f"{system_prompt}\n\n## Relevant Context:\n{context}"},
        {"role": "user", "content": user_query},
    ]

    client = AsyncOpenAI(api_key=get_settings().openai_api_key)
    completion = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    response = completion.choices[0].message.content or ""
    latency_ms = int((time.time() - start) * 1000)
    tokens_used = completion.usage.total_tokens if completion.usage else 0

    # Log the query
    await db.execute(
        text("""
            INSERT INTO "RagQueryLog" (id, query, response, "chunksUsed", "latencyMs", "tokensUsed", "userId", "createdAt")
            VALUES (:id, :query, :response, :chunks, :latency, :tokens, :user_id, :now)
        """),
        {
            "id": generate_cuid(),
            "query": user_query,
            "response": response,
            "chunks": len(chunks),
            "latency": latency_ms,
            "tokens": tokens_used,
            "user_id": user_id,
            "now": datetime.utcnow(),
        },
    )
    await db.commit()

    return {
        "response": response,
        "chunks_used": len(chunks),
        "latency_ms": latency_ms,
        "tokens_used": tokens_used,
        "sources": [
            {
                "title": c["document"]["title"],
                "category": c["document"]["category"],
                "similarity": round(c["similarity"], 4),
                "chunk_index": c["chunkIndex"],
            }
            for c in chunks
        ],
    }
