# Humanoid Robotics RAG Backend

This is the backend service for the Humanoid Robotics Textbook RAG agent. It provides an API for retrieving relevant content from the textbook, handling chat interactions, and ingesting content into a vector database.

## Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) (for dependency management)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

Initialize the environment and install dependencies using `uv`:

```bash
uv sync
```

### 3. Environment Variables

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Open `.env` and configure the following variables (see `.env.example` for the complete list with descriptions):

```ini
# Cohere API Key (for Embeddings)
COHERE_API_KEY="v..."

# Google Gemini (LLM)
GEMINI_API_KEY="AI..."
GEMINI_MODEL="gemini-2.5-flash"

# Ingestion Configuration
SITEMAP_URL="https://humanoid-robotics-textbook.vercel.app/sitemap.xml"

# Qdrant Vector DB
QDRANT_URL="https://your-qdrant-instance.cloud.qdrant.io"
QDRANT_API_KEY="your-qdrant-key"

# Neon Postgres (Metadata)
NEON_DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
```

> [!IMPORTANT]
> **Production vs Local**: When running scripts, `load_dotenv(override=True)` is used to strictly enforce values from your `.env` file, bypassing cached terminal variables.

## Running the Application

To start the customized FastAPI development server:

```bash
uv run uvicorn main:app --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## Data Ingestion & Management

### 1. Check Connection
Verify your environment is pointing to the correct Qdrant instance:
```bash
uv run scripts/check_connection.py
```

### 2. Ingest Content
Ingest textbook content (sitemap -> markdown -> chunks -> embeddings -> Qdrant).
Use `--force` to strict re-ingest even if the database marks content as unchanged (useful for fixing vector DB issues).

```bash
uv run -m scripts.ingest-content --force
```

**Options:**
- `--url <SITEMAP_URL>`: Specify a different sitemap URL.
- `--force`: Force re-ingestion ignoring hash matches.

### 3. Initialize Database
Initialize the Postgres database schema (if needed manually):
```bash
uv run -m scripts.init_db
```

## Testing & Debugging

### Run Unit Tests
```bash
uv run pytest
```

### Validate Retrieval
Test the retrieval system with sample queries to verify embedding and search quality:
```bash
uv run scripts/validate_retrieval.py "What is Humanoid Robot?"
```

### Debug RAG Pipeline
Debug the full RAG pipeline (Retrieval + Generation) locally:
```bash
uv run scripts/debug_rag.py
```

### Test Chat Stream
Test the streaming chat response functionality in isolation:

```bash
uv run scripts/test_chat_stream.py "Why is simulation important?"
```

### Debug Deployment
Test the **deployed** backend (e.g., on Railway) to see raw errors:
```bash
uv run scripts/debug_deployment.py <DEPLOYED_URL>
```
Example: `uv run scripts/debug_deployment.py https://my-app.up.railway.app/api/chat/message`

## Deployment

### Railway (Backend)
1. Link your repo to Railway.
2. Set the **Root Directory** to `backend`.
3. Set the **Start Command** to `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Add all environment variables from `.env` to the Railway Dashboard.

### Vercel (Frontend)
1. Link your repo to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Vercel automatically detects Docusaurus config.
