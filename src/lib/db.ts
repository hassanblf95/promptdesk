import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prefer direct URL to avoid PgBouncer pooler connection issues in serverless.
// Falls back to DATABASE_URL if DIRECT_URL is not set.
const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: { db: { url: datasourceUrl } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
