"""
Celery worker for background document processing.
Optional - only used when Redis + Celery are available.
Falls back to inline processing when not configured.
"""

import asyncio
import logging

logger = logging.getLogger(__name__)

try:
    from celery import Celery
    from app.core.config import get_settings

    settings = get_settings()

    celery_app = Celery(
        "rag_worker",
        broker=settings.redis_url,
        backend=settings.redis_url,
    )

    celery_app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        task_track_started=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        task_soft_time_limit=1800,
        task_time_limit=3600,
    )

    def run_async(coro):
        """Run async function in sync context for Celery."""
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    @celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
    def process_document_task(self, document_id: str):
        """Celery task to process a single document."""
        from app.core.database import get_session_maker
        from app.services.processor import process_document

        async def _process():
            async with get_session_maker()() as db:
                return await process_document(db, document_id)

        try:
            result = run_async(_process())
            return result
        except Exception as exc:
            logger.error(f"Task failed for document {document_id}: {exc}")
            raise self.retry(exc=exc)

    CELERY_AVAILABLE = True

except ImportError:
    CELERY_AVAILABLE = False
    celery_app = None
    process_document_task = None
    logger.info("Celery not installed - background processing disabled, using inline processing")
