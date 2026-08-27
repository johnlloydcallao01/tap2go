import { NextRequest, NextResponse } from 'next/server';
import type { SearchCategory } from '@/lib/search-types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
const AUTH_COOKIE = 'tap2go-merchant-token';

interface PayloadDoc {
  id: string | number;
  [key: string]: unknown;
}

interface CollectionConfig {
  slug: string;
  titleField: string;
  subtitleFields: string[];
  hrefPrefix: string;
  category: SearchCategory;
  depth?: number;
}

const COLLECTIONS: CollectionConfig[] = [
  {
    slug: 'merchants',
    titleField: 'outletName',
    subtitleFields: ['description'],
    hrefPrefix: '/merchants',
    category: 'merchants',
    depth: 1,
  },
  {
    slug: 'merchant-products',
    titleField: 'display_title',
    subtitleFields: ['product_name_override'],
    hrefPrefix: '/products',
    category: 'products',
    depth: 1,
  },
  {
    slug: 'orders',
    titleField: 'id',
    subtitleFields: ['status', 'total'],
    hrefPrefix: '/orders',
    category: 'orders',
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

async function searchCollection(
  config: CollectionConfig,
  query: string,
  token: string,
  limit: number = 5,
): Promise<{ id: string; title: string; subtitle: string; type: SearchCategory; href: string }[]> {
  try {
    const q = escapeWhere(query);
    let url: string;

    if (config.slug === 'orders' && /^\d+$/.test(query)) {
      url = `${API_BASE}/${config.slug}?where[id][equals]=${q}&limit=${limit}&depth=${config.depth ?? 0}&select=id,status,total`;
    } else if (config.slug === 'orders') {
      url = `${API_BASE}/${config.slug}?where[status][contains]=${q}&limit=${limit}&depth=${config.depth ?? 0}&select=id,status,total`;
    } else {
      const titleField = config.titleField;
      url = `${API_BASE}/${config.slug}?where[${titleField}][contains]=${q}&limit=${limit}&depth=${config.depth ?? 0}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    const docs: PayloadDoc[] = data.docs ?? [];

    return docs.map((doc) => {
      const title = getStringValue(doc[config.titleField]) || `#${doc.id}`;
      const subtitleParts = config.subtitleFields
        .map((f) => getStringValue(doc[f]))
        .filter(Boolean);
      const subtitle = subtitleParts.join(' · ') || config.category;

      let href = config.hrefPrefix;
      if (config.slug === 'orders') {
        href = `${config.hrefPrefix}?id=${doc.id}`;
      } else {
        href = `${config.hrefPrefix}/${doc.id}`;
      }

      return {
        id: String(doc.id),
        title,
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
    return NextResponse.json({ results: [], totalCount: 0, query: q ?? '' });
  }

  const cookieStore = request.cookies;
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limitParam = parseInt(searchParams.get('limit') ?? '5', 10);
  const limit = Math.min(Math.max(limitParam, 1), 10);

  const results = await Promise.all(
    COLLECTIONS.map((c) => searchCollection(c, q, token, limit)),
  );

  const flat = results.flat();
  return NextResponse.json({
    results: flat,
    totalCount: flat.length,
    query: q,
  });
}
