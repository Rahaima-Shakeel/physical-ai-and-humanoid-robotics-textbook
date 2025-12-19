# Manual Test Procedure: Content Ingestion (US1 & US2)

## Prerequisites
- [x] `.env` populated with valid keys.
- [x] Database initialized (`uv run python scripts/init_db.py`).

## Test Case 1: Initial Ingestion (US1)
1. **Run**: `uv run python scripts/ingest-content.py`
2. **Expect**:
   - Logs show "Found X URLs".
   - Logs show "Upserted X vectors" for each page.
   - DB `content_pages` count > 0.
   - Qdrant collection `book_content` count > 0.

## Test Case 2: Idempotency / No Changess (US2)
1. **Run**: `uv run python scripts/ingest-content.py` (Same command again)
2. **Expect**:
   - Logs should (mostly) say "Skipping ... Content unchanged." for all pages.
   - Execution time should be much faster.
   - DB `last_ingested_at` should NOT change for skipped pages.

## Test Case 3: Force Re-ingestion (US2)
1. **Run**: `uv run python scripts/ingest-content.py --force`
2. **Expect**:
   - Logs show "Content changed or forced... Re-ingesting."
   - All vectors are re-upserted.
   - DB `last_ingested_at` IS updated.

## Test Case 4: Content Change Simulation (Optional)
1. Manually update a row in `content_pages` to change `content_hash` to 'dummy'.
2. Run ingestion without `--force`.
3. Expect that specific page to be re-ingested.
