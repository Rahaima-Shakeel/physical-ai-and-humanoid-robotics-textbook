import hashlib
import uuid
from dotenv import load_dotenv
load_dotenv()
from services.db import Database
from services.embeddings.client import CohereClient
from services.ingest.chunker import chunk_text
from services.ingest.crawler import extract_content
from services.ingest.sitemap import fetch_sitemap
from services.vector_store.client import PointStruct, QdrantService


class IngestionManager:
    def __init__(self):
        self.cohere = CohereClient()
        self.qdrant = QdrantService()

    async def run_ingestion(self, sitemap_url: str, force: bool = False):
        print(f"Starting ingestion from {sitemap_url}")

        # 1. Init resources
        await Database.connect()
        self.qdrant.ensure_collection()

        try:
            # 2. Fetch Sitemap
            urls = fetch_sitemap(sitemap_url)
            print(f"Found {len(urls)} URLs in sitemap.")

            for url in urls:
                await self.process_page(url, force)

        finally:
            await Database.disconnect()

    async def process_page(self, url: str, force: bool):
        print(f"Processing {url}...")

        # 3. Crawl
        content = extract_content(url)
        if not content or not content.get("text"):
            print(f"Skipping {url}: No content extracted.")
            return

        text = content["text"]
        title = content.get("title") or f"Page {url}"

        # 4. Hash Check (Incremental Update Logic)
        content_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()

        # Check DB for existing page
        row = await Database.fetchrow("SELECT id, content_hash FROM content_pages WHERE url = $1", url)

        page_id = None
        if row:
            page_id = str(row['id'])
            stored_hash = row['content_hash']
            if not force and stored_hash == content_hash:
                print(f"Skipping {url}: Content unchanged.")
                return
            else:
                print(f"Content changed or forced (Old: {stored_hash[:8]}..., New: {content_hash[:8]}...). Re-ingesting.")
        else:
            print(f"New page detected: {url}")

        # 5. Chunk
        chunks = chunk_text(text)
        print(f"  -> Generated {len(chunks)} chunks.")

        if not chunks:
            return

        # 6. Embed
        embeddings = self.cohere.embed_batch(chunks)

        # 7. Update State (Transactional approach: Delete old vectors -> Upsert new -> Update DB)

        if page_id:
            # Delete old vectors for this page to avoid duplicates/stale chunks
            self.qdrant.delete_page_vectors(page_id)

            # Update DB Metadata
            await Database.execute("""
                UPDATE content_pages SET content_hash = $1, last_ingested_at = NOW(), word_count = $2, title = $3
                WHERE id = $4
            """, content_hash, len(text.split()), title, page_id)
        else:
            # Insert new page
            page_id = str(uuid.uuid4())
            await Database.execute("""
                INSERT INTO content_pages (id, url, title, content_hash, word_count)
                VALUES ($1, $2, $3, $4, $5)
            """, page_id, url, title, content_hash, len(text.split()))

        # Prepare and Upsert Qdrant Points
        points = []
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            chunk_id = str(uuid.uuid5(uuid.UUID(page_id), f"{i}")) # Deterministic ID based on page_id + index

            points.append(PointStruct(
                id=chunk_id,
                vector=vector,
                payload={
                    "page_id": str(page_id),
                    "page_url": url,
                    "page_title": title,
                    "chunk_text": chunk,
                    "chunk_index": i
                }
            ))

        self.qdrant.upsert_batch(points)
        print(f"  -> Upserted {len(points)} vectors.")
