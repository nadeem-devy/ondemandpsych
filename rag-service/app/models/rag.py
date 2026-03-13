"""
SQLAlchemy models matching the existing Prisma schema tables:
RagDocument, RagChunk, RagPrompt, RagSettings, RagQueryLog
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index
)
from pgvector.sqlalchemy import Vector
from app.core.database import Base


class RagDocument(Base):
    __tablename__ = "RagDocument"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    fileType = Column(String, nullable=False)  # pdf, pptx, video, docx, txt
    fileUrl = Column(String, nullable=False)
    fileSize = Column(Integer, default=0)
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending | processing | indexed | failed
    pageCount = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("RagDocument_status_idx", "status"),
        Index("RagDocument_category_idx", "category"),
    )


class RagChunk(Base):
    __tablename__ = "RagChunk"

    id = Column(String, primary_key=True)
    documentId = Column(String, ForeignKey("RagDocument.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    chunkIndex = Column(Integer, nullable=False)
    tokenCount = Column(Integer, default=0)
    metadata = Column(Text, nullable=True)  # JSON blob
    embedding = Column(Text, nullable=True)  # JSON fallback
    embedding_vec = Column(Vector(1536), nullable=True)  # pgvector native
    createdAt = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("RagChunk_documentId_idx", "documentId"),
    )


class RagPrompt(Base):
    __tablename__ = "RagPrompt"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    systemPrompt = Column(Text, nullable=False)
    temperature = Column(Float, default=0.7)
    model = Column(String, default="gpt-4")
    isActive = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RagSettings(Base):
    __tablename__ = "RagSettings"

    id = Column(String, primary_key=True)
    retrievalLimit = Column(Integer, default=5)
    chunkSize = Column(Integer, default=500)
    chunkOverlap = Column(Integer, default=50)
    similarityThreshold = Column(Float, default=0.7)
    embeddingModel = Column(String, default="text-embedding-3-small")
    chatModel = Column(String, default="gpt-4")
    temperature = Column(Float, default=0.7)
    maxTokens = Column(Integer, default=2000)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RagQueryLog(Base):
    __tablename__ = "RagQueryLog"

    id = Column(String, primary_key=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    chunksUsed = Column(Integer, default=0)
    latencyMs = Column(Integer, default=0)
    tokensUsed = Column(Integer, default=0)
    userId = Column(String, nullable=True)
    feedback = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("RagQueryLog_createdAt_idx", "createdAt"),
        Index("RagQueryLog_userId_idx", "userId"),
    )
