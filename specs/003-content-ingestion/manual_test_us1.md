# Manual Test Procedure: US1 Initial Ingestion

1. **Setup**:
   - Ensure `.env` is populated with valid keys.
   - Run `script/init_db.py` to ensure schema exists.
     ```bash
     uv run python scripts/init_db.py
     ```

2. **Run Ingestion**:
   - Execute the CLI script:
     ```bash
     uv run python scripts/ingest-content.py --url https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/sitemap.xml     ```
   OR checks default config if no URL provided.

3. **Verify Logs**:
   - Look for "Found X URLs".
   - Look for "Upserted X vectors".

4. **Verify Postgres**:
   - Connect to Neon DB.
   - `SELECT COUNT(*) FROM content_pages;` -> Should be > 0.

5. **Verify Qdrant**:
   - Use Qdrant dashboard or CURL.
   - `GET /collections/book_content/points/count` -> Should be > 0.
