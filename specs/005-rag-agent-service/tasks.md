# Tasks: RAG Agent Service

- [x] T201 Add `openai-agents` to `pyproject.toml` and sync.
- [x] T202 Create `services/llm/factory.py` for Gemini client and `services/llm/agent.py` for RAG Agent.
- [x] T203 Create `api/routers/chat.py` with `POST /message` using `Runner.run_streamed`.
- [x] T204 Register `chat` router in `api/main.py`.
- [x] T205 Create unit tests for agent configuration in `tests/test_rag_agent.py`.
- [x] T206 Manual validation: Test streaming endpoint via curl/script.
