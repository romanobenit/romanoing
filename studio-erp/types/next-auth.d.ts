import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      ruolo: string
      clienteId?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    ruolo: string
    clienteId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    ruolo: string
    clienteId?: string
  }
}
