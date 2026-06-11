import { createClient, type RedisClientType } from 'redis'

let redis: RedisClientType | null = null
let redisFailed = false
const memory = new Map<string, { expires: number; value: any }>()

async function getRedis(): Promise<RedisClientType | null> {
  if (redisFailed || !process.env.REDIS_URL) return null
  if (redis?.isOpen) return redis
  try {
    redis = createClient({ url: process.env.REDIS_URL })
    redis.on('error', () => { redisFailed = true })
    await redis.connect()
    return redis
  } catch {
    redisFailed = true
    return null
  }
}

export async function cached<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<{ value: T; cache: 'HIT' | 'MISS' | 'STALE' }> {
  const now = Date.now()
  const mem = memory.get(key)
  if (mem && mem.expires > now) return { value: mem.value as T, cache: 'HIT' }

  const client = await getRedis()
  if (client) {
    try {
      const raw = await client.get(key)
      if (raw) {
        const value = JSON.parse(raw) as T
        memory.set(key, { value, expires: now + ttlSeconds * 1000 })
        return { value, cache: 'HIT' }
      }
    } catch {
      redisFailed = true
    }
  }

  try {
    const value = await producer()
    memory.set(key, { value, expires: now + ttlSeconds * 1000 })
    if (client && !redisFailed) {
      try { await client.set(key, JSON.stringify(value), { EX: ttlSeconds }) } catch { redisFailed = true }
    }
    return { value, cache: 'MISS' }
  } catch (error) {
    if (mem) return { value: mem.value as T, cache: 'STALE' }
    throw error
  }
}
