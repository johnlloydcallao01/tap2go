'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@/components/ui/LinkWrapper';
import type { SearchResult, SearchCategory } from '@/lib/search-types';
import { SEARCH_CATEGORY_LABELS, SEARCH_CATEGORY_COLORS } from '@/lib/search-types';
import { Search, Store, Package, ShoppingBag, Users, Truck, RefreshCw } from '@/components/ui/IconWrapper';

const CATEGORY_ICONS: Record<SearchCategory, React.ReactNode> = {
  merchants: <Store className="w-4 h-4" />,
  products: <Package className="w-4 h-4" />,
  orders: <ShoppingBag className="w-4 h-4" />,
  customers: <Users className="w-4 h-4" />,
  drivers: <Truck className="w-4 h-4" />,
  vendors: <Store className="w-4 h-4" />,
};

const ALL_CATEGORIES: SearchCategory[] = ['merchants', 'products', 'orders', 'customers', 'drivers', 'vendors'];

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

  // vendor-style skeleton rows
  const skeletonRows = Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="animate-pulse">
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#262626]" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 bg-gray-100 dark:bg-[#262626] rounded" />
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-[#262626] rounded" />
        </div>
        <div className="flex-shrink-0 w-24 h-6 rounded-full bg-gray-100 dark:bg-[#262626]" />
      </div>
    </div>
  ));

  return (
    <div className="space-y-6 py-5 px-2.5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#eba236] text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </span>
            {query ? (
              <>Search results for "{query}"</>
            ) : (
              'Search'
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">
            {query
              ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
              : 'Search the admin panel — merchants, products, orders, customers, drivers, vendors'}
          </p>
        </div>
        <button
          onClick={() => { /* refresh */ }}
          disabled={isLoading}
          className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#a1a1aa] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-1.5 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'all'
              ? 'bg-[#eba236] text-white shadow-sm'
              : 'text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          All ({results.length})
        </button>
        {ALL_CATEGORIES.map((cat) => (
          counts[cat] > 0 && (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === cat
                  ? 'bg-[#eba236] text-white shadow-sm'
                  : 'text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {CATEGORY_ICONS[cat]}
              {SEARCH_CATEGORY_LABELS[cat]} ({counts[cat]})
            </button>
          )
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {skeletonRows}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]">
          <div className="h-16 w-16 bg-[#eba236]/10 dark:bg-[#eba236]/15 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#eba236]" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No results found</h2>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">
            Try searching for merchants, products, orders, or customers
          </p>
        </div>
      )}

      {/* Results List */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-[#262626]">
          {filteredResults.map((result) => (
            <div key={`${result.type}-${result.id}`}>
              <Link
                href={result.href as any}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50 transition"
              >
                <span className={`flex-shrink-0 p-2 rounded-lg ${SEARCH_CATEGORY_COLORS[result.type].replace('100', '50').replace('800', '700')} dark:bg-opacity-20`}>
                  {CATEGORY_ICONS[result.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{result.title}</div>
                  <div className="text-sm text-gray-500 dark:text-[#a1a1aa] truncate">{result.subtitle}</div>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${SEARCH_CATEGORY_COLORS[result.type].replace('100', '50').replace('800', '700')} dark:bg-opacity-20`}>
                  {SEARCH_CATEGORY_LABELS[result.type]}
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* No query state */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]">
          <div className="h-16 w-16 bg-[#eba236]/10 dark:bg-[#eba236]/15 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#eba236]" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Search the admin panel</h2>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">
            Search for merchants, products, orders, customers, drivers, vendors
          </p>
        </div>
      )}
    </div>
  );
}
