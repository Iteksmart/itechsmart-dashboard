import { Pool } from 'pg'

let pool: Pool | null = null

export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing')
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 3000
    })
  }
  return pool
}

export async function queryJson<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await db().query(sql, params)
  return result.rows as T[]
}
