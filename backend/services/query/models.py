import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ValidationQuery(BaseModel):
    """Input for a retrieval request."""
    query_text: str = Field(..., description="The natural language question/query")
    top_k: int = Field(default=5, ge=1, description="Number of results to return")
    score_threshold: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum similarity score")

class RetrievalResult(BaseModel):
    """A single retrieved chunk of content."""
    chunk_text: str = Field(..., description="The actual text content")
    similarity_score: float = Field(..., description="Cosine similarity (0-1)")
    source_url: str = Field(..., description="URL of the source page")
    page_title: str = Field(..., description="Title of the source page")
    section_header: Optional[str] = Field(None, description="Section header within the page")

class ValidationResponse(BaseModel):
    """Aggregated results for a query."""
    query: str = Field(..., description="The original query text")
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.now, description="Execution time")
    results: List[RetrievalResult] = Field(default_factory=list, description="Ranked list of matches")
    total_found: int = Field(default=0, description="Total matches found (before top_k cut)")
