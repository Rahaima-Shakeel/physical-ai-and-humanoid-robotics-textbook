# Implementation Plan - RAG Agent Service

This plan details the implementation of the RAG Agent Service, enabling users to ask questions and receive answers grounded in the textbook content using Gemini 2.0 Flash.

## Goal Description
Build a conversational AI agent that:
1.  Accepts natural language queries.
2.  Retrieves relevant content from Qdrant (`book_content` collection).
3.  Synthesizes an answer using the Gemini API, including citations.
4.  Exposes an API endpoint `POST /api/chat/message`.

## User Review Required
> [!IMPORTANT]
> **Gemini API Key**: Ensure `GEMINI_API_KEY` is present in `.env`.
> **Dependencies**: We will add `google-generativeai` package.

## Proposed Changes

### Configuration
#### [MODIFY] [pyproject.toml](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/pyproject.toml)
- Add `openai-agents` dependency.
- Ensure `openai` dependency is present (usually pulls with openai-agents, but good to be explicit).

### API Layer
#### [NEW] [apps/api/routers/chat.py](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/apps/api/routers/chat.py)
- Implement `POST /message` endpoint.
- Retrieve chunks using `QueryService`.
- Instantiate `RAGBot` agent using `get_rag_agent()`.
- Run agent with `Runner.run_streamed(agent, input=user_msg)`.
- Stream events to client.

#### [MODIFY] [apps/api/main.py](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/apps/api/main.py)
- Include `chat` router.

### Service Layer
#### [NEW] [services/llm/factory.py](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/services/llm/factory.py)
- `get_gemini_client() -> AsyncOpenAI`: Configures client with `GEMINI_API_KEY` and base URL.
- `build_chat_model(...) -> OpenAIChatCompletionsModel`: Wraps client.

#### [NEW] [services/llm/agent.py](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/services/llm/agent.py)
- `get_rag_agent(context: str) -> Agent`:
    - Uses `build_chat_model` with `gemini-2.0-flash`.
    - Instructions include user persona + injected context.

#### [MODIFY] [services/query/retrieval.py](file:///d:/GIAIC/Quarter 4/Hackathon/Project 1/humanoid-robotics/services/query/retrieval.py)
- Ensure `QueryService` returns rich metadata (URLs, titles) needed for citations.

## Verification Plan

### Automated Tests
- **Unit Tests**:
    - `tests/test_llm_factory.py`: Test client configuration (mock env vars).
    - `tests/test_rag_agent.py`: Test agent properties.
- **Integration Tests**:
    - `POST /api/chat/message` with known question.
    - Verify SSE (Server-Sent Events) stream format.

```bash
# Run new tests
uv run pytest tests/test_llm_factory.py tests/test_rag_agent.py
```

### Manual Verification
1.  Start API: `uv run uvicorn apps.api.main:app --reload`
2.  Send request via curl/Postman:
    ```bash
    curl -X POST http://localhost:8000/api/chat/message \
         -H "Content-Type: application/json" \
         -d '{"message": "What characterizes a humanoid robot?"}'
    ```
3.  Check response for:
    - `response`: Textual answer.
    - `sources`: Non-empty list of citations.
