import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "https://humanoid-robotic-auth.up.railway.app"
})

export const { signIn, signUp, useSession, signOut } = authClient;
