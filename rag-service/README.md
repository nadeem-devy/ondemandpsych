# OnDemandPsych RAG Service

Python/FastAPI backend for document ingestion, embedding, and retrieval. Connects to the same Neon PostgreSQL database (pgvector) as the Next.js app.

## Architecture

```
rag-service/
├── app/
│   ├── api/           # FastAPI route handlers
│   │   ├── documents.py   # Upload, list, delete documents
│   │   ├── query.py       # RAG query & vector search
│   │   └── health.py      # Health check & stats
│   ├── core/          # Config & database
│   ├── models/        # SQLAlchemy models (matches Prisma schema)
│   ├── services/      # Business logic
│   │   ├── extractors.py  # PDF, PPT, Video text extraction
│   │   ├── embeddings.py  # Chunking & OpenAI embedding
│   │   ├── processor.py   # Full document processing pipeline
│   │   └── retriever.py   # pgvector search & RAG query
│   └── workers/       # Celery background tasks
├── scripts/
│   └── batch_ingest.py    # Bulk document loader
├── Dockerfile
├── Dockerfile.worker
└── docker-compose.yml
```

## Quick Start (Local Development)

```bash
cd rag-service

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL and OpenAI key

# Run the API server
uvicorn app.main:app --reload --port 8000

# API docs available at http://localhost:8000/docs
```

## Docker Start

```bash
cd rag-service

# Copy and configure env
cp .env.example .env

# Start all services (API + Worker + Redis)
docker compose up -d

# Check logs
docker compose logs -f rag-api
```

## Batch Ingestion (2K PDFs, 5K PPTs, 1.5K Videos)

```bash
# Ingest all PDFs from a directory
python scripts/batch_ingest.py /path/to/pdfs --category "clinical-pdfs" --extensions pdf

# Ingest all PowerPoints
python scripts/batch_ingest.py /path/to/ppts --category "presentations" --extensions pptx,ppt

# Ingest videos (requires ffmpeg + whisper)
python scripts/batch_ingest.py /path/to/videos --category "video-lectures" --extensions mp4,mov

# Ingest everything from one directory
python scripts/batch_ingest.py /path/to/all-docs --category "knowledge-base"

# Control concurrency (default: 3)
python scripts/batch_ingest.py /path/to/docs --concurrent 5
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload single document
- `POST /api/documents/upload-batch` - Upload multiple documents
- `GET /api/documents/` - List documents (with filters)
- `GET /api/documents/{id}` - Get document details
- `POST /api/documents/{id}/reprocess` - Re-index a document
- `DELETE /api/documents/{id}` - Delete document

### Query
- `POST /api/query/` - Full RAG query (retrieve + generate response)
- `POST /api/query/search` - Vector similarity search only

### Health
- `GET /health` - Health check
- `GET /stats` - System statistics

## Integration with Next.js Copilot

The Next.js app can call this service instead of the built-in RAG:

```typescript
// In your copilot messages route, call the FastAPI service:
const ragResponse = await fetch('http://localhost:8000/api/query/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userMessage, user_id: userId }),
});
const { response, sources } = await ragResponse.json();
```

## AWS ECS Deployment

1. Push Docker images to ECR
2. Create ECS task definitions for `rag-api` and `rag-worker`
3. Set up an ALB pointing to the `rag-api` service
4. Add ElastiCache Redis for Celery broker
5. Set environment variables in ECS task definition

## Prerequisites for Video Processing

```bash
# macOS
brew install ffmpeg

# Linux
apt-get install ffmpeg
```
