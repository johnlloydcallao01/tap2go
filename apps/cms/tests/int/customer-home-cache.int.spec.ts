import { describe, expect, it, vi } from 'vitest'
import {
  bustCustomerHomeCache,
  getOrBuildDashboard,
} from '../../src/utils/dashboardCache'

vi.mock('@encreasl/cache', () => ({
  getCached: vi.fn(async () => null),
  setCached: vi.fn(async () => {}),
  deleteCachedByPrefix: vi.fn(async () => {}),
}))

describe('customer Home server cache', () => {
  it('serves warm responses and rebuilds on an explicit refresh', async () => {
    const key = `customer:home-overview:test:${Date.now()}`
    let builds = 0
    const build = async () => ++builds

    const first = await getOrBuildDashboard(key, 30, build)
    const warm = await getOrBuildDashboard(key, 30, build)
    const refreshed = await getOrBuildDashboard(key, 30, build, { bypassCache: true })
    const afterRefresh = await getOrBuildDashboard(key, 30, build)
    await bustCustomerHomeCache()
    const afterInvalidation = await getOrBuildDashboard(key, 30, build)

    expect(first).toMatchObject({ data: 1, status: 'MISS' })
    expect(warm).toMatchObject({ data: 1, status: 'HIT' })
    expect(refreshed).toMatchObject({ data: 2, status: 'MISS' })
    expect(afterRefresh).toMatchObject({ data: 2, status: 'HIT' })
    expect(afterInvalidation).toMatchObject({ data: 3, status: 'MISS' })
    expect(builds).toBe(3)
  })
})
