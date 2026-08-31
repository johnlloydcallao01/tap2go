'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Store, ArrowLeft, RefreshCw, AlertCircle, Sparkles, ExternalLink } from '@/components/ui/IconWrapper';

type Outlet = {
  id: string;
  outletName: string;
  outletCode: string;
  media: { thumbnail: { url: string; alt: string } | null; storeFrontImage: { url: string; alt: string } | null };
};

export default function OutletMediaPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/outlets', { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to load outlets');
      setOutlets(j.outlets || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6 py-5 px-2.5 animate-pulse">
        <div className="h-7 bg-gray-100 dark:bg-[#1a1a1a] rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5 px-2.5">
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-[#a1a1aa]">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 rounded-xl bg-[#eba236] text-white text-sm font-semibold inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex items-center gap-3">
        <Link href="/outlets" className="h-8 w-8 rounded-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] flex items-center justify-center text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#eba236]" /> Photos & Branding
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Store thumbnails and front photos — what customers see in the app.</p>
        </div>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-dashed border-gray-300 dark:border-[#404040] p-10 text-center">
          <Store className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No outlets yet.</p>
          <Link href="/outlets" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#eba236] text-white text-sm font-bold">Go to outlets</Link>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-200">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>
              Branding is managed per outlet via the media library. Thumbnails power search results and storefront cards; store front photos appear on the outlet detail page.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {outlets.map((o) => (
              <div key={o.id} className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626]">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{o.outletName}</h3>
                  <p className="text-xs text-gray-500 font-mono">{o.outletCode}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#a1a1aa] mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Thumbnail
                    </p>
                    {o.media.thumbnail?.url ? (
                      <a href={o.media.thumbnail.url} target="_blank" rel="noreferrer" className="group block relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] aspect-[16/10]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.media.thumbnail.url} alt={o.media.thumbnail.alt || o.outletName} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#0a0a0a] aspect-[16/10] flex flex-col items-center justify-center p-4 text-center">
                        <ImageIcon className="w-6 h-6 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400">No thumbnail set</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-[#a1a1aa] mb-2 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" /> Store front
                    </p>
                    {o.media.storeFrontImage?.url ? (
                      <a href={o.media.storeFrontImage.url} target="_blank" rel="noreferrer" className="group block relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] aspect-[16/10]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.media.storeFrontImage.url} alt={o.media.storeFrontImage.alt || o.outletName} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-[#404040] bg-gray-50 dark:bg-[#0a0a0a] aspect-[16/10] flex flex-col items-center justify-center p-4 text-center">
                        <Store className="w-6 h-6 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400">No store front photo</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-[#262626]">
                  <Link href="/outlets" className="text-xs font-semibold text-[#eba236] hover:text-[#c88a20]">Edit in outlets →</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
