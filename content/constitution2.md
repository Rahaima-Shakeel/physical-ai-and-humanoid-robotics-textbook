<!--
SYNC IMPACT REPORT
Version Change: 2.0.0 -> 2.1.0
Modified Principles: Updated Directory Structure (Flat), Python Version (3.13+), API Protocol (SSE), Agentic RAG.
Added Sections: LLM Service details.
Templates Updated: ✅ Templates verified compatible.
TODOs: None
-->
# Project Constitution: Docusaurus Book with RAG Chatbot

## 1. Project Vision & Core Principles

### 1.1 Vision Statement
Build a modern, AI-powered educational platform that combines static documentation with intelligent, context-aware conversational capabilities, enabling personalized learning experiences through RAG-powered interactions with Physical AI and Humanoid Robotics content.

### 1.2 Core Values
- **Simplicity First**: Prefer straightforward solutions over complex architectures
- **User Experience Excellence**: Every feature must enhance, not complicate, the user journey
- **Performance by Default**: Sub-second response times for chatbot, fast page loads
- **Maintainability**: Code that future developers can understand and modify easily
- **Security & Privacy**: User data protection is non-negotiable
- **Incremental Delivery**: Ship working features progressively, not all at once
- **Agent Autonomy**: Trust AI agents to autonomously modify code/docs and commit changes

## 2. Technical Architecture Principles

### 2.1 Monorepo Structure
```
project-root/
├── backend/            # FastAPI backend & services
│   ├── api/            # API routers (ingest, query, chat)
│   ├── services/       # Business logic
│   │   ├── ingest/     # Content processing
│   │   ├── query/      # Retrieval logic
│   │   ├── llm/        # Agentic RAG & Gemini client
│   │   └── vector_store/ # Qdrant wrapper
│   ├── scripts/        # Utility scripts
│   ├── pyproject.toml  # UV package management
│   └── main.py         # Entry point
├── frontend/           # Docusaurus static site
│   ├── docs/           # Documentation content
│   ├── src/            # React components (ChatWidget)
│   ├── docusaurus.config.ts
│   └── package.json    # Node package management
├── specs/              # Spec-driven development artifacts
├── history/            # Prompt history & ADRs
├── .specify/           # Agent memory & templates
├── .env                # Environment variables
└── README.md
```

### 2.2 Technology Stack Decisions

**Frontend (frontend/)**
- **Framework**: Docusaurus v3.x (latest stable)
- **UI Components**: React 18+ with TypeScript
- **Chat Interface**: OpenAI ChatKit (https://platform.openai.com/docs/guides/chatkit)
  - Adapts ChatKit UI styles/components
  - Uses Gemini API backend (NOT OpenAI API)
  - Streaming enabled by default
  - Global widget (available on every page)
- **Authentication Client**: Better-auth React SDK (future phase)
- **State Management**: React Context + hooks (avoid Redux unless necessary)
- **Styling**: Docusaurus theming + Tailwind CSS for custom components

**Backend (backend/)**
- **Framework**: FastAPI 0.115+ with Python 3.13+
- **Package Manager**: UV (NOT pip) - all dependency management through `uv add`, `uv sync`
- **Database**: Neon Serverless Postgres (connection pooling enabled)
- **Vector Database**: Qdrant Cloud Free Tier (single collection: "book_content")
- **Embedding Model**: Cohere `embed-english-light-v3.0` (384 dimensions)
- **LLM**: Gemini 2.0 Flash (`gemini-2.5-flash`) via Gemini API
- **Authentication**: Better-auth (future phase)
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **NO DOCKER**: Direct deployment without containerization

**Infrastructure**
- **Deployment**:
  - Frontend: GitHub Pages (static)
  - Backend: Railway/Render/Fly.io (native Python deployment)
- **CI/CD**: GitHub Actions
- **Environment Management**: `.env` files (never committed)
- **Monitoring**: Basic logging (structured JSON logs)

### 2.3 Content Source & Ingestion Strategy

**Primary Content Source**:
- URL: https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/sitemap.xml- Source Type: Deployed Docusaurus site (Physical AI & Humanoid Robotics textbook)

**Ingestion Workflow**:
1. **Manual CLI Command**: `uv run python scripts/ingest-content.sh`
   - Fetches all pages from sitemap.xml
   - Extracts markdown/HTML content
   - Applies semantic chunking
   - Generates embeddings (Cohere)
   - Upserts to Qdrant

2. **Automatic Re-ingestion**:
   - System detects document changes (checksum comparison)
   - Triggers re-embedding automatically via cron job or GitHub Actions
   - Only re-embeds changed pages (delta updates)

**Chunking Strategy**:
- **Method**: Semantic chunking (NOT fixed token splits)
- **Tools**: Use `langchain.text_splitter.SemanticChunker` or custom implementation
- **Logic**:
  - Group sentences by semantic similarity (embedding-based)
  - Preserve context boundaries (don't split mid-concept)
  - Target chunk size: ~400-600 tokens (flexible based on semantics)
  - Minimal overlap (semantic boundaries naturally provide context)

### 2.4 Data Architecture

**Neon Postgres Schema** (Future-Proof Multi-Tenant)

```sql
-- Users table (managed by better-auth, future phase)
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- User profiles (custom data, future phase)
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  software_background JSONB,  -- e.g., {"languages": ["Python"], "experience": "2-5 years"}
  hardware_background JSONB,  -- e.g., {"devices": ["laptop"], "specs": "..."}
  preferences JSONB,           -- personalization settings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Chat history (INITIAL PHASE - multi-tenant ready)
chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NULL,  -- NULL for anonymous users initially
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_sessions ON (user_id, created_at DESC)
)

chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  selected_text TEXT NULL,           -- stores text user highlighted (if any)
  sources JSONB NULL,                 -- [{page_id, url, chunk_index, score}]
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_session_messages ON (session_id, timestamp)
)

-- Feedback / ratings (FUTURE PHASE)
message_feedback (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Content tracking (for re-ingestion detection)
content_pages (
  id UUID PRIMARY KEY,
  url VARCHAR UNIQUE NOT NULL,
  title VARCHAR,
  content_hash VARCHAR(64),  -- SHA256 of page content
  last_ingested_at TIMESTAMP,
  word_count INT,
  INDEX idx_content_hash ON (content_hash)
)
```

**Qdrant Collection** (Single Collection Strategy)

```python
Collection: "book_content"
Config:
  - Vector Size: 384 (Cohere embed-english-light-v3.0)
  - Distance: Cosine similarity
  - Indexing: HNSW (default)

Payload Schema:
{
  "page_id": str,           # UUID from content_pages table
  "page_url": str,          # Full URL to page
  "page_title": str,        # Page title
  "chunk_text": str,        # Actual text content
  "chunk_index": int,       # Position in page (0, 1, 2, ...)
  "section": str,           # Section/heading within page
  "metadata": {
    "word_count": int,
    "ingested_at": str      # ISO timestamp
  }
}
```

## 3. Development Workflow Principles

### 3.1 Spec-Kit Plus Integration
- **ALWAYS** start with `/speckit.constitution` before any feature
- Use `/speckit.specify` for functional requirements (what, not how)
- Use `/speckit.clarify` before planning (mandatory)
- Use `/speckit.plan` for technical decisions (specify tech stack explicitly)
- Use `/speckit.tasks` to break down implementation
- Use `/speckit.implement` for execution

### 3.2 Branch Strategy
- `master`: Production-ready code (GitHub Pages auto-deploys)
- Feature branches: `001-feature-name`, `002-feature-name`
- One feature = One spec = One branch = One PR
- Agents have authority to commit changes autonomously

### 3.3 Code Quality Standards

**Python (FastAPI Backend)**
- Type hints REQUIRED for all functions
- Use Pydantic v2 models for all API schemas
- Use `uv` for ALL package operations:
  ```bash
  uv add fastapi[standard]  # NOT pip install
  uv sync                    # Install all dependencies
  uv run uvicorn main:app   # Run commands
  ```
- Follow PEP 8 (enforced by Ruff linter)
- Maximum function length: 50 lines
- Write docstrings for all public functions (Google style)
- Use async/await for I/O operations (database, API calls)

**TypeScript (React Frontend)**
- Strict mode enabled in tsconfig.json
- Functional components only (no class components)
- Custom hooks for reusable logic
- Props interfaces must be exported
- Use `const` by default, `let` only when necessary

**General**
- No commented-out code in production
- TODO comments must include date and author
- Error messages must be user-friendly (no stack traces exposed)
- All secrets in environment variables (use `.env.example` template)

### 3.4 Testing Requirements
- **Backend**: Pytest coverage >70% for critical paths (RAG pipeline, auth endpoints)
- **Frontend**: Manual testing of chat interface (automated tests optional)
- **Integration**: Test full flow: question → embedding → Qdrant → Gemini → response

## 4. RAG Chatbot Architecture

### 4.1 Core Components (Modular Services)

**Service 1: Ingest Service (backend/services/ingest/)**
- Fetches content from sitemap.xml
- Applies semantic chunking
- Generates embeddings (Cohere)
- Stores in Qdrant + Postgres (content_pages)
- Detects changes (checksum comparison) for re-ingestion

**Service 2: Query Service (backend/services/query/)**
- Handles user questions
- Performs adaptive retrieval based on query complexity
- Formats context for Gemini API
- Returns responses with citations (when possible)

**Service 3: Embedding Service (backend/services/embeddings/)**
- Wraps Cohere API calls
- Handles batching (max 96 texts per call)
- Caches embeddings (avoid redundant API calls)
- Implements retry logic with exponential backoff

**Service 4: Vector Store Service (backend/services/vector_store/)**
- Wraps Qdrant client operations
- Single collection management ("book_content")
- Similarity search with adaptive top_k

**Service 5: Auth Service (future phase)**
- Better-auth integration
- User profile CRUD
- Session management

### 4.2 RAG Query Pipeline

**Adaptive Retrieval Strategy**:
```python
def determine_retrieval_params(question: str) -> dict:
    """
    Adjust retrieval based on query complexity.

    Simple query (e.g., "What is a servo motor?"):
      - top_k = 3
      - score_threshold = 0.75

    Complex query (e.g., "Compare DC motors and stepper motors..."):
      - top_k = 8
      - score_threshold = 0.65

    Broad query (e.g., "Explain humanoid robotics"):
      - top_k = 12
      - score_threshold = 0.60
    """
    token_count = len(question.split())

    if token_count < 10:  # Simple
        return {"top_k": 3, "score_threshold": 0.75}
    elif token_count < 25:  # Medium
        return {"top_k": 6, "score_threshold": 0.70}
    else:  # Complex
        return {"top_k": 10, "score_threshold": 0.65}
```

**Answer Strictness**:
- **Policy**: Allow "best-effort" answers even if context is weak
- **User Messaging**: Clearly indicate when information is NOT found in book
  - Example response: "Based on related content in the textbook, [answer]. However, this specific question isn't directly addressed in the book. For more details, please refer to [citation]."
  - If NO relevant context found (all scores < 0.5): "I couldn't find information about this in the Physical AI Humanoid Robotics textbook. Could you rephrase your question or ask about a related topic?"

**Citation Requirements**:
- **Policy**: Provide citations ONLY when possible (not mandatory)
- **Format**:
  ```json
  "sources": [
    {
      "page_url": "https://zain-ul-abideen00.github.io/...",
      "page_title": "Introduction to Servo Motors",
      "chunk_index": 2,
      "similarity_score": 0.87
    }
  ]
  ```
- **Display**: Show clickable links below chatbot response
- **Absence**: If no strong citations (score < 0.70), omit sources section

**Text Selection Q&A**:
- **Behavior**: Selected text is PRIORITIZED but NOT EXCLUSIVE
- **Pipeline**:
  1. User highlights text → clicks "Ask about this"
  2. System embeds selected text + user question
  3. Qdrant search weights selected text higher (boost factor: 1.5x)
  4. Also retrieves related chunks from rest of book (top_k reduced by 30%)
  5. Gemini receives both: selected passage + related context
- **Example**:
  - Selected: "Servo motors use PWM signals for position control"
  - Question: "How does this compare to stepper motors?"
  - Retrieved: 2 chunks from selected page + 3 chunks about stepper motors

### 4.3 Chat Widget Implementation

**OpenAI ChatKit Integration**:
- **Source**: https://platform.openai.com/docs/guides/chatkit
- **Adaptation**: Use ChatKit UI components/styles but connect to Gemini backend
- **Streaming**: Enabled by default (ChatKit handles streaming display)
- **Behavior**: GLOBAL widget (available on every page)
  - Floating button (bottom-right corner)
  - Expands to chat panel on click
  - Persists session across page navigation (localStorage or session storage)
  - "Ask about this" button appears on text selection

**Frontend Implementation** (frontend/):
```typescript
// src/components/ChatWidget.tsx
import { ChatKitProvider, ChatWindow } from '@openai/chatkit-react'

function ChatWidget() {
  return (
    <ChatKitProvider
      apiEndpoint="/api/chat/message"  // Our FastAPI backend
      streaming={true}                  // Default enabled
    >
      <ChatWindow
        position="bottom-right"
        placeholder="Ask about the textbook..."
        showCitations={true}
        onTextSelection={handleTextSelection}
      />
    </ChatKitProvider>
  )
}
```

### 4.4 API Endpoints (Modular Structure)

**Ingest API** (backend/api/ingest.py)
```python
POST /api/ingest/trigger
- Admin endpoint to manually trigger content ingestion
- Body: {source_url?: str}  # defaults to sitemap.xml
- Returns: {status: str, pages_processed: int, chunks_created: int}

GET /api/ingest/status
- Returns: {last_run: str, pages_count: int, needs_update: bool}
```

**Query API** (backend/api/query.py)
```python
POST /api/chat/message
- Headers: `Accept: text/event-stream`
- Body: {
    message: str,
    session_id?: str,
    context_limit?: int
  }
- Returns: Server-Sent Events (SSE) stream
  - Event `data`: `{ "type": "sources", "data": [...] }`
  - Event `data`: `{ "type": "content", "delta": "..." }`
  - Event `data`: `[DONE]`

GET /api/chat/history/{session_id}
- Returns: {messages: [...]}

POST /api/chat/feedback
- Body: {message_id: str, rating: int, comment?: str}
- Returns: {success: bool}
```

**Auth API** (backend/api/auth.py - FUTURE PHASE)
```python
POST /api/auth/signup
- Body: {email, password, software_background, hardware_background}
- Returns: {user: {...}, session: {...}}

POST /api/auth/signin
- Body: {email, password}
- Returns: {user: {...}, session: {...}}

GET /api/user/profile
- Returns: {software_background, hardware_background, preferences}
```

### 4.5 Performance Requirements
- Chat response: <3 seconds (95th percentile)
- Docusaurus page load: <1 second
- Vector search latency: <500ms
- Qdrant upsert batch: <2 seconds for 100 vectors
- Streaming first token: <800ms

## 5. Feature Prioritization

### Phase 1: Core Functionality (100 points - MUST HAVE)
1. ✅ Docusaurus book deployed to GitHub Pages
2. Basic RAG chatbot (question → retrieval → Gemini → answer)
3. Text selection → "Ask about this" functionality
4. Citation display (when available, not mandatory)
5. Chat history stored in Postgres
6. Manual content ingestion CLI
7. Global chat widget on all pages
8. Semantic chunking from sitemap.xml
9. "Not found in book" messaging for weak answers

### Phase 2: Authentication (50 bonus points)
1. Better-auth signup with background questions
2. Better-auth signin with session management
3. Store user profiles in Neon Postgres
4. Protected chat history (user-specific)
5. Multi-tenant schema ready for multiple users

### Phase 3: Personalization (50 bonus points)
1. "Personalize Content" button at chapter start
2. Adjust explanations based on user's software/hardware background
3. Store personalization preferences per user
4. Dynamic content rewriting using Gemini API

### Phase 4: Translation (50 bonus points)
1. "Translate to Urdu" button at chapter start
2. Use Gemini API for translation
3. Cache translations (avoid re-translating)
4. Preserve formatting and citations

### Phase 5: Antigravity Agents (50 bonus points)
1. Create reusable subagents for common tasks
2. Define agent skills for documentation writing
3. Use Antigravity agent manager for coordination
4. Agents autonomously modify code and commit changes

## 6. Decision-Making Framework

### When to Add Complexity
- When user experience significantly improves
- When performance becomes a measurable problem
- When technical debt blocks future features

### When to Keep It Simple
- **Default stance**: Always choose simpler solution first
- When in doubt about architecture decisions
- When feature can be added incrementally later

### When to Research
- Before choosing between competing libraries
- When working with rapidly evolving tech (Gemini API, Docusaurus)
- When uncertain about best practices for new tools (UV, Better-auth)

### When to Refactor
- When same code exists in 3+ places
- When function exceeds 50 lines
- When tests become harder to write

## 7. Context7 MCP Server Usage

- Use Context7 for up-to-date documentation on:
  - Docusaurus API changes
  - Gemini API latest features (especially gemini-2.5-flash-exp)
  - Better-auth integration patterns
  - Qdrant Python client methods
  - FastAPI best practices
  - Semantic chunking strategies
  - OpenAI ChatKit component usage
- Query Context7 BEFORE making architectural decisions
- Document findings in `docs/research/` for team reference

## 8. Antigravity Agent Guidelines

### Agent Coordination
- Use Antigravity Agent Manager for multi-agent workflows
- Define clear boundaries: Ingest ↔ Query ↔ Frontend ↔ DevOps
- Share context via structured outputs (JSON schemas)
- **Agent Autonomy**: Agents can autonomously modify code/docs
- **Commit Authority**: Agents can commit changes directly to feature branches

### Reusable Skills
- Create skills for: semantic chunking, adaptive retrieval, citation extraction
- Version skills (e.g., `rag_pipeline_v1`, `rag_pipeline_v2`)
- Document skill inputs/outputs in `docs/agents/`

### Agent Output Authority
- Agents can:
  - Create/modify Python/TypeScript files
  - Update documentation
  - Commit to feature branches
  - Create pull requests
- Agents CANNOT:
  - Merge to master without approval
  - Delete production data
  - Expose secrets in commits

## 9. Security & Privacy

### Authentication (Future Phase)
- Passwords hashed with Better-auth defaults (bcrypt)
- Session tokens: httpOnly cookies
- CORS configured for GitHub Pages domain only

### Data Protection
- User backgrounds stored in JSONB (flexible schema)
- No PII in vector database payloads
- Chat history: soft-delete only (for debugging)
- Selected text stored temporarily (not indexed)

### API Security
- Rate limiting: 100 requests/minute per IP (anonymous), 500/minute (authenticated)
- API keys in environment variables (never in code)
- Input validation on all endpoints (Pydantic models)

## 10. Deployment & Operations

### Local Development
```bash
# Backend (UV)
cd backend
uv sync
uv run uvicorn main:app --reload

# Frontend (Node)
cd frontend
npm install
npm start

# Manual Content Ingestion
cd backend
uv run python scripts/ingest_content.py --source-url https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/sitemap.xml```

### Production Deployment (NO DOCKER)
- **Frontend**: GitHub Actions → GitHub Pages (automatic)
  ```yaml
  # .github/workflows/deploy-frontend.yml
  - run: npm run build
  - uses: peaceiris/actions-gh-pages@v4
  ```
- **Backend**: Native Python deployment to Railway/Render
  ```bash
  # Railway deploys directly from git with uv support
  # No Dockerfile needed
  ```
- **Database Migrations**: Alembic (versioned, reversible)
  ```bash
  uv run alembic upgrade head
  ```

### Content Sync Automation
```yaml
# .github/workflows/sync-content.yml
name: Auto-sync RAG content
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v1
      - run: uv run python scripts/sync_vectors.py
```

### Monitoring
- Backend logs: JSON format (timestamp, level, message, trace_id)
- Error tracking: Log to file + optional Sentry integration
- Performance: Log slow queries (>500ms), slow API calls (>2s)
- Ingestion logs: Track processed pages, failed chunks, embedding errors

## 11. When to Deviate from Constitution

This constitution is a **guide**, not a prison. Deviate when:
1. User explicitly requests different approach
2. New information invalidates a principle
3. Team consensus agrees on better pattern
4. Antigravity agents identify optimization opportunities

**Always document deviations** in `docs/architecture/decisions/` with:
- Date, decision, rationale, alternatives considered

---

## Appendix: Quick Reference

### UV Commands
```bash
uv add <package>       # Add dependency
uv sync                # Install all deps
uv run <command>       # Run in virtual env
uv pip list            # List installed packages
```

### Embedding Dimensions
- Cohere `embed-english-light-v3.0`: **384 dimensions**
- Qdrant collection vector size: **384**

### LLM Model
- Gemini 2.5 Flash: `gemini-2.5-flash`
- Streaming: Enabled by default in ChatKit

### API Keys Needed
- `GEMINI_API_KEY` (for LLM)
- `COHERE_API_KEY` (for embeddings)
- `NEON_DATABASE_URL` (Postgres)
- `QDRANT_API_KEY` + `QDRANT_URL` (vector DB)
- `BETTER_AUTH_SECRET` (auth encryption - future phase)

### Content Source
- Sitemap: https://physical-ai-and-humanoid-robotics-t-tau.vercel.app/sitemap.xml- Ingestion: Manual CLI + auto-detection of changes

### Useful Links
- Spec-Kit Plus: https://github.com/panaversity/spec-kit-plus/
- UV Docs: https://github.com/astral-sh/uv
- Better-auth: https://www.better-auth.com/
- Gemini API: https://ai.google.dev/
- Cohere: https://cohere.com/
- Qdrant: https://qdrant.tech/
- Neon: https://neon.tech/
- OpenAI ChatKit: https://platform.openai.com/docs/guides/chatkit
- Antigravity: https://antigravity.google/

**Version**: 2.1.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-18
