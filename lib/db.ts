/**
 * Prisma Client Singleton
 *
 * This file creates a single Prisma client instance that's reused across
 * the application. In development, this prevents creating too many database
 * connections during hot reloading.
 */

import { PrismaClient } from '@prisma/client'

// Define the global type for Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with logging in development
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// In development, store the Prisma client on the global object
// to prevent creating new instances on hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
