import { afterEach, describe, expect, it, vi } from 'vitest'
import { payloadJobsTickHandler } from '../../src/endpoints/payloadJobsTick'

describe('Payload scheduled jobs tick endpoint', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('handles due schedules before running the queue', async () => {
    vi.stubEnv('PAYLOAD_JOBS_RUN_SECRET', 'test-run-secret')
    const calls: string[] = []
    const req = {
      url: 'https://cms.example/api/payload-jobs/tick?queue=default',
      headers: new Headers({ 'x-payload-jobs-secret': 'test-run-secret' }),
      payload: {
        jobs: {
          handleSchedules: vi.fn(async () => { calls.push('schedules') }),
          run: vi.fn(async () => { calls.push('run') }),
        },
      },
    }

    const response = await payloadJobsTickHandler(req as never)

    expect(response.status).toBe(200)
    expect(calls).toEqual(['schedules', 'run'])
  })

  it('rejects unauthorized calls without queuing or running jobs', async () => {
    vi.stubEnv('PAYLOAD_JOBS_RUN_SECRET', 'test-run-secret')
    const run = vi.fn()
    const req = {
      url: 'https://cms.example/api/payload-jobs/tick?queue=default',
      headers: new Headers(),
      payload: { jobs: { handleSchedules: vi.fn(), run } },
    }

    const response = await payloadJobsTickHandler(req as never)

    expect(response.status).toBe(401)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects invalid queue names before running jobs', async () => {
    vi.stubEnv('PAYLOAD_JOBS_RUN_SECRET', 'test-run-secret')
    const run = vi.fn()
    const req = {
      url: 'https://cms.example/api/payload-jobs/tick?queue=default%2Fother',
      headers: new Headers({ 'x-payload-jobs-secret': 'test-run-secret' }),
      payload: { jobs: { handleSchedules: vi.fn(), run } },
    }

    const response = await payloadJobsTickHandler(req as never)

    expect(response.status).toBe(400)
    expect(run).not.toHaveBeenCalled()
  })
})
