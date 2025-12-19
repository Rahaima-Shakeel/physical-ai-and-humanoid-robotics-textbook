import os
from typing import List
from qdrant_client import QdrantClient, models
from qdrant_client.models import Distance, PointStruct, VectorParams


class QdrantService:
    def __init__(self):
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")

        if not url or not api_key:
             raise ValueError("QDRANT_URL or QDRANT_API_KEY not set")

        self.client = QdrantClient(url=url, api_key=api_key)
        self.collection_name = "book_content"
        self.vector_size = 384

    def ensure_collection(self):
        existing = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in existing.collections)

        if not exists:
            print(f"Creating Qdrant collection: {self.collection_name}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )

        # Ensure index on page_id for deletions
        self.client.create_payload_index(
            collection_name=self.collection_name,
            field_name="page_id",
            field_schema="keyword"
        )

    def upsert_batch(self, points: List[PointStruct]):
        if not points:
            return

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def delete_page_vectors(self, page_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=models.Filter(
                must=[
                    models.FieldCondition(
                        key="page_id",
                        match=models.MatchValue(value=page_id)
                    )
                ]
            )
        )
