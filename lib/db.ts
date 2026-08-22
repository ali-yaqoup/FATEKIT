import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

const mockNoOp = { 
  findMany: async () => [], 
  findFirst: async () => null,
  findUnique: async () => null, 
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {}, 
  delete: async () => ({}),
  count: async () => 0,
  aggregate: async () => ({ _sum: { total: 0 } }),
  groupBy: async () => [] 
};

if (!process.env.DATABASE_URL) {
  console.warn('[AI Studio] Database not connected (no DATABASE_URL) — using mock');
  db = new Proxy({}, { 
    get: (_, prop) => mockNoOp
  }) as unknown as PrismaClient;
} else {
  try {
    db = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch {
    console.warn('[AI Studio] Database not connected (error) — using mock');
    db = new Proxy({}, { 
      get: (_, prop) => mockNoOp
    }) as unknown as PrismaClient;
  }
}

export { db };
