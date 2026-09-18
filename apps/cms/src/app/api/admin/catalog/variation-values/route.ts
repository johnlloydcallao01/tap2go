/**
 * @file apps/cms/src/app/api/admin/catalog/variation-values/route.ts
 * @description BFF aggregation endpoint for prod-variation-values (admin) — mirrors vendors/attributes/attribute-terms BFF.
 * GET  /api/admin/catalog/variation-values?page=1&limit=20&search=&variationId=1&attributeId=1&termId=1&sort=-createdAt
 * POST /api/admin/catalog/variation-values -> create variation-value (join table 3 FKs)
 * Access: admin-only via authenticateAdmin (JWT Bearer/JWT or payload-token cookie)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { deleteCachedByPrefix } from '@encreasl/cache'
import { sql, type SQL } from 'drizzle-orm'

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null
}
function numVal(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

function sanitizeProductBrief(value: unknown): { id: number; name: string; slug: string; productType: string } | number | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  if (typeof value === 'object') {
    const src = value as Record<string, unknown>
    const id = Number(src.id)
    if (Number.isNaN(id)) return null
    return {
      id,
      name: str(src.name, ''),
      slug: str(src.slug, ''),
      productType: str((src as any).productType, ''),
    }
  }
  return null
}

function sanitizeVariation(value: unknown): { id: number; sku: string; name: string | null; product: ReturnType<typeof sanitizeProductBrief> } | number | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  if (typeof value === 'object') {
    const src = value as Record<string, any>
    const id = Number(src.id)
    if (Number.isNaN(id)) return null
    return {
      id,
      sku: str(src.sku, ''),
      name: optionalString(src.name),
      product: sanitizeProductBrief(src.product_id),
    }
  }
  return null
}

function sanitizeAttribute(value: unknown): { id: number; name: string; slug: string; type: string } | number | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  if (typeof value === 'object') {
    const src = value as Record<string, any>
    const id = Number(src.id)
    if (Number.isNaN(id)) return null
    return {
      id,
      name: str(src.name, ''),
      slug: str(src.slug, ''),
      type: str(src.type, 'select'),
    }
  }
  return null
}

function sanitizeTerm(value: unknown): { id: number; name: string; slug: string; value: string | null; attribute_id: number | null } | number | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  if (typeof value === 'object') {
    const src = value as Record<string, any>
    const id = Number(src.id)
    if (Number.isNaN(id)) return null
    const attrRaw = src.attribute_id
    const attrIdNum =
      attrRaw && typeof attrRaw === 'object' && 'id' in attrRaw
        ? Number((attrRaw as any).id)
        : typeof attrRaw === 'number'
          ? attrRaw
          : typeof attrRaw === 'string'
            ? Number(attrRaw)
            : null
    return {
      id,
      name: str(src.name, ''),
      slug: str(src.slug, ''),
      value: optionalString(src.value),
      attribute_id: attrIdNum !== null && !Number.isNaN(attrIdNum) ? attrIdNum : null,
    }
  }
  return null
}

function sanitizeDoc(raw: Record<string, any>): Record<string, any> {
  const variationRaw = raw.variation_id
  const attributeRaw = raw.attribute_id
  const termRaw = raw.term_id

  const variation = sanitizeVariation(variationRaw)
  const attribute = sanitizeAttribute(attributeRaw)
  const term = sanitizeTerm(termRaw)

  const variationIdNum =
    variation && typeof variation === 'object' && 'id' in variation
      ? (variation as any).id
      : typeof variationRaw === 'number'
        ? variationRaw
        : typeof variationRaw === 'string'
          ? Number(variationRaw)
          : null

  const attributeIdNum =
    attribute && typeof attribute === 'object' && 'id' in attribute
      ? (attribute as any).id
      : typeof attributeRaw === 'number'
        ? attributeRaw
        : typeof attributeRaw === 'string'
          ? Number(attributeRaw)
          : null

  const termIdNum =
    term && typeof term === 'object' && 'id' in term
      ? (term as any).id
      : typeof termRaw === 'number'
        ? termRaw
        : typeof termRaw === 'string'
          ? Number(termRaw)
          : null

  return {
    id: raw.id,
    variation_id: variationIdNum,
    variation: typeof variation === 'object' && variation !== null && 'id' in variation ? variation : null,
    // alias for convenience
    variationBrief: typeof variation === 'object' && variation !== null && 'id' in variation ? variation : null,
    attribute_id: attributeIdNum,
    attribute: typeof attribute === 'object' && attribute !== null && 'id' in attribute ? attribute : null,
    term_id: termIdNum,
    term: typeof term === 'object' && term !== null && 'id' in term ? term : null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

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
    const cacheKey = `admin:catalog-variation-values:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildVariationValuesList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-VariationValues-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load variation values'
    console.error('[admin/catalog/variation-values] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function vvRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

async function buildVariationValuesList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || '-createdAt'

    const variationIdRaw = searchParams.get('variationId') || searchParams.get('variation_id') || searchParams.get('variation')
    const attributeIdRaw = searchParams.get('attributeId') || searchParams.get('attribute_id')
    const termIdRaw = searchParams.get('termId') || searchParams.get('term_id')

    const where: Record<string, any> = {}

    if (variationIdRaw) {
      const n = Number(variationIdRaw)
      if (!Number.isNaN(n) && Number.isFinite(n)) where.variation_id = { equals: n }
    }
    if (attributeIdRaw) {
      const n = Number(attributeIdRaw)
      if (!Number.isNaN(n) && Number.isFinite(n)) where.attribute_id = { equals: n }
    }
    if (termIdRaw) {
      const n = Number(termIdRaw)
      if (!Number.isNaN(n) && Number.isFinite(n)) where.term_id = { equals: n }
    }

    // search: via related term name (SQL term-id pre-pass, bounded 200)
    // If search provided, resolve term ids that match term name/slug/value ILIKE search
    let searchTermIds: number[] | null = null
    let searchNoMatch = false
    if (search) {
      try {
        const like = `%${escLike(search)}%`
        const termRows = await vvRows(
          payload,
          sql`SELECT id FROM prod_attribute_terms WHERE name ILIKE ${like} OR slug ILIKE ${like} OR value ILIKE ${like} LIMIT 200`,
        )
        const ids = termRows.map((d) => Number(d.id)).filter((n) => !Number.isNaN(n))
        if (ids.length === 0) {
          searchNoMatch = true
        } else {
          searchTermIds = ids
          // merge with existing termId filter? intersect if already filtered
          if (where.term_id?.equals !== undefined) {
            const already = Number(where.term_id.equals)
            if (!ids.includes(already)) searchNoMatch = true
            else searchTermIds = [already]
          } else {
            where.term_id = { in: ids }
          }
        }
      } catch {
        // fallback: ignore search filter if lookup fails
      }
    }

    if (searchNoMatch) {
      // early empty result
      return {
        docs: [],
        pagination: { page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        stats: { total: 0, totalAll: 0, filteredTotal: 0, perVariation: {}, perAttribute: {}, perTerm: {} },
        meta: { generatedAt: new Date().toISOString(), sort, search, variationId: variationIdRaw || null, attributeId: attributeIdRaw || null, termId: termIdRaw || null },
      }
    }

    const finalWhere = Object.keys(where).length ? where : undefined

    // Filtered WHERE fragment (mirrors finalWhere FK semantics) for exact filtered KPIs.
    const fConds: SQL[] = []
    const varNum = variationIdRaw && Number.isFinite(Number(variationIdRaw)) ? Number(variationIdRaw) : null
    const attrNum = attributeIdRaw && Number.isFinite(Number(attributeIdRaw)) ? Number(attributeIdRaw) : null
    if (varNum !== null) fConds.push(sql`variation_id_id = ${varNum}`)
    if (attrNum !== null) fConds.push(sql`attribute_id_id = ${attrNum}`)
    const finalTermIds = searchTermIds ?? (termIdRaw && Number.isFinite(Number(termIdRaw)) ? [Number(termIdRaw)] : null)
    if (finalTermIds && finalTermIds.length) {
      fConds.push(sql`term_id_id IN (${sql.join(finalTermIds.map((n) => sql`${n}`), sql`, `)})`)
    } else if (termIdRaw && !finalTermIds) {
      // explicit term filter handled via where; fallback keeps parity
    }
    let filterWhere: SQL | null = null
    if (fConds.length) {
      filterWhere = fConds[0]
      for (let i = 1; i < fConds.length; i++) filterWhere = sql`${filterWhere} AND ${fConds[i]}`
    }

    // Paginated display (correct) + SQL stats (no 2000-doc hydration, no re-fetch).
    const [paginated, statRows, perVarRows, perAttrRows, perTermRows] = await Promise.all([
      payload.find({
        collection: 'prod-variation-values',
        where: finalWhere as any,
        page,
        limit,
        sort,
        depth: 2,
        overrideAccess: true,
      }),
      vvRows(payload, sql`SELECT COUNT(*)::int AS total FROM prod_variation_values`),
      vvRows(payload, sql`SELECT variation_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values GROUP BY variation_id_id`),
      vvRows(payload, sql`SELECT attribute_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values GROUP BY attribute_id_id`),
      vvRows(payload, sql`SELECT term_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values GROUP BY term_id_id`),
    ])

    const docs = (paginated.docs as unknown as Record<string, any>[]).map((d) => sanitizeDoc(d))

    const total = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length
    const totalAll = Number(statRows[0]?.total ?? 0)

    // per- counts (global, SQL GROUP BY)
    const perVariation: Record<string, number> = {}
    for (const r of perVarRows) perVariation[String(r.k ?? 'unknown')] = Number(r.c ?? 0)
    const perAttribute: Record<string, number> = {}
    for (const r of perAttrRows) perAttribute[String(r.k ?? 'unknown')] = Number(r.c ?? 0)
    const perTerm: Record<string, number> = {}
    for (const r of perTermRows) perTerm[String(r.k ?? 'unknown')] = Number(r.c ?? 0)

    // filtered stats exact via SQL (replaces bounded-2000 re-fetch + cap fallback)
    let filteredTotal = total
    let perVariationFiltered = perVariation
    let perAttributeFiltered = perAttribute
    let perTermFiltered = perTerm
    if (filterWhere) {
      const [fCount, fVar, fAttr, fTerm] = await Promise.all([
        vvRows(payload, sql`SELECT COUNT(*)::int AS total FROM prod_variation_values WHERE ${filterWhere}`),
        vvRows(payload, sql`SELECT variation_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values WHERE ${filterWhere} GROUP BY variation_id_id`),
        vvRows(payload, sql`SELECT attribute_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values WHERE ${filterWhere} GROUP BY attribute_id_id`),
        vvRows(payload, sql`SELECT term_id_id::text AS k, COUNT(*)::int AS c FROM prod_variation_values WHERE ${filterWhere} GROUP BY term_id_id`),
      ])
      filteredTotal = Number(fCount[0]?.total ?? total)
      const pv: Record<string, number> = {}
      for (const r of fVar) pv[String(r.k ?? 'unknown')] = Number(r.c ?? 0)
      const pa: Record<string, number> = {}
      for (const r of fAttr) pa[String(r.k ?? 'unknown')] = Number(r.c ?? 0)
      const pt: Record<string, number> = {}
      for (const r of fTerm) pt[String(r.k ?? 'unknown')] = Number(r.c ?? 0)
      perVariationFiltered = pv
      perAttributeFiltered = pa
      perTermFiltered = pt
    }

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
        total: totalAll,
        totalAll,
        filteredTotal,
        perVariation: perVariationFiltered,
        perAttribute: perAttributeFiltered,
        perTerm: perTermFiltered,
        // global for compatibility
        globalPerVariation: perVariation,
        globalPerAttribute: perAttribute,
        globalPerTerm: perTerm,
      },
      meta: { generatedAt: new Date().toISOString(), sort, search, variationId: variationIdRaw || null, attributeId: attributeIdRaw || null, termId: termIdRaw || null },
    }
    return responseBody
  } catch (err: unknown) {
    console.error('[admin/catalog/variation-values] list build error:', err)
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

    // whitelist: variation_id required Number
    const varRaw = body.variation_id ?? body.variationId ?? body.variation
    const variation_id = Number(varRaw)
    if (varRaw === undefined || varRaw === null || varRaw === '' || Number.isNaN(variation_id) || !Number.isFinite(variation_id)) {
      return badRequest('variation_id is required (numeric prod-variations id)')
    }
    // attribute_id required Number
    const attrRaw = body.attribute_id ?? body.attributeId ?? body.attribute
    const attribute_id = Number(attrRaw)
    if (attrRaw === undefined || attrRaw === null || attrRaw === '' || Number.isNaN(attribute_id) || !Number.isFinite(attribute_id)) {
      return badRequest('attribute_id is required (numeric prod-attributes id)')
    }
    // term_id required Number
    const termRaw = body.term_id ?? body.termId ?? body.term
    const term_id = Number(termRaw)
    if (termRaw === undefined || termRaw === null || termRaw === '' || Number.isNaN(term_id) || !Number.isFinite(term_id)) {
      return badRequest('term_id is required (numeric prod-attribute-terms id)')
    }

    // validate variation exists
    try {
      const v = await payload.findByID({ collection: 'prod-variations', id: variation_id as number, depth: 0, overrideAccess: true })
      if (!v) return badRequest(`variation_id ${variation_id} does not exist`)
    } catch {
      return badRequest(`variation_id ${variation_id} does not exist`)
    }

    // validate attribute exists
    try {
      const a = await payload.findByID({ collection: 'prod-attributes', id: attribute_id as number, depth: 0, overrideAccess: true })
      if (!a) return badRequest(`attribute_id ${attribute_id} does not exist`)
    } catch {
      return badRequest(`attribute_id ${attribute_id} does not exist`)
    }

    // validate term exists and belongs to attribute via find
    let termDoc: Record<string, any> | null = null
    try {
      const termRes = await payload.find({
        collection: 'prod-attribute-terms',
        where: { id: { equals: term_id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      termDoc = (termRes.docs?.[0] as unknown as Record<string, any>) ?? null
    } catch {}
    if (!termDoc) return badRequest(`term_id ${term_id} does not exist`)
    const termAttrId = typeof termDoc.attribute_id === 'object' ? (termDoc.attribute_id as any).id : termDoc.attribute_id
    const termAttrNum = Number(termAttrId)
    if (Number(termAttrNum) !== Number(attribute_id)) {
      return badRequest('Term does not belong to the selected attribute', { termAttributeId: termAttrNum, selectedAttributeId: attribute_id })
    }

    // duplicate check: same variation_id + attribute_id already exists -> 409
    try {
      const dup = await payload.find({
        collection: 'prod-variation-values',
        where: {
          and: [{ variation_id: { equals: variation_id } }, { attribute_id: { equals: attribute_id } }],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (dup.docs.length > 0) {
        return NextResponse.json(
          { error: `Duplicate attribute for variation: attribute #${attribute_id} already assigned to variation #${variation_id}`, code: 'DUPLICATE_ATTRIBUTE_FOR_VARIATION', details: `variation ${variation_id} already has attribute ${attribute_id}` },
          { status: 409 },
        )
      }
    } catch {}

    const data: Record<string, any> = {
      variation_id,
      attribute_id,
      term_id,
    }

    let created: Record<string, any>
    try {
      created = (await payload.create({ collection: 'prod-variation-values', data: data as any, depth: 2, overrideAccess: true })) as unknown as Record<string, any>
    } catch (e: any) {
      const msg = e?.message || 'Failed to create variation value'
      const lower = String(msg).toLowerCase()
      if (lower.includes('term does not belong') || lower.includes('selected term does not belong')) {
        return NextResponse.json({ error: 'Term does not belong to the selected attribute', details: msg }, { status: 400 })
      }
      if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists')) {
        return NextResponse.json({ error: 'Duplicate attribute for variation', code: 'DUPLICATE_ATTRIBUTE_FOR_VARIATION', details: msg }, { status: 409 })
      }
      return NextResponse.json({ error: msg, details: e?.data || e?.errors }, { status: 400 })
    }

    const sanitized = sanitizeDoc(created)
    // Bust list cache (all admins / query variants) so the new value shows immediately
    await deleteCachedByPrefix('admin:catalog-variation-values:')
    return NextResponse.json({ success: true, message: 'Variation value created successfully', doc: sanitized }, { status: 201 })
  } catch (err: any) {
    console.error('[admin/catalog/variation-values] POST error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
