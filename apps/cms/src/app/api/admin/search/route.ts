/**
 * @file apps/cms/src/app/api/admin/search/route.ts
 * @description Unified BFF for admin global search (typeahead + results page).
 * Replaces the 6-way direct-REST fan-out previously done in web-admin
 * (/api/search + /api/search/suggestions hit merchants/products/orders/
 * vendors/customers/drivers REST endpoints in parallel, each with its own
 * auth + full-doc hydration incl. depth:2 merchant afterRead loops).
 *
 * GET /api/admin/search?q=<query>&limit=5&mode=results|suggestions
 *   mode=results     -> { results: [{id,title,subtitle,type,href,thumbnail}], totalCount, query }
 *   mode=suggestions -> { suggestions: [{id,label,subtitle,type,href,thumbnail}], query }
 * Access: admin-only via authenticateAdmin (JWT Bearer/JWT or payload-token cookie)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'

type SearchCategory = 'merchants' | 'products' | 'orders' | 'customers' | 'drivers' | 'vendors'

type PayloadDoc = {
  id: string | number
  [key: string]: unknown
}

type CollectionConfig = {
  slug: string
  titleField: string
  subtitleFields: string[]
  hrefPrefix: string
  category: SearchCategory
  depth: number
  select?: Record<string, unknown>
  skipStoreHours?: boolean
}

const COLLECTIONS: CollectionConfig[] = [
  {
    slug: 'merchants',
    titleField: 'outletName',
    subtitleFields: ['description'],
    hrefPrefix: '/merchants',
    category: 'merchants',
    depth: 2,
    select: { outletName: true, description: true, media: { thumbnail: true, storeFrontImage: true }, vendor: true },
    skipStoreHours: true,
  },
  {
    slug: 'products',
    titleField: 'name',
    subtitleFields: ['description'],
    hrefPrefix: '/products',
    category: 'products',
    depth: 1,
    // description richText always resolved to '' by getStringValue — dropped.
    // media kept whole to preserve the primaryImage → images[] fallback chain.
    select: { name: true, media: true },
  },
  {
    slug: 'orders',
    titleField: 'id',
    subtitleFields: ['status', 'total'],
    hrefPrefix: '/orders',
    category: 'orders',
    depth: 0,
    select: { status: true, total: true },
  },
  {
    slug: 'vendors',
    titleField: 'businessName',
    subtitleFields: ['legalName'],
    hrefPrefix: '/vendors',
    category: 'vendors',
    depth: 1,
    // NOTE: vendors has no businessEmail field — the old BFF read always
    // resolved to '' and fell back to legalName/category. Dropped.
    select: { businessName: true, legalName: true, logo: true },
  },
  {
    slug: 'customers',
    titleField: 'id',
    subtitleFields: ['user'],
    hrefPrefix: '/customers',
    category: 'customers',
    depth: 1,
    select: { user: true },
  },
  {
    slug: 'drivers',
    titleField: 'id',
    subtitleFields: ['user'],
    hrefPrefix: '/drivers',
    category: 'drivers',
    depth: 1,
    select: { user: true },
  },
]

function getStringValue(val: unknown): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (val && typeof val === 'object' && 'name' in val) return String((val as { name: unknown }).name)
  if (val && typeof val === 'object' && 'email' in val) return String((val as { email: unknown }).email)
  if (val && typeof val === 'object' && 'outletName' in val) return String((val as { outletName: unknown }).outletName)
  if (val && typeof val === 'object' && 'firstName' in val) {
    const obj = val as { firstName?: string; lastName?: string }
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ')
  }
  return ''
}

function absolutizeUrl(u: string, origin: string): string {
  if (!u) return u
  if (/^https?:\/\//i.test(u)) return u
  // CMS `url` is often relative (e.g. "/api/media/file/...") — resolve vs CMS host.
  if (u.startsWith('/')) return `${origin}${u}`
  return u
}

/**
 * Resolve a displayable URL from a populated Media doc (or raw string).
 * CMS Media exposes cloudinaryURL / url / thumbnailURL — prefer in that order.
 */
function getMediaUrl(media: unknown, origin: string): string | undefined {
  if (!media) return undefined
  if (typeof media === 'string') return absolutizeUrl(media, origin) || undefined
  if (typeof media === 'number') return undefined
  if (typeof media === 'object') {
    const m = media as { cloudinaryURL?: unknown; url?: unknown; thumbnailURL?: unknown }
    if (typeof m.cloudinaryURL === 'string' && m.cloudinaryURL) return absolutizeUrl(m.cloudinaryURL, origin)
    if (typeof m.url === 'string' && m.url) return absolutizeUrl(m.url, origin)
    if (typeof m.thumbnailURL === 'string' && m.thumbnailURL) return absolutizeUrl(m.thumbnailURL, origin)
  }
  return undefined
}

function getThumbnailUrl(doc: PayloadDoc, category: SearchCategory, origin: string): string | undefined {
  if (category === 'products') {
    // products.media = group { primaryImage: upload->media, images: [{ image: upload->media }] }
    const media = (doc.media ?? null) as { primaryImage?: unknown; images?: unknown; image?: unknown } | null
    if (media && typeof media === 'object') {
      const primaryUrl = getMediaUrl(media.primaryImage, origin)
      if (primaryUrl) return primaryUrl
      if (Array.isArray(media.images)) {
        for (const entry of media.images as Array<{ image?: unknown } | unknown>) {
          const url = getMediaUrl((entry as { image?: unknown })?.image ?? entry, origin)
          if (url) return url
        }
      }
      const legacy = getMediaUrl(media.image, origin)
      if (legacy) return legacy
    }
    return getMediaUrl((doc as { primaryImage?: unknown }).primaryImage, origin)
  }

  if (category === 'vendors') {
    // vendors.logo upload->media
    return getMediaUrl((doc as { logo?: unknown }).logo, origin)
  }

  if (category === 'merchants') {
    // outlet's own media.thumbnail / media.storeFrontImage, then vendor logo.
    const media = (doc.media ?? null) as { thumbnail?: unknown; storeFrontImage?: unknown } | null
    if (media && typeof media === 'object') {
      const thumb = getMediaUrl(media.thumbnail, origin)
      if (thumb) return thumb
      const front = getMediaUrl(media.storeFrontImage, origin)
      if (front) return front
    }
    const vendor = (doc.vendor ?? null) as { logo?: unknown } | null
    if (!vendor || typeof vendor !== 'object') return undefined
    return getMediaUrl(vendor.logo, origin)
  }

  return undefined
}

function buildWhere(slug: string, titleField: string, query: string): Record<string, unknown> {
  if (slug === 'orders') {
    if (/^\d+$/.test(query)) return { id: { equals: Number(query) } }
    return { status: { contains: query } }
  }
  // customers/drivers search numeric id via contains (REST-parity semantics).
  return { [titleField]: { contains: query } }
}

function hrefFor(prefix: string, slug: string, id: string | number): string {
  if (slug === 'orders') return `${prefix}?id=${id}`
  return `${prefix}/${id}`
}

async function searchCollection(
  payload: Awaited<ReturnType<typeof getPayload>>,
  config: CollectionConfig,
  query: string,
  perCollectionLimit: number,
  origin: string,
  labelKey: 'title' | 'label',
): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await payload.find({
      collection: config.slug as never,
      where: buildWhere(config.slug, config.titleField, query) as never,
      limit: perCollectionLimit,
      depth: config.depth,
      overrideAccess: true,
      pagination: false,
      ...(config.skipStoreHours ? { context: { skipStoreHours: true } } : {}),
      ...(config.select ? { select: config.select } : {}),
    } as never)
    const docs = ((res as unknown as { docs?: PayloadDoc[] }).docs ?? []) as PayloadDoc[]
    return docs.map((doc) => {
      const title = getStringValue(doc[config.titleField]) || `#${doc.id}`
      const subtitle = config.subtitleFields.map((f) => getStringValue(doc[f])).filter(Boolean).join(' · ') || config.category
      const thumbnail = getThumbnailUrl(doc, config.category, origin)
      const row: Record<string, unknown> = {
        id: String(doc.id),
        [labelKey]: title,
        subtitle,
        type: config.category,
        href: hrefFor(config.hrefPrefix, config.slug, doc.id),
      }
      if (thumbnail) row.thumbnail = thumbnail
      return row
    })
  } catch {
    return []
  }
}

async function buildSearch(payload: Awaited<ReturnType<typeof getPayload>>, query: string, perCollectionLimit: number, origin: string, mode: 'results' | 'suggestions') {
  const labelKey = mode === 'suggestions' ? 'label' : ('title' as const)
  const grouped = await Promise.all(COLLECTIONS.map((c) => searchCollection(payload, c, query, perCollectionLimit, origin, labelKey)))
  const flat = grouped.flat()
  if (mode === 'suggestions') {
    return { suggestions: flat.slice(0, 8), query }
  }
  return { results: flat, totalCount: flat.length, query }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() ?? ''
    const mode = searchParams.get('mode') === 'suggestions' ? 'suggestions' : 'results'
    if (!q || q.length < 2) {
      return NextResponse.json(
        mode === 'suggestions' ? { suggestions: [], query: q } : { results: [], totalCount: 0, query: q },
      )
    }
    const limitParam = parseInt(searchParams.get('limit') ?? '5', 10)
    // Suggestions always fan out 2 per collection (BFF parity); results clamp 1..10.
    const perCollectionLimit = mode === 'suggestions' ? 2 : Math.min(Math.max(limitParam || 5, 1), 10)

    const cacheKey = `admin:search:v1:${mode}:${encodeURIComponent(q)}:${perCollectionLimit}`
    const origin = new URL(request.url).origin
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildSearch(payload, q, perCollectionLimit, origin, mode)),
    )
    return NextResponse.json(data, { headers: { 'X-Search-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search'
    console.error('[admin/search] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
