import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const utente = await prisma.utente.findUnique({
          where: { email: credentials.email as string },
          include: {
            ruolo: true,
            cliente: true,
          },
        })

        if (!utente || !utente.attivo) {
          return null
        }

        const passwordCorretta = await compare(
          credentials.password as string,
          utente.passwordHash
        )

        if (!passwordCorretta) {
          return null
        }

        return {
          id: utente.id.toString(),
          email: utente.email,
          name: `${utente.nome} ${utente.cognome}`,
          ruolo: utente.ruolo.codice,
          clienteId: utente.clienteId?.toString(),
        }
      },
    }),
  ],
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
