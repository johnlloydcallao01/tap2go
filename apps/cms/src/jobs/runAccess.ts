import crypto from 'crypto'
import type { RunJobAccessArgs } from 'payload'

/**
 * Payload exposes GET /api/payload-jobs/run by default. Keep it closed unless
 * the caller presents the shared Cloud Scheduler secret configured at runtime.
 */
export function payloadJobsRunAccess({ req }: RunJobAccessArgs): boolean {
  const expectedSecret = process.env.PAYLOAD_JOBS_RUN_SECRET
  const suppliedSecret = req.headers.get('x-payload-jobs-secret')
  if (!expectedSecret || !suppliedSecret) return false

  const expected = Buffer.from(expectedSecret)
  const supplied = Buffer.from(suppliedSecret)
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied)
}
