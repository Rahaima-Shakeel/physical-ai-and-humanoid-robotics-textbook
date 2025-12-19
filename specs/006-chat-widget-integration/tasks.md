---
description: "Task list for Chat Widget Integration"
---

# Tasks: Chat Widget Integration

**Input**: Design documents from `specs/006-chat-widget-integration/`
**Prerequisites**: plan.md, spec.md

**Tests**: Manual verification steps included as tasks.

**Organization**: Tasks are grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: US1, US2, US3

## Phase 1: Setup

**Purpose**: Project initialization

- [x] T001 Verify/Install `lucide-react` and `clsx` dependencies in `frontend/package.json`
- [x] T002 Create component directory `frontend/src/components/ChatWidget`

---

## Phase 2: Foundational

**Purpose**: Base styling and shared utilities

- [x] T003 Create `frontend/src/components/ChatWidget/styles.module.css` with base variables and layout classes

---

## Phase 3: User Story 1 - Standalone Chat Interface (Priority: P1) 🎯 MVP

**Goal**: A visitor can open a chat widget to ask questions (mocked response).

**Independent Test**: Widget renders, toggles, and "chats" (echo/mock).

### Implementation for User Story 1

- [x] T004 [US1] Create mock `useChat` hook in `frontend/src/components/ChatWidget/useChat.ts` (State: messages, isLoading)
- [x] T005 [US1] Create `ChatWindow` component in `frontend/src/components/ChatWidget/ChatWindow.tsx` (MessageList + Input)
- [x] T006 [US1] Create `ChatWidget` container in `frontend/src/components/ChatWidget/index.tsx` (FAB + Window toggle)
- [x] T007 [US1] Manual Verification: Run `npm start` and test widget interaction on any page

---

## Phase 4: User Story 2 - Global Availability (Priority: P2)

**Goal**: Widget persists across page navigation using Session Storage.

**Independent Test**: Navigate between 3 pages, chat state remains.

### Implementation for User Story 2

- [x] T008 [US2] Create or Modify `frontend/src/theme/Root.js` to wrap app with `ChatWidget`
- [x] T009 [US2] Manual Verification: Open Chat, type message, click link to different doc, verify message persists

---

## Phase 5: User Story 3 - RAG Backend Connection (Priority: P3)

**Goal**: Connect to real backend via SSE.

**Independent Test**: Real responses flow from backend.

### Implementation for User Story 3

- [x] T010 [US3] Update `frontend/src/components/ChatWidget/useChat.ts` to implement `EventSource` (SSE) logic
- [x] T011 [US3] Configure proxy or API URL in `frontend/docusaurus.config.ts` (if needed for CORS/path)
- [x] T012 [US3] Manual Verification: Send query, verify streaming response from backend

---

## Dependencies & Execution Order

1. **Setup & Foundation**: T001-T003 (Blocks all)
2. **US1 (UI)**: T004-T007 (Blocks US2)
3. **US2 (Integration)**: T008-T009 (Blocks US3 integration testing, though US3 logic could be parallel)
4. **US3 (Backend)**: T010-T012

## Implementation Strategy

1. **MVP**: Complete US1 + US2. This gives a working "dumb" widget that follows the user.
2. **V1**: Complete US3. Wires it to the brain.
