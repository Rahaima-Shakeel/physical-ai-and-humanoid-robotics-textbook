# Research: Retrieval Validation

**Goal**: Confirm that indexed textbook content can be reliably retrieved via semantic search.

## Decisions

### 1. Retrieval Strategy
- **Decision**: Use single-stage dense retrieval (Vector Search) using Qdrant.
- **Rationale**: The constitution specifies a Qdrant-based RAG pipeline. Dense retrieval is sufficient for the MVP validation of content ingestion.
- **Model**: Must use `embed-english-light-v3.0` (Cohere) to match ingestion embeddings.
- **Metrics**: Cosine similarity is already configured in the collection.

### 2. Implementation Logic
- **Service Layer**: Create `services/query` to house the retrieval logic. This promotes reusability for the future Chat API.
- **Client Handling**: Reuse `QdrantClient` and `cohere.Client` (managed in `services/vector_store` and `services/embeddings` if they exist, or create wrappers if not).
- **Validation Script**: A standalone `validate_retrieval.py` script is simpler for quick checks than curling an endpoint, but we will implement both (script uses the service directly).

### 3. Metadata Handling
- **Decision**: Return full payload metadata (URL, Title, Section) for validation.
- **Rationale**: Crucial for "Source Traceability" user story. We need to verify that chunks map back to specific pages.

## Alternatives Considered

- **Hybrid Search (Keyword + Vector)**:
  - *Rejected for now*: Adds complexity (setting up sparse vectors or BM25). Dense retrieval is enough for the "Validation" goal.
- **Reranking (Cohere Rerank)**:
  - *Rejected for now*: Improves quality but costs more and adds latency. Can be added later if simple vector search quality is poor.

## Unknowns Resolved
- **Embedding Dimensions**: Content 384 (confirmed in Data Model 004).
- **Collection Name**: `book_content` (confirmed in Data Model 004).
