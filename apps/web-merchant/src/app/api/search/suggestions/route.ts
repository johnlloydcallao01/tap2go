import { NextRequest, NextResponse } from 'next/server';
import type { SearchCategory } from '@/lib/search-types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-merchant-token';

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
    slug: 'merchant-products',
    titleField: 'display_title',
    subtitleField: 'product_name_override',
    category: 'products',
    hrefPrefix: '/products',
    depth: 1,
  },
  {
    slug: 'orders',
    titleField: 'id',
    category: 'orders',
    hrefPrefix: '/orders',
  },
];

function getStringValue(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val && typeof val === 'object' && 'outletName' in val) return String((val as { outletName: unknown }).outletName);
  if (val && typeof val === 'object' && 'name' in val) return String((val as { name: unknown }).name);
  if (val && typeof val === 'object' && 'display_title' in val) return String((val as { display_title: unknown }).display_title);
  if (val && typeof val === 'object' && 'product_name_override' in val) return String((val as { product_name_override: unknown }).product_name_override);
  return '';
}

function escapeWhere(value: string): string {
  return value.replace(/[[\]]/g, '\\$&');
}

async function fetchSuggestions(
  config: SuggestionCollection,
  query: string,
  token: string,
): Promise<{ id: string; label: string; subtitle: string; type: SearchCategory; href: string }[]> {
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

      return {
        id: String(doc.id),
        label,
        subtitle,
        type: config.category,
        href,
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

  const flat = results.flat().slice(0, 6);
  return NextResponse.json({ suggestions: flat, query: q });
}
