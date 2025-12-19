import pytest
from unittest.mock import patch, MagicMock
from services.llm.factory import get_gemini_client, build_chat_model
from services.llm.agent import get_rag_agent

@patch("services.llm.factory.os.getenv")
@patch("services.llm.factory.AsyncOpenAI")
def test_get_gemini_client(mock_openai, mock_getenv):
    """Test that client initializes with correct auth."""
    mock_getenv.side_effect = lambda key, default=None: "fake_key" if key == "GEMINI_API_KEY" else default

    client = get_gemini_client()

    mock_openai.assert_called_once()
    assert client is not None

@patch("services.llm.agent.get_gemini_client")
def test_get_rag_agent(mock_get_client):
    """Test that agent is created with injected context."""
    mock_client = MagicMock()
    mock_get_client.return_value = mock_client

    context = "Robot context."
    agent = get_rag_agent(context=context)

    assert agent.name == "Tutor"
    assert "Robot context." in agent.instructions
    assert "Physical AI & Humanoid Robotics" in agent.instructions
