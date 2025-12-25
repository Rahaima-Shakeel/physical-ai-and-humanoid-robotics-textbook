import { betterAuth } from "better-auth"
import { Pool } from "pg"
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  trustedOrigins: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : ["http://localhost:3000"],
  advanced: {
      cookies: {
          session_token: {
              attributes: {
                  secure: true,
                  sameSite: "none"
              }
          }
      }
  }
})