import os
from typing import List
from dotenv import load_dotenv
load_dotenv()

import cohere


class CohereClient:
    def __init__(self):
        api_key = os.getenv("COHERE_API_KEY")
        if not api_key:
            raise ValueError("COHERE_API_KEY environment variable is not set")
        self.client = cohere.Client(api_key)
        self.model = "embed-english-light-v3.0"

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        # Batch size limit for Cohere is often 96, safely doing 90
        BATCH_SIZE = 90
        all_embeddings = []

        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            response = self.client.embed(
                texts=batch,
                model=self.model,
                input_type="search_document"
            )
            all_embeddings.extend(response.embeddings)

        return all_embeddings
