import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, AsyncMock, MagicMock
from services.query.retrieval import QueryService

client = TestClient(app)

@patch("api.chat.get_rag_agent")
@patch("api.chat.Runner.run_streamed")
def test_chat_message_endpoint(mock_run_streamed, mock_get_rag_agent):
    """Test full RAG flow with mocked Agent Runner and QueryService."""

    # Mock Query Service Instance (Synchronous Mock)
    mock_query_instance = MagicMock()
    mock_result = MagicMock()
    mock_result.chunk_text = "Content"
    mock_result.similarity_score = 0.9
    mock_result.page_title = "Test Page"
    mock_result.source_url = "http://test"

    # Mock Search Response
    mock_response = MagicMock()
    mock_response.results = [mock_result]

    # search() is sync
    mock_query_instance.search.return_value = mock_response

    # FastApi Dependency Override
    app.dependency_overrides[QueryService] = lambda: mock_query_instance

    # Mock Agent
    mock_agent = MagicMock()
    mock_get_rag_agent.return_value = mock_agent

    # Mock Streaming
    mock_stream = MagicMock()

    # Mock stream events to be an async generator
    async def stream_generator():
        mock_event = MagicMock()
        mock_event.type = "raw_response_event"
        mock_event.data.delta = "Hello "
        yield mock_event

        mock_event2 = MagicMock()
        mock_event2.type = "raw_response_event"
        mock_event2.data.delta = "World"
        yield mock_event2

    # stream_events() is called on the result of run_streamed
    mock_stream.stream_events.return_value = stream_generator()

    # run_streamed() is sync, returns the stream object
    mock_run_streamed.return_value = mock_stream

    # Actual Request
    response = client.post("/api/chat/message", json={"message": "hello"})

    # Cleanup dependency override
    app.dependency_overrides = {}

    assert response.status_code == 200
