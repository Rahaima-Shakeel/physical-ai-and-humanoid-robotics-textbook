# Implementation Plan: Retrieval Validation

**Branch**: `005-retrieval-validation` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-retrieval-validation/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a validation mechanism (CLI script and test test endpoint) to verify that indexed semantic content can be correctly retrieved from Qdrant using natural language queries. This ensures the ingestion pipeline has worked correctly and the RAG system's core retrieval component is functional.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.12+ (managed by UV)
**Primary Dependencies**:
- `fastapi` (API endpoint)
- `qdrant-client` (Vector search)
- `cohere` (Embedding generation)
- `pydantic` (Data models)
- `typer` (CLI for manual validation)
**Storage**: N/A (Read-only from Qdrant/Postgres)
**Testing**: `pytest` for unit tests, Manual CLI verification
**Target Platform**: Local Dev / Railway
**Project Type**: Backend Service
**Performance Goals**: Retrieval < 500ms
**Constraints**: Must use existing `book_content` collection and `embed-english-light-v3.0` model.
**Scale/Scope**: Validating top-k retrieval for specific queries.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Simplicity First**: Using a simple CLI and a single API endpoint.
- [x] **User Experience Excellence**: Providing clear output and error messages.
- [x] **Performance by Default**: Using efficient Qdrant headers and optimized embedding calls.
- [x] **Maintainability**: Reusing existing embedding logic (will refactor into shared service).
- [x] **Security & Privacy**: No user data involved, only public content.
- [x] **System Architecture**: Aligns with Microservice/Modular Monolith structure (`services/query/`).

## Project Structure

### Documentation (this feature)

```text
specs/005-retrieval-validation/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Monorepo Structure
apps/
└── api/
    └── src/
        ├── routers/
        │   └── query.py       # [NEW] Query validation endpoint
        └── main.py            # [MODIFY] Register query router

services/
└── query/                     # [NEW] Query Service Module
    ├── __init__.py
    ├── retrieval.py           # [NEW] Core retrieval logic (embed -> search)
    └── models.py              # [NEW] Internal domain models for search

scripts/
└── validate_retrieval.py      # [NEW] CLI script for manual verification (uses service)
```

**Structure Decision**: creating a dedicated `services/query/` module to encapsulate retrieval logic, keeping it separate from ingestion (`services/ingest/`). The API router will purely handle HTTP/JSON concerns, delegating logic to the service. A standalone script `scripts/validate_retrieval.py` will allow mostly easy manual testing without running the full API server.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
