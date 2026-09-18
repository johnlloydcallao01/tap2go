import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith did 13× limit:2000-5000 depth:1 (~31k docs) + O(days×N) JS loops.
 * Use /api/admin/analytics/overview (single call) or /summary, /charts, /tops slices.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone: use /api/admin/analytics/overview (or /summary, /charts, /tops)' },
    { status: 410 },
  )
}
