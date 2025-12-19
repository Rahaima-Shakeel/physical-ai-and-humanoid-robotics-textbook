import os
import sys
from dotenv import load_dotenv
from qdrant_client import QdrantClient

def check_connection():
    print(f"Pre-load QDRANT_URL: {os.getenv('QDRANT_URL')}")
    load_dotenv(override=True)
    print(f"Post-load QDRANT_URL: {os.getenv('QDRANT_URL')}")

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_key = os.getenv("QDRANT_API_KEY")

    print(f"--- Checking Qdrant Connection ---")
    if not qdrant_url:
        print("ERROR: QDRANT_URL is not set.")
        return

    print(f"Target URL: {qdrant_url}")
    print(f"API Key set: {'Yes' if qdrant_key else 'No'}")

    try:
        client = QdrantClient(url=qdrant_url, api_key=qdrant_key, timeout=10)
        collections = client.get_collections()

        print("\n[Success] Connected to Qdrant!")
        print(f"Found {len(collections.collections)} collections:")
        for c in collections.collections:
            print(f" - {c.name}")

        print("\nIf you don't see 'book_content' here, you need to run the ingestion script.")

    except Exception as e:
        print(f"\n[Error] Could not connect: {e}")

if __name__ == "__main__":
    check_connection()
