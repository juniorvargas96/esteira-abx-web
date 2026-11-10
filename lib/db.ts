import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { dbPool?: Pool };

export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');
  if (!globalForDb.dbPool) {
    globalForDb.dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 8000,
    });
  }
  return globalForDb.dbPool;
}
