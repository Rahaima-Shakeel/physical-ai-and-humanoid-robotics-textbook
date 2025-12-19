# Research: Content Ingestion Decisions

**Feature**: Content Ingestion (004)
**Date**: 2025-12-16

## 1. HTML Extraction Strategy

**Option A: Beautiful Soup 4 (BS4)**
- *Pros*: Familiar, precise control.
- *Cons*: Requires writing custom parsers for every page layout; brittle if theme changes.

**Option B: Trafilatura (Selected)**
- *Pros*: Specialized for main text extraction; ignores nav/sidebars/footers automatically; robust.
- *Cons*: Less control over specific selectors.
- *Decision*: **Trafilatura**. It drastically simplifies the "clean content" requirement (FR-002) and is industry standard for NLP scraping.

## 2. Embedding Model

**Option A: OpenAI `text-embedding-3-small`**
- *Pros*: High performance, simple API.
- *Cons*: Dependent on OpenAI; potentially higher cost at scale.

**Option B: Cohere `embed-english-light-v3.0` (Selected)**
- *Pros*: Specific focus on RAG retrieval (`input_type="search_document"`); 384 dimensions is highly efficient for storage (4x smaller than OpenAI's 1536); widely used in enterprise RAG.
- *Decision*: **Cohere**. 384 dims provides excellent performance/storage ratio for a textbook-sized corpus.

## 3. Vector Database

**Option A: PGVector (Postgres extension)**
- *Pros*: Single DB for metadata + vectors.
- *Cons*: Scaling complexity; shared resources with main app DB.

**Option B: Qdrant (Selected)**
- *Pros*: Dedicated vector engine; superior filtering performance; excellent Python client; distinct separation of concerns.
- *Decision*: **Qdrant**. Aligns with the "Modular Architecture" principle and provides better long-term scalability for RAG.

## 4. Chunking Strategy

**Option A: RecursiveCharacterTextSplitter (LangChain)**
- *Pros*: Simple, keeps context.
- *Cons*: Arbitrary splits can break semantic meaning mid-thought.

**Option B: Semantic Chunking (Selected)**
- *Pros*: Uses embedding similarity to group sentences; strictly preserves concept boundaries.
- *Decision*: **Semantic**. For a textbook, preserving the integrity of explanations is critical.
- *Refinement*: Added "Preserve & Oversize" rule (Clarification Q2) for code blocks to prevent breaking syntax.
