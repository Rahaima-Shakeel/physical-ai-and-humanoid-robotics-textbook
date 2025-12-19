---
description: "Tasks for Textbook Knowledge Ingestion (backend pipeline)"
---

# Tasks: Textbook Knowledge Ingestion

**Input**: Design documents from `/specs/004-content-ingestion/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Organization**: Grouped by User Story (Initial Ingestion P1, Incremental Updates P2)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: [US1] (Initial Ingestion), [US2] (Incremental Updates)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project dependencies and environment

- [ ] T001 Update `pyproject.toml` with dependencies (fastapi, uv, qdrant-client, cohere, trafilatura, asyncpg)
- [ ] T002 Create `.env.example` with required keys (COHERE, QDRANT, NEON)
- [ ] T003 [P] Configure specific linting rules for ingestion scripts

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core DB and Client infrastructure required for all stories

- [ ] T004 Create `services/db.py` for Neon Postgres connection management
- [ ] T005 Create database schema migration/init script for `content_pages` table
- [ ] T006 [P] Implement `CohereClient` wrapper in `services/embeddings/client.py`
- [ ] T007 [P] Implement `QdrantService` wrapper in `services/vector_store/client.py`

**Checkpoint**: Database connections verified, Schema applied.

## Phase 3: User Story 1 - Initial Ingestion (Priority: P1) 🎯 MVP

**Goal**: Ingest full textbook content into Qdrant/Postgres from sitemap.

**Independent Test**: verify `ingest-content.py` populates Qdrant with ~1000 chunks from fresh DB.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Implement `sitemap.py` with filtering for `/tags/` and `/authors/`
- [ ] T009 [P] [US1] Implement `crawler.py` using Trafilatura for content extraction
- [ ] T010 [P] [US1] Implement `chunker.py` with semantic splitting and code block preservation
- [ ] T011 [P] [US1] Create unit tests for sitemap, crawler, and chunker logic
- [ ] T012 [US1] Implement `manager.py` orchestration (Sitemap -> Crawl -> Chunk -> Embed -> Store)
- [ ] T013 [US1] Create CLI entry point `scripts/ingest-content.py`
- [ ] T014 [US1] Add manual test procedure in `specs/004-content-ingestion/manual_test_us1.md`

**Checkpoint**: Full ingestion works manually via CLI.

## Phase 4: User Story 2 - Incremental Updates (Priority: P2)

**Goal**: Detect changes via content hash and only re-ingest modified pages.

**Independent Test**: Edit a page, run ingest, verify only 1 page processed.

### Implementation for User Story 2

- [ ] T015 [US2] Update `manager.py` to calculate SHA256 content hashes
- [ ] T016 [US2] Implement "Hash Check" logic: Fetch old hash from DB -> Compare -> Skip if match
- [ ] T017 [US2] Add `delete_page_vectors` method to `QdrantService`
- [ ] T018 [US2] Implement "Re-ingest" flow: Delete old vectors -> Embed new -> Upsert -> Update DB Hash
- [ ] T019 [US2] Update `ingest-content.py` to support `--force` flag (bypass hash check)

**Checkpoint**: Re-running ingestion is idempotent and fast.

## Phase 5: Polish & API

**Purpose**: Admin controls and system hardening

- [ ] T020 [P] Create `apps/api/routers/ingest.py` (FastAPI endpoint)
- [ ] T021 Connect API endpoint to `manager.run_ingestion` background task
- [ ] T022 Add structured logging to all services
- [ ] T023 Finalize `quickstart.md` with verified commands

## Dependencies

- **US1** requires Phase 2 (DB Clients)
- **US2** requires US1 (Basic ingestion flow)
