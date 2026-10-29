import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomeOverviewService } from '../../../../packages/client-services/src/services/home-overview-service'

describe('HomeOverviewService cancellation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    HomeOverviewService.clearCache()
  })

  it('passes the query signal to fetch and rejects instead of returning empty success', async () => {
    const fetchMock = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              const error = new Error('Request aborted')
              error.name = 'AbortError'
              reject(error)
            },
            { once: true },
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const controller = new AbortController()

    const request = HomeOverviewService.getHomeOverview(
      { customerId: `cancel-test-${Date.now()}` },
      controller.signal,
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    )

    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('reports the HTTP status and duration when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503, headers: new Headers() }) as Response),
    )
    const timingLog = vi.spyOn(console, 'info').mockImplementation(() => {})

    await expect(
      HomeOverviewService.getHomeOverview({ customerId: `failure-test-${Date.now()}` }),
    ).rejects.toThrow('home-overview: 503')

    expect(timingLog).toHaveBeenCalledWith(
      '[home-overview] request timing',
      expect.objectContaining({
        status: 503,
        outcome: 'error',
        fetchMs: expect.any(Number),
        totalMs: expect.any(Number),
      }),
    )
  })

  it('requests a section-specific overview for lazy section loading', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: true, data: {} }),
    }) as Response)
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'info').mockImplementation(() => {})

    await HomeOverviewService.getHomeOverview({
      customerId: `lazy-test-${Date.now()}`,
      section: 'recommendations',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('section=recommendations')
  })

  it('bypasses server response caching when explicitly refreshed', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: true, data: {} }),
    }) as Response)
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'info').mockImplementation(() => {})

    await HomeOverviewService.getHomeOverview({
      customerId: `refresh-test-${Date.now()}`,
      forceRefresh: true,
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('refresh=true')
  })
})
