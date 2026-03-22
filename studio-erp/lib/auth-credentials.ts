/**
 * Credentials provider for NextAuth
 * This file uses database queries and should only be imported in Node.js runtime (not Edge)
 */
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { query } from '@/lib/db'

export const credentialsProvider = Credentials({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null
    }

    const sql = `
      SELECT
        u.id, u.email, u.nome, u.cognome, u.attivo,
        u.password_hash as "passwordHash",
        u.cliente_id as "clienteId",
        r.codice as "ruoloCodice"
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE u.email = $1
      LIMIT 1
    `

    const result = await query(sql, [credentials.email as string])
    const utente = result.rows[0]

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
      nome: utente.nome,
      cognome: utente.cognome,
      ruolo: utente.ruoloCodice,
      clienteId: utente.clienteId?.toString(),
    }
  },
})
