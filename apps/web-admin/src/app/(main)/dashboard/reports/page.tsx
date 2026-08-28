'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { ReportsData } from '@/lib/reports-types'
import { FileText, Download, Clock, ShieldCheck, DollarSign, Store, ShoppingCart, Truck, Package, Award, AlertCircle, RefreshCw, FileSpreadsheet } from '@/components/ui/IconWrapper'

type Range = '7d' | '30d' | '90d' | '1y' | 'all'
const RANGE_OPTS: { value: Range; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
]

function fmtCurrency(n: number) { return `₱${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}` }
function fmtDate(iso: string) { try { return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return iso } }
function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')
}
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1">{sub}</p>}
    </div>
  )
}

export default function ReportsPage() {
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (r: Range) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/reports?range=${r}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load reports')
      setData(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(range) }, [load, range])

  if (loading && !data) {
    return (
      <div className="space-y-[10px] py-5 px-2.5 animate-pulse">
        <div className="h-7 bg-gray-100 dark:bg-[#171717] rounded w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}</div>
        <div className="h-64 bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />
      </div>
    )
  }
  if (error && !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <button onClick={() => load(range)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" />Retry</button>
      </div>
    )
  }
  if (!data) return null

  const period = `${fmtDate(data.meta.periodStart)} — ${fmtDate(data.meta.periodEnd)}`

  return (
    <div className="space-y-[10px] py-5 px-2.5">
      {/* Header — period-closed, immutable */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2"><FileText className="w-6 h-6 text-blue-600" />Reports</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Period-closed, auditable exports • <span className="font-medium text-gray-700 dark:text-white">{period}</span> • Generated {new Date(data.meta.generatedAt).toLocaleString('en-PH')} • BFF <span className="font-mono text-xs">/admin/reports</span></p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Immutable snapshot — verified <span className="font-semibold">paid</span> transactions only. Differs from live Analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#171717] rounded-full border border-gray-200 dark:border-[#262626]">
            {RANGE_OPTS.map((o) => (
              <button key={o.value} onClick={() => setRange(o.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${range === o.value ? 'bg-white dark:bg-[#262626] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-[#333]' : 'text-gray-600 dark:text-[#a1a1aa]'}`}>{o.label}</button>
            ))}
          </div>
          <button onClick={() => load(range)} className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-full"><RefreshCw className="w-4 h-4 text-gray-600 dark:text-[#a1a1aa]" /></button>
        </div>
      </div>

      {/* Summary — differs from dashboard/analytics: closed-period totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
        <Kpi label="Gross (paid)" value={fmtCurrency(data.summary.totalRevenue)} sub={`${data.summary.paidCount} tx`} />
        <Kpi label="Refunded" value={fmtCurrency(data.summary.totalRefunded)} sub={`${data.summary.refundedCount} tx`} />
        <Kpi label="Net revenue" value={fmtCurrency(data.summary.netRevenue)} sub={`Avg ${fmtCurrency(data.summary.avgOrder)}`} />
        <Kpi label="Orders in period" value={String(data.summary.totalOrders)} sub={`${data.summary.failedCount} failed`} />
      </div>

      {/* Report cards — export per domain (unlike analytics charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]">
        {[
          { title: 'Financial Reconciliation', desc: 'Every paid transaction joined to order/merchant/vendor with platform & delivery fees. Source of truth for accounting.', icon: DollarSign, count: `${data.financialReconciliation.totalCount} tx`, rows: data.financialReconciliation.rows.length, action: () => downloadCsv(`financial-${data.meta.range}-${Date.now()}.csv`, toCsv(data.financialReconciliation.rows as unknown as Record<string, unknown>[], ['transactionId','orderId','date','merchant','vendor','amount','platformFee','deliveryFee','status','paymentMethod'])) },
          { title: 'Vendor Payouts', desc: 'Aggregated per vendor: orders, gross, fees, net payout. For settlement.', icon: Store, count: `${data.vendorPayouts.count} vendors`, rows: data.vendorPayouts.rows.length, action: () => downloadCsv(`vendor-payouts-${data.meta.range}.csv`, toCsv(data.vendorPayouts.rows as unknown as Record<string, unknown>[], ['vendorId','businessName','orders','gross','platformFees','deliveryFees','net'])) },
          { title: 'Refunds & Failures', desc: 'Refunded + failed transactions in period. For support/finance review.', icon: AlertCircle, count: `${data.refundsFailures.count} rows`, rows: data.refundsFailures.rows.length, action: () => downloadCsv(`refunds-failures-${data.meta.range}.csv`, toCsv(data.refundsFailures.rows as unknown as Record<string, unknown>[], ['transactionId','orderId','date','amount','status','paymentMethod'])) },
          { title: 'Product Performance', desc: 'Verified-order items only. Quantity & revenue per SKU snapshot.', icon: Package, count: `${data.productPerformance.count} SKUs`, rows: data.productPerformance.rows.length, action: () => downloadCsv(`product-performance-${data.meta.range}.csv`, toCsv(data.productPerformance.rows as unknown as Record<string, unknown>[], ['id','name','quantity','revenue','orders'])) },
          { title: 'Vendor Compliance', desc: 'Verification status, active flag, merchant count. For ops/legal.', icon: ShieldCheck, count: `${data.vendorCompliance.count} vendors`, rows: data.vendorCompliance.rows.length, action: () => downloadCsv(`vendor-compliance-${data.meta.range}.csv`, toCsv(data.vendorCompliance.rows as unknown as Record<string, unknown>[], ['vendorId','businessName','businessType','verificationStatus','isActive','totalMerchants'])) },
          { title: 'Delivery Logistics', desc: 'Lalamove bookings in period by status + sample rows. For SLA.', icon: Truck, count: `${data.deliveryLogistics.totalBookings} bookings`, rows: data.deliveryLogistics.sampleRows.length, action: () => downloadCsv(`delivery-${data.meta.range}.csv`, toCsv(data.deliveryLogistics.sampleRows as unknown as Record<string, unknown>[], ['orderId','status','deliveryFee','serviceType','driverName'])) },
        ].map((card) => (
          <div key={card.title} className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0"><card.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-[#a1a1aa]">{card.count}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{card.title}</h3>
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 flex-1">{card.desc}</p>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={card.action} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"><Download className="w-3.5 h-3.5" />CSV</button>
              <span className="text-xs text-gray-400">{card.rows} preview rows</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed tables — period-closed line items, not analytics trends */}
      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />Financial Reconciliation — {period} ({data.financialReconciliation.totalCount} tx)</h3>
          <button onClick={() => downloadCsv(`financial-${data.meta.range}.csv`, toCsv(data.financialReconciliation.rows as unknown as Record<string, unknown>[], ['transactionId','orderId','date','merchant','vendor','amount','platformFee','deliveryFee']))} className="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" />Export CSV</button>
        </div>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-[#a1a1aa] sticky top-0"><tr><th className="text-left px-3 py-2 font-medium">Date</th><th className="text-left px-3 py-2 font-medium">Order</th><th className="text-left px-3 py-2 font-medium">Merchant</th><th className="text-left px-3 py-2 font-medium">Vendor</th><th className="text-right px-3 py-2 font-medium">Amount</th><th className="text-right px-3 py-2 font-medium">Platform</th><th className="text-right px-3 py-2 font-medium">Delivery</th><th className="text-left px-3 py-2 font-medium">Method</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {data.financialReconciliation.rows.map((r) => (
                <tr key={r.transactionId} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50"><td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.date)}</td><td className="px-3 py-2 font-mono">#{r.orderId.slice(-6)}</td><td className="px-3 py-2 truncate max-w-[140px]">{r.merchant}</td><td className="px-3 py-2 truncate max-w-[140px]">{r.vendor}</td><td className="px-3 py-2 text-right font-medium">{fmtCurrency(r.amount)}</td><td className="px-3 py-2 text-right">{fmtCurrency(r.platformFee)}</td><td className="px-3 py-2 text-right">{fmtCurrency(r.deliveryFee)}</td><td className="px-3 py-2 capitalize">{r.paymentMethod}</td></tr>
              ))}
              {!data.financialReconciliation.rows.length && <tr><td colSpan={8} className="text-center py-8 text-gray-500">No paid transactions in period</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-between text-xs text-gray-600 dark:text-[#a1a1aa]"><span>Showing {data.financialReconciliation.count} / {data.financialReconciliation.totalCount} rows (cap 200)</span><span>Gross {fmtCurrency(data.financialReconciliation.totals.gross)} • Platform {fmtCurrency(data.financialReconciliation.totals.platformFees)} • Delivery {fmtCurrency(data.financialReconciliation.totals.deliveryFees)}</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Vendor Payouts</h3><button onClick={() => downloadCsv(`vendor-payouts-${data.meta.range}.csv`, toCsv(data.vendorPayouts.rows as unknown as Record<string, unknown>[], ['vendorId','businessName','orders','gross','net']))} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1"><Download className="w-3 h-3" />CSV</button></div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs"><thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-[#a1a1aa] sticky top-0"><tr><th className="text-left px-3 py-2">Vendor</th><th className="text-right px-3 py-2">Orders</th><th className="text-right px-3 py-2">Gross</th><th className="text-right px-3 py-2">Net</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">{data.vendorPayouts.rows.map((r) => <tr key={r.vendorId} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50"><td className="px-3 py-2 truncate max-w-[160px]">{r.businessName}</td><td className="px-3 py-2 text-right">{r.orders}</td><td className="px-3 py-2 text-right">{fmtCurrency(r.gross)}</td><td className="px-3 py-2 text-right font-semibold">{fmtCurrency(r.net)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Award className="w-4 h-4" />Product Performance (verified)</h3><button onClick={() => downloadCsv(`products-${data.meta.range}.csv`, toCsv(data.productPerformance.rows as unknown as Record<string, unknown>[], ['name','quantity','revenue','orders']))} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1"><Download className="w-3 h-3" />CSV</button></div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs"><thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 sticky top-0"><tr><th className="text-left px-3 py-2">Product</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Revenue</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">{data.productPerformance.rows.map((r) => <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50"><td className="px-3 py-2 truncate max-w-[180px]">{r.name}</td><td className="px-3 py-2 text-right">{r.quantity}</td><td className="px-3 py-2 text-right font-medium">{fmtCurrency(r.revenue)}</td></tr>)}
                {!data.productPerformance.rows.length && <tr><td colSpan={3} className="text-center py-6 text-gray-500">No verified order items in period</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4" />Order Volume Daily (closed period)</h3><span className="text-xs text-gray-500">{data.orderVolume.daily.length} days</span></div>
        <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
          <table className="w-full text-xs"><thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 sticky top-0"><tr><th className="text-left px-3 py-2">Date</th><th className="text-right px-3 py-2">Orders</th><th className="text-right px-3 py-2">Revenue</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">{data.orderVolume.daily.slice(-30).map((d) => <tr key={d.date}><td className="px-3 py-2">{d.date}</td><td className="px-3 py-2 text-right">{d.orders}</td><td className="px-3 py-2 text-right">{fmtCurrency(d.revenue)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 dark:text-[#52525b] text-center">Period: {period} • Generated {new Date(data.meta.generatedAt).toLocaleString('en-PH')} • BFF <span className="font-mono">/admin/reports</span> • Dashboard=live, Analytics=exploratory, Reports=auditable</p>
    </div>
  )
}
