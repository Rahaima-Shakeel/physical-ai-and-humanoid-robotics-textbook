# Data Model: Retrieval Validation

**Feature**: Retrieval Validation (005)
**Status**: DRAFT

## 1. Domain Models (Python/Pydantic)

These models define the internal structure of data passing through the `services/query` layer.

### `ValidationQuery`
Input for a retrieval request.

| Field | Type | Description |
|-------|------|-------------|
| `query_text` | `str` | The natural language question/query. |
| `top_k` | `int` | Number of results to return (default: 5). |
| `score_threshold` | `float` | Minimum similarity score (0.0-1.0) to include. |

### `RetrievalResult`
A single retrieved chunk of content.

| Field | Type | Description |
|-------|------|-------------|
| `chunk_text` | `str` | The actual text content. |
| `similarity_score` | `float` | Cosine similarity (0-1). |
| `source_url` | `str` | URL of the source page. |
| `page_title` | `str` | Title of the source page. |
| `section_header` | `str` | (Optional) Section header within the page. |

### `ValidationResponse`
Aggregated results for a query.

| Field | Type | Description |
|-------|------|-------------|
| `query` | `str` | The original query text. |
| `timestamp` | `datetime` | Execution time. |
| `results` | `List[RetrievalResult]` | Ranked list of matches. |
| `total_found` | `int` | Total matches found (before top_k cut). |

## 2. API Schema (OpenAPI)

Mappings to the FastAPI layer.

### Request: `POST /api/query/validate`
Body: `ValidationQuery`

### Response: `200 OK`
Body: `ValidationResponse`
