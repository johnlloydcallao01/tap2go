import { Redis } from '@upstash/redis'

const CACHE_TIMEOUT_MS = 1500

let redis: Redis | null | undefined

function getRedis(): Redis | null {
  if (redis !== undefined) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token, enableTelemetry: false }) : null
  return redis
}

function withTimeout<T>(operation: Promise<T>): Promise<T | null> {
  return Promise.race([
    operation,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), CACHE_TIMEOUT_MS)),
  ]).catch(() => null)
}

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null
  return withTimeout(client.get<T>(key))
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis()
  if (!client) return
  await withTimeout(client.set(key, value, { ex: ttlSeconds }))
}

export async function deleteCached(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  await withTimeout(client.del(key))
}