'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from '@/components/ui/IconWrapper'
import { getOrderDetailProgressStatus, getOrderStatusLabel } from '@/utils/orderStatus'

type CustomerOption = { id: number; label: string }
type OutletOption = { id: number; label: string }

type OrderDoc = {
  id: number
  orderNumber: string
  status: string
  fulfillment_type: string
  subtotal: number
  delivery_fee: number
  platform_fee: number
  priority_fee: number
  discount_total: number
  coupon_code: string | null
  free_delivery_applied: boolean
  notes: string | null
  placed_at: string | null
  delivery_status: string
  lalamove: { orderId: string | null; serviceType: string; status: string; trackingLink: string | null }
  booking: { status: string; lalamove_order_id: string | null } | null
  payment: { isPaid: boolean }
  customer: { id: number; email: string; firstName: string; lastName: string } | null
  merchant: { id: number; outletName: string; outletCode: string } | null
}

const STATUS_OPTIONS = [
  'pending',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'on_delivery',
  'delivered',
  'cancelled',
]
function toLocalInput(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function displayCustomer(customer: Record<string, unknown>): CustomerOption | null {
  const id = Number(customer.id)
  if (!Number.isSafeInteger(id) || id < 1) return null
  const firstName = typeof customer.firstName === 'string' ? customer.firstName : ''
  const lastName = typeof customer.lastName === 'string' ? customer.lastName : ''
  const email = typeof customer.email === 'string' ? customer.email : ''
  const name = `${firstName} ${lastName}`.trim()
  return { id, label: `${name || email || `Customer #${id}`}${email && name ? ` • ${email}` : ''}` }
}

function displayOutlet(outlet: Record<string, unknown>): OutletOption | null {
  const id = Number(outlet.id)
  if (!Number.isSafeInteger(id) || id < 1) return null
  const name = typeof outlet.outletName === 'string' ? outlet.outletName : `Outlet #${id}`
  const code = typeof outlet.outletCode === 'string' ? outlet.outletCode : ''
  return { id, label: `${name}${code ? ` (${code})` : ''}` }
}

export function OrderForm({ orderId }: { orderId?: string }) {
  const router = useRouter()
  const editing = Boolean(orderId)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [outlets, setOutlets] = useState<OutletOption[]>([])
  const [customerId, setCustomerId] = useState('')
  const [outletId, setOutletId] = useState('')
  const [status, setStatus] = useState('pending')
  const [statusModified, setStatusModified] = useState(false)
  const [fulfillment, setFulfillment] = useState('delivery')
  const [deliveryStatus, setDeliveryStatus] = useState('none')
  const [hasDeliveryBooking, setHasDeliveryBooking] = useState(false)
  const [lalamoveOrderId, setLalamoveOrderId] = useState('')
  const [subtotal, setSubtotal] = useState('0')
  const [deliveryFee, setDeliveryFee] = useState('0')
  const [platformFee, setPlatformFee] = useState('0')
  const [priorityFee, setPriorityFee] = useState('0')
  const [discountTotal, setDiscountTotal] = useState('0')
  const [couponCode, setCouponCode] = useState('')
  const [freeDelivery, setFreeDelivery] = useState(false)
  const [notes, setNotes] = useState('')
  const [placedAt, setPlacedAt] = useState(() => toLocalInput(new Date().toISOString()))
  const [auditNote, setAuditNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const [customerResponse, outletResponse, orderResponse] = await Promise.all([
          fetch('/api/customers?limit=100', { cache: 'no-store' }),
          fetch('/api/outlets', { cache: 'no-store' }),
          orderId ? fetch(`/api/orders/${orderId}?refresh=true`, { cache: 'no-store' }) : Promise.resolve(null),
        ])
        const customerResult = await customerResponse.json()
        const outletResult = await outletResponse.json()
        if (!customerResponse.ok) throw new Error(customerResult.error || 'Failed to load customers')
        if (!outletResponse.ok) throw new Error(outletResult.error || 'Failed to load outlets')

        const customerDocs = Array.isArray(customerResult.docs) ? customerResult.docs : []
        const outletDocs = Array.isArray(outletResult.outlets)
          ? outletResult.outlets
          : Array.isArray(outletResult.docs)
            ? outletResult.docs
            : []
        const nextCustomers = customerDocs
          .map((customer: Record<string, unknown>) => displayCustomer(customer))
          .filter((customer: CustomerOption | null): customer is CustomerOption => customer !== null)
        const nextOutlets = outletDocs
          .map((outlet: Record<string, unknown>) => displayOutlet(outlet))
          .filter((outlet: OutletOption | null): outlet is OutletOption => outlet !== null)

        let order: OrderDoc | null = null
        if (orderResponse) {
          const orderResult = await orderResponse.json()
          if (!orderResponse.ok) throw new Error(orderResult.error || 'Failed to load order')
          order = orderResult.doc as OrderDoc
        }

        if (cancelled) return
        if (order?.customer) {
          const currentCustomer = displayCustomer(order.customer)
          if (currentCustomer && !nextCustomers.some((option) => option.id === currentCustomer.id)) {
            nextCustomers.unshift(currentCustomer)
          }
        }
        if (order?.merchant) {
          const currentOutlet = displayOutlet(order.merchant)
          if (currentOutlet && !nextOutlets.some((option) => option.id === currentOutlet.id)) {
            nextOutlets.unshift(currentOutlet)
          }
        }
        setCustomers(nextCustomers)
        setOutlets(nextOutlets)

        if (order) {
          setCustomerId(String(order.customer?.id ?? ''))
          setOutletId(String(order.merchant?.id ?? ''))
          setStatus(order.status || 'pending')
          setStatusModified(false)
          setFulfillment(order.fulfillment_type || 'delivery')
          setDeliveryStatus(order.lalamove?.status || order.delivery_status || 'none')
          setHasDeliveryBooking(Boolean(order.booking || order.lalamove?.orderId))
          setLalamoveOrderId(order.lalamove?.orderId || '')
          setSubtotal(String(order.subtotal ?? 0))
          setDeliveryFee(String(order.delivery_fee ?? 0))
          setPlatformFee(String(order.platform_fee ?? 0))
          setPriorityFee(String(order.priority_fee ?? 0))
          setDiscountTotal(String(order.discount_total ?? 0))
          setCouponCode(order.coupon_code || '')
          setFreeDelivery(order.free_delivery_applied)
          setNotes(order.notes || '')
          setPlacedAt(toLocalInput(order.placed_at))
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Failed to load order form')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [orderId])

  const total = useMemo(() => {
    const values = [subtotal, deliveryFee, platformFee, priorityFee, discountTotal].map((value) => Number(value))
    if (values.some((value) => !Number.isFinite(value) || value < 0)) return null
    const calculated = Math.round((values[0] + values[1] + values[2] + values[3] - values[4]) * 100) / 100
    return calculated >= 0 ? calculated : null
  }, [subtotal, deliveryFee, platformFee, priorityFee, discountTotal])
  const canToggleDeliveryStatus =
    editing
    && ['pending', 'accepted'].includes(status)
    && ['none', 'pending'].includes(deliveryStatus.toLowerCase())
  const canCancelDelivery =
    editing
    && !['delivered', 'cancelled'].includes(status)
    && ['none', 'pending', 'assigning_driver'].includes(deliveryStatus.toLowerCase())
  const deliveryStatusOptions = canToggleDeliveryStatus ? ['pending', 'accepted'] : [status]
  if (canCancelDelivery && !deliveryStatusOptions.includes('cancelled')) {
    deliveryStatusOptions.push('cancelled')
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/orders')
  }

  const handleSave = async () => {
    setSaveError(null)
    setSaveWarning(null)
    if (!customerId) return setSaveError('Customer is required')
    if (!outletId) return setSaveError('Outlet is required')
    if (total == null) return setSaveError('Amounts must be valid and discounts cannot exceed the order charges')
    if (!placedAt || Number.isNaN(new Date(placedAt).getTime())) return setSaveError('Placed date must be valid')

    setSaving(true)
    try {
      const body = {
        customer: Number(customerId),
        merchant: Number(outletId),
        ...(fulfillment === 'pickup' || (editing && statusModified) ? { status } : {}),
        fulfillment_type: fulfillment,
        subtotal: Number(subtotal),
        delivery_fee: Number(deliveryFee),
        platform_fee: Number(platformFee),
        priority_fee: Number(priorityFee),
        discount_total: Number(discountTotal),
        total,
        coupon_code: couponCode.trim() || null,
        free_delivery_applied: freeDelivery,
        notes: notes.trim() || null,
        placed_at: new Date(placedAt).toISOString(),
        ...(editing ? { description: auditNote.trim() || undefined } : {}),
      }
      const response = await fetch(editing ? `/api/orders/${orderId}` : '/api/orders', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || `Failed to ${editing ? 'update' : 'create'} order`)

      const savedId = result.doc?.id ?? orderId
      setSaved(true)
      setSaveWarning(typeof result.warning === 'string' ? result.warning : null)
      window.setTimeout(() => router.push(`/orders/${savedId}`), result.warning ? 1800 : 800)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] px-3 py-2.5 text-sm text-gray-900 dark:text-white'
  const labelClass = 'text-xs font-medium text-gray-700 dark:text-[#a1a1aa]'
  const numberClass = `${inputClass} font-mono`

  if (loading) {
    return <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-[#262626] dark:bg-[#171717]" />
  }

  if (loadError) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        <p>{loadError}</p>
        <button onClick={handleBack} className="inline-flex items-center gap-2 font-medium"><ArrowLeft className="h-4 w-4" /> Back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle className="h-5 w-5" /> Order {editing ? 'updated' : 'created'} successfully.
        </div>
      )}
      {saveWarning && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{saveWarning}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#171717]">
        <div className="space-y-6 p-5 sm:p-6">
          {saveError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{saveError}</p>}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Order</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Customer *</label>
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={inputClass}>
                  <option value="">Select customer…</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.label}</option>)}
                </select>
                {customers.length === 0 && <p className="mt-1 text-xs text-gray-500">No customers have ordered at your outlets yet.</p>}
              </div>
              <div>
                <label className={labelClass}>Outlet *</label>
                <select value={outletId} onChange={(event) => setOutletId(event.target.value)} className={inputClass}>
                  <option value="">Select outlet…</option>
                  {outlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                {fulfillment === 'delivery' ? (
                  canToggleDeliveryStatus || canCancelDelivery ? (
                    <>
                      <select
                        value={status}
                        onChange={(event) => {
                          setStatus(event.target.value)
                          setStatusModified(true)
                        }}
                        className={inputClass}
                      >
                        {deliveryStatusOptions.map((option) => (
                          <option key={option} value={option}>{getOrderStatusLabel(option)}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {canToggleDeliveryStatus
                          ? 'Toggle Pending or Accepted until Lalamove delivery progress begins.'
                          : 'Cancellation is subject to Lalamove rules when a delivery booking is active.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        value={getOrderStatusLabel(getOrderDetailProgressStatus(status, fulfillment, deliveryStatus))}
                        readOnly
                        className={`${inputClass} bg-gray-50 dark:bg-[#171717]`}
                      />
                      <p className="mt-1 text-xs text-gray-500">Lalamove controls delivery progress after acceptance.</p>
                    </>
                  )
                ) : (
                  <select
                    value={status}
                    onChange={(event) => { setStatus(event.target.value); setStatusModified(true) }}
                    disabled={status === 'cancelled'}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {STATUS_OPTIONS
                      .filter((option) => option !== 'cancelled' || status !== 'delivered')
                      .map((option) => <option key={option} value={option}>{getOrderStatusLabel(option)}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className={labelClass}>Fulfillment *</label>
                <select value={fulfillment} onChange={(event) => setFulfillment(event.target.value)} disabled={hasDeliveryBooking} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
                {hasDeliveryBooking && <p className="mt-1 text-xs text-gray-500">Fulfillment is locked because a Lalamove delivery booking exists.</p>}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Amounts (PHP)</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><label className={labelClass}>Subtotal</label><input type="number" min="0" step="0.01" value={subtotal} onChange={(event) => setSubtotal(event.target.value)} className={numberClass} /></div>
              <div><label className={labelClass}>Delivery fee</label><input type="number" min="0" step="0.01" value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} className={numberClass} /></div>
              <div><label className={labelClass}>Platform fee</label><input type="number" min="0" step="0.01" value={platformFee} onChange={(event) => setPlatformFee(event.target.value)} className={numberClass} /></div>
              <div><label className={labelClass}>Priority fee</label><input type="number" min="0" step="0.01" value={priorityFee} onChange={(event) => setPriorityFee(event.target.value)} className={numberClass} /></div>
              <div><label className={labelClass}>Discount total</label><input type="number" min="0" step="0.01" value={discountTotal} onChange={(event) => setDiscountTotal(event.target.value)} className={numberClass} /></div>
              <div>
                <label className={labelClass}>Total (auto)</label>
                <input value={total == null ? 'Invalid amount' : total.toFixed(2)} readOnly className={`${numberClass} bg-gray-50 font-bold dark:bg-[#171717]`} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Notes & promotion</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Coupon code</label><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className={`${inputClass} font-mono`} /></div>
              <div><label className={labelClass}>Placed at</label><input type="datetime-local" value={placedAt} onChange={(event) => setPlacedAt(event.target.value)} className={`${inputClass} font-mono`} /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Notes</label><textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} /></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#a1a1aa]">
                <input type="checkbox" checked={freeDelivery} onChange={(event) => setFreeDelivery(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#eba236] focus:ring-[#eba236]" />
                Free delivery applied
              </label>
              {editing && statusModified && <div><label className={labelClass}>Status change note</label><input value={auditNote} onChange={(event) => setAuditNote(event.target.value)} className={inputClass} placeholder="Optional reason for the status change" /></div>}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Delivery</h3>
            {fulfillment === 'delivery' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Lalamove status</label><input value={getOrderStatusLabel(deliveryStatus)} readOnly className={`${inputClass} bg-gray-50 dark:bg-[#171717]`} /></div>
                <div><label className={labelClass}>Lalamove order ID</label><input value={lalamoveOrderId || 'Not booked'} readOnly className={`${inputClass} bg-gray-50 font-mono dark:bg-[#171717]`} /></div>
                <p className="text-xs text-gray-500 sm:col-span-2">Status and delivery identifiers are managed by Lalamove and cannot be edited here.</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not applicable to pickup orders.</p>
            )}
          </section>

          <div className="flex gap-2">
            <button onClick={handleBack} disabled={saving} className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#262626] dark:bg-[#171717] dark:text-[#a1a1aa]">Cancel</button>
            <button onClick={handleSave} disabled={saving || saved} className="flex-1 rounded-xl bg-[#eba236] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c88a20] disabled:opacity-50">
              {saving ? 'Saving…' : editing ? 'Save changes' : `Create order${total == null ? '' : ` • ₱${total.toFixed(2)}`}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
