import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Hostinger shared MySQL: max_connections_per_hour düşük.
 * Build ve runtime’da bağlantı sayısını sınırla; aksi halde ISR/prerender 500 üretir.
 */
function databaseUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const isBuild = process.env.NEXT_PHASE === "phase-production-build";
    const limit =
      process.env.PRISMA_CONNECTION_LIMIT?.trim() || (isBuild ? "1" : "3");
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", limit);
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "20");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl() ? { db: { url: databaseUrl() } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
