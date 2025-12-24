# Feature Spec: Authentication with User Background Capture

## Goal
Add user authentication and collect software and hardware background data to enable future content personalization.

## Scope
### In Scope
- User signup and signin flows (Backend + Frontend).
- Collection of background data during signup:
  - Software background: languages, experience level, tools.
  - Hardware background: devices, specs, constraints.
- Secure storage of user credentials and background data in Neon Postgres.
- Associating chat activity with authenticated users.
- Ensuring the app remains functional for anonymous users.

### Out of Scope
- Password reset flow (can be added later).
- Social logins (OAuth2) - only email/password for now.
- Advanced personalization logic (this spec only covers data collection).

## Requirements

### Backend
1. **User Model**:
   - `id` (UUID)
   - `email` (Unique)
   - `hashed_password`
   - `created_at`
2. **User Profile Model**:
   - `user_id` (ForeignKey)
   - `software_experience`: JSON or structured fields (languages, level, tools).
   - `hardware_specs`: JSON or structured fields (devices, specs).
3. **Authentication**:
   - JWT-based authentication.
   - `/api/auth/signup` endpoint.
   - `/api/auth/signin` endpoint.
   - `/api/auth/me` endpoint to fetch current user profile.
4. **Chat Integration**:
   - Update `chat_message` endpoint to optionally accept a user ID from the JWT token.
   - Store chat history in the database associated with the user.

### Frontend
1. **Authentication State**:
   - React Context or Docusaurus custom field to manage auth state.
   - Persistent login using localStorage/cookies.
2. **UI Components**:
   - `AuthModal` or dedicated pages for Sign In / Sign Up.
   - Multi-step Sign Up form:
     - Step 1: Account details (Email, Password).
     - Step 2: Software background questionnaire.
     - Step 3: Hardware background questionnaire.
3. **Navigation**:
   - "Sign In" button in the navbar.
   - "Profile" or "Sign Out" once authenticated.
4. **Chat Integration**:
   - Pass the JWT token in the `Authorization` header when calling chat endpoints.

## Success Criteria
- Users can sign up and sign in successfully.
- Background questions are collected and stored during signup.
- User profile data is retrievable via an API.
- Existing features work for anonymous users.
- Chat history is persisted for logged-in users.

## User Review Required
> [!IMPORTANT]
> Should we allow users to skip the background questionnaire during signup? This might improve signup conversion but result in less personalized content initially.
