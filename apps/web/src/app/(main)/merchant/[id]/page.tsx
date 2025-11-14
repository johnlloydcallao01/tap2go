import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from '@/components/ui/ImageWrapper';
import { BackButton } from '@/components/ui/BackButton';
import { getMerchantById } from '@/server/services/merchant-service';
import type { Merchant, Media } from '@/types/merchant';
import MobileStickyHeader from '@/components/merchant/MobileStickyHeader';

type RouteParams = { id?: string | string[] };
type PageProps = { params?: Promise<RouteParams> };

function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = (await params) ?? {};
  const rawId = resolved.id;
  const id = Array.isArray(rawId) ? rawId?.[0] : rawId;
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
  const rawId = resolved.id;
  const id = Array.isArray(rawId) ? rawId?.[0] : rawId;
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
      <div className="max-w-6xl mx-auto px-4 py-6">
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900">Lorem Ipsum</h2>
          <div className="mt-2 space-y-4 text-gray-700 leading-relaxed">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
              Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
            <p>
              Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
              Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent.
            </p>
            <p>
              Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque
              nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.
            </p>
            <p>
              Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis,
              luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
