import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith did 5× limit:2000-5000 depth:1 (~12k docs) + JS join loops.
 * Use /api/admin/vendors/payouts/overview (single call) or /summary, /rows, /daily slices.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone: use /api/admin/vendors/payouts/overview (or /summary, /rows, /daily)' },
    { status: 410 },
  )
}
