# Configurable Multi-Source Ingestion Plan

**Feature Branch**: `007-configurable-ingestion`
**Status**: Draft

## User Review Required

> [!IMPORTANT]
> **Environment Variables**: New variables `QDRANT_COLLECTION`, `SITEMAP_URL`, `COHERE_EMBED_MODEL`, and `DB_TABLE_CONTENT_PAGES` will be added. Ensure these are set in your production environment before deploying.

> [!WARNING]
> **Data Separation**: This change intentionally separates new ingestion into a *new* collection. Old data will not be migrated automatically. The application will query the collection defined in `QDRANT_COLLECTION`.

## Proposed Changes

### Configuration
#### [MODIFY] [.env.template](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/backend/.env)
- Add templates for new configuration variables with safe defaults.

### Backend Services

#### [MODIFY] [client.py](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/backend/services/vector_store/client.py)
- Update `QdrantService` `__init__`:
    - Read `collection_name` from `QDRANT_COLLECTION` env var (default: `book_content`).
    - Allow overriding `collection_name` via constructor argument.

#### [MODIFY] [client.py](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/backend/services/embeddings/client.py)
- Update `CohereClient` `__init__`:
    - Read `model` from `COHERE_EMBED_MODEL` env var (default: `embed-english-light-v3.0`).

#### [MODIFY] [retrieval.py](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/backend/services/query/retrieval.py)
- Update `QueryService.initialize`:
    - Use `QDRANT_COLLECTION` and `COHERE_EMBED_MODEL` env vars to configure clients.
    - Consistency with Ingestion settings is key.

#### [MODIFY] [manager.py](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/backend/services/ingest/manager.py)
- Update `run_ingestion` signature to accept `sitemap_url` (optional, default to env var).
- Update SQL queries to use dynamic table name from `DB_TABLE_CONTENT_PAGES` env var.
- **Safety**: Use string replacement for table names (parameterized queries don't work for identifiers) but validation/sanitization is assumed via controlled env vars.

## Verification Plan

### Automated Tests
- Create `tests/test_config_loading.py`:
    - access `QdrantService` and `CohereClient` with specific env mocks to ensure they pick up the values.

### Manual Verification
1. **Config Setup**:
   - Update `.env`:
     ```bash
     SITEMAP_URL=https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/sitemap.xml     QDRANT_COLLECTION=robotics_textbook_v2
     DB_TABLE_CONTENT_PAGES=content_pages_v2
     ```
2. **Run Ingestion**:
   - Run `python scripts/ingest.py` (assuming wrapper exists or we invoke manager directly).
   - Observe logs for "Ingesting from https://... into robotics_textbook_v2".
3. **Verify Retrieval**:
   - Start backend: `uvicorn main:app`
   - Send query via Swagger/Chat: "What is physical AI?"
   - Verify logs show search in `robotics_textbook_v2`.
