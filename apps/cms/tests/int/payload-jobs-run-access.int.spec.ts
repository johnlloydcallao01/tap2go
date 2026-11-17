import { afterEach, describe, expect, it, vi } from 'vitest'
import { payloadJobsRunAccess } from '../../src/jobs/runAccess'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Payload jobs run access', () => {
  it('requires the configured shared-secret header', () => {
    vi.stubEnv('PAYLOAD_JOBS_RUN_SECRET', 'a sufficiently long secret')

    expect(payloadJobsRunAccess({ req: { headers: new Headers() } } as any)).toBe(false)
    expect(payloadJobsRunAccess({
      req: { headers: new Headers({ 'x-payload-jobs-secret': 'incorrect' }) },
    } as any)).toBe(false)
    expect(payloadJobsRunAccess({
      req: { headers: new Headers({ 'x-payload-jobs-secret': 'a sufficiently long secret' }) },
    } as any)).toBe(true)
  })

  it('denies access when the server secret is not configured', () => {
    vi.stubEnv('PAYLOAD_JOBS_RUN_SECRET', '')

    expect(payloadJobsRunAccess({
      req: { headers: new Headers({ 'x-payload-jobs-secret': 'any value' }) },
    } as any)).toBe(false)
  })
})
