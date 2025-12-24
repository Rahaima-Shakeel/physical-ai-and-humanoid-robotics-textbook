import asyncio
import os
import sys

# Add backend directory to path so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.db import Database  # Make sure services/db.py exists with Database class

async def init_simple_chat_db():
    print("Initializing Simple Chat Database Schema...")

    db = Database()
    await db.connect()

    try:
        # Create chat_messages Table
        print("Creating chat_messages table...")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                userId TEXT,
                sessionId TEXT,
                role TEXT,
                content TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Indexes for performance
        print("Creating indexes...")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(userId);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(sessionId);")

        print("Chat Database Schema initialized successfully.")

    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    # Needed on Windows to avoid event loop issues
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    # Run the async function
    asyncio.run(init_simple_chat_db())
