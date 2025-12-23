import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.ruolo = user.ruolo
        token.clienteId = user.clienteId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.ruolo = token.ruolo as string
        session.user.clienteId = token.clienteId as string | undefined
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnPublicPage = [
        '/',
        '/login',
        '/quiz',
        '/bundle',
        '/checkout',
      ].some((path) => nextUrl.pathname.startsWith(path))

      if (isOnPublicPage) {
        return true
      }

      if (!isLoggedIn) {
        return false
      }

      const ruolo = auth.user.ruolo

      // Protezione route committente
      if (nextUrl.pathname.startsWith('/cliente')) {
        return ruolo === 'COMMITTENTE'
      }

      // Protezione route collaboratori
      if (nextUrl.pathname.startsWith('/collaboratore')) {
        return ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO'].includes(ruolo)
      }

      // Protezione route admin
      if (nextUrl.pathname.startsWith('/admin')) {
        return ruolo === 'TITOLARE'
      }

      return true
    },
  },
}
