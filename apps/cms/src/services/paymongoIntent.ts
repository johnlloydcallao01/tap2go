export function getPayMongoSecretKey(): string | null {
  return process.env.PAYMONGO_SANDBOX === 'true'
    ? process.env.PAYMONGO_SANDBOX_API_KEY || null
    : process.env.PAYMONGO_SECRET_KEY_LIVE || null
}

export async function retrievePayMongoIntent(paymentIntentId: string, secretKey: string) {
  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(12_000),
    },
  )
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`PayMongo intent lookup failed with HTTP ${response.status}`)
  }
  return body?.data
}

export async function cancelPayMongoIntent(paymentIntentId: string, secretKey: string) {
  const retryDelaysMs = [250, 750]
  let latestIntent: any
  let providerErrorCode: string | null = null

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt += 1) {
    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        },
        signal: AbortSignal.timeout(12_000),
      },
    )
    const body = await response.json().catch(() => ({}))
    const canceledStatus = ['canceled', 'cancelled'].includes(
      String(body?.data?.attributes?.status || '').toLowerCase(),
    )
    if (response.ok && String(body?.data?.id || '') === paymentIntentId && canceledStatus) {
      return { intent: body.data, providerErrorCode: null }
    }
    providerErrorCode = typeof body?.errors?.[0]?.code === 'string'
      ? body.errors[0].code
      : null

    latestIntent = await retrievePayMongoIntent(paymentIntentId, secretKey)
    const currentStatus = String(latestIntent?.attributes?.status || '').toLowerCase()
    if (currentStatus !== 'awaiting_next_action') {
      return { intent: latestIntent, providerErrorCode }
    }

    if (
      response.status !== 409 ||
      providerErrorCode !== 'resource_locked' ||
      attempt === retryDelaysMs.length
    ) {
      return { intent: latestIntent, providerErrorCode }
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]))
  }

  return { intent: latestIntent, providerErrorCode }
}

export function amountInMinorUnits(value: unknown): number | null {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  const minorUnits = Math.round(amount * 100)
  if (!Number.isSafeInteger(minorUnits) || Math.abs(amount * 100 - minorUnits) > 1e-7) return null
  return minorUnits
}
