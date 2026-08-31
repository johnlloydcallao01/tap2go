'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Truck, Store, ArrowLeft, RefreshCw, AlertCircle, DollarSign, MapPin, Clock } from '@/components/ui/IconWrapper';

type Outlet = {
  id: string;
  outletName: string;
  outletCode: string;
  deliverySettings: {
    minimumOrderAmount: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryTimeMinutes: number;
    maxDeliveryTimeMinutes: number;
    deliveryRadiusMeters: number;
    deliveryFeePerKm: number;
  };
  address: { formattedAddress: string } | null;
};

export default function OutletDeliveryPage() {
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
            <Truck className="w-5 h-5 text-[#eba236]" /> Delivery Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Per-outlet minimums, fees and ETAs — FoodPanda-style fulfillment configuration.</p>
        </div>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-dashed border-gray-300 dark:border-[#404040] p-10 text-center">
          <Store className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No outlets yet.</p>
          <Link href="/outlets" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#eba236] text-white text-sm font-bold">Go to outlets</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#262626]">
                <tr className="text-xs font-semibold text-gray-500 dark:text-[#a1a1aa] text-left">
                  <th className="px-4 py-3">Outlet</th>
                  <th className="px-3 py-3">Min order</th>
                  <th className="px-3 py-3">Base fee</th>
                  <th className="px-3 py-3">Per km</th>
                  <th className="px-3 py-3">Free delivery</th>
                  <th className="px-3 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                {outlets.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{o.outletName}</p>
                      <p className="text-xs text-gray-400 font-mono">{o.outletCode} • {o.address?.formattedAddress?.slice(0, 32) || 'No address'}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" /> ₱{Number(o.deliverySettings.minimumOrderAmount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-700 dark:text-[#a1a1aa]">₱{Number(o.deliverySettings.deliveryFee).toLocaleString()}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-[#a1a1aa]">₱{Number(o.deliverySettings.deliveryFeePerKm).toFixed(2)}</td>
                    <td className="px-3 py-3">
                      {o.deliverySettings.freeDeliveryThreshold ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                          ₱{Number(o.deliverySettings.freeDeliveryThreshold).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-[#a1a1aa]">
                        <Clock className="w-3.5 h-3.5" /> {o.deliverySettings.estimatedDeliveryTimeMinutes}–{o.deliverySettings.maxDeliveryTimeMinutes} min
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-[#262626] flex items-center justify-between text-xs">
            <span className="text-gray-400">Edit from outlets → Edit → Delivery tab</span>
            <Link href="/outlets" className="font-semibold text-[#eba236] hover:text-[#c88a20]">Manage outlets →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
