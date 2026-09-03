import { NextRequest, NextResponse } from 'next/server';
import type { SearchCategory } from '@/lib/search-types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-admin-token';

interface PayloadDoc {
  id: string | number;
  [key: string]: unknown;
}

interface SuggestionCollection {
  slug: string;
  titleField: string;
  subtitleField?: string;
  category: SearchCategory;
  hrefPrefix: string;
  depth?: number;
}

const SUGGESTION_COLLECTIONS: SuggestionCollection[] = [
  {
    slug: 'merchants',
    titleField: 'outletName',
    subtitleField: 'description',
    category: 'merchants',
    hrefPrefix: '/merchants',
    depth: 1,
  },
  {
    slug: 'products',
    titleField: 'name',
    subtitleField: 'description',
    category: 'products',
    hrefPrefix: '/products',
  },
  {
    slug: 'orders',
    titleField: 'id',
    category: 'orders',
    hrefPrefix: '/orders',
  },
  {
    slug: 'vendors',
    titleField: 'businessName',
    subtitleField: 'businessEmail',
    category: 'vendors',
    hrefPrefix: '/vendors',
  },
  {
    slug: 'customers',
    titleField: 'id',
    category: 'customers',
    hrefPrefix: '/customers',
    depth: 1,
  },
  {
    slug: 'drivers',
    titleField: 'id',
    category: 'drivers',
    hrefPrefix: '/drivers',
    depth: 1,
  },
];

function getStringValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val && typeof val === 'object' && 'name' in val) return String((val as { name: unknown }).name);
  if (val && typeof val === 'object' && 'email' in val) return String((val as { email: unknown }).email);
  if (val && typeof val === 'object' && 'outletName' in val) return String((val as { outletName: unknown }).outletName);
  if (val && typeof val === 'object' && 'firstName' in val) {
    const obj = val as { firstName?: string; lastName?: string };
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ');
  }
  return '';
}

function escapeWhere(value: string): string {
  return value.replace(/[[\]]/g, '\\$&');
}

function getThumbnailUrl(doc: PayloadDoc, category: SearchCategory): string | undefined {
  if (category === 'vendors') {
    const logo = (doc.logo ?? null) as { cloudinaryURL?: string; url?: string } | string | null | undefined;
    if (typeof logo === 'string') return logo || undefined;
    if (logo && typeof logo === 'object') return logo.cloudinaryURL || logo.url || undefined;
  }

  if (category === 'merchants') {
    const vendor = (doc.vendor ?? null) as { logo?: { cloudinaryURL?: string; url?: string } | string | null } | null;
    const logo = vendor?.logo ?? null;
    if (typeof logo === 'string') return logo || undefined;
    if (logo && typeof logo === 'object') return logo.cloudinaryURL || logo.url || undefined;
  }

  return undefined;
}

async function fetchSuggestions(
  config: SuggestionCollection,
  query: string,
  token: string,
): Promise<{ id: string; label: string; subtitle: string; type: SearchCategory; href: string; thumbnail?: string }[]> {
  try {
    const q = escapeWhere(query);
    let url: string;

    if (config.slug === 'orders' && /^\d+$/.test(query)) {
      url = `${API_BASE}/${config.slug}?where[id][equals]=${q}&limit=2&depth=0&select=id,status`;
    } else if (config.slug === 'orders') {
      url = `${API_BASE}/${config.slug}?where[status][contains]=${q}&limit=2&depth=0&select=id,status`;
    } else {
      url = `${API_BASE}/${config.slug}?where[${config.titleField}][contains]=${q}&limit=2&depth=${config.depth ?? 0}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    const docs: PayloadDoc[] = data.docs ?? [];

    return docs.map((doc) => {
      const label = getStringValue(doc[config.titleField]) || `#${doc.id}`;
      const subtitle = config.subtitleField
        ? getStringValue(doc[config.subtitleField]) || config.category
        : config.category;
      const href =
        config.slug === 'orders'
          ? `${config.hrefPrefix}?id=${doc.id}`
          : `${config.hrefPrefix}/${doc.id}`;

      const thumbnail = getThumbnailUrl(doc, config.category);

      return {
        id: String(doc.id),
        label,
        subtitle,
        type: config.category,
        href,
        thumbnail,
      };
    });
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [], query: q ?? '' });
  }

  const cookieStore = request.cookies;
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await Promise.all(
    SUGGESTION_COLLECTIONS.map((c) => fetchSuggestions(c, q, token)),
  );

  const flat = results.flat().slice(0, 8);
  return NextResponse.json({ suggestions: flat, query: q });
}
