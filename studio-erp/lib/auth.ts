import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { credentialsProvider } from './auth-credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  ...authConfig,
  providers: [credentialsProvider, ...authConfig.providers],
})
