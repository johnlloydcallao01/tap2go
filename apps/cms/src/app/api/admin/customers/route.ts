/**
 * @file apps/cms/src/app/api/admin/customers/route.ts
 * @description BFF aggregation endpoint for web-admin customers page (enterprise-grade).
 * Follows docs/BFF-pattern.md and apps/cms/src/app/api/admin/vendors/route.ts:
 * backend owns context resolution, joins, filtering, pagination, and sanitization
 * with overrideAccess:true. Frontend is thin consumer.
 *
 * GET  /api/admin/customers?page=1&limit=20&search=&currentLevel=beginner,intermediate&isActive=true&sort=-createdAt
 *      -> { docs, pagination, stats, meta }
 * POST /api/admin/customers -> create customer (and owner user if needed)
 * Access: admin-only via authenticateAdmin (JWT / Bearer / payload-token cookie)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { bustCustomersCache, getOrBuildDashboard } from '@/utils/dashboardCache'
import { sql, type SQL } from 'drizzle-orm'
import crypto from 'crypto'

function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null
}
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
function sanitizeMediaRef(value: unknown): { id: number; url: string | null; filename: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const src = value as Record<string, unknown>
  const id = Number(src.id)
  if (Number.isNaN(id)) return null
  const url =
    typeof src.cloudinaryURL === 'string'
      ? src.cloudinaryURL
      : typeof src.url === 'string'
        ? src.url
        : null
  return { id, url, filename: typeof src.filename === 'string' ? src.filename : null }
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
    birthDate: u.birthDate ? String(u.birthDate) : null,
    profilePicture: sanitizeMediaRef(u.profilePicture),
    createdAt: String(u.createdAt ?? ''),
    updatedAt: String(u.updatedAt ?? ''),
  }
}
function sanitizeAddressBrief(value: unknown): Record<string, any> | null {
  if (!value || typeof value !== 'object') return null
  const a = value as Record<string, any>
  const id = Number(a.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    formatted_address: str(a.formatted_address, ''),
    locality: optionalString(a.locality),
    administrative_area_level_1: optionalString(a.administrative_area_level_1),
    postal_code: optionalString(a.postal_code),
    address_type: optionalString(a.address_type),
    is_default: !!a.is_default,
    is_verified: !!a.is_verified,
    latitude: typeof a.latitude === 'number' ? a.latitude : null,
    longitude: typeof a.longitude === 'number' ? a.longitude : null,
  }
}
function sanitizeCustomerDoc(
  rawUser: Record<string, any>,
  profile: Record<string, any> | null,
  orderCountMap: Map<string, number>,
  addressCountMap: Map<string, number>
): Record<string, any> {
  const userBrief = sanitizeUserBrief(rawUser)
  const addressVal = profile?.activeAddress ?? null
  const addressBrief = sanitizeAddressBrief(addressVal)
  const customerIdStr = String(profile?.id ?? rawUser.id)
  const isActive = userBrief ? userBrief.isActive : true
  return {
    id: rawUser.id,
    customerId: profile?.id != null ? Number(profile.id) : null,
    userId: userBrief ? Number(userBrief.id) : Number(rawUser.id),
    email: optionalString(rawUser.email) || (userBrief ? userBrief.email : ''),
    srn: optionalString(profile?.srn),
    couponCode: optionalString(profile?.couponCode),
    enrollmentDate: profile?.enrollmentDate ? String(profile.enrollmentDate) : null,
    currentLevel: optionalString(profile?.currentLevel) || 'beginner',
    activeAddress: addressBrief,
    activeAddressId: addressBrief ? Number(addressBrief.id) : null,
    user: userBrief,
    isActive,
    orderCount: orderCountMap.get(customerIdStr) ?? 0,
    addressCount: userBrief ? (addressCountMap.get(String(userBrief.id)) ?? 0) : 0,
    createdAt: String(rawUser.createdAt ?? ''),
    updatedAt: String(rawUser.updatedAt ?? ''),
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

const LEVEL_SET = new Set(['beginner', 'intermediate', 'advanced'])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheQuery = Array.from(searchParams.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'page=1&limit=20&sort=-createdAt'
    const cacheKey = `admin:customers:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildCustomersList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Customers-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load customers'
    console.error('[admin/customers] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function cRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

async function buildCustomersList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || '-createdAt'
    const levelCsv = parseCsv(searchParams.get('currentLevel') || searchParams.get('level'))
    const isActiveParam = searchParams.get('isActive')
    const isActiveFilter = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : null
    const hasActiveParam = searchParams.get('has_active') ?? searchParams.get('hasActive')
    const hasActiveFilter = hasActiveParam === 'true' ? true : hasActiveParam === 'false' ? false : null

    // Build where for direct customer user fields; the customer page should be sourced from users with role=customer.
    const where: Record<string, any> = { role: { equals: 'customer' } }
    const and: any[] = []

    if (levelCsv.length) {
      const filtered = levelCsv.filter((v) => LEVEL_SET.has(v))
      if (filtered.length) {
        // Level lives on customers profiles; resolve matching user ids in SQL
        // (bounded 10000, indexed current_level) instead of hydrating 5000 docs.
        const levelRows = await cRows(
          payload,
          sql`SELECT user_id FROM customers WHERE LOWER(current_level::text) IN (${sql.join(
            filtered.map((v) => sql`${v}`),
            sql`, `,
          )}) LIMIT 10000`,
        )
        const userIds = levelRows.map((r) => Number(r.user_id)).filter((n) => Number.isFinite(n))
        if (userIds.length) {
          and.push({ id: { in: userIds } })
        } else {
          return {
            docs: [],
            pagination: { page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
            stats: {
              totalCustomers: 0,
              totalAll: 0,
              filteredTotal: 0,
              levelBreakdown: { beginner: 0, intermediate: 0, advanced: 0 },
              activeCount: 0,
              inactiveCount: 0,
              enrollmentThisMonth: 0,
              withActiveAddressCount: 0,
              withoutActiveAddressCount: 0,
            },
            meta: { generatedAt: new Date().toISOString(), sort, search },
          }
        }
      }
    }

    // Search handling: users are the primary source of truth for customer listing.
    if (search) {
      and.push({
        or: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
      })
    }

    if (isActiveFilter !== null) {
      where.isActive = { equals: isActiveFilter }
    }

    // Customer-first address management: filter by whether customers.activeAddress is set.
    // Backend resolves this so the page stays thin per docs/BFF-pattern.md.
    // Active-address user ids resolved in SQL (id pairs only, no hydration).
    if (hasActiveFilter !== null) {
      const activeRows = await cRows(
        payload,
        sql`SELECT user_id FROM customers WHERE active_address_id IS NOT NULL`,
      )
      const withActive: number[] = []
      const activeUserSet = new Set<number>()
      for (const r of activeRows) {
        const uid = Number(r.user_id)
        if (!Number.isFinite(uid)) continue
        activeUserSet.add(uid)
        withActive.push(uid)
      }
      if (hasActiveFilter === true) {
        if (!withActive.length) {
          return {
            docs: [],
            pagination: { page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
            stats: {
              totalCustomers: 0,
              totalAll: 0,
              filteredTotal: 0,
              levelBreakdown: { beginner: 0, intermediate: 0, advanced: 0 },
              activeCount: 0,
              inactiveCount: 0,
              enrollmentThisMonth: 0,
              withActiveAddressCount: 0,
              withoutActiveAddressCount: 0,
            },
            meta: { generatedAt: new Date().toISOString(), sort, search, hasActiveFilter },
          }
        }
        and.push({ id: { in: withActive } })
      } else {
        // without active = all customer users minus withActive. Resolve via users query below
        // by excluding active ids; if no active at all, no extra filter needed.
        if (activeUserSet.size) {
          and.push({ id: { not_in: Array.from(activeUserSet) } })
        }
      }
    }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // parallel: paginated list (correct, bounded ≤100) + page profiles (bounded by page ids)
    const [paginated] = await Promise.all([
      payload.find({
        collection: 'users',
        where: Object.keys(finalWhere).length ? finalWhere : undefined,
        page,
        limit,
        sort,
        depth: 2,
        overrideAccess: true,
      }),
    ])
    const paginatedDocs = (paginated.docs as unknown as Record<string, any>[]) ?? []
    const pageUserIds = paginatedDocs.map((d) => Number(d.id)).filter((n) => Number.isFinite(n))
    const profileRows = pageUserIds.length
      ? ((await payload.find({
          collection: 'customers',
          where: { user: { in: pageUserIds } },
          limit: pageUserIds.length,
          depth: 1,
          overrideAccess: true,
          pagination: false,
        } as any).catch(() => ({ docs: [] } as any))).docs as Record<string, any>[] ?? [])
      : []
    const profileByUserId = new Map<number, Record<string, any>>()
    for (const customerDoc of profileRows) {
      const userVal = customerDoc.user
      const userId = userVal && typeof userVal === 'object' ? Number(userVal.id) : Number(userVal)
      if (Number.isFinite(userId)) profileByUserId.set(userId, customerDoc)
    }

    // Build orderCountMap and addressCountMap for paginated ids only (efficient)
    const paginatedUserIds = paginatedDocs.map((d) => Number(d.id)).filter((n) => Number.isFinite(n)) as number[]
    const customerIds = paginatedDocs
      .map((d) => Number(profileByUserId.get(Number(d.id))?.id ?? 0))
      .filter((n) => n > 0)

    const [ordersAgg, addressesAgg] = await Promise.all([
      customerIds.length
        ? payload
            .find({
              collection: 'orders',
              where: { customer: { in: customerIds } },
              limit: 5000,
              depth: 0,
              overrideAccess: true,
              pagination: false,
            } as any)
            .catch(() => ({ docs: [] } as any))
        : ({ docs: [] } as any),
      paginatedUserIds.length
        ? payload
            .find({
              collection: 'addresses',
              where: { user: { in: paginatedUserIds } },
              limit: 5000,
              depth: 0,
              overrideAccess: true,
              pagination: false,
            } as any)
            .catch(() => ({ docs: [] } as any))
        : ({ docs: [] } as any),
    ])

    const orderCountMap = new Map<string, number>()
    for (const o of ((ordersAgg as any).docs as any[]) ?? []) {
      const rawCustomer = (o as any).customer
      const cid = rawCustomer && typeof rawCustomer === 'object' ? String((rawCustomer as any).id ?? '') : String(rawCustomer ?? '')
      if (!cid) continue
      orderCountMap.set(cid, (orderCountMap.get(cid) || 0) + 1)
    }
    const addressCountMap = new Map<string, number>()
    for (const a of ((addressesAgg as any).docs as any[]) ?? []) {
      const rawUser = (a as any).user
      const uid = rawUser && typeof rawUser === 'object' ? String((rawUser as any).id ?? '') : String(rawUser ?? '')
      if (!uid) continue
      addressCountMap.set(uid, (addressCountMap.get(uid) || 0) + 1)
    }

    const docs = paginatedDocs.map((d) => sanitizeCustomerDoc(d, profileByUserId.get(Number(d.id)) ?? null, orderCountMap, addressCountMap))

    // Global stats via SQL (no 5000-doc hydration; previously returned zeros via limit:0 docs).
    const now = new Date()
    const monthStartISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const [custCount, levelRows, userActiveRows, enrollRows, addrRows] = await Promise.all([
      cRows(payload, sql`SELECT COUNT(*)::int AS total FROM customers`),
      cRows(payload, sql`SELECT LOWER(current_level::text) AS lvl, COUNT(*)::int AS c FROM customers GROUP BY LOWER(current_level::text)`),
      cRows(payload, sql`SELECT COUNT(*) FILTER (WHERE is_active IS NOT false)::int AS active, COUNT(*) FILTER (WHERE is_active = false)::int AS inactive, COUNT(*)::int AS total FROM users WHERE role = 'customer'`),
      cRows(payload, sql`SELECT COUNT(*)::int AS c FROM customers WHERE enrollment_date >= ${monthStartISO}`),
      cRows(payload, sql`SELECT COUNT(*) FILTER (WHERE active_address_id IS NOT NULL)::int AS with_a, COUNT(*)::int AS total FROM customers`),
    ])
    const levelBreakdown: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 }
    for (const r of levelRows) {
      const lvl = String(r.lvl || 'beginner').toLowerCase()
      levelBreakdown[lvl] = (levelBreakdown[lvl] || 0) + Number(r.c ?? 0)
    }
    const activeCount = Number(userActiveRows[0]?.active ?? 0)
    const inactiveCount = Number(userActiveRows[0]?.inactive ?? 0)
    const enrollmentThisMonth = Number(enrollRows[0]?.c ?? 0)
    const withActiveAddressCount = Number(addrRows[0]?.with_a ?? 0)

    const totalCustomers = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length
    const totalAll = Number(custCount[0]?.total ?? 0)

    const response = {
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
        totalCustomers,
        totalAll,
        filteredTotal: totalCustomers,
        levelBreakdown,
        activeCount,
        inactiveCount,
        enrollmentThisMonth,
        withActiveAddressCount,
        withoutActiveAddressCount: Math.max(0, totalAll - withActiveAddressCount),
      },
      meta: { generatedAt: new Date().toISOString(), sort, search, hasActiveFilter },
    }
    return response
  } catch (err: unknown) {
    console.error('[admin/customers] list build error:', err)
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

    // Validate customer fields
    const srn = typeof body.srn === 'string' ? body.srn.trim() || null : null
    const couponCode = typeof body.couponCode === 'string' ? body.couponCode.trim() || null : null
    const enrollmentDateRaw = body.enrollmentDate
    let enrollmentDate: string | null = null
    if (enrollmentDateRaw !== undefined && enrollmentDateRaw !== null && enrollmentDateRaw !== '') {
      const d = new Date(String(enrollmentDateRaw))
      if (Number.isNaN(d.getTime())) return badRequest('enrollmentDate must be a valid date')
      enrollmentDate = d.toISOString()
    } else {
      enrollmentDate = new Date().toISOString()
    }
    const currentLevelRaw = typeof body.currentLevel === 'string' ? body.currentLevel.trim().toLowerCase() : 'beginner'
    const currentLevel = LEVEL_SET.has(currentLevelRaw) ? currentLevelRaw : 'beginner'
    if (body.currentLevel !== undefined && !LEVEL_SET.has(currentLevelRaw)) {
      return badRequest(`currentLevel must be one of: ${Array.from(LEVEL_SET).join(', ')}`)
    }
    let activeAddress: number | null = null
    if (body.activeAddress !== undefined && body.activeAddress !== null && body.activeAddress !== '') {
      const n = Number(body.activeAddress)
      if (Number.isNaN(n)) return badRequest('activeAddress must be numeric address id')
      // verify address exists
      try {
        await payload.findByID({ collection: 'addresses', id: n, depth: 0, overrideAccess: true })
        activeAddress = n
      } catch {
        return badRequest('activeAddress not found')
      }
    }

    // Resolve owner user
    let ownerUserId: number | null = null
    if (body.userId != null && body.userId !== '') {
      const uid = Number(body.userId)
      if (Number.isNaN(uid)) return badRequest('userId must be numeric')
      try {
        const u: any = await payload.findByID({ collection: 'users', id: uid, depth: 0, overrideAccess: true })
        if (!u) return badRequest('userId not found')
        if (u.role !== 'customer') return badRequest('userId must reference a customer user')
        // check if customer already exists for this user
        const existing = await payload.find({ collection: 'customers', where: { user: { equals: uid } }, limit: 1, depth: 0, overrideAccess: true })
        if (existing.docs.length) return NextResponse.json({ error: 'Customer profile already exists for this user' }, { status: 409 })
        ownerUserId = uid
      } catch (e: any) {
        return badRequest(e?.message || 'userId not found')
      }
    } else if (body.ownerUserId != null && body.ownerUserId !== '') {
      const uid = Number(body.ownerUserId)
      if (!Number.isNaN(uid)) {
        try {
          const u: any = await payload.findByID({ collection: 'users', id: uid, depth: 0, overrideAccess: true })
          if (u && u.role === 'customer') {
            const existing = await payload.find({ collection: 'customers', where: { user: { equals: uid } }, limit: 1, depth: 0, overrideAccess: true })
            if (!existing.docs.length) ownerUserId = uid
            else ownerUserId = null
          }
        } catch {}
      }
    }

    if (!ownerUserId) {
      // create new customer user
      const ownerEmailRaw = typeof body.ownerEmail === 'string' ? body.ownerEmail.trim().toLowerCase() : typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const ownerEmail = ownerEmailRaw
      if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) return badRequest('ownerEmail (or email) must be a valid email to create customer account')
      const existing = await payload.find({ collection: 'users', where: { email: { equals: ownerEmail } }, limit: 1, depth: 0, overrideAccess: true })
      if (existing.docs.length) {
        const eu: any = existing.docs[0]
        if (eu.role !== 'customer') return badRequest(`Email ${ownerEmail} already belongs to a ${eu.role} account`)
        // check if customer already exists for this user
        const custExisting = await payload.find({ collection: 'customers', where: { user: { equals: eu.id } }, limit: 1, depth: 0, overrideAccess: true })
        if (custExisting.docs.length) return NextResponse.json({ error: 'Customer profile already exists for this email' }, { status: 409 })
        ownerUserId = eu.id
      } else {
        const firstName = typeof body.ownerFirstName === 'string' && body.ownerFirstName.trim() ? body.ownerFirstName.trim() : typeof body.firstName === 'string' && body.firstName.trim() ? body.firstName.trim() : 'Customer'
        const lastName = typeof body.ownerLastName === 'string' && body.ownerLastName.trim() ? body.ownerLastName.trim() : typeof body.lastName === 'string' && body.lastName.trim() ? body.lastName.trim() : 'User'
        if (!firstName || firstName.length < 2) return badRequest('ownerFirstName (or firstName) is required (min 2 chars)')
        if (!lastName || lastName.length < 2) return badRequest('ownerLastName (or lastName) is required (min 2 chars)')
        let tempPassword = typeof body.ownerPassword === 'string' ? body.ownerPassword : typeof body.password === 'string' ? body.password : ''
        if (!tempPassword) tempPassword = crypto.randomBytes(12).toString('base64url') + 'A1!'
        if (tempPassword.length < 8) return badRequest('ownerPassword must be at least 8 characters (or omit to auto-generate)')
        try {
          const created: any = await payload.create({
            collection: 'users',
            data: {
              email: ownerEmail,
              password: tempPassword,
              firstName,
              lastName,
              role: 'customer',
              isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
              phone: typeof body.ownerPhone === 'string' ? body.ownerPhone.trim() || null : typeof body.phone === 'string' ? body.phone.trim() || null : null,
              username: typeof body.username === 'string' ? body.username.trim() || null : null,
            },
            overrideAccess: true,
          })
          ownerUserId = created.id
        } catch (e: any) {
          const msg = e?.message || 'Failed to create customer user'
          if (String(msg).toLowerCase().includes('email') && String(msg).toLowerCase().includes('unique')) {
            return NextResponse.json({ error: 'Email already in use', details: msg }, { status: 409 })
          }
          return NextResponse.json({ error: msg, details: e?.data }, { status: 400 })
        }
      }
    }

    if (!ownerUserId) return badRequest('Unable to resolve customer user')

    // validate srn uniqueness if provided
    if (srn) {
      const dup = await payload.find({ collection: 'customers', where: { srn: { equals: srn } }, limit: 1, depth: 0, overrideAccess: true })
      if (dup.docs.length) return NextResponse.json({ error: 'Duplicate srn: already exists' }, { status: 409 })
    }

    const customerData: Record<string, any> = {
      user: ownerUserId,
      srn,
      couponCode,
      enrollmentDate,
      currentLevel,
      activeAddress,
    }

    let created: Record<string, any>
    try {
      created = (await payload.create({ collection: 'customers', data: customerData as any, depth: 2, overrideAccess: true })) as unknown as Record<string, any>
    } catch (e: any) {
      const msg = e?.message || 'Failed to create customer'
      const lower = String(msg).toLowerCase()
      if (lower.includes('unique') || lower.includes('already exists') || lower.includes('duplicate')) {
        return NextResponse.json({ error: 'Duplicate value violates unique constraint', details: msg }, { status: 409 })
      }
      return NextResponse.json({ error: msg, details: e?.data || e?.errors }, { status: 400 })
    }

    const sanitized = sanitizeCustomerDoc(created, created, new Map(), new Map())
    try { await bustCustomersCache() } catch { /* ignore */ }
    return NextResponse.json({ success: true, message: 'Customer created successfully', doc: sanitized }, { status: 201 })
  } catch (err: any) {
    console.error('[admin/customers] POST error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
