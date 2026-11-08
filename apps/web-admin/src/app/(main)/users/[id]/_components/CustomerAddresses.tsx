'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle, CalendarDays, CheckCircle, Eye, MapPin, Pencil, Plus, RefreshCw,
  ShieldCheck, Trash2, X,
} from '@/components/ui/IconWrapper'

type AddressDoc = {
  id: number
  formatted_address: string
  barangay: string | null
  locality: string | null
  administrative_area_level_1: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  geocoding_accuracy: string | null
  verification_method: string | null
  address_type: string
  label: string | null
  is_default: boolean
  is_verified: boolean
  isActiveAddress: boolean
  createdAt: string
  updatedAt: string
}

type CustomerProfile = {
  id: number
  srn: string | null
  currentLevel: string
  activeAddress: Omit<Pick<AddressDoc, 'id' | 'formatted_address' | 'locality' | 'administrative_area_level_1' | 'postal_code' | 'barangay' | 'latitude' | 'longitude' | 'address_type' | 'is_default' | 'is_verified'>, 'address_type'> & { address_type: string | null } | null
  addressCount: number
  createdAt: string
  updatedAt: string
}

function dateLabel(value: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value.slice(0, 10)
  }
}

function AddressSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] overflow-hidden">
      <h2 className="px-4 py-3 border-b border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      {children}
    </section>
  )
}

function AddressFormModal({
  initial,
  userId,
  onClose,
  onSaved,
}: {
  initial: AddressDoc | null
  userId: number
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    formatted_address: initial?.formatted_address || '',
    address_type: initial?.address_type || 'home',
    locality: initial?.locality || '',
    postal_code: initial?.postal_code || '',
    barangay: initial?.barangay || '',
    label: initial?.label || '',
    latitude: initial?.latitude != null ? String(initial.latitude) : '',
    longitude: initial?.longitude != null ? String(initial.longitude) : '',
  })

  const setField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const inputClass = 'mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236]'
  const labelClass = 'text-xs font-medium text-gray-700 dark:text-[#a1a1aa]'

  const submit = async () => {
    const formattedAddress = form.formatted_address.trim()
    if (formattedAddress.length < 5) {
      setError('Formatted address is required (min 5 chars)')
      return
    }
    const latitude = form.latitude.trim() ? Number(form.latitude) : null
    const longitude = form.longitude.trim() ? Number(form.longitude) : null
    if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
      setError('Latitude and longitude must be valid numbers')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        formatted_address: formattedAddress,
        address_type: form.address_type,
        locality: form.locality.trim() || null,
        postal_code: form.postal_code.trim() || null,
        barangay: form.barangay.trim() || null,
        label: form.label.trim() || null,
        latitude,
        longitude,
        ...(!initial ? { user: userId } : {}),
      }
      const response = await fetch(initial ? `/api/customers/addresses/${initial.id}` : '/api/customers/addresses', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to save address')
      await onSaved()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !saving && onClose()}>
      <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#262626] flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{initial ? `Edit Address #${initial.id}` : 'New Address'}</h3>
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1">{initial ? 'Update customer address details.' : 'Add a saved address for this customer.'}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close address form" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500 disabled:opacity-50"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">{error}</div>}
          <div><label className={labelClass}>Formatted address *</label><textarea value={form.formatted_address} onChange={(event) => setField('formatted_address', event.target.value)} rows={3} placeholder="Complete formatted address" className={inputClass} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className={labelClass}>Type</label><select value={form.address_type} onChange={(event) => setField('address_type', event.target.value)} className={inputClass}><option value="home">Home</option><option value="work">Work</option><option value="partner">Partner</option><option value="billing">Billing</option><option value="shipping">Shipping</option><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></div>
            <div><label className={labelClass}>Locality</label><input value={form.locality} onChange={(event) => setField('locality', event.target.value)} placeholder="City / municipality" className={inputClass} /></div>
            <div><label className={labelClass}>Postal code</label><input value={form.postal_code} onChange={(event) => setField('postal_code', event.target.value)} placeholder="e.g. 1000" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className={labelClass}>Barangay</label><input value={form.barangay} onChange={(event) => setField('barangay', event.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Label</label><input value={form.label} onChange={(event) => setField('label', event.target.value)} placeholder="Home / Work" className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelClass}>Latitude</label><input inputMode="decimal" value={form.latitude} onChange={(event) => setField('latitude', event.target.value)} placeholder="14.59" className={inputClass} /></div>
              <div><label className={labelClass}>Longitude</label><input inputMode="decimal" value={form.longitude} onChange={(event) => setField('longitude', event.target.value)} placeholder="120.98" className={inputClass} /></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a] px-6 py-4">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-300 dark:border-[#262626] bg-white dark:bg-[#171717] px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#a1a1aa] disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => void submit()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#eba236] hover:bg-[#c88a20] px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving && <RefreshCw className="h-4 w-4 animate-spin" />}{initial ? 'Save changes' : 'Create address'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function CustomerAddresses({ profile, userId }: { profile: CustomerProfile; userId: number }) {
  const [addresses, setAddresses] = useState<AddressDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AddressDoc | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<AddressDoc | null>(null)
  const [deleting, setDeleting] = useState<AddressDoc | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [settingActiveId, setSettingActiveId] = useState<number | null>(null)

  const loadAddresses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ customerId: String(profile.id), limit: '100', sort: '-createdAt' })
      const response = await fetch(`/api/customers/addresses?${params}`, { cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to load customer addresses')
      setAddresses(Array.isArray(result.docs) ? result.docs : [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load customer addresses')
    } finally {
      setLoading(false)
    }
  }, [profile.id])

  useEffect(() => { void loadAddresses() }, [loadAddresses])
  useEffect(() => {
    if (!actionError) return
    const timeout = setTimeout(() => setActionError(null), 5000)
    return () => clearTimeout(timeout)
  }, [actionError])
  useEffect(() => {
    if (!showForm && !viewing && !deleting) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [showForm, viewing, deleting])

  const activeAddress = useMemo(() => addresses.find((address) => address.isActiveAddress) ?? null, [addresses])
  const savedAddresses = useMemo(() => addresses.filter((address) => !address.isActiveAddress), [addresses])

  const setActiveAddress = async (address: AddressDoc) => {
    if (address.isActiveAddress || settingActiveId !== null) return
    setSettingActiveId(address.id)
    setActionError(null)
    try {
      const response = await fetch(`/api/customers/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeAddress: address.id }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to set active address')
      await loadAddresses()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Failed to set active address')
    } finally {
      setSettingActiveId(null)
    }
  }

  const deleteAddress = async () => {
    if (!deleting || isDeleting) return
    setIsDeleting(true)
    setActionError(null)
    try {
      const response = await fetch(`/api/customers/addresses/${deleting.id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Failed to delete address')
      setDeleting(null)
      await loadAddresses()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Failed to delete address')
    } finally {
      setIsDeleting(false)
    }
  }

  const openNewAddress = () => { setEditing(null); setShowForm(true) }
  const openEditAddress = (address: AddressDoc) => { setEditing(address); setShowForm(true) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Customer Addresses</h2>
        <button type="button" onClick={openNewAddress} className="inline-flex items-center gap-2 px-3 py-2 bg-[#eba236] hover:bg-[#c88a20] text-white rounded-lg text-sm font-semibold"><Plus className="w-4 h-4" /> New Address</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] p-4">
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">Active Current</p>
          <p className={`mt-2 font-semibold text-sm ${activeAddress ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{activeAddress ? `#${activeAddress.id} set` : 'Not set'}</p>
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1">{activeAddress?.address_type || 'Pick a saved address'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] p-4">
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">Saved Addresses</p>
          <p className="mt-2 font-bold flex items-center gap-1 text-lg text-gray-900 dark:text-white"><MapPin className="w-5 h-5 text-[#eba236]" />{loading ? '…' : savedAddresses.length}</p>
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">{loading ? 'Loading addresses' : `${addresses.length} total rows`}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] p-4">
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">Customer Profile</p>
          <p className="mt-2 font-semibold text-sm text-gray-900 dark:text-white">{profile.srn || 'No SRN'}</p>
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1 capitalize">{profile.currentLevel}</p>
        </div>
      </div>

      {actionError && <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{actionError}</span></div>}
      {error && <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-3"><span>{error}</span><button type="button" onClick={() => void loadAddresses()} className="inline-flex items-center gap-1 font-semibold"><RefreshCw className="w-3 h-3" />Retry</button></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AddressSection title="Active Current Address">
          {loading ? <div className="p-5 text-sm text-gray-500">Loading addresses…</div> : activeAddress ? (
            <div className="p-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activeAddress.formatted_address}</p>
                <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1">{[activeAddress.barangay, activeAddress.locality, activeAddress.postal_code].filter(Boolean).join(' • ') || '—'} • {activeAddress.address_type}{activeAddress.is_verified ? ' • verified' : ''}</p>
                <p className="text-xs font-mono text-gray-400 mt-1">Address ID #{activeAddress.id} • {activeAddress.latitude ?? '—'}, {activeAddress.longitude ?? '—'}</p>
              </div>
              <div className="flex gap-1 mt-3">
                <button type="button" onClick={() => setViewing(activeAddress)} className="h-8 px-3 inline-flex items-center gap-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500 dark:text-[#a1a1aa] text-xs font-medium"><Eye className="w-4 h-4" />View</button>
                <button type="button" onClick={() => openEditAddress(activeAddress)} className="h-8 px-3 inline-flex items-center gap-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-[#a1a1aa] text-xs font-medium"><Pencil className="w-4 h-4" />Edit</button>
              </div>
            </div>
          ) : <div className="p-6 text-sm text-amber-700 dark:text-amber-300 text-center">No active address — set one from the saved list.</div>}
        </AddressSection>

        <AddressSection title={`Saved Addresses (${savedAddresses.length})`}>
          {loading ? <div className="p-5 text-sm text-gray-500">Loading addresses…</div> : savedAddresses.length ? (
            <div className="divide-y divide-gray-100 dark:divide-[#262626]">
              {savedAddresses.map((address) => (
                <div key={address.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white" title={address.formatted_address}>#{address.id} {address.formatted_address}</p>
                    <p className="text-xs text-gray-500 dark:text-[#a1a1aa]">{[address.barangay, address.locality, address.postal_code].filter(Boolean).join(' • ') || '—'}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">{address.address_type}</span>
                      <span className="text-[11px] text-gray-400">{address.is_verified ? 'verified' : 'unverified'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => void setActiveAddress(address)} disabled={settingActiveId !== null} className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#eba236] disabled:opacity-50" title="Set as active current">
                      {settingActiveId === address.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Set Active
                    </button>
                    <button type="button" onClick={() => setViewing(address)} aria-label={`View address ${address.id}`} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500"><Eye className="w-4 h-4" /></button>
                    <button type="button" onClick={() => openEditAddress(address)} aria-label={`Edit address ${address.id}`} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500"><Pencil className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setDeleting(address)} aria-label={`Delete address ${address.id}`} className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-6 text-sm text-gray-500 dark:text-[#a1a1aa] text-center">No extra saved addresses{activeAddress ? ' — the active address above is the only one.' : '.'}</div>}
        </AddressSection>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#171717] p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#eba236]" />Customer Profile Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="flex justify-between gap-2"><span className="text-gray-500">Created</span><span className="font-mono text-xs text-gray-900 dark:text-white">{dateLabel(profile.createdAt)}</span></div>
          <div className="flex justify-between gap-2"><span className="text-gray-500">Updated</span><span className="font-mono text-xs text-gray-900 dark:text-white">{dateLabel(profile.updatedAt)}</span></div>
          <div className="flex justify-between gap-2"><span className="text-gray-500">Active Address</span><span className="font-mono text-xs text-gray-900 dark:text-white">{activeAddress ? `#${activeAddress.id}` : '—'}</span></div>
        </div>
      </section>

      {showForm && <AddressFormModal initial={editing} userId={userId} onClose={() => { setShowForm(false); setEditing(null) }} onSaved={loadAddresses} />}

      {viewing && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-lg p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Address #{viewing.id} {viewing.isActiveAddress ? '• Active' : '• Saved'}</h3>
              <button type="button" onClick={() => setViewing(null)} aria-label="Close address details" className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-900 dark:text-white mt-2">{viewing.formatted_address}</p>
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{viewing.address_type} • {viewing.is_verified ? 'verified' : 'unverified'} • {viewing.verification_method || 'UNVERIFIED'}</p>
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-2">{[viewing.barangay, viewing.locality, viewing.administrative_area_level_1, viewing.postal_code].filter(Boolean).join(' • ') || '—'}</p>
            <div className="flex justify-end mt-6"><button type="button" onClick={() => setViewing(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] text-sm font-medium text-gray-700 dark:text-[#a1a1aa]">Close</button></div>
          </div>
        </div>,
        document.body,
      )}

      {deleting && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleting(null)}>
          <div className="relative bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#262626] w-full max-w-md p-6" onClick={(event) => event.stopPropagation()}>
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="font-bold text-gray-900 dark:text-white">Delete address #{deleting.id}?</h3>
            <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1">{deleting.formatted_address.slice(0, 100)}{deleting.isActiveAddress ? ' — this is the ACTIVE address. The CMS will reject deletion until another address is active.' : ' This action cannot be undone.'}</p>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setDeleting(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] text-sm font-medium text-gray-700 dark:text-[#a1a1aa] disabled:opacity-50">Cancel</button>
              <button type="button" onClick={() => void deleteAddress()} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2">{isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}Confirm delete</button>
            </div>
            {deleting.isActiveAddress && <p className="text-xs text-amber-600 mt-3">Set another saved address as active before deleting this one.</p>}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
