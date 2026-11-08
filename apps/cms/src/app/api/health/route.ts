import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export const GET = async () => {
  try {
    const payload = await getPayload({ config: configPromise })
    const jobs = await payload.find({
      collection: 'payload-jobs',
      where: {
        and: [
          { taskSlug: { equals: 'delivery-fulfillment' } },
          { completedAt: { exists: true } },
        ],
      },
      sort: '-completedAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const lastRunAt = jobs.docs[0]?.completedAt || null
    const workerFresh =
      typeof lastRunAt === 'string'
      && !jobs.docs[0]?.hasError
      && Date.now() - new Date(lastRunAt).getTime() < 3 * 60_000
    const startingGracePeriod = process.uptime() < 5 * 60
    const healthy = workerFresh || startingGracePeriod

    return Response.json(
      {
        status: healthy ? 'ok' : 'degraded',
        service: '@encreasl/cms',
        deliveryWorker: {
          status: healthy ? 'ok' : 'stale',
          lastRunAt,
        },
      },
      {
        status: healthy ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    console.error('[health] failed to verify delivery worker status:', error)
    return Response.json(
      { status: 'unhealthy', service: '@encreasl/cms' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
