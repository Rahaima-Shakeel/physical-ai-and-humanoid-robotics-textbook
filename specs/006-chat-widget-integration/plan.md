# Implementation Plan: Chat Widget Integration

**Branch**: `006-chat-widget-integration` | **Date**: 2025-12-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-chat-widget-integration/spec.md`

## Summary

Implement a **React-based Chat Widget** integrated into the Docusaurus documentation site via global `Root` component swizzling. The widget will persist state using `Session Storage` and stream responses from the backend using **Server-Sent Events (SSE)**.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18)
**Primary Dependencies**: `clsx` (CSS util), `lucide-react` (Icons - typical in modern stacks, will verify if present or use SVGs), Docusaurus Core.
**Storage**: Browser `sessionStorage`.
**Testing**: Manual UI verification and Mock Service Worker (MSW) or simple fetch mock for independent testing.
**Target Platform**: Web (modern browsers).
**Project Type**: Docusaurus Static Site (SPA navigation).
**Performance Goals**: <100ms interaction latency, zero layout shift (CLS) on open.

## Constitution Check

- [x] **Simplicity First**: Using Docusaurus native `Root` vs external scripts keeps build simple.
- [x] **User Experience Excellence**: Persistent FAB, non-blocking UI, streaming feedback.
- [x] **Performance by Default**: Widget code split (lazy load if possible) but lightweight enough for init.
- [x] **Maintainability**: Componentized architecture (`ChatWidget`, `MessageList`, `Input`).
- [x] **Security & Privacy**: No sensitive data storage (Session only).
- [x] **Incremental Delivery**: UI first (mocked), then Backend wiring.

## Project Structure

### Documentation (this feature)

```text
specs/006-chat-widget-integration/
├── plan.md              # This file
├── spec.md              # Requirements
├── tasks.md             # To be created
```

### Source Code

```text
frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget/          # [NEW] Feature Component
│   │       ├── index.tsx        # Main container
│   │       ├── ChatWindow.tsx   # UI State & Layout
│   │       ├── styles.module.css# Scoped styling
│   │       └── useChat.ts       # Logic hook (state, SSE)
│   └── theme/
│       └── Root.js              # [NEW/MODIFY] Global layout wrapper
```

## Proposed Changes

### Frontend - Components
#### [NEW] [ChatWidget](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/frontend/src/components/ChatWidget/index.tsx)
- Implements the Floating Action Button (FAB).
- Manages visibility state.
- Lazy loads the ChatWindow only on first interaction (optional optimization).

#### [NEW] [ChatWindow](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/frontend/src/components/ChatWidget/ChatWindow.tsx)
- Renders `MessageList` and `InputArea`.
- Handles auto-scrolling.
- Displays Markdown content (using `react-markdown` if available in Docusaurus deps, else plain text for MVP).

#### [NEW] [useChat Hook](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/frontend/src/components/ChatWidget/useChat.ts)
- `sendMessage(text)`: POST to backend.
- `messages`: State array (persisted in sessionStorage).
- `isLoading`: Boolean state.
- Handles SSE connection and message appending.

### Frontend - Integration
#### [NEW] [Root Component](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/frontend/src/theme/Root.js)
- Wraps the Docusaurus app.
- Mounts `<ChatWidget />` globally so it persists across route changes.

## Verification Plan

### Automated Tests
*Currently no unit test runner detected in `frontend`. Will rely on manual verification for this UI feature.*

### Manual Verification
1. **Visual Test**:
   - Run `npm start` in `frontend`.
   - Verify FAB appears on Homepage and Doc pages.
   - Verify Chat Window opens/closes.
   - Verify mobile responsiveness.

2. **Persistence Test**:
   - Open Chat, type a message.
   - Click a link to navigate to another page.
   - Verify Chat state is preserved (messages still there).
   - Close tab, reopen -> Verify Chat is reset.

3. **Mock Backend Test**:
   - Create a temporary SSE mock in `useChat`.
   - Verify "typing..." indicator.
   - Verify text streaming works smoothly.
