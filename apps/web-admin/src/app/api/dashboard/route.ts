import { NextResponse } from 'next/server';

/**
 * Retired: legacy monolith BFF. Use /api/dashboard/overview (single call)
 * or /api/dashboard/metrics|charts|tables.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Gone: use /api/dashboard/overview' },
    { status: 410 },
  );
}
