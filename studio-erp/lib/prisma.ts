/**
 * Mock Prisma client for compatibility
 * NOTE: This app uses direct SQL queries via lib/db.ts instead of Prisma
 * This file exists only for NextAuth adapter compatibility
 */

// Create a mock Prisma client that satisfies NextAuth's PrismaAdapter requirements
export const prisma = {} as any

export default prisma
