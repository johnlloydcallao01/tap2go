'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@/components/ui/LinkWrapper';
import type { SearchResult, SearchCategory } from '@/lib/search-types';
import { SEARCH_CATEGORY_LABELS, SEARCH_CATEGORY_COLORS } from '@/lib/search-types';
import { Search, Store, Package, ShoppingBag, Loader2 } from '@/components/ui/IconWrapper';

const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  merchants: <Store className="w-4 h-4" />,
  products: <Package className="w-4 h-4" />,
  orders: <ShoppingBag className="w-4 h-4" />,
};

const ALL_CATEGORIES: SearchCategory[] = ['merchants', 'products', 'orders'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchCategory | 'all'>('all');

  const fetchResults = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter((r) => r.type === activeTab);

  const counts = ALL_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = results.filter((r) => r.type === cat).length;
      return acc;
    },
    {} as Record<SearchCategory, number>,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? (
            <>Search results for &ldquo;{query}&rdquo;</>
          ) : (
            'Search'
          )}
        </h1>
        {!isLoading && query && (
          <p className="text-sm text-gray-500 mt-1">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({results.length})
        </button>
        {ALL_CATEGORIES.map((cat) => (
          counts[cat] > 0 && (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_ICONS[cat]}
              {SEARCH_CATEGORY_LABELS[cat]} ({counts[cat]})
            </button>
          )
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">No results found</h2>
          <p className="text-sm text-gray-500">
            Try searching for merchants, products, or orders
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="space-y-2">
          {filteredResults.map((result) => (
            <div key={`${result.type}-${result.id}`}>
              <Link
                href={result.href as any}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <span className={`flex-shrink-0 p-2 rounded-lg ${SEARCH_CATEGORY_COLORS[result.type]}`}>
                  {CATEGORY_ICONS[result.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{result.title}</div>
                  <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${SEARCH_CATEGORY_COLORS[result.type]}`}>
                  {SEARCH_CATEGORY_LABELS[result.type]}
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* No query state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">Search the merchant portal</h2>
          <p className="text-sm text-gray-500">
            Use the search bar above to find merchants, products, and orders
          </p>
        </div>
      )}
    </div>
  );
}
