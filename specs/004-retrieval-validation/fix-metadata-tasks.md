# Tasks: Fix Metadata Ingestion

**Goal**: Populate `page_title` and `section_header` (if possible) in Qdrant payload.

- [x] T101 Update `services/ingest/crawler.py` to return a `Content` object (text, title, meta).
- [x] T102 Update `services/ingest/manager.py` to use `Content` object and save `title` in DB and Qdrant payload.
- [x] T103 Run full ingestion (force update).
- [x] T104 Verify using `validate_retrieval.py` that Title is now correct.
