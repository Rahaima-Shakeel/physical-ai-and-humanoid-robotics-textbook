import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth.js'
import 'dotenv/config'

const app = new Hono()

app.use('/api/*', cors({
  origin: (origin) => origin, // Allow configured origins
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
}))

app.all('/api/auth/*', (c) => auth.handler(c.req.raw))

// Default to 3001 to avoid conflict with Docusaurus/Next.js default 3000
const port = Number(process.env.PORT) || 3001
console.log(`Auth Service running on port ${port}`)
serve({ fetch: app.fetch, port })