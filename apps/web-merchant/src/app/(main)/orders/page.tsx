'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Pencil, XCircle } from 'lucide-react'
import { ClientOnly } from '@/components/ClientOnly'
import { getEffectiveOrderStatus, getOrderStatusLabel } from '@/utils/orderStatus'
import {
  ShoppingBag, Clock, Package, CheckCircle, DollarSign, Store, MapPin, Search, X,
  SlidersHorizontal, ChevronDown, RefreshCw, AlertCircle, Truck, Store as OutletIcon,
  Eye, Plus, Trash2
} from '@/components/ui/IconWrapper'

type OrderDoc = {
  id: number
  orderNumber: string
  status: string
  fulfillment_type: string
  total: number
  subtotal: number
  delivery_fee: number
  platform_fee: number
  priority_fee: number
  discount_total: number
  coupon_code: string | null
  free_delivery_applied: boolean
  placed_at: string | null
  notes: string | null
  isPaid: boolean
  lalamove: { orderId: string | null; serviceType: string; status: string; trackingLink: string | null }
  merchant: { id: number; outletName: string; outletCode: string; isActive: boolean | null } | null
  customer: { id: number; email: string; firstName: string; lastName: string } | null
  createdAt: string
  updatedAt: string
}

type Pagination = { page: number; totalDocs: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean }

type Stats = {
  totalAll: number
  filteredTotal: number
  statusBreakdown: Record<string, number>
  fulfillmentBreakdown: Record<string, number>
  deliveryStatusBreakdown: Record<string, number>
  totalRevenue: number
  avgOrderValue: number
}

const STATUS_OPTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]
const FULFILL_OPTS = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
]
const DELIVERY_OPTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigning_driver', label: 'Assigning Driver' },
  { value: 'driver_assigned', label: 'On Going' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

function statusBadge(s: string) {
  const v = (s || '').toLowerCase()
  if (v === 'delivered' || v === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
  if (v === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
  if (['cancelled', 'canceled', 'rejected', 'expired'].includes(v)) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  if (v === 'on_delivery' || v === 'picked_up' || v === 'driver_assigned') return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800'
  if (v === 'preparing' || v === 'assigning_driver') return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
  if (v === 'accepted') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
  if (v === 'ready_for_pickup') return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'
  return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#262626] dark:text-[#a1a1aa] dark:border-[#262626]'
}
function fulfillmentBadge(s: string) {
  const v = (s || '').toLowerCase()
  if (v === 'delivery') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
  if (v === 'pickup') return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800'
  return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#262626] dark:text-[#a1a1aa]'
}
function deliveryBadge(s: string | null) {
  const v = (s || 'none').toLowerCase()
  if (v === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
  if (v === 'none') return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-[#262626] dark:text-[#a1a1aa] dark:border-[#262626]'
  if (v === 'picked_up' || v === 'driver_assigned') return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800'
  if (v === 'canceled' || v === 'cancelled' || v === 'rejected' || v === 'expired') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
}
function fmtPeso(v: number) {
  return `₱${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' })
    const time = d.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })
    return `${date} ${time}`
  } catch {
    return String(iso).slice(0, 10)
  }
}
function customerLabel(c: OrderDoc['customer']): string {
  if (!c) return 'Guest'
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim()
  return name || c.email || 'Guest'
}

function KpiCard({ title, value, sub, icon, iconBg }: { title: string; value: string; sub?: string; icon: React.ReactNode; iconBg: string }) {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa] truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 truncate">{sub}</p>}
        </div>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="h-8 w-48 bg-gray-200 dark:bg-[#262626] rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[86px] bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
      </div>
      <div className="h-16 bg-gray-100 dark:bg-[#171717] rounded-xl animate-pulse" />
    </div>
  )
}

function FilterPills({ label, options, value, onToggle }: { label: string; options: { value: string; label: string }[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-700 dark:text-[#a1a1aa] mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value.includes(opt.value)
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition capitalize ${active ? 'bg-[#eba236] text-white border-[#eba236]' : 'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626]'}`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OrdersContent() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [fulfillFilter, setFulfillFilter] = useState<string[]>([])
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([])
  const [discountFilter, setDiscountFilter] = useState<string[]>([])
  const [sort, setSort] = useState('-placed_at')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 10

  const [docs, setDocs] = useState<OrderDoc[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<OrderDoc | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 400)
    return () => clearTimeout(id)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, statusFilter, fulfillFilter, deliveryFilter, discountFilter, sort])

  const activeFilterCount = useMemo(
    () => statusFilter.length + fulfillFilter.length + deliveryFilter.length + discountFilter.length + (debouncedQ ? 1 : 0),
    [statusFilter, fulfillFilter, deliveryFilter, discountFilter, debouncedQ],
  )

  const load = async (opts?: { hard?: boolean }) => {
    if (opts?.hard) {
      setDocs([])
      setStats(null)
    }
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (debouncedQ) qs.set('search', debouncedQ)
      if (statusFilter.length) qs.set('status', statusFilter.join(','))
      if (fulfillFilter.length) qs.set('fulfillment_type', fulfillFilter.join(','))
      if (deliveryFilter.length) qs.set('delivery_status', deliveryFilter.join(','))
      if (discountFilter.length === 1) qs.set('has_discount', discountFilter[0])
      qs.set('page', String(page))
      qs.set('limit', String(limit))
      qs.set('sort', sort)
      const res = await fetch(`/api/orders?${qs.toString()}&_t=${Date.now()}`, { cache: 'no-store' })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to load orders')
      setDocs(Array.isArray(j.docs) ? j.docs : [])
      setStats(j.stats || null)
      setPagination(j.pagination || null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [debouncedQ, statusFilter, fulfillFilter, deliveryFilter, discountFilter, sort, page])

  const deleteOrder = async () => {
    if (!deleting || isDeleting) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch(`/api/orders/${deleting.id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to delete order')
      setDeleting(null)
      if (filtered.length === 1 && page > 1) setPage((current) => Math.max(1, current - 1))
      else await load()
    } catch (failure) {
      setDeleteError(failure instanceof Error ? failure.message : 'Failed to delete order')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleOrderStatus = async (order: OrderDoc) => {
    if (statusUpdatingId !== null) return
    const nextStatus = order.status.toLowerCase() === 'pending' ? 'accepted' : 'pending'
    setStatusUpdatingId(order.id)
    setStatusActionError(null)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          description: nextStatus === 'accepted' ? 'Vendor accepted the order' : 'Vendor returned the order to pending',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to update order status')
      await load()
    } catch (failure) {
      setStatusActionError(failure instanceof Error ? failure.message : 'Failed to update order status')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const cancelOrder = async (order: OrderDoc) => {
    if (statusUpdatingId !== null) return
    const deliveryCancellation = order.fulfillment_type === 'delivery'
    const details = deliveryCancellation
      ? 'If a Lalamove delivery is active, cancellation is subject to provider rules and may adjust the delivery fee.'
      : 'This action cannot be undone.'
    if (!window.confirm(`Cancel ${order.orderNumber}? ${details}`)) return

    setStatusUpdatingId(order.id)
    setStatusActionError(null)
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          description: 'Vendor cancelled the order',
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to cancel order')
      await load()
    } catch (failure) {
      setStatusActionError(failure instanceof Error ? failure.message : 'Failed to cancel order')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
    setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const toggleStatus = toggleFilter(setStatusFilter)
  const toggleFulfill = toggleFilter(setFulfillFilter)
  const toggleDelivery = toggleFilter(setDeliveryFilter)
  const toggleDiscount = toggleFilter(setDiscountFilter)

  const clearAll = () => {
    setQ('')
    setDebouncedQ('')
    setStatusFilter([])
    setFulfillFilter([])
    setDeliveryFilter([])
    setDiscountFilter([])
  }

  const filtered = useMemo(() => {
    let arr = [...docs]
    if (statusFilter.length > 1) arr = arr.filter((o) => statusFilter.includes(o.status.toLowerCase()))
    if (fulfillFilter.length > 1) arr = arr.filter((o) => fulfillFilter.includes(o.fulfillment_type.toLowerCase()))
    if (deliveryFilter.length > 1) arr = arr.filter((o) => deliveryFilter.includes(o.lalamove.status.toLowerCase()))
    if (discountFilter.length > 1) arr = arr.filter((o) => discountFilter.includes(String(o.discount_total > 0)))
    return arr
  }, [docs, statusFilter, fulfillFilter, deliveryFilter, discountFilter])

  const totalPages = Math.max(1, pagination?.totalPages ?? Math.ceil(filtered.length / limit))
  const pendingVal = stats ? String(stats.statusBreakdown?.pending || 0) : '0'
  const inProgressVal = stats ? String((stats.statusBreakdown?.preparing || 0) + (stats.statusBreakdown?.on_delivery || 0)) : '0'
  const deliveredVal = stats ? String(stats.statusBreakdown?.delivered || 0) : '0'
  const revenueVal = stats ? fmtPeso(stats.totalRevenue) : '₱0.00'
  const avgVal = stats ? `avg ${fmtPeso(stats.avgOrderValue)}` : ''

  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#eba236] text-white flex items-center justify-center"><ShoppingBag className="w-4 h-4" /></span>
            All Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">View and manage orders placed across your outlets.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load({ hard: true })}
            disabled={loading}
            aria-label="Refresh orders"
            className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#a1a1aa] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/orders/new" className="inline-flex items-center gap-2 rounded-xl bg-[#eba236] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c88a20]">
            <Plus className="h-4 w-4" /> New order
          </Link>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard title="Total Orders" value={String(stats.filteredTotal)} sub={`${stats.totalAll} overall`} icon={<ShoppingBag className="w-5 h-5 text-white" />} iconBg="bg-[#eba236]" />
          <KpiCard title="Pending" value={pendingVal} sub="awaiting acceptance" icon={<Clock className="w-5 h-5 text-white" />} iconBg="bg-amber-500" />
          <KpiCard title="In Progress" value={inProgressVal} sub="preparing + delivery" icon={<Package className="w-5 h-5 text-white" />} iconBg="bg-blue-600" />
          <KpiCard title="Delivered" value={deliveredVal} sub={`${Math.round(((stats.statusBreakdown?.delivered || 0) / Math.max(1, stats.totalAll)) * 100)}% completed`} icon={<CheckCircle className="w-5 h-5 text-white" />} iconBg="bg-emerald-500" />
          <KpiCard title="Revenue" value={revenueVal} sub={avgVal || 'total revenue'} icon={<DollarSign className="w-5 h-5 text-white" />} iconBg="bg-[#c88a20]" />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[86px] bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
        </div>
      ) : null}

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, coupon, Lalamove ID, notes…" className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-700 dark:text-white">
              <option value="-placed_at">Newest first</option>
              <option value="placed_at">Oldest first</option>
              <option value="-total">Total: high→low</option>
              <option value="total">Total: low→high</option>
            </select>
            <button onClick={() => setShowFilters((v) => !v)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition shrink-0 ${activeFilterCount ? 'bg-[#eba236] hover:bg-[#c88a20] text-white border-[#eba236]' : 'bg-white dark:bg-[#171717] text-gray-700 dark:text-[#a1a1aa] border-gray-200 dark:border-[#262626]'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#eba236]">{activeFilterCount}</span>} <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {activeFilterCount > 0 && <button onClick={clearAll} className="text-sm font-medium text-gray-500 dark:text-[#a1a1aa] hover:text-gray-900">Clear all</button>}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#262626] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FilterPills label="Status" options={STATUS_OPTS} value={statusFilter} onToggle={toggleStatus} />
              <FilterPills label="Fulfillment" options={FULFILL_OPTS} value={fulfillFilter} onToggle={toggleFulfill} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FilterPills label="Delivery Status" options={DELIVERY_OPTS} value={deliveryFilter} onToggle={toggleDelivery} />
              <FilterPills label="Discount" options={[{ value: 'true', label: 'Has discount' }, { value: 'false', label: 'No discount' }]} value={discountFilter} onToggle={toggleDiscount} />
            </div>
            <div className="flex justify-end"><button onClick={() => setShowFilters(false)} className="text-xs font-semibold text-[#eba236]">Done</button></div>
          </div>
        )}

        {activeFilterCount > 0 && !showFilters && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {debouncedQ && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eba236]/10 dark:bg-[#eba236]/15 text-[#8a5f17] dark:text-[#eba236] rounded-full text-xs font-medium border border-[#eba236]/30">Search: “{debouncedQ}” <button onClick={() => setQ('')}><X className="w-3 h-3" /></button></span>}
            {statusFilter.map((v) => <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] rounded-full text-xs font-medium capitalize">{v.replace('_', ' ')} <button onClick={() => toggleStatus(v)}><X className="w-3 h-3" /></button></span>)}
            {fulfillFilter.map((v) => <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] rounded-full text-xs font-medium capitalize">fulfillment: {v} <button onClick={() => toggleFulfill(v)}><X className="w-3 h-3" /></button></span>)}
            {deliveryFilter.map((v) => <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] rounded-full text-xs font-medium capitalize">delivery: {v.replace('_', ' ')} <button onClick={() => toggleDelivery(v)}><X className="w-3 h-3" /></button></span>)}
            {discountFilter.map((v) => <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#a1a1aa] rounded-full text-xs font-medium">{v === 'true' ? 'Has discount' : 'No discount'} <button onClick={() => toggleDiscount(v)}><X className="w-3 h-3" /></button></span>)}
          </div>
        )}
      </div>

      {statusActionError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {statusActionError}
        </p>
      )}

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"><AlertCircle className="h-7 w-7 text-red-500" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Failed to load orders</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
            <button onClick={() => void load({ hard: true })} className="inline-flex items-center px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium"><RefreshCw className="h-4 w-4 mr-2" />Retry</button>
          </div>
        ) : loading && docs.length === 0 ? (
          <div className="p-4 space-y-3 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-14 w-14 bg-[#eba236]/10 dark:bg-[#eba236]/15 rounded-full flex items-center justify-center mb-4"><ShoppingBag className="w-7 h-7 text-[#eba236]" /></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">No orders found</h3>
            <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1 max-w-md">Orders appear here once customers place them at your outlets. Try adjusting search or filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-xs text-gray-500 dark:text-[#a1a1aa] border-b border-gray-200 dark:border-[#262626]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Order</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Customer</th>
                    <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Outlet</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fulfillment</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Delivery</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Placed</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                  {filtered.map((o) => {
                    const fulfillment = o.fulfillment_type || 'delivery'
                    const placed = o.placed_at || o.createdAt
                    const total = o.total ?? 0
                    const effectiveStatus = getEffectiveOrderStatus(o.fulfillment_type, o.status, o.lalamove.status)
                    const normalizedStatus = o.status.toLowerCase()
                    const canQuickToggleStatus = ['pending', 'accepted'].includes(normalizedStatus)
                      && (fulfillment !== 'delivery' || ['none', 'pending'].includes(o.lalamove.status.toLowerCase()))
                    const canQuickCancelOrder =
                      !['delivered', 'cancelled'].includes(normalizedStatus)
                      && (
                        fulfillment !== 'delivery'
                        || ['none', 'pending', 'assigning_driver'].includes(o.lalamove.status.toLowerCase())
                      )
                    const nextStatus = normalizedStatus === 'pending' ? 'accepted' : 'pending'
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50 transition">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[#eba236]">{o.orderNumber}</span>
                          {o.coupon_code && <div className="text-[11px] text-gray-400 mt-0.5">coupon: {o.coupon_code}</div>}
                          {o.notes && <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[140px]">“{o.notes}”</div>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[140px]">{customerLabel(o.customer)}</div>
                            <div className="text-xs text-gray-500 dark:text-[#a1a1aa] truncate max-w-[140px]">{o.customer?.email || '—'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-full text-xs font-medium text-gray-700 dark:text-white">
                            <OutletIcon className="w-3 h-3 text-[#eba236]" /> {o.merchant?.outletName || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border capitalize ${fulfillmentBadge(fulfillment)}`}>
                            {fulfillment === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />} {fulfillment}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${statusBadge(effectiveStatus)}`}>{getOrderStatusLabel(effectiveStatus)}</span>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border capitalize ${deliveryBadge(o.lalamove.status)}`}>
                            <MapPin className="w-3 h-3" /> {getOrderStatusLabel(o.lalamove.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{fmtPeso(total)}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500 dark:text-[#a1a1aa]">{fmtDate(placed)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {canQuickToggleStatus && (
                              <button
                                onClick={() => void toggleOrderStatus(o)}
                                disabled={statusUpdatingId !== null}
                                aria-label={`${nextStatus === 'accepted' ? 'Accept' : 'Set to pending'} ${o.orderNumber}`}
                                title={nextStatus === 'accepted' ? 'Accept order' : 'Set order to pending'}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50 ${nextStatus === 'accepted' ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                              >
                                {statusUpdatingId === o.id
                                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                                  : nextStatus === 'accepted'
                                    ? <CheckCircle className="h-4 w-4" />
                                    : <Clock className="h-4 w-4" />}
                              </button>
                            )}
                            {canQuickCancelOrder && (
                              <button
                                onClick={() => void cancelOrder(o)}
                                disabled={statusUpdatingId !== null}
                                aria-label={`Cancel ${o.orderNumber}`}
                                title="Cancel order"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                {statusUpdatingId === o.id
                                  ? <RefreshCw className="h-4 w-4 animate-spin" />
                                  : <XCircle className="h-4 w-4" />}
                              </button>
                            )}
                            <Link href={`/orders/${o.id}`} aria-label={`View ${o.orderNumber}`} title="View" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:bg-[#262626]">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link href={`/orders/${o.id}/edit`} aria-label={`Edit ${o.orderNumber}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-[#a1a1aa] dark:hover:bg-blue-900/20">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button onClick={() => { setDeleting(o); setDeleteError(null) }} aria-label={`Delete ${o.orderNumber}`} title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-[#a1a1aa] dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="text-gray-600 dark:text-[#a1a1aa]">Page {page} of {totalPages} • {pagination?.totalDocs ?? filtered.length} orders • 10 per page</div>
                <div className="flex items-center gap-1">
                  <button disabled={loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Prev</button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const n = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                    if (n > totalPages) return null
                    return <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg text-sm font-medium border ${n === page ? 'bg-[#eba236] text-white border-[#eba236]' : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#262626] text-gray-700 dark:text-white'}`}>{n}</button>
                  })}
                  <button disabled={loading || page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleting && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => { if (!isDeleting) setDeleting(null) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-order-title" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#262626] dark:bg-[#171717]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20"><Trash2 className="h-6 w-6 text-red-600" /></div>
            <h2 id="delete-order-title" className="font-bold text-gray-900 dark:text-white">Delete order permanently?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a1a1aa]">This will permanently delete order <span className="font-semibold">{deleting.orderNumber}</span> and its dependent records. Orders with paid or refunded transactions are protected.</p>
            {deleteError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeleting(null)} disabled={isDeleting} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-[#262626]">Keep order</button>
              <button onClick={() => void deleteOrder()} disabled={isDeleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isDeleting ? 'Deleting…' : 'Delete permanently'}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <div className="rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] p-4 text-xs text-gray-500 dark:text-[#a1a1aa]">
        Revenue reflects <span className="font-semibold text-gray-700 dark:text-white">verified paid transactions</span> only, matching your dashboard analytics — never raw order totals. Fulfillment and delivery statuses update automatically as riders and outlets progress the order.
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ClientOnly fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </ClientOnly>
  )
}
