import { createAuthClient } from "better-auth/react"

import siteConfig from '@generated/docusaurus.config';

export const authClient = createAuthClient({
    baseURL: siteConfig.customFields?.betterAuthUrl as string
})

export const { signIn, signUp, useSession, signOut } = authClient;