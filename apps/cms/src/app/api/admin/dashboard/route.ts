import { NextResponse } from 'next/server'

/**
 * Retired: legacy monolith did 5x limit:1000 depth:1 + O(30N) JS loops.
 * Use split routes (/metrics, /charts, /tables) or deduped /overview instead.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Gone: use /api/admin/dashboard/overview (or /metrics, /charts, /tables)',
    },
    { status: 410 },
  )
}
