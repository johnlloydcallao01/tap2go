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

export function amountInMinorUnits(value: unknown): number | null {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  const minorUnits = Math.round(amount * 100)
  if (!Number.isSafeInteger(minorUnits) || Math.abs(amount * 100 - minorUnits) > 1e-7) return null
  return minorUnits
}
