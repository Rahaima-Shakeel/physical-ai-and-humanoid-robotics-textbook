import os
from typing import List
from dotenv import load_dotenv
load_dotenv()
import cohere
from qdrant_client import QdrantClient

from .models import RetrievalResult, ValidationQuery, ValidationResponse


class QueryService:
    """Service to handle semantic search queries against Qdrant."""
    def __init__(self):
        self.co_client = None
        self.qdrant_client = None
        self.collection_name = "book_content"
        self.initialized = False

    def initialize(self):
        """Initialize API clients for Qdrant and Cohere."""
        if self.initialized:
            return

        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_key = os.getenv("QDRANT_API_KEY")
        cohere_key = os.getenv("COHERE_API_KEY")

        if not qdrant_url or not qdrant_key:
            raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set")
        if not cohere_key:
            raise ValueError("COHERE_API_KEY must be set")

        self.qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_key)
        self.co_client = cohere.Client(api_key=cohere_key)
        self.initialized = True

    def embed_query(self, text: str) -> List[float]:
        """Convert query text to vector embedding."""
        if not self.initialized:
            self.initialize()

        response = self.co_client.embed(
            texts=[text],
            model="embed-english-light-v3.0",
            input_type="search_query"
        )
        return response.embeddings[0]

    def search(self, query: ValidationQuery) -> ValidationResponse:
        """Execute semantic search and return validation response."""
        if not self.initialized:
            self.initialize()

        vector = self.embed_query(query.query_text)

        search_result = self.qdrant_client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=query.top_k,
            score_threshold=query.score_threshold
        ).points

        results = []
        for point in search_result:
            payload = point.payload or {}

            # Extract metadata (US2)
            results.append(RetrievalResult(
                chunk_text=payload.get("chunk_text", ""),
                similarity_score=point.score,
                source_url=payload.get("page_url", "unknown"),
                page_title=payload.get("page_title", "unknown"),
                section_header=payload.get("section", None)
            ))

        return ValidationResponse(
            query=query.query_text,
            results=results,
            total_found=len(results)
        )
