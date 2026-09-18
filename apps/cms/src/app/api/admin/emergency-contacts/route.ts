/**
 * @file apps/cms/src/app/api/admin/emergency-contacts/route.ts
 * @description BFF aggregation endpoint for web-admin emergency-contacts page (enterprise-grade).
 * Follows docs/BFF-pattern.md and apps/cms/src/app/api/admin/customers/route.ts / vendors/route.ts:
 * backend owns context resolution, joins, filtering, pagination, and sanitization
 * with overrideAccess:true. Frontend is thin consumer.
 *
 * GET  /api/admin/emergency-contacts?page=1&limit=20&search=&relationship=parent,spouse&isPrimary=true&userId=123&sort=-createdAt
 *      -> { docs, pagination, stats, meta }
 * POST /api/admin/emergency-contacts -> create emergency contact (admin-only)
 * Access: admin-only via authenticateAdmin (JWT / Bearer / payload-token cookie)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { bustCustomersCache, getOrBuildDashboard } from '@/utils/dashboardCache'
import { sql, type SQL } from 'drizzle-orm'

function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null
}
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function sanitizeMediaRef(value: unknown): { id: number; url: string | null; filename: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Record<string, unknown>
  const id = Number(source.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    url: typeof source.cloudinaryURL === 'string' ? source.cloudinaryURL : typeof source.url === 'string' ? source.url : null,
    filename: typeof source.filename === 'string' ? source.filename : null,
  }
}
function sanitizeUserBrief(value: unknown): Record<string, any> | null {
  if (!value || typeof value !== 'object') return null
  const u = value as Record<string, any>
  const id = Number(u.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    email: str(u.email, ''),
    firstName: str(u.firstName, ''),
    lastName: str(u.lastName, ''),
    middleName: optionalString(u.middleName),
    phone: optionalString(u.phone),
    username: optionalString(u.username),
    role: str(u.role, 'customer'),
    isActive: typeof u.isActive === 'boolean' ? u.isActive : true,
    profilePicture: sanitizeMediaRef(u.profilePicture),
    createdAt: String(u.createdAt ?? ''),
    updatedAt: String(u.updatedAt ?? ''),
  }
}
function sanitizeEmergencyContactDoc(raw: Record<string, any>): Record<string, any> {
  const userBrief = sanitizeUserBrief(raw.user)
  return {
    id: raw.id,
    user: userBrief,
    // also expose raw user id for filtering convenience
    userId: userBrief ? userBrief.id : (typeof raw.user === 'number' ? raw.user : Number(raw.user) || null),
    firstName: str(raw.firstName, ''),
    middleName: optionalString(raw.middleName),
    lastName: str(raw.lastName, ''),
    contactNumber: str(raw.contactNumber, ''),
    relationship: str(raw.relationship, 'other'),
    completeAddress: str(raw.completeAddress, ''),
    isPrimary: !!raw.isPrimary,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}
function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

const RELATIONSHIPS = new Set(['parent', 'spouse', 'sibling', 'child', 'guardian', 'friend', 'relative', 'other'])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheQuery = Array.from(searchParams.entries())
      .filter(([key]) => key !== '_t')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'page=1&limit=20'
    const cacheKey = `admin:emergency-contacts:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildEmergencyContactsList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-EmergencyContacts-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load emergency contacts'
    console.error('[admin/emergency-contacts] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function ecRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

async function buildEmergencyContactsList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || '-createdAt'
    const relationshipCsv = parseCsv(searchParams.get('relationship'))
    const isPrimaryParam = searchParams.get('isPrimary')
    const isPrimaryFilter = isPrimaryParam === 'true' ? true : isPrimaryParam === 'false' ? false : null
    const userIdParam = searchParams.get('userId') || searchParams.get('user') || ''
    const userIdFilter = userIdParam ? Number(userIdParam) : null

    const where: Record<string, any> = {}
    const and: any[] = []

    if (relationshipCsv.length) {
      const filtered = relationshipCsv.filter((v) => RELATIONSHIPS.has(v))
      if (filtered.length) where.relationship = { in: filtered }
    }
    if (isPrimaryFilter !== null) where.isPrimary = { equals: isPrimaryFilter }
    if (userIdFilter !== null && Number.isFinite(userIdFilter)) where.user = { equals: userIdFilter }

    // Search handling: user ids resolved in SQL (id-only, bounded 200, no hydration).
    let userIdsForSearch: number[] | null = null
    if (search) {
      // direct contact fields OR
      const directOr: any[] = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { middleName: { contains: search } },
        { contactNumber: { contains: search } },
        { completeAddress: { contains: search } },
        { relationship: { contains: search } },
      ]

      // lookup users matching search
      try {
        const like = `%${escLike(search)}%`
        const uRows = await ecRows(
          payload,
          sql`SELECT id FROM users WHERE first_name ILIKE ${like} OR last_name ILIKE ${like} OR email ILIKE ${like} OR username ILIKE ${like} OR phone ILIKE ${like} LIMIT 200`,
        )
        const ids = uRows.map((u) => Number(u.id)).filter((n) => Number.isFinite(n))
        userIdsForSearch = ids
        if (ids.length > 0) directOr.push({ user: { in: ids } })
      } catch {
        // ignore user lookup failure, keep direct search
      }

      and.push({ or: directOr })
    }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // parallel: paginated list (correct, bounded ≤100) + SQL stats (no 2000-doc hydration)
    const [paginated, statRows, relRows] = await Promise.all([
      payload.find({
        collection: 'emergency-contacts',
        where: Object.keys(finalWhere).length ? finalWhere : undefined,
        page,
        limit,
        sort,
        depth: 2, // populate user for sanitization
        overrideAccess: true,
      }),
      ecRows(payload, sql`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE is_primary = true)::int AS primary_n FROM emergency_contacts`),
      ecRows(payload, sql`SELECT COALESCE(LOWER(relationship::text),'other') AS s, COUNT(*)::int AS c FROM emergency_contacts GROUP BY LOWER(relationship::text)`),
    ])

    const paginatedDocs = (paginated.docs as unknown as Record<string, any>[]) ?? []
    const docs = paginatedDocs.map((d) => sanitizeEmergencyContactDoc(d))

    const totalFiltered = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length
    const totalAll = Number(statRows[0]?.total ?? 0)

    const relationshipBreakdown: Record<string, number> = { parent: 0, spouse: 0, sibling: 0, child: 0, guardian: 0, friend: 0, relative: 0, other: 0 }
    for (const r of relRows) {
      const rel = String(r.s || 'other').toLowerCase()
      relationshipBreakdown[rel] = (relationshipBreakdown[rel] || 0) + Number(r.c ?? 0)
    }
    const primaryCount = Number(statRows[0]?.primary_n ?? 0)
    const nonPrimaryCount = totalAll - primaryCount

    const responseBody = {
      docs,
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        totalDocs: paginated.totalDocs,
        totalPages: paginated.totalPages,
        hasNextPage: paginated.hasNextPage,
        hasPrevPage: paginated.hasPrevPage,
      },
      stats: {
        totalEmergencyContacts: totalFiltered,
        totalAll,
        filteredTotal: totalFiltered,
        relationshipBreakdown,
        primaryCount,
        nonPrimaryCount,
      },
      meta: { generatedAt: new Date().toISOString(), sort, search },
    }
    return responseBody
  } catch (err: unknown) {
    console.error('[admin/emergency-contacts] list build error:', err)
    throw err
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    let body: Record<string, any>
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    // Resolve user id (required) — accept user, userId, ownerUserId
    const rawUser = body.user ?? body.userId ?? body.ownerUserId ?? body.user_id
    const userId = Number(rawUser)
    if (!rawUser || Number.isNaN(userId)) return badRequest('user is required (numeric user id)')
    // verify user exists
    try {
      const u: any = await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })
      if (!u) return badRequest('user not found')
    } catch (e: any) {
      return badRequest(e?.message || 'user not found')
    }

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
    const middleName = typeof body.middleName === 'string' ? body.middleName.trim() || null : null
    const contactNumber = typeof body.contactNumber === 'string' ? body.contactNumber.trim() : ''
    const relationshipRaw = typeof body.relationship === 'string' ? body.relationship.trim().toLowerCase() : ''
    const completeAddress = typeof body.completeAddress === 'string' ? body.completeAddress.trim() : ''
    const isPrimary = typeof body.isPrimary === 'boolean' ? body.isPrimary : String(body.isPrimary).toLowerCase() === 'true'

    if (!firstName || firstName.length < 2) return badRequest('firstName is required (min 2 chars)')
    if (!lastName || lastName.length < 2) return badRequest('lastName is required (min 2 chars)')
    if (!contactNumber) return badRequest('contactNumber is required')
    if (!relationshipRaw || !RELATIONSHIPS.has(relationshipRaw)) return badRequest(`relationship must be one of: ${Array.from(RELATIONSHIPS).join(', ')}`)
    if (!completeAddress) return badRequest('completeAddress is required')

    // isPrimary uniqueness: if setting primary, unset existing primaries for this user
    if (isPrimary) {
      try {
        const existing: any = await payload.find({
          collection: 'emergency-contacts',
          where: { user: { equals: userId }, isPrimary: { equals: true } },
          limit: 100,
          depth: 0,
          overrideAccess: true,
          pagination: false,
        } as any)
        for (const doc of existing.docs || []) {
          try {
            await payload.update({ collection: 'emergency-contacts', id: doc.id, data: { isPrimary: false } as any, overrideAccess: true, depth: 0 })
          } catch {}
        }
      } catch {}
    }

    const data: Record<string, any> = {
      user: userId,
      firstName,
      middleName,
      lastName,
      contactNumber,
      relationship: relationshipRaw,
      completeAddress,
      isPrimary,
    }

    let created: Record<string, any>
    try {
      created = (await payload.create({ collection: 'emergency-contacts', data: data as any, depth: 2, overrideAccess: true })) as unknown as Record<string, any>
    } catch (e: any) {
      const msg = e?.message || 'Failed to create emergency contact'
      return NextResponse.json({ error: msg, details: e?.data || e?.errors }, { status: 400 })
    }

    const sanitized = sanitizeEmergencyContactDoc(created)
    try { await bustCustomersCache() } catch { /* ignore */ }
    return NextResponse.json({ success: true, message: 'Emergency contact created successfully', doc: sanitized }, { status: 201 })
  } catch (err: any) {
    console.error('[admin/emergency-contacts] POST error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
