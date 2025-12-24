# import asyncio
# import os
# import sys

# # Add project root to path so we can import backend
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(_file_), '../../')))

# from backend.services.db import Database

# async def create_tables():
#     print("Connecting to database...")
#     await Database.connect()

#     print("Creating user_profiles table...")
#     # Note: 'user' is a reserved word, so better-auth likely uses "user".
#     # We reference it as public."user"

#     query = """
#     CREATE TABLE IF NOT EXISTS public.user_profiles (
#         id TEXT PRIMARY KEY,
#         software_context JSONB DEFAULT '{}'::jsonb NOT NULL,
#         hardware_context JSONB DEFAULT '{}'::jsonb NOT NULL,
#         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
#         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
#         CONSTRAINT fk_user
#             FOREIGN KEY(id)
#             REFERENCES public."user"(id)
#             ON DELETE CASCADE
#     );
#     """

#     try:
#         await Database.execute(query)
#         print("Table 'user_profiles' created successfully.")
#     except Exception as e:
#         print(f"Error creating table: {e}")
#     finally:
#         await Database.disconnect()

# if _name_ == "_main_":
#     asyncio.run(create_tables())



import asyncio
import os
import sys

# Add project root to path so we can import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.services.db import Database

async def create_tables():
    print("Connecting to database...")
    await Database.connect()

    print("Creating user_profiles table...")

    query = """
    CREATE TABLE IF NOT EXISTS public.user_profiles (
        id TEXT PRIMARY KEY,
        software_context JSONB DEFAULT '{}'::jsonb NOT NULL,
        hardware_context JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_user
            FOREIGN KEY(id)
            REFERENCES public."user"(id)
            ON DELETE CASCADE
    );
    """

    try:
        await Database.execute(query)
        print("Table 'user_profiles' created successfully.")
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(create_tables())
