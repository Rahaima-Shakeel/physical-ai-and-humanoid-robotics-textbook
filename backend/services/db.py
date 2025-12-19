import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
import asyncpg

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

class Database:
    _pool: Optional[asyncpg.Pool] = None

    @classmethod
    async def connect(cls):
        if cls._pool is None:
            if not DATABASE_URL:
                raise ValueError("NEON_DATABASE_URL environment variable is not set")
            cls._pool = await asyncpg.create_pool(DATABASE_URL)
            print("Connected to Neon Postgres")

    @classmethod
    async def disconnect(cls):
        if cls._pool:
            await cls._pool.close()
            cls._pool = None
            print("Disconnected from Neon Postgres")

    @classmethod
    def get_pool(cls) -> asyncpg.Pool:
        if cls._pool is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return cls._pool

    @classmethod
    async def execute(cls, query: str, *args):
        pool = cls.get_pool()
        async with pool.acquire() as conn:
            return await conn.execute(query, *args)

    @classmethod
    async def fetch(cls, query: str, *args):
        pool = cls.get_pool()
        async with pool.acquire() as conn:
            return await conn.fetch(query, *args)

    @classmethod
    async def fetchrow(cls, query: str, *args):
        pool = cls.get_pool()
        async with pool.acquire() as conn:
            return await conn.fetchrow(query, *args)
