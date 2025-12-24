# Quickstart: Auth Sidecar Setup

## 1. Auth Service
```bash
cd auth-service
npm install
npm run dev # Runs on port 3001
```

## 2. Backend
```bash
cd backend
uv sync
uv run uvicorn main:app --reload # Runs on port 8000
```
**Env Var**: `BETTER_AUTH_URL=http://localhost:3001`

## 3. Frontend
```bash
cd frontend
npm install
npm start # Runs on port 3000
```

## 4. Migrations
Initialize database tables:
```bash
cd backend
python scripts/init_db.py
```
Better-Auth tables are created on first login/run.
