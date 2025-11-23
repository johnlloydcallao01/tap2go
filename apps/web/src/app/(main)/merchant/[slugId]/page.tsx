import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from '@/components/ui/ImageWrapper';
import { BackButton } from '@/components/ui/BackButton';
import { getMerchantById } from '@/server/services/merchant-service';
import type { Merchant, Media } from '@/types/merchant';
import MobileStickyHeader from '@/components/merchant/MobileStickyHeader';
import MerchantProductGrid from '@/components/merchant/MerchantProductGrid';

type RouteParams = { slugId?: string | string[] };
type PageProps = { params?: Promise<RouteParams> };

function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

async function getMerchantProducts(merchantId: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.PAYLOAD_API_KEY || process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
  if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

  const url = `${API_BASE}/merchant-products?where[merchant_id][equals]=${merchantId}&where[is_active][equals]=true&where[is_available][equals]=true&depth=2&limit=48`;
  try {
    const res = await fetch(url, { headers, next: { revalidate: 120 } });
    if (!res.ok) return { items: [], categories: [] } as any;
    const data = await res.json();
    const docs: any[] = (data?.docs || []).filter((mp: any) => mp?.product_id?.catalogVisibility !== 'hidden');
    const categoryMap = new Map<number, any>();
    const items = docs.map((mp) => {
      const product = mp?.product_id || null;
      const primaryImage = product?.media?.primaryImage || null;
      const imageUrl = primaryImage?.cloudinaryURL || primaryImage?.url || primaryImage?.thumbnailURL || null;
      const rawCats = Array.isArray(product?.categories) ? product.categories : [];
      const categoryIds: number[] = [];
      rawCats.forEach((c: any) => {
        const id = typeof c === 'number' ? c : (typeof c?.id === 'number' ? c.id : null);
        if (typeof id === 'number') {
          categoryIds.push(id);
          if (typeof c === 'object' && c) {
            const icon = c?.media?.icon || null;
            categoryMap.set(id, {
              id,
              name: c?.name,
              slug: c?.slug,
              media: { icon },
            });
          }
        }
      });
      return {
        id: product?.id ?? mp?.id,
        name: product?.name ?? '',
        productType: product?.productType ?? 'simple',
        basePrice: product?.basePrice ?? null,
        compareAtPrice: product?.compareAtPrice ?? null,
        shortDescription: product?.shortDescription ?? '',
        imageUrl,
        categoryIds,
      };
    });
    const collectedIds = new Set<number>();
    items.forEach((it) => (it.categoryIds || []).forEach((cid) => collectedIds.add(cid)));
    const ids = Array.from(collectedIds);
    let uniqueCategories = Array.from(categoryMap.values());

    if (ids.length > 0) {
      const catUrl = `${API_BASE}/product-categories?where[id][in]=${ids.join(',')}&limit=${ids.length}&depth=1`;
      const catRes = await fetch(catUrl, { headers, next: { revalidate: 300 } });
      if (catRes.ok) {
        const catData = await catRes.json();
        const cats = Array.isArray(catData?.docs) ? catData.docs : [];
        const byId = new Map<number, any>();
        cats.forEach((c: any) => {
          if (typeof c?.id === 'number') {
            byId.set(c.id, {
              id: c.id,
              name: c?.name,
              slug: c?.slug,
              media: { icon: c?.media?.icon },
            });
          }
        });
        uniqueCategories = ids
          .map((cid) => byId.get(cid) || categoryMap.get(cid))
          .filter((c: any) => c && c.id);
      }
    }
    return {
      items: items.filter((p) => p && p.name),
      categories: uniqueCategories,
    };
  } catch {
    return { items: [], categories: [] } as any;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (await params) ?? {};
  const rawSlugId = resolved.slugId;
  const slugId = Array.isArray(rawSlugId) ? rawSlugId?.[0] : rawSlugId;
  const id = slugId ? slugId.toString().split('-').pop() || '' : '';
  if (!id) {
    return {
      title: 'Restaurant Not Found | Tap2Go',
      description: 'The requested restaurant could not be found.'
    };
  }
  const merchant = await getMerchantById(id);
  if (!merchant) {
    return {
      title: 'Restaurant Not Found | Tap2Go',
      description: 'The requested restaurant could not be found.'
    };
  }

  const titleBase = merchant.outletName || 'Restaurant';
  const vendorName = merchant.vendor?.businessName ? ` | ${merchant.vendor.businessName}` : '';
  const title = `${titleBase}${vendorName} | Tap2Go`;

  const thumbnail = getImageUrl(merchant.media?.thumbnail);
  const storeFront = getImageUrl(merchant.media?.storeFrontImage);
  const ogImage = storeFront || thumbnail || merchant.vendor?.logo?.cloudinaryURL || merchant.vendor?.logo?.url || undefined;

  return {
    title,
    description: merchant.description || `View details for ${titleBase} on Tap2Go, including operating hours, contact information, and delivery options.`,
    openGraph: {
      title,
      description: merchant.description || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: merchant.description || undefined,
      images: ogImage ? [ogImage] : undefined
    }
  };
}

// Fetch the merchant's active address display name from the production CMS
async function getActiveAddressNameByMerchantId(merchantId: string): Promise<string | null> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.PAYLOAD_API_KEY || process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
  if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

  try {
    const res = await fetch(`${API_BASE}/merchants/${merchantId}?depth=1`, { headers, next: { revalidate: 120 } });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.activeAddress;
    const name: string | null = addr?.formatted_address ?? null;
    return name;
  } catch (e) {
    return null;
  }
}

export default async function MerchantPage({ params }: PageProps) {
  const resolved = (await params) ?? {};
  const rawSlugId = resolved.slugId;
  const slugId = Array.isArray(rawSlugId) ? rawSlugId?.[0] : rawSlugId;
  const id = slugId ? slugId.toString().split('-').pop() || '' : '';
  const merchant: Merchant | null = id ? await getMerchantById(id) : null;
  if (!merchant) {
    notFound();
  }

  const heroImage = getImageUrl(merchant.media?.storeFrontImage) || getImageUrl(merchant.media?.thumbnail);
  const vendorLogo = getImageUrl(merchant.vendor?.logo);
  const operationalStatus = merchant.operationalStatus || (merchant.isAcceptingOrders ? 'open' : 'closed');

  const statusColor = operationalStatus === 'open'
    ? 'bg-green-600'
    : operationalStatus === 'busy'
      ? 'bg-yellow-500'
      : 'bg-red-600';

  // Build display name using active address from production CMS
  const addressName = id ? await getActiveAddressNameByMerchantId(id) : null;
  const displayName = addressName ? `${merchant.outletName} - ${addressName}` : merchant.outletName;

  const result = id ? await getMerchantProducts(id) : { items: [], categories: [] } as any;
  const products = result.items;
  const categories = result.categories;

  const formatPrice = (value: number | null) => {
    if (value == null) return null;
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(value));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page-exclusive sticky transparent header (mobile/tablet) with scroll opacity */}
      <MobileStickyHeader />

      {/* Hero Section */}
      <div className="relative w-full aspect-[3/1] md:h-[280px] md:aspect-auto -mt-12 lg:-mt-12">
        {heroImage ? (
          <Image src={heroImage} alt={`${merchant.outletName} storefront`} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-1/2 z-10 transform -translate-x-1/2 translate-y-[35%]">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30">
            {vendorLogo ? (
              <Image src={vendorLogo} alt={`${merchant.vendor?.businessName || 'Vendor'} logo`} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80">{merchant.vendor?.businessName?.charAt(0) || 'R'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="w-full px-2.5 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Main column: description, hours, media */}
          <div className="space-y-6">
            {/* Merchant name + active address below the logo */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900 line-clamp-2">{displayName}</h1>
            </div>
            {/* Description */}
            {merchant.description && (
              <section className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                <p className="text-gray-700 mt-2 whitespace-pre-line">{merchant.description}</p>
              </section>
            )}

            {/* Operating Hours */}
            {merchant.operatingHours && (
              <section className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                  {Object.entries(merchant.operatingHours).map(([day, value]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="font-medium">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Media Gallery */}
            {merchant.menuImages && merchant.menuImages.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900">Menu & Photos</h2>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {merchant.menuImages.map((m, idx) => {
                    const url = getImageUrl(m);
                    return (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {url ? (
                          <Image src={url} alt={m.alt || `Photo ${idx + 1}`} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right column removed per request */}
        </div>
      </div>
    
      <div className="w-full py-6 bg-white rounded-t-[25px] shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
        {products && products.length > 0 ? (
          <MerchantProductGrid products={products} categories={categories} />
        ) : (
          <div className="text-center text-gray-500">No products available</div>
        )}
      </div>
    </div>
  );
}
