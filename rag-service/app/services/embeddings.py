"""
Chunking and embedding pipeline.
Handles batch embedding generation for high-volume document processing.
"""

import asyncio
import logging
from typing import Optional

import tiktoken
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _get_client():
    return AsyncOpenAI(api_key=get_settings().openai_api_key)


def count_tokens(text: str, model: str = "text-embedding-3-small") -> int:
    """Count tokens in text using tiktoken."""
    try:
        enc = tiktoken.encoding_for_model(model)
    except KeyError:
        enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
) -> list[str]:
    """
    Split text into chunks of roughly `chunk_size` tokens with overlap.
    Uses word-based splitting (1 token ~ 0.75 words) matching the existing JS logic.
    """
    words = text.split()
    if not words:
        return []

    words_per_chunk = max(1, round(chunk_size * 0.75))
    overlap_words = max(0, round(chunk_overlap * 0.75))
    chunks: list[str] = []

    i = 0
    while i < len(words):
        end = min(i + words_per_chunk, len(words))
        chunk = " ".join(words[i:end])
        if chunk.strip():
            chunks.append(chunk)
        i = end - overlap_words
        if i >= len(words) - overlap_words:
            if end < len(words):
                tail = " ".join(words[end - overlap_words:])
                if tail.strip():
                    chunks.append(tail)
            break

    return chunks


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def generate_embedding(
    text: str,
    model: Optional[str] = None,
) -> list[float]:
    """Generate embedding for a single text string."""
    settings = get_settings()
    model = model or settings.embedding_model
    client = _get_client()
    response = await client.embeddings.create(
        model=model,
        input=text.replace("\n", " ").strip(),
    )
    return response.data[0].embedding


async def generate_embeddings_batch(
    texts: list[str],
    model: Optional[str] = None,
    max_concurrent: Optional[int] = None,
) -> list[list[float]]:
    """
    Generate embeddings for a batch of texts with concurrency control.
    """
    settings = get_settings()
    model = model or settings.embedding_model
    max_concurrent = max_concurrent or settings.max_concurrent_embeddings
    semaphore = asyncio.Semaphore(max_concurrent)

    async def _embed_one(text: str) -> list[float]:
        async with semaphore:
            return await generate_embedding(text, model)

    embeddings = await asyncio.gather(
        *[_embed_one(t) for t in texts],
        return_exceptions=True,
    )

    results = []
    for i, emb in enumerate(embeddings):
        if isinstance(emb, Exception):
            logger.error(f"Embedding failed for chunk {i}: {emb}")
            results.append([0.0] * settings.embedding_dimensions)
        else:
            results.append(emb)

    return results


async def generate_embeddings_bulk(
    texts: list[str],
    model: Optional[str] = None,
    batch_size: int = 100,
) -> list[list[float]]:
    """
    Process embeddings in batches using OpenAI's batch API.
    Better for very large document sets (thousands of chunks).
    """
    settings = get_settings()
    model = model or settings.embedding_model
    client = _get_client()
    all_embeddings: list[list[float]] = []

    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]
        cleaned = [t.replace("\n", " ").strip() for t in batch]

        try:
            response = await client.embeddings.create(
                model=model,
                input=cleaned,
            )
            batch_embeddings = [d.embedding for d in response.data]
            all_embeddings.extend(batch_embeddings)
        except Exception as e:
            logger.error(f"Batch embedding failed at offset {start}: {e}")
            individual = await generate_embeddings_batch(batch, model)
            all_embeddings.extend(individual)

        logger.info(f"Embedded {min(start + batch_size, len(texts))}/{len(texts)} chunks")

    return all_embeddings
