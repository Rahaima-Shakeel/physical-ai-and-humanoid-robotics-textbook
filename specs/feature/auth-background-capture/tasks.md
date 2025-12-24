# Tasks: Better-Auth Sidecar Integration

## Phase 1: Auth Service Setup (Node.js)
- [x] Initialize `auth-service` directory with Hono and Better-Auth
- [x] Configure `better-auth` with Neon Postgres (Shared DB)
- [x] Implement JWKS endpoint for FastAPI consumption
- [x] Configure CORS for Docusaurus frontend
- [x] Run initial migrations for Better-Auth tables

## Phase 2: Backend Integration (FastAPI)
- [x] Add `pyjwt[crypto]` to `requirements.txt`
- [x] Implement `backend/api/auth_utils.py` for token verification
- [x] Update `init_db.py` with extension tables (`user_profiles`, `chat_messages`)
- [x] Create Profile API endpoints (`backend/api/profile.py`)
- [x] Support `user_id` in `chat.py` messages

## Phase 3: Frontend Integration (Docusaurus)
- [x] Install `better-auth` client dependencies
- [x] Create `frontend/src/lib/auth-client.ts`
- [x] Wrap application with `AuthProvider` in `Root.js`
- [x] Implement `AuthModal` (Login/Signup)
- [x] Build `SignupFlow` questionnaire
- [x] Register custom `NavbarAuth` item

## Phase 4: Styling & Verification
- [x] Professional UI for Auth and Profile forms
- [x] Explicit backend URL handling via Docusaurus context
- [x] Manual test: End-to-end signup -> profile save
- [x] Manual test: Authenticated chat history link
