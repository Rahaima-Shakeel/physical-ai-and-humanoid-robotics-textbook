# Quickstart: Retrieval Validation

**Goal**: Verify that content ingestion worked and the system can retrieve relevant chunks.

## Prerequisites

- **Environment**:
  - `QDRANT_URL` and `QDRANT_API_KEY` set
  - `COHERE_API_KEY` set
  - `NEON_DATABASE_URL` set (optional for pure vector test, but good for robust env)
- **Deps**: `uv sync` must be run.

## 1. Run Via CLI Script

The fastest way to test.

```bash
# From project root
uv run python scripts/validate_retrieval.py "What is zero moment point?"
```

**Options**:
```bash
# Limit results
uv run python scripts/validate_retrieval.py "servo motor" --top-k 3

# Set threshold
uv run python scripts/validate_retrieval.py "random noise" --threshold 0.8
```

## 2. Run Via API

If the server is running.

1. Start API:
   ```bash
   cd apps/api
   uv run uvicorn main:app
   ```

2. Send Request:
   ```bash
   curl -X POST http://localhost:8000/api/query/validate \
     -H "Content-Type: application/json" \
     -d '{"query_text": "humanoid robot definition", "top_k": 2}'
   ```
