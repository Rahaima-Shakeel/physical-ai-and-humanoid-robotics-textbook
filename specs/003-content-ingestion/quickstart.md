# Quickstart: Content Ingestion

## Prerequisites

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in:
   - `COHERE_API_KEY`
   - `QDRANT_URL` & `QDRANT_API_KEY`
   - `NEON_DATABASE_URL`

2. **Dependencies**:
   ```bash
   uv sync
   ```

3. **Initialize Database**:
   ```bash
   uv run python scripts/init_db.py
   ```

## CLI Usage

**Ingest from default sitemap**:
```bash
uv run python scripts/ingest-content.py
```

**Force re-ingestion (ignore hash)**:
```bash
uv run python scripts/ingest-content.py --force
```

**Custom Sitemap**:
```bash
uv run python scripts/ingest-content.py --url https://example.com/sitemap.xml
```

## API Usage

Start the API server:
```bash
uv run fastapi dev apps/api/main.py
```

Trigger Ingestion:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/ingest" \
     -H "Content-Type: application/json" \
     -d '{"force": false}'
```

## Testing

Run unit tests:
```bash
uv run pytest tests/unit
```
