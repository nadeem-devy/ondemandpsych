"""
OnDemandPsych RAG Service - FastAPI Application
Handles document ingestion, embedding, and retrieval for the psychiatric copilot.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.documents import router as documents_router
from app.api.query import router as query_router
from app.api.health import router as health_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger(__name__).info("RAG Service starting up")
    yield
    logging.getLogger(__name__).info("RAG Service shutting down")


app = FastAPI(
    title="OnDemandPsych RAG Service",
    description="Document ingestion, embedding, and retrieval for the psychiatric clinical copilot",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ondemandpsych.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(documents_router, prefix="/api")
app.include_router(query_router, prefix="/api")
