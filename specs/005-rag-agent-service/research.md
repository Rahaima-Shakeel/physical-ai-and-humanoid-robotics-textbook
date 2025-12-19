# Research & Decisions

## Context
We need to implement the RAG Chatbot core functionality.
The Constitution specifies:
- LLM: `gemini-2.0-flash-exp`
- Embedding: Cohere
- Vector DB: Qdrant
- Pipeline: Adaptive Retrieval + Generation

## Key Decisions

### 1. Agent Framework
**Decision**: Use `openai-agents` Python SDK with `AsyncOpenAI` client pointing to Gemini.
**Rationale**: Explicit User Request to avoid `litellm` wrapper.
**Implementation**: Custom `build_chat_model` factory using Gemini base URL and key.

### 2. LLM Choice
**Decision**: `gemini-2.0-flash` (via OpenAI-compatible endpoint).
**Rationale**: Direct integration offers cleaner dependency graph.
**Implementation**: `get_gemini_client()` helper.

### 3. Retrieval Strategy
**Decision**: Use `QueryService` for retrieval, then *inject* context into the Agent's system instruction or run input.
**Why**: The user specified "Retrieve... Pass...". The Agent consumes the context.

### 3. Prompt Strategy
**Decision**: System prompt should enforce "textbook grounding".
**Pattern**:
```
You are an expert tutor...
Context: {chunks}
Question: {question}
Answer based ONLY on context...
If not found, say "I cannot find..."
```

### 4. History Management
**Decision**: In Phase 1, we will accept `session_id` but might not strictly persist conversation history in DB yet (focus on single-turn RAG first), or use a simple in-memory/file storage if needed.
**Refinement**: Constitution says "Phase 1: Chat history stored in Postgres".
**Plan**: I will add the `chat_sessions` and `chat_messages` tables to the `data-model.md` as per Constitution, but for the *first iteration* of the service, I might start with just the API responding to the current message, and then add persistence in a follow-up task if it's too large.
**Actually**: The user "Build" instructions didn't explicitly ask for history persistence, just "Accept user questions, Retrieve..., Generate...".
**Constitution check**: "Phase 1 ... 5. Chat history stored in Postgres".
**Decision**: I will include DB schema in `data-model.md` and `tasks.md` to be compliant with Phase 1.

## Unknowns & Risks
- **Gemini Rate Limits**: Experimental model might have lower limits.
- **Latency**: End-to-end latency might exceed 3s if Cohere + Qdrant + Gemini all lag.
