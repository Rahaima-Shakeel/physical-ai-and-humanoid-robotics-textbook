from dotenv import load_dotenv
from fastapi import FastAPI
from contextlib import asynccontextmanager
from api import ingest, query, chat, profile, auth
from services.db import Database

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await Database.connect()
    yield
    await Database.disconnect()

app = FastAPI(title="Humanoid Robotics RAG API", version="0.1.0", lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware

import os

# Parse allowed origins from env, default to localhost
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allow_origins = default_origins + [o.strip() for o in env_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ingest.router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(query.router, prefix="/api", tags=["Query"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])

@app.get("/health")
def health_check():
    return {"status": "ok"}