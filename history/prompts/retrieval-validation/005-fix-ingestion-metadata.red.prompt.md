---
id: 005
title: Fix Ingestion Metadata
stage: red
date: 2025-12-16
surface: agent
model: antigravity
feature: retrieval-validation
branch: 005-retrieval-validation
user: User
command: /sp.implement
labels: ["bugfix", "ingestion", "metadata", "qdrant"]
links:
  spec: [spec.md](../../../../specs/005-retrieval-validation/spec.md)
  ticket: null
  adr: null
  pr: null
files:
  - services/ingest/crawler.py
  - services/ingest/manager.py
  - services/vector_store/client.py
tests:
  - CLI manual validation: T104
---

## Prompt

"The ingestion process seems to be missing page_title and section metadata in the vector payload..."

## Response snapshot

Fixed content ingestion to properly extract and store metadata (title).
1. **Crawler**: Updated `services/ingest/crawler.py` to use `trafilatura.extract(output_format="json")` to capture metadata fields (title, etc) instead of just text string.
2. **Manager**: Updated `services/ingest/manager.py` to handle the dictionary return type, populate `page_title` in the DB `content_pages` table and Qdrant `payload`.
3. **Qdrant**: Added `create_payload_index` for `page_id` in `services/vector_store/client.py` to fix `delete_vectors` failure during re-ingestion.
4. **Validation**: Ran full forced re-ingestion and verified with `validate_retrieval.py` that titles are now being populated (or falling back gracefully to "Page {url}").

## Outcome

- ✅ Impact: Vector payload now contains `page_title`, identifying sources better. Re-ingestion process is robust (fixed deletion error).
- 🧪 Tests: Validated via `scripts/validate_retrieval.py`.
- 📁 Files: `services/ingest/crawler.py`, `services/ingest/manager.py`, `services/vector_store/client.py`.
- 🔁 Next prompts: None.
- 🧠 Reflection: Trafilatura documentation for `bare_extraction` was slightly misleading or version-dependent; `extract(output_format='json')` proved more reliable. Qdrant filtering requires indexes, which was a good catch.
