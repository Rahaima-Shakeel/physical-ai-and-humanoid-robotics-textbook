# Implementation Plan: Textbook Knowledge Ingestion

**Branch**: `004-content-ingestion` | **Date**: 2025-12-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-content-ingestion/spec.md`

## Summary

Implement a backend content ingestion pipeline that fetches the textbook sitemap, extracts educational content, applies semantic chunking, generates embeddings via Cohere, and stores vectors in Qdrant with metadata in Postgres. This establishes the baseline knowledge base for the RAG chatbot.

## Technical Context

**Language/Version**: Python 3.12+ (FastAPI)
**Primary Dependencies**: `fastapi`, `uv`, `trafilatura` (extraction), `cohere`, `qdrant-client`, `asyncpg` (Postgres).
**Storage**: Neon Postgres (Metadata), Qdrant Cloud (Vectors).
**Testing**: `pytest` for unit/integration tests.
**Processing**: Batch processing with checkpoints (idempotent).
**Performance Goals**: Full ingestion < 10 mins.
**Constraints**: No Docker, use `uv` for deps.

## Constitution Check

*GATE: Passed. Modular structure (`services/*`) and tech stack (FastAPI/Cohere/Qdrant) align with Constitution v2.0.0.*

## Project Structure

### Documentation

```text
specs/004-content-ingestion/
├── plan.md              # This file
└── spec.md              # Feature specification
```

### Source Code

```text
apps/api/
├── routers/
│   └── ingest.py        # ADMIN API trigger endpoint

services/
├── ingest/
│   ├── sitemap.py       # Sitemap parsing & filtering logic
│   ├── crawler.py       # HTML download & Trafilatura extraction
│   ├── chunker.py       # Semantic splitting logic
│   └── manager.py       # Orchestration & Change Detection
├── embeddings/
│   └── client.py        # Cohere wrapper
└── vector-store/
    └── client.py        # Qdrant wrapper

scripts/
└── ingest-content.py    # CLI entry point (wraps service manager)
```

**Structure Decision**: Adopts the modular Service architecture defined in the Constitution to ensure separation of concerns between fetching, processing, and storage.

## Proposed Changes

### Configuration
#### [NEW] [.env.example](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/.env.example)
- Add entries for `COHERE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`.

### Services Layer

#### [NEW] [services/ingest/sitemap.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/ingest/sitemap.py)
- `fetch_sitemap(url)`: Parse XML.
- `filter_urls(urls)`: Apply exclusion rules (`/tags/`, `/authors/`).

#### [NEW] [services/ingest/crawler.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/ingest/crawler.py)
- `download_page(url)`: Requests with retries.
- `extract_content(html)`: Trafilatura logic.

#### [NEW] [services/ingest/chunker.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/ingest/chunker.py)
- `chunk_text(text)`: Semantic splitter (400-600 tokens).
- Handles "Preserve & Oversize" logic for code blocks.

#### [NEW] [services/embeddings/client.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/embeddings/client.py)
- `CohereClient`: Wraps `cohere.Client.embed`.
- Implements batching (96 items limit).

#### [NEW] [services/vector_store/client.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/vector_store/client.py)
- `QdrantService`: Wraps `QdrantClient`.
- `upsert_batch`: Pushes vectors.
- `delete_page`: Removes chunks for a specific URL.

#### [NEW] [services/ingest/manager.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/services/ingest/manager.py)
- `run_ingestion()`: Main workflow.
- Orchestrates: Sitemap -> Filter -> DB Check (Hash) -> Crawl -> Chunk -> Embed -> Store.
- Manages Postgres `content_pages` updates.

### API Layer
#### [NEW] [apps/api/routers/ingest.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/apps/api/routers/ingest.py)
- `POST /ingest`: Triggers `manager.run_ingestion()` in background task.

### Scripts
#### [NEW] [scripts/ingest-content.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%201/humanoid-robotics/scripts/ingest-content.py)
- CLI wrapper for `manager.run_ingestion()`.

## Verification Plan

### Automated Tests
- **Unit Tests**:
  - `tests/unit/test_sitemap.py`: Verify filtering logic excludes `/tags/`.
  - `tests/unit/test_chunker.py`: Verify code blocks are preserved intact.
  - `tests/unit/test_crawler.py`: Verify trafilatura extraction on mock HTML.

- **Integration Tests**:
  - `tests/integration/test_ingest_flow.py`:
           1. run ingestion on mock sitemap.
           2. verify Postgres metadata.
           3. verify Qdrant vectors.
           4. update mock content -> re-run -> verify update.

### Manual Verification
1. **Setup**: `uv sync` to install new deps.
2. **Run CLI**: `uv run python scripts/ingest-content.py` against the real sitemap.
3. **Verify Postgres**: Query `content_pages` to see ~100 rows.
4. **Verify Qdrant**: Check collection count via Qdrant UI/API.
5. **Idempotency**: Run script again -> Verify "0 pages processed" log.
