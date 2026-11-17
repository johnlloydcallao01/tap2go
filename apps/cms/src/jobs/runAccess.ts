import crypto from 'crypto'
import type { RunJobAccessArgs } from 'payload'

/**
 * Payload exposes GET /api/payload-jobs/run by default. Keep it closed unless
 * the caller presents the shared external-runner secret configured at runtime.
 */
export function payloadJobsRunAccess({ req }: RunJobAccessArgs): boolean {
  return isPayloadJobsRunAuthorized(req.headers.get('x-payload-jobs-secret'))
}

export function isPayloadJobsRunAuthorized(suppliedSecret: string | null): boolean {
  const expectedSecret = process.env.PAYLOAD_JOBS_RUN_SECRET
  if (!expectedSecret || !suppliedSecret) return false

  const expected = Buffer.from(expectedSecret)
  const supplied = Buffer.from(suppliedSecret)
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied)
}
