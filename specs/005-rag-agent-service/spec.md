# Feature Specification: RAG Agent Service

- **Feature Name**: RAG Agent Service
- **Branch**: 006-rag-agent-service
- **Creation Date**: 2025-12-16
- **Status**: Draft

## User Input

> Goal: Create an AI agent that answers questions using retrieved textbook content.
>
> Build:
> - Accept user questions
> - Retrieve relevant textbook chunks
> - Generate answers grounded in retrieved content
> - Include source references when available
>
> Why: This is the core intelligence layer that turns indexed knowledge into usable explanations.
>
> Success:
> - Answers are based on retrieved textbook content
> - Clear handling when information is not found in the book
> - Source references preserved for downstream use

## User Stories

### Story 1: Answer Question from Textbook
As a **Student**,
I want **to ask a question and get an answer derived *only* from the textbook**,
So that **I can trust the information is relevant to my coursework.**

**Acceptance Criteria:**
- System retrieves relevant chunks for the query.
- LLM generates a coherent answer using those chunks.
- If the answer is in the chunks, it is provided.
- If the content is NOT in the chunks, the system states "I cannot find this information in the textbook."

### Story 2: Source Attribution
As a **Student**,
I want **to know which chapters or pages the answer comes from**,
So that **I can read more if I need details.**

**Acceptance Criteria:**
- The response includes a list of "Sources" or "References".
- Each reference links to the URL (and Title if available).

### Story 3: Context Awareness (Single Turn)
As a **User**,
I want **the agent to understand broad questions**,
So that **I don't have to keyword-stuff my queries.**

**Acceptance Criteria:**
- The system uses semantic search (already implemented) effectively.
- The prompt to the LLM ensures it validates the context before answering.

## Functional Requirements

1.  **RAG Pipeline**:
    *   Input: User Query (str).
    *   Step 1: Embed Query (Cohere).
    *   Step 2: Search Qdrant (using `QueryService`).
    *   Step 3: Format Prompt (System Prompt + Context Chunks).
    *   Step 4: Generate Answer (Gemini 2.0 Flash via OpenAI Agents SDK).
    *   Output: Answer (str) + Sources (list).

2.  **API Endpoint**:
    *   `POST /api/chat/message`.
    *   Request: `{"message": "...", "session_id": "...", "context_limit": 5}`.
    *   Response: Streaming text (Server-Sent Events) or JSON.

## Technical Considerations

- **Agent Framework**: OpenAI Agents SDK (`openai-agents` + `litellm`).
- **LLM Provider**: Gemini 2.0 Flash (`gemini/gemini-2.0-flash`).
- **Pattern**: RAG (Retrieval Augmentation via Context Injection).
- **Latency**: Streaming reduces perceived latency.

## Success Criteria

- 90% of "in-book" questions answered correctly.
- 100% of answers include sources if used.
- "Not found" rate matches ground truth for out-of-scope queries (hallucination resistance).
