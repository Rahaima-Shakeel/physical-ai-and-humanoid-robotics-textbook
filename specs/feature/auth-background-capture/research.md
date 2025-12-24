# Research: Better-Auth Sidecar Architecture

## Decision: Sidecar Architecture
We use the "Sidecar" pattern as recommended for polyglot environments (Python/Node.js).

- **Auth Service**: Node.js + Better-Auth. Handles user sessions, signup, and login.
- **Resource Server**: FastAPI. Verifies tokens via JWKS.
- **Shared DB**: Neon Postgres. Both services share the `user`, `session`, and `account` tables.

## Rationale
- Better-Auth is built for Node.js and providing first-class React integration for Docusaurus.
- FastAPI is excellent for the RAG/AI logic but implementing a full-featured auth system (session, OIDC, etc.) from scratch is complex.
- Shared database allows both services to access user data efficiently.

## Integration Patterns
- **Stateless Verification**: FastAPI will fetch public keys from `auth-service/.well-known/jwks.json` to verify tokens without a DB hit for every request.
- **Profile Extension**: `user_profiles` table in the shared DB stores background capture data, linked by `user_id`.

## Security Considerations
- JWT Verification: Use `pyjwt[crypto]` for RS256 signature verification.
- CORS: Configured `TRUSTED_ORIGINS` for Docusaurus.
- Cookie Safety: `secure: true` and `sameSite: "none"` for cross-subdomain in production.
