---
id: 004
title: Refine Plan RAG Agent (Direct Client)
stage: plan
date: 2025-12-16
surface: agent
model: antigravity
feature: rag-agent-service
branch: 006-rag-agent-service
user: User
command: /sp-plan RAG Agent Service
labels: ["rag", "plan", "architecture", "openai-agents", "optimization"]
links:
  spec: [spec.md](../../../../specs/006-rag-agent-service/spec.md)
  plan: [plan.md](../../../../specs/006-rag-agent-service/plan.md)
  research: [research.md](../../../../specs/006-rag-agent-service/research.md)
  tasks: [tasks.md](../../../../specs/006-rag-agent-service/tasks.md)
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-rag-agent-service/plan.md
  - specs/006-rag-agent-service/research.md
  - specs/006-rag-agent-service/tasks.md
tests: []
---

## Prompt

"Why are we using litellm? ... Remove it... use openai-agents with custom factory..."

## Response snapshot

Updated implementation plan to remove `litellm` and use `AsyncOpenAI` client pointing to Gemini base URL.
- **Factory Pattern**: Added `services/llm/factory.py` to configure `AsyncOpenAI` for Gemini.
- **Agent Construction**: `services/llm/agent.py` uses `build_chat_model(client)`.
- **Dependencies**: Removed `litellm`.
- **Streaming**: Added `Runner.run_streamed` logic to API router.

## Outcome

- ✅ Impact: Cleaner architecture with direct provider integration, honoring user code snippets.
- 🧪 Tests: Updated test plan to verify factory and agent behavior.
- 📁 Files: `plan.md`, `tasks.md`, `research.md`.
- 🔁 Next prompts: /sp.implement
