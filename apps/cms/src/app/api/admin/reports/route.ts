import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith did 9× limit:2000-5000 depth:1 + JS aggregation.
 * Use /api/admin/reports/overview (single call) or /summary, /financial, /catalog slices.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone: use /api/admin/reports/overview (or /summary, /financial, /catalog)' },
    { status: 410 },
  )
}
