import type { PayloadRequest } from 'payload'
import { isPayloadJobsRunAuthorized } from '../jobs/runAccess'

const QUEUE_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/

export async function payloadJobsTickHandler(req: PayloadRequest) {
  if (!isPayloadJobsRunAuthorized(req.headers.get('x-payload-jobs-secret'))) {
    return Response.json({ error: 'Unauthorized job runner.' }, { status: 401 })
  }

  const queue = new URL((req as unknown as Request).url).searchParams.get('queue') || 'default'
  if (!QUEUE_PATTERN.test(queue)) {
    return Response.json({ error: 'Invalid job queue.' }, { status: 400 })
  }

  try {
    await req.payload.jobs.handleSchedules({ queue, req })
    await req.payload.jobs.run({
      queue,
      req,
      overrideAccess: true,
      sequential: true,
      limit: 10,
    })
    return Response.json({ status: 'completed', queue })
  } catch (error) {
    console.error('[payload-jobs/tick] scheduled job run failed:', error)
    return Response.json({ error: 'Scheduled job run failed.' }, { status: 500 })
  }
}
