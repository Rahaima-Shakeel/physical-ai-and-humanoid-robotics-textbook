import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.db import Database


async def init_db():
    try:
        await Database.connect()
        print("Creating table `content_pages` if not exists...")

        await Database.execute("""
            CREATE TABLE IF NOT EXISTS content_pages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                url VARCHAR(2048) UNIQUE NOT NULL,
                title VARCHAR(512) NOT NULL,
                content_hash CHAR(64) NOT NULL,
                last_ingested_at TIMESTAMPTZ DEFAULT NOW(),
                word_count INTEGER DEFAULT 0
            );
        """)

        await Database.execute("""
            CREATE INDEX IF NOT EXISTS idx_content_pages_url ON content_pages(url);
        """)

        await Database.execute("""
            CREATE INDEX IF NOT EXISTS idx_content_pages_hash ON content_pages(content_hash);
        """)

        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(init_db())
