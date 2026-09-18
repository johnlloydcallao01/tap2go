import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith BFF. Use /api/reports/overview (single call)
 * or /summary, /financial, /catalog slices.
 */
export async function GET() {
  return NextResponse.json({ error: 'Gone: use /api/reports/overview' }, { status: 410 })
}
