// NOTE: No top-level import of '@encreasl/cache' here.
// Collections import this module during `payload migrate:*` (payload bin ESM),
// where the workspace package's named ESM exports fail to resolve.
// Dynamic imports below run only at Next.js runtime, where existing API routes
// already import '@encreasl/cache' successfully.

async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const mod = await import('@encreasl/cache')
    return await (mod as unknown as { getCached: <X>(k: string) => Promise<X | null> }).getCached<T>(key)
  } catch {
    return null
  }
}

async function redisSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const mod = await import('@encreasl/cache')
    await (mod as unknown as { setCached: <X>(k: string, v: X, ttl: number) => Promise<void> }).setCached(key, value, ttlSeconds)
  } catch {
    // ignore - TTL convergence is fallback
  }
}

async function redisBustPrefix(prefix: string): Promise<void> {
  try {
    const mod = await import('@encreasl/cache')
    await (mod as unknown as { deleteCachedByPrefix: (p: string) => Promise<void> }).deleteCachedByPrefix(prefix)
  } catch {
    // ignore
  }
}

// L1: process-local 5s fresh + 30s stale-while-revalidate.
// Survives Upstash 1.5s timeouts / misconfig (fail-open Redis -> L1 still serves).
const L1_FRESH_MS = 5000
const L1_STALE_MS = 30000

type L1Entry = { value: unknown; freshUntil: number; staleUntil: number }
const l1 = new Map<string, L1Entry>()

// Singleflight: concurrent MISS for same key share one builder promise.
// Prevents thundering herd when global TTL expires across tabs/instances.
const inflight = new Map<string, Promise<unknown>>()

export function bustDashboardL1(prefix = 'admin:dashboard:'): void {
  for (const key of l1.keys()) {
    if (key.startsWith(prefix)) l1.delete(key)
  }
}

export async function bustDashboardCache(prefix = 'admin:dashboard:'): Promise<void> {
  bustDashboardL1(prefix)
  await redisBustPrefix(prefix)
}

export async function bustAnalyticsCache(): Promise<void> {
  bustDashboardL1('admin:analytics:')
  await redisBustPrefix('admin:analytics:')
}

export async function bustReportsCache(): Promise<void> {
  bustDashboardL1('admin:reports:')
  await redisBustPrefix('admin:reports:')
}

export async function bustPayoutsCache(): Promise<void> {
  bustDashboardL1('admin:payouts:')
  await redisBustPrefix('admin:payouts:')
}

export async function bustVendorsCache(): Promise<void> {
  bustDashboardL1('admin:vendors:')
  await redisBustPrefix('admin:vendors:')
}

export async function bustMerchantsCache(): Promise<void> {
  bustDashboardL1('admin:merchants:')
  await redisBustPrefix('admin:merchants:')
}

export async function bustOrdersCache(): Promise<void> {
  bustDashboardL1('admin:orders:')
  await redisBustPrefix('admin:orders:')
}

export async function bustCustomersCache(): Promise<void> {
  bustDashboardL1('admin:customers:')
  await redisBustPrefix('admin:customers:')
  bustDashboardL1('admin:customer-addresses:')
  await redisBustPrefix('admin:customer-addresses:')
  bustDashboardL1('admin:emergency-contacts:')
  await redisBustPrefix('admin:emergency-contacts:')
  bustDashboardL1('admin:customer-activity:')
  await redisBustPrefix('admin:customer-activity:')
}

export async function bustOrderItemsCache(): Promise<void> {
  bustDashboardL1('admin:order-items:')
  await redisBustPrefix('admin:order-items:')
}

export async function bustTransactionsCache(): Promise<void> {
  bustDashboardL1('admin:transactions:')
  await redisBustPrefix('admin:transactions:')
}

export async function bustProductsCache(): Promise<void> {
  bustDashboardL1('admin:products:')
  await redisBustPrefix('admin:products:')
  bustDashboardL1('admin:merchant-products:')
  await redisBustPrefix('admin:merchant-products:')
}

export async function bustCatalogCache(): Promise<void> {
  bustDashboardL1('admin:catalog-')
  await redisBustPrefix('admin:catalog-')
  bustDashboardL1('admin:product-categories:')
  await redisBustPrefix('admin:product-categories:')
}

export async function bustBusinessZonesCache(): Promise<void> {
  bustDashboardL1('admin:business-zones:')
  await redisBustPrefix('admin:business-zones:')
  bustDashboardL1('admin:business-zones-overview:')
  await redisBustPrefix('admin:business-zones-overview:')
}

export async function bustProfileCache(userId?: number | string): Promise<void> {
  const selector = userId != null ? `admin:profile:v1:${userId}` : 'admin:profile:'
  bustDashboardL1(selector)
  await redisBustPrefix(selector)
}

export async function bustMediaLibraryCache(): Promise<void> {
  bustDashboardL1('admin:media-library:')
  await redisBustPrefix('admin:media-library:')
}

export async function bustSearchCache(): Promise<void> {
  bustDashboardL1('admin:search:')
  await redisBustPrefix('admin:search:')
}

function readL1<T>(key: string): { hit: boolean; stale: boolean; value: T | null } {
  const entry = l1.get(key)
  if (!entry) return { hit: false, stale: false, value: null }
  const now = Date.now()
  if (now <= entry.freshUntil) return { hit: true, stale: false, value: entry.value as T }
  if (now <= entry.staleUntil) return { hit: true, stale: true, value: entry.value as T }
  l1.delete(key)
  return { hit: false, stale: false, value: null }
}

function writeL1(key: string, value: unknown): void {
  const now = Date.now()
  l1.set(key, { value, freshUntil: now + L1_FRESH_MS, staleUntil: now + L1_STALE_MS })
}

/**
 * L1 (5s fresh / 30s stale) -> Redis -> singleflight builder.
 * Returns status for X-Dashboard-Cache header.
 * Stale L1 is served immediately while background rebuild refreshes Redis.
 */
export async function getOrBuildDashboard<T>(
  key: string,
  ttlSeconds: number,
  builder: () => Promise<T>,
): Promise<{ data: T; status: 'HIT' | 'STALE' | 'MISS' }> {
  const l1Res = readL1<T>(key)
  if (l1Res.hit && !l1Res.stale && l1Res.value != null) {
    return { data: l1Res.value, status: 'HIT' }
  }
  const staleFallback = l1Res.hit && l1Res.stale ? l1Res.value : null

  const existing = inflight.get(key)
  if (existing) {
    const data = (await existing) as T
    return { data, status: 'HIT' }
  }

  // Fast path: Redis HIT (no builder, no gate queue upstream).
  try {
    const redisHit = await redisGet<T>(key)
    if (redisHit != null) {
      writeL1(key, redisHit)
      return { data: redisHit, status: 'HIT' }
    }
  } catch {
    // fall through to stale / rebuild
  }

  if (staleFallback != null) {
    // SWR: serve stale now, refresh in background (singleflight).
    const rebuild = (async () => {
      const fresh = await builder()
      writeL1(key, fresh)
      await redisSet(key, fresh, ttlSeconds)
      return fresh
    })()
    inflight.set(key, rebuild)
    void rebuild.finally(() => {
      if (inflight.get(key) === rebuild) inflight.delete(key)
    })
    return { data: staleFallback, status: 'STALE' }
  }

  const build = (async () => {
    const fresh = await builder()
    writeL1(key, fresh)
    await redisSet(key, fresh, ttlSeconds)
    return fresh
  })()
  inflight.set(key, build)
  try {
    const data = await build
    return { data, status: 'MISS' }
  } finally {
    if (inflight.get(key) === build) inflight.delete(key)
  }
}
