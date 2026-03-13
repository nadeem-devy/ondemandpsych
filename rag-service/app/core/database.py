from functools import lru_cache

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_engine():
    settings = get_settings()
    return create_async_engine(
        settings.database_url,
        echo=False,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
    )


@lru_cache
def get_session_maker():
    return async_sessionmaker(get_engine(), class_=AsyncSession, expire_on_commit=False)


# Alias for imports in workers
def async_session():
    return get_session_maker()()


async def get_db() -> AsyncSession:
    session = get_session_maker()()
    try:
        yield session
    finally:
        await session.close()
