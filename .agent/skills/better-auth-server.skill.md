# Skill: Scaffold Better-Auth Sidecar Service

## Metadata
- **Name**: better-auth-server
- **Category**: setup
- **Tags**: auth, nodejs, better-auth, scaffolding

## Description
Creates a lightweight, production-ready Node.js (Hono) server dedicated to running Better-Auth. This is required for the "Sidecar" pattern with Python backends.

## Inputs
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| port | number | No | 3001 | Port to run the auth service on (Default 3001 to avoid React/Docusaurus 3000) |

## Outputs
- `auth-service/package.json`
- `auth-service/src/index.ts`
- `auth-service/tsconfig.json`

## Execution Steps

### 1. Create Directory
Run `mkdir auth-service` and `mkdir auth-service/src`.

### 2. Create `package.json`
```json
{
  "name": "auth-service",
  "type": "module",
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
    "@types/node": "^22.10.1",
    "@types/pg": "^8.11.10"
  }
}
```

### 3. Create `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### 4. Create `src/index.ts`
(Includes CORS Authorization and Dynamic Origin Handling)

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { betterAuth } from "better-auth"
import { Pool } from "pg"
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Fix for self-signed certs in some managed DBs
})

const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : ["http://localhost:3000"]
})

const app = new Hono()

app.use('/api/*', cors({
  origin: (origin) => origin, // Allow configured origins
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
}))

app.all('/api/auth/*', (c) => auth.handler(c.req.raw))

// Default to 3001 to avoid conflict with Docusaurus/Next.js default 3000
const port = Number(process.env.PORT) || {{port}}
console.log(`Auth Service running on port ${port}`)
serve({ fetch: app.fetch, port })
```

### 5. Final Instructions
User must run `cd auth-service && npm install` after generation.
