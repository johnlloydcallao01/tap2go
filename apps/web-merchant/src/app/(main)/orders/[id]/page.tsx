'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound, useParams, useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Receipt,
  Store,
  Truck,
} from '@/components/ui/IconWrapper'
import {
  getOrderDetailProgressStatus,
  getOrderProgressStepIndex,
  getOrderStatusLabel,
  ORDER_PROGRESS_STEPS,
} from '@/utils/orderStatus'

type OrderDetail = {
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
  lalamove: { orderId: string | null; serviceType: string; status: string; trackingLink: string | null }
  merchant: {
    id: number
    outletName: string
    outletCode: string
    vendor: { id: number; businessName: string; logo: { id: number; url: string | null } | null } | null
  } | null
  customer: { id: number; email: string; firstName: string; lastName: string; phone: string | null } | null
  items: Array<{ id: number; product_name_snapshot: string; price_at_purchase: number; quantity: number; total_price: number; options_snapshot: unknown }>
  booking: { service_type: string; status: string; raw_status: string | null; share_link: string | null; driver_name: string | null; driver_phone: string | null; dropoff_address: string | null } | null
  location: { formatted_address: string; delivery_instructions: string | null; contact_name: string | null; contact_phone: string | null } | null
  payment: { isPaid: boolean; transactions: Array<{ id: number; payment_method: string | null; amount: number; currency: string; status: string; paid_at: string | null; createdAt: string }> }
  trackingHistory: Array<{ id: number; status: string; timestamp: string; description: string | null }>
  discounts: Array<{ id: number; code: string | null; amount_off: number; funded_by: string | null }>
  createdAt: string
  updatedAt: string
  deliveryStatusSource: 'stored' | 'lalamove'
  deliveryStatusWarning: string | null
}

async function fetchOrder(id: string): Promise<OrderDetail> {
  const response = await fetch(`/api/orders/${id}?refresh=true`, { cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Failed to load order')
  return result.doc as OrderDetail
}

function currency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(value || 0)
}

function dateTime(value: string | null | undefined) {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })
}

function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function statusStyle(status: string) {
  if (status === 'delivered' || status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (['cancelled', 'canceled', 'rejected', 'expired'].includes(status)) return 'border-red-200 bg-red-50 text-red-700'
  if (status === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-[#262626] dark:border-[#262626] dark:bg-[#171717]">{children}</div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm"><span className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{label}</span><span className="max-w-[65%] break-words text-right text-gray-900 dark:text-white">{value}</span></div>
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  if (!/^\d+$/.test(id)) notFound()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const doc = await fetchOrder(id)
        if (!cancelled) setOrder(doc)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Failed to load order')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!order?.lalamove?.orderId) return
    const deliveryStatus = (order.booking?.status || order.lalamove.status).toLowerCase()
    if (['completed', 'canceled', 'cancelled', 'rejected', 'expired'].includes(deliveryStatus)) return

    const timeout = window.setTimeout(() => {
      void fetchOrder(id)
        .then(setOrder)
        .catch((refreshError) => {
          setOrder((current) => current ? {
            ...current,
            deliveryStatusWarning: refreshError instanceof Error
              ? `Unable to refresh from Lalamove: ${refreshError.message}`
              : 'Unable to refresh from Lalamove.',
          } : current)
        })
    }, 15000)

    return () => window.clearTimeout(timeout)
  }, [id, order])

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to delete order')
      router.push('/orders')
    } catch (deleteFailure) {
      setDeleteError(deleteFailure instanceof Error ? deleteFailure.message : 'Failed to delete order')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="space-y-5 py-5 px-2.5"><div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-[#262626]" /><div className="h-72 animate-pulse rounded-xl bg-gray-100 dark:bg-[#171717]" /></div>
  }
  if (error || !order) {
    return (
      <div className="space-y-5 py-5 px-2.5">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-[#a1a1aa]"><ArrowLeft className="h-4 w-4" /> Back to orders</Link>
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error || 'Order not found'}</div>
      </div>
    )
  }

  const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer?.email || '—'
  const trackingLink = safeHttpUrl(order.booking?.share_link || order.lalamove?.trackingLink)
  const progressStatus = getOrderDetailProgressStatus(
    order.status,
    order.fulfillment_type,
    order.booking?.status || order.lalamove?.status,
  )
  const activeStepIndex = getOrderProgressStepIndex(progressStatus)

  return (
    <div className="order-print-root space-y-6 py-5 px-2.5">
      <div className="print-brand hidden items-center gap-3">
        <Image src="/logo.png" alt="Tap2Go" width={52} height={52} className="h-12 w-12 object-contain" />
        <div>
          <p className="text-lg font-bold text-gray-900">Tap2Go</p>
          <p className="text-xs text-gray-500">Order details</p>
        </div>
      </div>
      <button onClick={() => router.back()} className="print-hide inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="print-hide flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#eba236] to-[#c88a20] text-white"><Receipt className="h-6 w-6" /></div>
          {order.merchant?.vendor?.logo?.url && (
            <div className="print-vendor-logo hidden h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1">
              <Image src={order.merchant.vendor.logo.url} alt={`${order.merchant.vendor.businessName} logo`} width={48} height={48} unoptimized className="h-full w-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              {order.orderNumber || `#${order.id}`}
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(progressStatus)}`}>{getOrderStatusLabel(progressStatus)}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#a1a1aa]">{order.merchant?.outletName || '—'} • {order.fulfillment_type} • {dateTime(order.placed_at)}</p>
          </div>
        </div>
        <div className="print-hide flex gap-2">
          <button onClick={() => window.print()} title="Print or save this order as a PDF" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-[#262626] dark:bg-[#171717] dark:text-[#a1a1aa]">
            <FileText className="h-4 w-4" /> Print / Save PDF
          </button>
          <Link href={`/orders/${order.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-[#eba236] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c88a20]"><Pencil className="h-4 w-4" /> Edit</Link>
          <button onClick={() => setShowDelete(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-[#171717]"><AlertCircle className="h-4 w-4" /> Delete</button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"><p className="text-xs text-gray-500">Total</p><p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{currency(order.total)}</p><p className="mt-1 text-xs text-gray-500">Subtotal {currency(order.subtotal)}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"><p className="text-xs text-gray-500">Payment</p><p className={`mt-2 flex items-center gap-1 text-sm font-semibold ${order.payment?.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{order.payment?.isPaid ? <CheckCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}{order.payment?.isPaid ? 'Paid' : 'Unpaid'}</p><p className="mt-1 text-xs text-gray-500">{order.payment?.transactions?.length || 0} transaction(s)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"><p className="text-xs text-gray-500">Items</p><p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{order.items?.length || 0}</p><p className="mt-1 text-xs text-gray-500">{order.discounts?.length || 0} discount(s)</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]"><p className="text-xs text-gray-500">Delivery</p><p className="mt-2 flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white"><Truck className="h-4 w-4" />{getOrderStatusLabel(order.booking?.status || order.lalamove?.status)}</p><p className="mt-1 text-xs text-gray-500">{order.lalamove?.serviceType || '—'}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {order.fulfillment_type === 'delivery' && (
            <DetailSection title="Delivery progress">
              <div className="px-4 py-4">
                <div className="grid grid-cols-5 gap-2">
                  {ORDER_PROGRESS_STEPS.map((step, index) => {
                    const complete = activeStepIndex >= index
                    const current = activeStepIndex === index
                    return (
                      <div key={step.key} aria-current={current ? 'step' : undefined} className="text-center">
                        <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-[#eba236] text-white' : 'bg-gray-100 text-gray-400 dark:bg-[#262626]'}`}>
                          {index + 1}
                        </div>
                        <p className={`mt-2 text-[10px] leading-tight sm:text-xs ${current ? 'font-semibold text-[#c88a20]' : complete ? 'text-gray-700 dark:text-[#d4d4d8]' : 'text-gray-400'}`}>{step.label}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{getOrderStatusLabel(progressStatus)}</p>
                {order.deliveryStatusSource === 'lalamove' && <p className="mt-1 text-xs text-emerald-600">Updated from Lalamove just now.</p>}
                {order.deliveryStatusWarning && <p role="status" className="mt-2 text-xs text-amber-700">{order.deliveryStatusWarning}</p>}
              </div>
            </DetailSection>
          )}
          <DetailSection title="Order">
            <DetailRow label="Status" value={getOrderStatusLabel(progressStatus)} />
            <DetailRow label="Fulfillment" value={order.fulfillment_type} />
            <DetailRow label="Coupon" value={order.coupon_code || '—'} />
            <DetailRow label="Free delivery" value={order.free_delivery_applied ? 'Yes' : 'No'} />
            <DetailRow label="Notes" value={order.notes || '—'} />
            <DetailRow label="Placed" value={dateTime(order.placed_at)} />
          </DetailSection>
          <DetailSection title="Amounts (PHP)">
            <DetailRow label="Subtotal" value={currency(order.subtotal)} />
            <DetailRow label="Delivery fee" value={currency(order.delivery_fee)} />
            <DetailRow label="Platform fee" value={currency(order.platform_fee)} />
            <DetailRow label="Priority fee" value={currency(order.priority_fee)} />
            <DetailRow label="Discount" value={currency(order.discount_total)} />
            <DetailRow label="Total" value={currency(order.total)} />
          </DetailSection>
          <DetailSection title="Customer">
            <DetailRow label="Name" value={customerName} />
            <DetailRow label="Email" value={<span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{order.customer?.email || '—'}</span>} />
            <DetailRow label="Phone" value={order.customer?.phone || '—'} />
          </DetailSection>
          <DetailSection title="Outlet">
            <DetailRow label="Outlet" value={<span className="inline-flex items-center gap-1"><Store className="h-3 w-3" />{order.merchant?.outletName || '—'}</span>} />
            <DetailRow label="Outlet code" value={order.merchant?.outletCode || '—'} />
          </DetailSection>
        </div>

        <div className="space-y-5">
          {order.items?.length > 0 && (
            <DetailSection title={`Items (${order.items.length})`}>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0"><p className="truncate font-medium text-gray-900 dark:text-white">{item.product_name_snapshot} × {item.quantity}</p><p className="text-xs text-gray-500">{currency(item.price_at_purchase)} each</p></div>
                  <span className="shrink-0 font-semibold text-gray-900 dark:text-white">{currency(item.total_price)}</span>
                </div>
              ))}
            </DetailSection>
          )}
          <DetailSection title="Delivery details">
            <DetailRow label="Service" value={order.booking?.service_type || order.lalamove?.serviceType || '—'} />
            <DetailRow label="Delivery status" value={getOrderStatusLabel(order.booking?.status || order.lalamove?.status)} />
            <DetailRow label="Tracking" value={trackingLink ? <a href={trackingLink} target="_blank" rel="noreferrer" className="text-[#eba236] hover:underline">Open tracking link</a> : '—'} />
            <DetailRow label="Driver" value={order.booking?.driver_name || '—'} />
            <DetailRow label="Dropoff" value={<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location?.formatted_address || order.booking?.dropoff_address || '—'}</span>} />
            <DetailRow label="Contact" value={order.location?.contact_name ? `${order.location.contact_name}${order.location.contact_phone ? ` • ${order.location.contact_phone}` : ''}` : order.location?.contact_phone || '—'} />
            <DetailRow label="Instructions" value={order.location?.delivery_instructions || '—'} />
          </DetailSection>
          {order.payment?.transactions?.length > 0 && (
            <DetailSection title={`Payments (${order.payment.transactions.length})`}>
              {order.payment.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div><p className="font-medium text-gray-900 dark:text-white">{transaction.payment_method || 'Payment'} • {transaction.status}</p><p className="text-xs text-gray-500">{dateTime(transaction.paid_at || transaction.createdAt)}</p></div>
                  <span className="font-semibold text-gray-900 dark:text-white">{currency(transaction.amount)}</span>
                </div>
              ))}
            </DetailSection>
          )}
          {order.trackingHistory?.length > 0 && (
            <DetailSection title="Status history">
              {order.trackingHistory.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                  <div><p className="font-medium capitalize text-gray-900 dark:text-white">{entry.status.replace(/_/g, ' ')}</p>{entry.description && <p className="text-xs text-gray-500">{entry.description}</p>}</div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-gray-500"><Calendar className="h-3 w-3" />{dateTime(entry.timestamp)}</span>
                </div>
              ))}
            </DetailSection>
          )}
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-500 dark:border-[#262626] dark:bg-[#171717]">
            <p className="flex items-center gap-1"><Package className="h-3 w-3" /> Order #{order.id}</p>
            <p className="mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> Created {dateTime(order.createdAt)} · Updated {dateTime(order.updatedAt)}</p>
          </div>
        </div>
      </div>

      {showDelete && (
        <div className="print-hide fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={() => { if (!deleting) setShowDelete(false) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-order-title" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#262626] dark:bg-[#171717]" onClick={(event) => event.stopPropagation()}>
            <h2 id="delete-order-title" className="font-bold text-gray-900 dark:text-white">Delete order permanently?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a1a1aa]">This removes order {order.orderNumber} and its dependent records. Orders with paid or refunded transactions are protected and cannot be deleted.</p>
            {deleteError && <p role="alert" className="mt-3 text-sm text-red-600">{deleteError}</p>}
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowDelete(false)} disabled={deleting} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-[#262626]">Keep order</button>
              <button onClick={() => void handleDelete()} disabled={deleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
