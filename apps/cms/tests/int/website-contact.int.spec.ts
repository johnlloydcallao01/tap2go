import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { websiteContactHandler } from '../../src/endpoints/websiteContact'

function createRequest(body: unknown, ipAddress: string): PayloadRequest {
  return {
    method: 'POST',
    headers: new Headers({ 'x-real-ip': ipAddress }),
    json: async () => body,
  } as unknown as PayloadRequest
}

describe('website contact endpoint', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('sends a validated contact message through Resend with escaped HTML', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
    vi.stubEnv('CONTACT_TO_EMAIL', 'support@example.com')

    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await websiteContactHandler(createRequest({
      name: '<Tap2Go User>',
      email: 'customer@example.com',
      topic: 'order',
      message: 'Please help with my delivery order.',
      website: '',
    }, '198.51.100.11'))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ success: true })
    expect(fetchMock).toHaveBeenCalledOnce()

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const email = JSON.parse(String(options.body)) as {
      to: string[]
      reply_to: string
      subject: string
      html: string
    }
    expect(email.to).toEqual(['support@example.com'])
    expect(email.reply_to).toBe('customer@example.com')
    expect(email.subject).toContain('Order support')
    expect(email.html).toContain('&lt;Tap2Go User&gt;')
    expect(email.html).not.toContain('<Tap2Go User>')
  })

  it('rejects invalid input without calling Resend', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await websiteContactHandler(createRequest({
      name: 'A',
      email: 'not-an-email',
      topic: 'unknown',
      message: 'Too short',
      website: '',
    }, '198.51.100.12'))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends an account deletion request with its account role and confirmation', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await websiteContactHandler(createRequest({
      name: 'Customer User',
      email: 'customer@example.com',
      topic: 'account_deletion',
      accountRole: 'customer',
      confirmedDeletion: true,
      message: '',
      website: '',
    }, '198.51.100.14'))

    expect(response.status).toBe(200)
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const email = JSON.parse(String(options.body)) as { subject: string; text: string }
    expect(email.subject).toContain('Account deletion request')
    expect(email.text).toContain('Account type: Customer')
    expect(email.text).toContain('Deletion confirmation: Yes')
  })

  it('requires an allowed account role and explicit confirmation for deletion requests', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await websiteContactHandler(createRequest({
      name: 'Customer User',
      email: 'customer@example.com',
      topic: 'account_deletion',
      accountRole: 'admin',
      confirmedDeletion: false,
      message: '',
      website: '',
    }, '198.51.100.15'))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without sending email', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await websiteContactHandler(createRequest({
      name: 'Automated bot',
      email: 'bot@example.com',
      topic: 'general',
      message: 'This automated message should not be sent.',
      website: 'filled-in-by-bot',
    }, '198.51.100.13'))

    expect(response.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
