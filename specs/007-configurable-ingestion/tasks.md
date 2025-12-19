# Tasks: Configurable Multi-Source Ingestion

**Input**: Design documents from `/specs/007-configurable-ingestion/`
**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize configuration infrastructure.

- [ ] T001 [P] Create `tests/test_config_loading.py` to verify config injection
- [ ] T002 Update `.env.template` with new variables and defaults

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration logic must be in place.

- [ ] T003 Refactor `backend/services/vector_store/client.py` to accept `collection_name` in `__init__`
- [ ] T004 Refactor `backend/services/embeddings/client.py` to accept `model` in `__init__`
- [ ] T005 Refactor `backend/services/query/retrieval.py` to initialize clients with env vars

## Phase 3: User Story 1 - Configurable Ingestion Source (Priority: P1)

**Goal**: Ingest content from a configurable sitemap URL.

- [ ] T006 [US1] Update `backend/services/ingest/manager.py` to read `SITEMAP_URL` from env
- [ ] T007 [US1] Update `run_ingestion` in `manager.py` to accept optional `sitemap_url`
- [ ] T008 [US1] Test ingestion attempts to fetch from configured URL (Manual/Log check)

## Phase 4: User Story 2 - Configurable Vector Storage (Priority: P1)

**Goal**: Store and retrieve embeddings from a configurable Qdrant collection.

- [ ] T009 [US2] Update `backend/services/ingest/manager.py` to initialize `QdrantService` with configured collection
- [ ] T010 [US2] Update `backend/services/ingest/manager.py` to initialize `CohereClient` with configured model
- [ ] T011 [US2] Verify `backend/services/query/retrieval.py` uses the same configured collection/model (from T005)
- [ ] T012 [US2] Manual Verification: Run ingestion with `QDRANT_COLLECTION=test_v2` and verify vectors exist

## Phase 5: User Story 3 - Configurable Database Tables (Priority: P2)

**Goal**: Store metadata in configurable SQL tables.

- [ ] T013 [US3] Update `backend/services/ingest/manager.py` to read `DB_TABLE_CONTENT_PAGES` from env
- [ ] T014 [US3] Update SQL queries in `manager.py` to use dynamic table name
- [ ] T015 [US3] Manual Verification: Run ingestion with `DB_TABLE_CONTENT_PAGES=test_pages` and verify DB rows

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 Verify backward compatibility (unset env vars should use defaults)
- [ ] T017 Final cleanup of any hardcoded values in `services/ingest/`

## Dependencies

- **Setup & Foundational** must complete before any US.
- **US1, US2, US3** can technically run in parallel, but `manager.py` updates overlap, so sequential T006 -> T009 -> T013 is recommended to avoid merge conflicts.
