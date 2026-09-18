import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith BFF. Use /api/vendors/payouts/overview (single call)
 * or /summary, /rows, /daily slices.
 */
export async function GET() {
  return NextResponse.json({ error: 'Gone: use /api/vendors/payouts/overview' }, { status: 410 })
}
