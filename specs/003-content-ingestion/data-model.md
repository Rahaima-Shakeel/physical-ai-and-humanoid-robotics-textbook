# Data Model: Content Ingestion

**Feature**: Content Ingestion (004)
**Status**: DRAFT

## 1. Relational Schema (Postgres)

We use Neon Postgres to track the state of ingested pages for change detection and management.

### Table: `content_pages`

Tracks every unique URL found in the sitemap and its ingestion status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Unique identifier for the page. |
| `url` | `VARCHAR(2048)` | `UNIQUE`, `NOT NULL` | The full canonical URL of the page. |
| `title` | `VARCHAR(512)` | `NOT NULL` | Page title extracted from HTML. |
| `content_hash` | `CHAR(64)` | `NOT NULL` | SHA-256 hash of the extracted *text content*. |
| `last_ingested_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Timestamp of the last successful ingestion. |
| `word_count` | `INTEGER` | `DEFAULT 0` | Approximate word count of the content. |

**Indexes**:
- `idx_content_pages_url` on `url` (for fast lookups during sitemap iteration).
- `idx_content_pages_hash` on `content_hash` (for change detection).

---

## 2. Vector Schema (Qdrant)

We use Qdrant for storing semantic embeddings of content chunks.

### Collection: `book_content`

**Configuration**:
- **Vector Name**: `default`
- **Dimensions**: `384` (Matching Cohere `embed-english-light-v3.0`)
- **Distance Metric**: `Cosine`

### Payload Structure

Each point in Qdrant represents one text chunk.

```json
{
  "id": "UUID (derived from page_id + chunk_index)",
  "vector": [0.012, -0.045, ...],  // 384 floats
  "payload": {
    "page_id": "UUID",              // FK to content_pages.id
    "page_url": "https://...",      // Denormalized for fast retrieval
    "page_title": "Introduction to Robotics",
    "chunk_text": "Robotics is the intersection of...",
    "chunk_index": 0,               // Integer sequence (0, 1, 2...)
    "section_header": "Overview",   // Nearest H2/H3 header
    "metadata": {
       "batch_id": "ingest_20251216"
    }
  }
}
```

## 3. Data Flow & State Transitions

1. **New Page Found**:
   - IF `url` not in `content_pages`: Insert row, Embed chunks, Upsert to Qdrant.
2. **Page Unchanged**:
   - IF `url` exists AND `new_hash == old_hash`: Skip processing.
3. **Page Changed**:
   - IF `url` exists AND `new_hash != old_hash`:
     - Delete old vectors from Qdrant (filter by `page_url`).
     - Embed new chunks.
     - Upsert new vectors.
     - Update `content_pages` (hash, timestamp).
