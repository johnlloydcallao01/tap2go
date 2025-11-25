import type { Metadata } from 'next'
import Image from '@/components/ui/ImageWrapper'
import ProductStickyHeader from '@/components/merchant/ProductStickyHeader'

type RouteParams = { slugId?: string | string[]; productSlugId?: string | string[] }
type PageProps = { params?: Promise<RouteParams> }

function slugToId(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw?.[0] : raw
  const s = v ? v.toString() : ''
  const id = s.split('-').pop() || ''
  return id
}

function formatPrice(value: number | null): string | null {
  if (value == null) return null
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(value))
}

function getImageUrl(media: any): string | null {
  if (!media) return null
  return media.cloudinaryURL || media.url || media.thumbnailURL || null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (await params) ?? {}
  const productId = slugToId(resolved.productSlugId)
  if (!productId) return { title: 'Product | Tap2Go' }

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api'
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const apiKey = process.env.PAYLOAD_API_KEY || process.env.NEXT_PUBLIC_PAYLOAD_API_KEY
    if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

    const res = await fetch(`${API_BASE}/products/${productId}?depth=2`, { headers, next: { revalidate: 120 } })
    if (!res.ok) return { title: 'Product | Tap2Go' }
    const product = await res.json()
    const titleBase: string = product?.name || 'Product'
    const ogImage = getImageUrl(product?.media?.primaryImage)
    return {
      title: `${titleBase} | Tap2Go`,
      description: product?.shortDescription || undefined,
      openGraph: { title: `${titleBase} | Tap2Go`, description: product?.shortDescription || undefined, images: ogImage ? [{ url: ogImage }] : undefined },
      twitter: { card: 'summary_large_image', title: `${titleBase} | Tap2Go`, description: product?.shortDescription || undefined, images: ogImage ? [ogImage] : undefined },
    }
  } catch {
    return { title: 'Product | Tap2Go' }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const resolved = (await params) ?? {}
  const merchantSlugId = Array.isArray(resolved.slugId) ? resolved.slugId?.[0] : resolved.slugId
  const merchantId = slugToId(resolved.slugId)
  const productId = slugToId(resolved.productSlugId)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api'
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const apiKey = process.env.PAYLOAD_API_KEY || process.env.NEXT_PUBLIC_PAYLOAD_API_KEY
  if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

  const res = await fetch(`${API_BASE}/products/${productId}?depth=2`, { headers, cache: 'no-store' })
  if (!res.ok) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-2.5 py-6">
          <div className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-red-600">Failed to load product</p>
          </div>
        </div>
      </div>
    )
  }
  const product = await res.json()

  const primaryImage = getImageUrl(product?.media?.primaryImage)
  const name: string = product?.name || ''
  const basePrice: number | null = product?.basePrice ?? null
  const compareAtPrice: number | null = product?.compareAtPrice ?? null
  const shortDescription: string | null = product?.shortDescription ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductStickyHeader fallbackHref={`/merchant/${merchantSlugId}`} />
      <div className="relative w-full aspect-[72/26] lg:aspect-[72/20] -mt-12 lg:-mt-12">
        {primaryImage ? (
          <Image src={primaryImage} alt={name} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div className="w-full px-2.5 pb-8 pt-5">
        <div className="max-w-6xl">
          <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
          <div className="mt-3 flex items-center gap-3">
            {formatPrice(basePrice) && (
              <span className="text-2xl font-bold text-gray-900">{formatPrice(basePrice)}</span>
            )}
            {formatPrice(compareAtPrice) && (compareAtPrice as number) > (basePrice ?? 0) && (
              <span className="text-base text-gray-500 line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
          {shortDescription && (
            <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{shortDescription}</p>
          )}
        </div>
      </div>
    </div>
  )
}
