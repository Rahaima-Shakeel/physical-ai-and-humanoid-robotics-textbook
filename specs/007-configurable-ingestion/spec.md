# Feature Specification: Configurable Multi-Source Ingestion

**Feature Branch**: `007-configurable-ingestion`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "Correct the content source by ingesting data from a new sitemap URL and ensure all ingestion and retrieval operate on a new, configurable vector collection."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurable Ingestion Source (Priority: P1)

As a developer, I want to define the sitemap URL via environment variables so that I can switch content sources without changing code.

**Why this priority**: The current source URL is incorrect, and hardcoding it forces code changes for every content update.

**Independent Test**:
1. Set `SITEMAP_URL` to a valid sitemap (e.g., `https://example.com/sitemap.xml`).
2. Run the ingestion script.
3. Verify that the script attempts to fetch from that specific URL.

**Acceptance Scenarios**:
1. **Given** `SITEMAP_URL` is set in `.env`, **When** ingestion runs, **Then** it fetches the sitemap from that URL.
2. **Given** `SITEMAP_URL` is NOT set, **When** ingestion runs, **Then** it should fail gracefully or use a safe default (if defined).

---

### User Story 2 - Configurable Vector Storage (Priority: P1)

As a DevOps engineer, I want to define the Qdrant collection name and embedding model via environment variables so that I can isolate data for different environments or content versions.

**Why this priority**: Essential for testing new content without polluting production collections or breaking existing features.

**Independent Test**:
1. Set `QDRANT_COLLECTION="test_collection_v2"`.
2. Run ingestion.
3. Verify in Qdrant dashboard/API that "test_collection_v2" exists and contains vectors.

**Acceptance Scenarios**:
1. **Given** `QDRANT_COLLECTION` is set to `new_coll`, **When** ingestion runs, **Then** vectors are upserted to `new_coll`.
2. **Given** `QDRANT_COLLECTION` is set to `new_coll`, **When** retrieval runs, **Then** search results are fetched from `new_coll`.

---

### User Story 3 - Configurable Database Tables (Priority: P2)

As a database administrator, I want to configure table names for content metadata so that I can manage schema migrations or parallel deployments safely.

**Why this priority**: Prevents collisions when re-architecting data schemas or running parallel ingestion pipelines.

**Independent Test**:
1. Set `DB_TABLE_CONTENT_PAGES="content_pages_v2"`.
2. Run ingestion.
3. Verify data is written to `content_pages_v2`.

**Acceptance Scenarios**:
1. **Given** configured table names, **When** ingestion runs, **Then** SQL queries use the configured table names.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read `SITEMAP_URL` from environment variables for ingestion.
- **FR-002**: System MUST read `QDRANT_COLLECTION` from environment variables, defaulting to `book_content` if unset.
- **FR-003**: System MUST read `COHERE_EMBED_MODEL` from environment variables, defaulting to `embed-english-light-v3.0` if unset.
- **FR-004**: System MUST read `DB_TABLE_CONTENT_PAGES` from environment variables, defaulting to `content_pages` if unset.
- **FR-005**: Ingestion script MUST NOT have hardcoded headers, URLs, or collection names.
- **FR-006**: Retrieval service MUST use the same configured `QDRANT_COLLECTION` and `COHERE_EMBED_MODEL` as the ingestion service.

### Key Entities *(include if feature involves data)*

- **IngestionManager**: Orchestrates fetching, chunking, and embedding. Needs to accept configuration.
- **QdrantService**: Manages vector DB interactions. Needs to be instantiated with dynamic collection names.
- **CohereClient**: Manages embedding generation. Needs dynamic model selection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ingestion completes successfully using a newly defined `SITEMAP_URL` and `QDRANT_COLLECTION` without code modification.
- **SC-002**: Search requests return relevant results from the new `QDRANT_COLLECTION`.
- **SC-003**: No hardcoded "book_content" or sitemap URLs exist in `services/ingest` or `services/vector_store`.
