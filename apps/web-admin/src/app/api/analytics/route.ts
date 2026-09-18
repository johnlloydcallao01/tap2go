import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith BFF (13× limit:2000-5000 depth:1, ~31k docs).
 * Use /api/analytics/overview (single call) or /summary, /charts, /tops slices.
 */
export async function GET() {
  return NextResponse.json({ error: 'Gone: use /api/analytics/overview' }, { status: 410 })
}
