---
id: 003
title: Re-plan RAG Agent Service (OpenAI SDK)
stage: plan
date: 2025-12-16
surface: agent
model: antigravity
feature: rag-agent-service
branch: 006-rag-agent-service
user: User
command: /sp-plan RAG Agent Service
labels: ["rag", "plan", "architecture", "openai-agents", "litellm"]
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

/sp-plan RAG Agent Service
- Use OpenAI Agents SDK...
- LLM: Gemini 2.0 Flash...

## Response snapshot

Updated implementation plan to use `openai-agents` SDK with `litellm`.
- **Framework**: `openai-agents-python` (via `pip install openai-agents`).
- **Model**: `LitellmModel(model="gemini/gemini-2.0-flash-exp")`.
- **Workflow**:
  1. Retrieve context (QueryService).
  2. Inject context into Agent input/instructions.
  3. Run Agent with `Runner.run_streamed`.
  4. Stream response.

## Outcome

- ✅ Impact: Aligned with user's specific SDK request while keeping Gemini model.
- 🧪 Tests: Updated test plan to cover Agent instantiation and streaming.
- 📁 Files: `plan.md`, `tasks.md`, `research.md`.
- 🔁 Next prompts: /sp.implement
