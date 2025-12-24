# Better-Auth Sidecar Knowledge Base

> Implementation guide for running Better-Auth as a standalone microservice alongside FastAPI.

## 1. The Auth Service (Node.js)

This service runs *only* Better-Auth. It exposes the API endpoints used by the frontend client.

### `package.json`
We use **Hono** which provides a standard Fetch API interface, simplifying deployment on Vercel, Cloudflare, or Railway.

```json
{
  "name": "auth-service",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "db:migrate": "better-auth migrate"
  },
  "dependencies": {
    "better-auth": "^1.0.0",
    "hono": "^4.6.12",
    "@hono/node-server": "^1.13.7",
    "pg": "^8.13.1",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "@types/node": "^22.10.1"
  }
}
```

### `src/index.ts` (The Server)

**Crucial for Production**: We dynamically set cookie security based on the environment.

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { betterAuth } from "better-auth"
import { Pool } from "pg"
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true // Required for Neon
})

const isProd = process.env.NODE_ENV === 'production';

const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  advanced: {
    // SECURITY: This ensures cookies work across 'docs.com' and 'auth.docs.com'
    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd // MUST be true in production
    }
  },
  user: {
      additionalFields: {
          role: { type: "string", required: false, defaultValue: "user" }
      }
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS ?
      process.env.TRUSTED_ORIGINS.split(',') :
      ["http://localhost:3000"] // Docusaurus Dev Port
})

const app = new Hono()

// CORS: Allow Docusaurus to talk to us
app.use('/api/*', cors({
  origin: (origin) => origin, // In strict mode, validate against allowed list
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true, // Required to pass Cookies
}))

app.all('/api/auth/*', (c) => auth.handler(c.req.raw))

const port = Number(process.env.PORT) || 3001; // Avoid port 3000 conflict with Docusaurus
console.log(`Auth Service running on port ${port}`)
serve({ fetch: app.fetch, port })
```

## 2. Frontend Integration (Docusaurus)

**Issue**: Docusaurus renders pages at build time (Node environment). Accessing `window` causes crashes.
**Solution**: Use a safe client wrapper or `BrowserOnly`.

### `src/lib/auth-client.ts`
```typescript
import { createAuthClient } from "better-auth/react"

// Ensure we don't crash the build server
export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production'
    ? "https://auth.your-project.com" // Prod Auth URL
    : "http://localhost:3001" // Dev Auth URL
})
```

### `src/components/AuthWrapper.tsx`
Accessing user state safely in components.

```tsx
import React from 'react';
import { authClient } from '../lib/auth-client';

export function LoginButton() {
    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.href // Return to current page
        });
    };

    return <button onClick={handleLogin}>Sign in with Google</button>;
}
```

## 3. Deployment Checklist (Railway)

1.  **Repo Structure**: Monorepo with `/backend` and `/auth-service`.
2.  **Services**: Create 2 services in Railway from the same repo.
3.  **Environment Variables**:
    *   `DATABASE_URL`: Same for both.
    *   `BETTER_AUTH_SECRET`: Same for both.
    *   `BETTER_AUTH_URL`: The *public* domain of the Auth Service.
    *   `TRUSTED_ORIGINS`: Comma-separated list of your Docusaurus domains (e.g. `https://docs.humanoid-robotics.com`).

## 4. Troubleshooting Guide

### "PyJWKClientConnectionError" in FastAPI
*   **Cause**: FastAPI cannot reach the Auth Service to get public keys.
*   **Fix**: Check `BETTER_AUTH_URL` env var in FastAPI. It should be the *public* URL (e.g. `https://auth.app.com`) OR the internal Docker URL if on the same network.
*   **Debug**: `curl https://YOUR_AUTH_URL/.well-known/jwks.json` to verify keys exist.

### "CORS Error" on Frontend
*   **Cause**: The Auth Service is rejecting the request because the Origin header doesn't match.
*   **Fix**: Add your frontend URL (exactly as it appears in the browser) to `TRUSTED_ORIGINS` in the Auth Service environment variables.

### "Session is null" after Login
*   **Cause**: Browser blocked the cookie.
*   **Fix**:
    1. Ensure `https` is used everywhere.
    2. Ensure `sameSite: "none"` and `secure: true` are set in `better-auth` config (see `index.ts` above).
    3. Ensure domains match (e.g. `app.com` and `api.app.com` share cookies better than `app.railway.app` and `api.vercel.app`).
