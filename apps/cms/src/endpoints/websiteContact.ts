import { createHash, randomUUID } from 'crypto'
import type { PayloadHandler, PayloadRequest } from 'payload'
import { createRedisClient, type RedisClient } from '@encreasl/cache/redis'

const RATE_LIMIT = 5
const RATE_WINDOW_SECONDS = 15 * 60
const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 5000
const allowedTopics = ['general', 'order', 'restaurant', 'partnership', 'account_deletion', 'other'] as const
type ContactTopic = (typeof allowedTopics)[number]
const allowedAccountRoles = ['customer', 'vendor', 'driver'] as const
type AccountRole = (typeof allowedAccountRoles)[number]

const topicLabels: Record<ContactTopic, string> = {
  general: 'General question',
  order: 'Order support',
  restaurant: 'Restaurant partnership',
  partnership: 'Business partnership',
  account_deletion: 'Account deletion request',
  other: 'Other',
}

const accountRoleLabels: Record<AccountRole, string> = {
  customer: 'Customer',
  vendor: 'Vendor / restaurant',
  driver: 'Driver / rider',
}

type ContactRateEntry = { count: number; resetAt: number }
type ContactRateState = typeof globalThis & {
  __tap2goContactRateMap?: Map<string, ContactRateEntry>
  __tap2goContactRedis?: RedisClient | null
}

function getRedisClient(): RedisClient | null {
  const state = globalThis as ContactRateState
  if (state.__tap2goContactRedis !== undefined) return state.__tap2goContactRedis

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  state.__tap2goContactRedis = url && token
    ? createRedisClient(url, token, { keyPrefix: 'tap2go:website-contact:' })
    : null
  return state.__tap2goContactRedis
}

function hashIpAddress(ipAddress: string): string {
  return createHash('sha256').update(ipAddress).digest('hex')
}

function getClientIp(req: PayloadRequest): string {
  return (
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

async function checkRateLimit(ipAddress: string): Promise<boolean> {
  const key = hashIpAddress(ipAddress)
  const redisClient = getRedisClient()

  if (redisClient) {
    const redis = redisClient.getClient()
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, RATE_WINDOW_SECONDS)
    return count <= RATE_LIMIT
  }

  const state = globalThis as ContactRateState
  const rateMap = state.__tap2goContactRateMap ?? new Map<string, ContactRateEntry>()
  state.__tap2goContactRateMap = rateMap
  const now = Date.now()
  const existing = rateMap.get(key)

  if (!existing || now >= existing.resetAt) {
    if (rateMap.size >= 5000) {
      for (const [entryKey, entry] of rateMap) {
        if (now >= entry.resetAt) rateMap.delete(entryKey)
      }
      if (rateMap.size >= 5000) return false
    }
    rateMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_SECONDS * 1000 })
    return true
  }

  if (existing.count >= RATE_LIMIT) return false
  existing.count += 1
  return true
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]!
  })
}

function isEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function readJsonBody(req: PayloadRequest): Promise<Record<string, unknown> | null> {
  try {
    const request = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
    const body: unknown = typeof request.json === 'function'
      ? await request.json()
      : request.body
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

export const websiteContactHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  const requestId = randomUUID()

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const clientIp = getClientIp(req)
    if (!(await checkRateLimit(clientIp))) {
      return Response.json(
        { error: 'Too many messages. Please wait a little before trying again.' },
        { status: 429 },
      )
    }

    const body = await readJsonBody(req)
    if (!body) {
      return Response.json({ error: 'Please submit a valid contact form.' }, { status: 400 })
    }

    const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
    if (honeypot) {
      return Response.json({ success: true })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const topic = typeof body.topic === 'string' ? body.topic : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const accountRole = typeof body.accountRole === 'string' ? body.accountRole : ''
    const confirmedDeletion = body.confirmedDeletion === true

    if (
      name.length < 2 ||
      name.length > MAX_NAME_LENGTH ||
      !isEmail(email) ||
      !allowedTopics.includes(topic as ContactTopic) ||
      (topic === 'account_deletion' && (
        !allowedAccountRoles.includes(accountRole as AccountRole) ||
        !confirmedDeletion
      )) ||
      (topic !== 'account_deletion' && message.length < 10) ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return Response.json(
        { error: 'Please check the required form fields and try again.' },
        { status: 400 },
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error(`[website-contact:${requestId}] Resend is not configured.`)
      return Response.json(
        { error: 'The contact form is temporarily unavailable. Please try again later.' },
        { status: 503 },
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@tap2goph.com'
    const fromName = process.env.EMAIL_FROM_NAME || 'Tap2Go'
    const toEmail = process.env.CONTACT_TO_EMAIL || 'support@tap2goph.com'
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const messageContent = message || 'No additional details provided.'
    const safeMessage = escapeHtml(messageContent).replace(/\r\n|\r|\n/g, '<br>')
    const accountRoleLabel = topic === 'account_deletion'
      ? accountRoleLabels[accountRole as AccountRole]
      : null

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject: `Tap2Go website contact: ${topicLabels[topic as ContactTopic]}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Topic: ${topicLabels[topic as ContactTopic]}`,
          ...(accountRoleLabel ? [`Account type: ${accountRoleLabel}`, 'Deletion confirmation: Yes'] : []),
          '',
          messageContent,
        ].join('\n'),
        html: [
          '<h2>New Tap2Go website message</h2>',
          `<p><strong>Name:</strong> ${safeName}</p>`,
          `<p><strong>Email:</strong> ${safeEmail}</p>`,
          `<p><strong>Topic:</strong> ${topicLabels[topic as ContactTopic]}</p>`,
          ...(accountRoleLabel
            ? [
                `<p><strong>Account type:</strong> ${accountRoleLabel}</p>`,
                '<p><strong>Deletion confirmation:</strong> Yes</p>',
              ]
            : []),
          `<p><strong>Message:</strong><br>${safeMessage}</p>`,
        ].join(''),
      }),
    })

    if (!resendResponse.ok) {
      console.error(`[website-contact:${requestId}] Resend returned status ${resendResponse.status}.`)
      return Response.json(
        { error: 'We could not send your message right now. Please try again later.' },
        { status: 502 },
      )
    }

    return Response.json({ success: true, message: 'Your message has been sent.' })
  } catch (error) {
    console.error(
      `[website-contact:${requestId}] Request failed:`,
      error instanceof Error ? error.message : 'Unknown error',
    )
    return Response.json(
      { error: 'The contact form is temporarily unavailable. Please try again later.' },
      { status: 503 },
    )
  }
}
