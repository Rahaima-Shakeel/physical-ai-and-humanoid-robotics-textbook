---
description: "Tasks for Retrieval Validation feature"
---

# Tasks: Retrieval Validation

**Input**: Design documents from `/specs/005-retrieval-validation/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml, research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure.

- [x] T001 Initialize feature directory structure (create `services/query/`)
- [x] T002 Update `pyproject.toml` to ensure `fastapi`, `qdrant-client`, `cohere`, `typer` are dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [x] T003 Create `services/query/__init__.py` to export the service
- [x] T004 Create `services/query/models.py` with `ValidationQuery`, `RetrievalResult`, `ValidationResponse` classes (Pydantic)
- [x] T005 [P] Create `services/query/retrieval.py` skeleton with `QueryService` class and `search` method stubs

**Checkpoint**: Foundation ready - service structure defined.

---

## Phase 3: User Story 1 - Verify Semantic Retrieval (Priority: P1) 🎯 MVP

**Goal**: Query knowledge base with natural language and get relevant chunks.

**Independent Test**: Run `scripts/validate_retrieval.py "What is ZMP?"` and verify output contains ZMP definition.

### Implementation for User Story 1

- [x] T006 [US1] Implement `QueryService.initialize` in `services/query/retrieval.py` (connect to Qdrant/Cohere)
- [x] T007 [US1] Implement `QueryService.embed_query` in `services/query/retrieval.py` (call Cohere API)
- [x] T008 [US1] Implement `QueryService.search` in `services/query/retrieval.py` (Qdrant search logic)
- [x] T009 [US1] Create `scripts/validate_retrieval.py` CLI using `typer` and `QueryService`
- [x] T010 [US1] Create `apps/api/src/routers/query.py` implementing `POST /api/query/validate`
- [x] T011 [US1] Register query router in `apps/api/src/main.py`
- [x] T012 [US1] Manual test: Run CLI with "What is a humanoid robot?" and verify results

**Checkpoint**: Basic semantic search is working via CLI and API.

---

## Phase 4: User Story 2 - Source Traceability (Priority: P1)

**Goal**: Verify source metadata (URL, Title) is returned with chunks.

**Independent Test**: Run CLI/API and check JSON/Output for `source_url` and `page_title` fields.

### Implementation for User Story 2

- [x] T013 [US2] Update `QueryService.search` in `services/query/retrieval.py` to extract payload metadata
- [x] T014 [US2] Update `ValidationResult` model to ensure metadata fields are populated correctly
- [x] T015 [US2] Update `scripts/validate_retrieval.py` to pretty-print source metadata
- [x] T016 [US2] Manual test: Verify specific URL matches content context

**Checkpoint**: Results include traceable source information.

---

## Phase 5: User Story 3 - Empty State Handling (Priority: P2)

**Goal**: Handle nonsense queries and empty results gracefully.

**Independent Test**: Query "dsajkldjsalkjdsa" and verify 0 results or "No matches".

### Implementation for User Story 3

- [x] T017 [US3] Implement score threshold logic in `QueryService.search` (filter results < threshold)
- [x] T018 [US3] Update `scripts/validate_retrieval.py` to handle empty result lists gracefully
- [x] T019 [US3] Manual test: Verify random noise query returns zero results

**Checkpoint**: robust handling of edge cases.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T020 [P] Add Docstrings to `services/query/retrieval.py`
- [x] T021 Check error handling for missing API keys (Service Initialization)
- [x] T022 Code cleanup and formatting (ruff check)

---

## Dependencies & Execution Order

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational.
- **User Story 2 (P1)**: Depends on US1 (builds on search logic).
- **User Story 3 (P2)**: Depends on US1 (can be done logic-wise essentially in parallel but conceptually refines it).

### Parallel Opportunities

- T009 (CLI) and T010 (API) can be implemented in parallel once Service is ready.
- T020 (Docs) can be done anytime.

## Implementation Strategy

### MVP First (US1 + US2)

1. Setup & Foundational.
2. Implement Core Search (US1).
3. Ensure Metadata (US2) - *Likely done together with US1 as Qdrant returns payload by default*.
4. Validate with CLI.

### Incremental Delivery

1. Foundation.
2. CLI Validation capability.
3. API Endpoint.
4. Robustness (Thresholds).
