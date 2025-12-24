import asyncio
from dotenv import load_dotenv
load_dotenv()
from services.db import Database


async def init_db():
    try:
        await Database.connect()
        print("Creating table `content_pages` if not exists...")

        # Better-Auth Tables (Should be managed by Better-Auth migrate, but adding for completeness/reference)
        # Note: Better-Auth usually creates its own tables. We focus on the extension tables.
        
        print("Creating table `user_profiles` if not exists...")
        await Database.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                userId TEXT UNIQUE NOT NULL,
                software_background JSONB,
                hardware_background JSONB,
                updatedAt TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        print("Creating table `chat_messages` if not exists...")
        await Database.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                userId TEXT,
                sessionId TEXT NOT NULL,
                role VARCHAR(20) NOT NULL,
                content TEXT NOT NULL,
                createdAt TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(init_db())
