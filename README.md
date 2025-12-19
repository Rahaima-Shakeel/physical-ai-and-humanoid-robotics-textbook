# Physical AI and Humanoid Robotics Textbook

An interactive, open-source textbook on Physical AI and Humanoid Robotics by Google DeepMind, featuring a RAG-powered chatbot for intelligent Q&A.

[![Deploy Backend](https://img.shields.io/badge/Railway-Deploy-blue)](https://railway.app)
[![Deploy Frontend](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com)

## 🌟 Features

- **📚 Comprehensive Textbook**: In-depth coverage of Physical AI and Humanoid Robotics topics
- **🤖 AI-Powered Chatbot**: RAG (Retrieval-Augmented Generation) agent that answers questions using textbook content
- **🔍 Vector Search**: Qdrant-powered semantic search for relevant content retrieval
- **⚡ Real-time Streaming**: Server-sent events for responsive chat interactions
- **🎨 Modern UI**: Built with Docusaurus for a clean, accessible reading experience

## 🏗️ Architecture

This project consists of two main components:

```
physical-ai-and-humanoid-robotics-textbook/
├── backend/          # FastAPI RAG service (Python 3.13 + uv)
├── frontend/         # Docusaurus documentation site (React + TypeScript)
└── README.md         # This file
```

### Tech Stack

**Backend:**
- **Framework**: FastAPI with Server-Sent Events (SSE)
- **LLM**: Google Gemini 2.0
- **Embeddings**: Cohere
- **Vector DB**: Qdrant Cloud
- **Metadata DB**: Neon Postgres
- **Package Manager**: uv

**Frontend:**
- **Framework**: Docusaurus 3.9
- **UI**: React 19 + TypeScript
- **Styling**: Custom CSS

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.13+, [uv](https://github.com/astral-sh/uv)
- **Frontend**: Node.js 20+, npm

### 1. Clone the Repository

```bash
git clone https://github.com/rahaima-shakeel/physical-ai-and-humanoid-robotics-textbook.git
cd physical-ai-and-humanoid-robotics-textbook
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (see backend/README.md for details)

# Run development server
uv run uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Ingest Content (First Time Only)

```bash
cd backend
uv run -m scripts.ingest-content
```

This ingests the textbook content from the sitemap into Qdrant for RAG functionality.

## 📖 Documentation

- **[Backend README](./backend/README.md)**: Detailed backend setup, API documentation, and deployment guides
- **[Frontend README](./frontend/README.md)**: Frontend development and build instructions

## 🔧 Configuration

### Backend Environment Variables

See [`backend/.env.example`](./backend/.env.example) for required configuration:

- `COHERE_API_KEY`: Cohere API key for embeddings
- `GEMINI_API_KEY`: Google Gemini API key for LLM
- `QDRANT_URL` & `QDRANT_API_KEY`: Qdrant vector database credentials
- `NEON_DATABASE_URL`: Neon Postgres connection string
- `SITEMAP_URL`: Source URL for textbook content

### Frontend Environment Variables

For production deployment, set:
- `BACKEND_URL`: Backend API URL (e.g., `https://your-backend.railway.app`)

## 🌐 Deployment

### Backend (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Configure **Start Command**: `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`
6. Deploy!

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable: `BACKEND_URL=https://your-backend.railway.app`
5. Deploy!

Vercel automatically detects Docusaurus configuration.

## 🧪 Testing

### Backend Tests

```bash
cd backend
uv run pytest
```

### Frontend Build

```bash
cd frontend
npm run build
```

## 📝 License

This project is open-source. Please refer to the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ by the Physical AI and Humanoid Robotics community
