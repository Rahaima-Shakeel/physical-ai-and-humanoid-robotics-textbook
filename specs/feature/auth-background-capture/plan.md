# Implementation Plan: Authentication with User Background Capture

**Branch**: `feature/auth-background-capture` | **Date**: 2025-12-23 | **Spec**: [spec.md](file:///c:/Users/Dell/Desktop/Quarter%204/Hacathon/physical-ai-and-humanoid-robotics-textbook/specs/007-auth-background-capture/spec.md)
**Input**: Feature specification from `/specs/007-auth-background-capture/spec.md`

## Summary

This feature implements user authentication using **Better-Auth** in a "Sidecar Architecture" alongside the existing FastAPI backend. It also captures user software and hardware background data via a multi-step questionnaire in Docusaurus to enable future content personalization.

## Technical Context

**Language/Version**: Python 3.13 (Backend), Node.js 20+ (Auth & Frontend)
**Primary Dependencies**: FastAPI (Python), Better-Auth (Node.js), Hono (Auth Server), React (Docusaurus)
**Storage**: Neon Serverless PostgreSQL (Shared DB)
**Testing**: Pytest (Backend), Manual verification (Frontend)
**Target Platform**: Web (Docusaurus)
**Project Type**: Monorepo (Web App + Backend)
**Performance Goals**: < 800ms for first stream token, sub-second page loads
**Constraints**: Stateless JWT verification (RS256) via JWKS
**Scale/Scope**: Support for both authenticated and anonymous chat users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Simplicity First**: Sidecar architecture separates concerns while sharing the DB.
- [x] **User Experience Excellence**: Questionnaire is non-blocking and enables personalization.
- [x] **Performance by Default**: Stateless verification avoids DB lookup for every request.
- [x] **Maintainability**: Clear separation between Auth Service and RAG Backend.
- [x] **Security & Privacy**: RS256 signing and Secure cookies (in prod).
- [x] **Incremental Delivery**: Signup/In first, followed by background capture.
- [x] **Agent Autonomy**: Structured planning allows autonomous implementation.

## Project Structure

### Documentation (this feature)

```text
specs/feature/auth-background-capture/
├── plan.md              # This file
├── research.md          # Sidecar architecture & JWKS patterns
├── data-model.md        # Shared user/profile schema
├── quickstart.md        # Local setup steps
├── contracts/           # API contracts for profile/chat
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
auth-service/
├── src/
│   ├── index.ts         # Hono + Better-Auth server
├── package.json
└── tsconfig.json

backend/
├── api/
│   ├── auth_utils.py    # JWT/JWKS verification
│   ├── profile.py       # User profile endpoints
│   └── chat.py          # Updated with user association
├── scripts/
│   └── init_db.py       # Updated schema
└── requirements.txt     # Added pyjwt[crypto]

frontend/
├── src/
│   ├── components/Auth/ # AuthUI & SignupFlow
│   ├── context/         # AuthProvider
│   └── lib/             # auth-client.ts
└── docusaurus.config.ts  # Navbar integration
```

**Structure Decision**: Web application structure with a dedicated `auth-service` for Better-Auth.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple Services | Better-Auth requires Node.js but RAG is Python | Custom FastAPI auth lacks advanced features and React integration. |
| Shared Database | Direct access for profile/auth | Service-to-service API introduces latency and synchronization complexity. |
