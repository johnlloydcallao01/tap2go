'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Store, ArrowLeft, RefreshCw, AlertCircle, MapPin, CheckCircle, XCircle } from '@/components/ui/IconWrapper';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

type Outlet = {
  id: string;
  outletName: string;
  outletCode: string;
  operationalStatus: string;
  operatingHours: Record<string, { open: string; close: string; closed: boolean }> | null;
  address: { formattedAddress: string } | null;
};

function formatTime(t: string) {
  if (!t) return t;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function OutletHoursPage() {
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
            <Clock className="w-5 h-5 text-[#eba236]" /> Status & Operating Hours
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Weekly schedule per outlet — customers see these hours on the storefront.</p>
        </div>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-dashed border-gray-300 dark:border-[#404040] p-10 text-center">
          <Store className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No outlets yet. Create an outlet to manage hours.</p>
          <Link href="/outlets" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#eba236] text-white text-sm font-bold">Go to outlets</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {outlets.map((o) => (
            <div key={o.id} className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{o.outletName}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <span className="font-mono bg-gray-100 dark:bg-[#262626] px-2 py-0.5 rounded-full border border-gray-200 dark:border-[#404040]">{o.outletCode}</span>
                    {o.address?.formattedAddress && (
                      <>
                        <MapPin className="w-3 h-3" /> <span className="truncate">{o.address.formattedAddress}</span>
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                    o.operationalStatus === 'open'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : o.operationalStatus === 'busy'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300'
                  }`}
                >
                  {o.operationalStatus === 'open' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} {o.operationalStatus}
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-[#262626]">
                {DAYS.map((day) => {
                  const h = o.operatingHours?.[day.toLowerCase()] || o.operatingHours?.[day] as { open: string; close: string; closed: boolean } | undefined;
                  const closed = !h || h.closed;
                  return (
                    <div key={day} className="flex items-center justify-between px-5 py-2.5 text-sm">
                      <span className="font-medium text-gray-900 dark:text-white w-24">{day}</span>
                      {closed ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-[#262626] text-gray-500 border border-gray-200 dark:border-[#404040]">Closed</span>
                      ) : (
                        <span className="text-gray-600 dark:text-[#a1a1aa] font-medium">
                          {formatTime(h.open)} – {formatTime(h.close)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-5 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-[#262626] flex items-center justify-between">
                <span className="text-xs text-gray-400">Edit hours from the main outlets page → Edit outlet → Hours tab</span>
                <Link href="/outlets" className="text-xs font-semibold text-[#eba236] hover:text-[#c88a20]">Manage →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
