# Feature Specification: Textbook Knowledge Ingestion

**Feature Branch**: `004-content-ingestion`
**Created**: 2025-12-16
**Status**: Draft
**Input**: User description: "Goal: Turn the deployed textbook website into a structured, machine-queryable knowledge base that future AI agents can reliably use and cite. What to Build: Automatically discover all textbook pages, extract only the educational content, split content into meaningful semantic units, store each unit with clear source attribution, detect content changes and re-ingest safely without duplication."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Ingestion (Priority: P1)

As a System Administrator, I want to run a CLI command to ingest the entire textbook content so that the RAG system has a baseline knowledge base.

**Why this priority**: Required to populate the database for the chatbot to function.

**Independent Test**: Run the ingestion script on a fresh database and verify Qdrant contains vectors matching the number of chunks expected.

**Acceptance Scenarios**:

1. **Given** a valid sitemap URL, **When** I run the ingestion script, **Then** all pages in the sitemap are fetched and processed.
2. **Given** the ingestion completes, **When** I query the `content_pages` table, **Then** I see entries for every page with correct titles and URLs.
3. **Given** the ingestion completes, **When** I query Qdrant, **Then** I see vector points enriched with metadata (URL, chunk index).

---

### User Story 2 - Incremental Updates (Priority: P2)

As the System, I want to identify which pages have changed since the last ingestion so that I only re-process modified content, saving compute costs and time.

**Why this priority**: Essential for maintaining an up-to-date knowledge base without wasteful re-processing.

**Independent Test**: Modify one page on the source, run ingestion again, and verify only that page is processed.

**Acceptance Scenarios**:

1. **Given** an already ingested site, **When** I re-run ingestion without changes, **Then** 0 pages are re-embedded and the process completes quickly.
2. **Given** an updated page on the site, **When** I re-run ingestion, **Then** the system detects the hash change, deletes old chunks for that page, and ingests new chunks.
3. **Given** a deleted page on the site, **When** I re-run ingestion, **Then** the page is marked as removed in Postgres and vectors are deleted from Qdrant.

---

### Edge Cases

- **Network Failure**: If the sitemap or a page cannot be fetched, the process should log the error but continue with other pages (partial success).
- **Malformed Content**: If a page has no extractable content (e.g., empty div), it should be skipped with a warning.
- **Large Pages**: If a page is extremely large, the chunking strategy must handle it without running out of memory.

## Requirements *(mandatory)*

## Clarifications

### Session 2025-12-16
- Q: Should the system ingest everything in the sitemap? → A: **Exclude** generated pages (e.g., `/tags/`, `/authors/`, `/blog/archive`, `/search`).
- Q: How to handle large code/tables? → A: **Preserve & Oversize** (allow chunks >600 tokens for indivisible blocks).

### Functional Requirements

- **FR-001**: System MUST fetch and parse the `sitemap.xml`, explicitly **excluding** generated/list pages (e.g., `/tags/*`, `/authors/*`, `/archive/*`).
- **FR-002**: System MUST extract main content from HTML, ignoring navigation, sidebars, and footers.
- **FR-003**: System MUST split content into semantic chunks (target 400-600 tokens). Large code blocks (>10 lines) and tables MUST be preserved intact even if they exceed the token limit (soft limit up to 1024 tokens).
- **FR-004**: System MUST generate embeddings for each chunk using Cohere `embed-english-light-v3.0` (384 dimensions).
- **FR-005**: System MUST store page metadata (URL, title, content hash) in Postgres `content_pages` table.
- **FR-006**: System MUST store vector embeddings and text payloads in Qdrant `book_content` collection.
- **FR-007**: System MUST calculate a SHA256 checksum of the extracted text to detect changes.
- **FR-008**: System MUST support idempotency: re-running ingestion on identical content MUST NOT create duplicate vectors.
- **FR-009**: System MUST provide a CLI interface (e.g., `uv run python scripts/ingest-content.sh`) for manual triggering.

### Key Entities

- **SourcePage**: Represents a URL in the textbook (tracked in Postgres).
- **ContentChunk**: A semantic segment of text from a page (stored in Qdrant).
- **IngestionJob**: A record of an ingestion run (logs/status).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid pages listed in `sitemap.xml` are indexed in the vector database.
- **SC-002**: Re-running ingestion on a static site results in 0 inserts/updates to the vector store.
- **SC-003**: Ingestion of the full textbook (approx 100 pages) completes in under 10 minutes (assuming standard rate limits).
- **SC-004**: Every stored chunk includes a valid `page_url` and `chunk_index` in its metadata.
