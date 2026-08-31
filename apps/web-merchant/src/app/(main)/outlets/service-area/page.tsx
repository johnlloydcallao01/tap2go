'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Store, ArrowLeft, RefreshCw, AlertCircle, Globe } from '@/components/ui/IconWrapper';

type Outlet = {
  id: string;
  outletName: string;
  outletCode: string;
  address: { formattedAddress: string; latitude: number; longitude: number } | null;
  coordinates: { latitude: number; longitude: number };
  deliverySettings: { deliveryRadiusMeters: number; maxDeliveryRadiusMeters: number };
};

export default function OutletServiceAreaPage() {
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
        <div className="h-64 bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />
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
            <Globe className="w-5 h-5 text-[#eba236]" /> Service Areas & Radius
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Delivery coverage per outlet — coordinates and service radius.</p>
        </div>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-dashed border-gray-300 dark:border-[#404040] p-10 text-center">
          <Store className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No outlets yet.</p>
          <Link href="/outlets" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#eba236] text-white text-sm font-bold">Go to outlets</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {outlets.map((o) => {
            const lat = o.coordinates.latitude || o.address?.latitude || 0;
            const lng = o.coordinates.longitude || o.address?.longitude || 0;
            const hasCoords = lat !== 0 && lng !== 0;
            return (
              <div key={o.id} className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-[#eba236]/20 via-amber-50 to-gray-100 dark:from-[#eba236]/10 dark:via-[#1a1a1a] dark:to-[#0a0a0a] relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full border-2 border-[#eba236]/30 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-[#eba236]/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#eba236]" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white dark:bg-[#1a1a1a] rounded-full px-2.5 py-1 text-xs font-semibold border border-gray-200 dark:border-[#404040] shadow-sm">
                    {(o.deliverySettings.deliveryRadiusMeters / 1000).toFixed(1)} km radius
                  </div>
                  {!hasCoords && (
                    <div className="absolute top-2 left-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-1 text-xs font-semibold">No coordinates</div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{o.outletName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{o.outletCode} • ID #{o.id}</p>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 dark:text-[#a1a1aa]">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 line-clamp-2">{o.address?.formattedAddress || 'No address set'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-[#262626]">
                    <div className="rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] p-3">
                      <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">Coordinates</p>
                      <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white mt-1">{hasCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] p-3">
                      <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">Service radius</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{(o.deliverySettings.deliveryRadiusMeters / 1000).toFixed(1)} km</p>
                      <p className="text-[11px] text-gray-400">max {(o.deliverySettings.maxDeliveryRadiusMeters / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasCoords && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#404040] text-xs font-semibold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#333]"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Open in Maps
                      </a>
                    )}
                    <Link href="/outlets" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#eba236] hover:bg-[#c88a20] text-white text-xs font-bold">
                      Edit outlet
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
