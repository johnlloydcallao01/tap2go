'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ClientOnly } from '@/components/ClientOnly'
import {
  AlertCircle,
  CheckCircle,
  Hash,
  Info,
  Layers,
  RefreshCw,
  Search,
  Tag,
  X,
} from '@/components/ui/IconWrapper'

type AttributeType = 'select' | 'color' | 'button' | 'radio'

type AttributeDoc = {
  id: number
  name: string
  slug: string
  type: AttributeType
  is_active: boolean
  termsCount: number
}

type AttributeTerm = {
  id: number
  attribute_id: number | null
  name: string
  slug: string
  value: string | null
  sort_order: number
  is_active: boolean
}

type Pagination = {
  page: number
  limit: number
  totalDocs: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

type AttributeStats = {
  total: number
  active: number
  inactive: number
  filteredTotal: number
}

const PAGE_SIZE = 10
const TYPE_OPTIONS: { value: AttributeType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'select', label: 'Select' },
  { value: 'color', label: 'Color' },
  { value: 'button', label: 'Button' },
  { value: 'radio', label: 'Radio' },
]
const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function apiError(payload: unknown, fallback: string) {
  return isRecord(payload) && typeof payload.error === 'string' && payload.error.trim()
    ? payload.error
    : fallback
}

function typeLabel(type: AttributeType) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
        : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function AttributeTypeBadge({ type }: { type: AttributeType }) {
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800">
      {typeLabel(type)}
    </span>
  )
}

function SummaryCard({ title, value, note, icon, iconClass }: {
  title: string
  value: number
  note: string
  icon: React.ReactNode
  iconClass: string
}) {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-1">{note}</p>
        </div>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  )
}

function PageControls({ page, pagination, loading, label, onChange }: {
  page: number
  pagination: Pagination | null
  loading: boolean
  label: string
  onChange: (page: number) => void
}) {
  if (!pagination || pagination.totalDocs === 0) return null
  const totalPages = Math.max(1, pagination.totalPages)

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <div className="text-gray-600 dark:text-[#a1a1aa]">
        Page {page} of {totalPages} · {pagination.totalDocs.toLocaleString()} {label} · {pagination.limit} per page
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function AttributesSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-[#262626] rounded" />
      <div className="h-16 bg-gray-100 dark:bg-[#171717] rounded-xl" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="h-96 bg-gray-100 dark:bg-[#171717] rounded-xl" />
        <div className="h-96 bg-gray-100 dark:bg-[#171717] rounded-xl" />
      </div>
    </div>
  )
}

function AttributesContent() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<AttributeType | ''>('')
  const [active, setActive] = useState('')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [attributes, setAttributes] = useState<AttributeDoc[]>([])
  const [stats, setStats] = useState<AttributeStats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [termQuery, setTermQuery] = useState('')
  const [termSearch, setTermSearch] = useState('')
  const [termActive, setTermActive] = useState('')
  const [termPage, setTermPage] = useState(1)
  const [terms, setTerms] = useState<AttributeTerm[]>([])
  const [termPagination, setTermPagination] = useState<Pagination | null>(null)
  const [termsLoading, setTermsLoading] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [termsRefreshKey, setTermsRefreshKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const timer = setTimeout(() => setTermSearch(termQuery.trim()), 350)
    return () => clearTimeout(timer)
  }, [termQuery])

  useEffect(() => {
    setPage(1)
  }, [search, type, active, sort])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sort,
    })
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (active) params.set('is_active', active)

    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const response = await fetch(`/api/catalog/attributes?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const payload: unknown = await response.json()
        if (!response.ok) throw new Error(apiError(payload, 'Failed to load attributes'))
        if (
          !isRecord(payload)
          || !Array.isArray(payload.docs)
          || !isRecord(payload.stats)
          || !isRecord(payload.pagination)
        ) {
          throw new Error('The attribute service returned an invalid response.')
        }

        const docs = payload.docs as AttributeDoc[]
        setAttributes(docs)
        setStats(payload.stats as AttributeStats)
        setPagination(payload.pagination as Pagination)
        setSelectedId((current) => docs.some((attribute) => attribute.id === current)
          ? current
          : docs[0]?.id ?? null)
      } catch (caught: unknown) {
        if (controller.signal.aborted) return
        setError(caught instanceof Error ? caught.message : 'Failed to load attributes')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [page, search, type, active, sort, refreshKey])

  const selectedAttribute = useMemo(
    () => attributes.find((attribute) => attribute.id === selectedId) ?? null,
    [attributes, selectedId],
  )

  useEffect(() => {
    setTermPage(1)
    setTermQuery('')
    setTermSearch('')
    setTermActive('')
  }, [selectedId])

  useEffect(() => {
    if (selectedId === null) {
      setTerms([])
      setTermPagination(null)
      setTermsError(null)
      setTermsLoading(false)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      attribute_id: String(selectedId),
      page: String(termPage),
      limit: String(PAGE_SIZE),
      sort: 'sort_order',
    })
    if (termSearch) params.set('search', termSearch)
    if (termActive) params.set('is_active', termActive)

    setTermsLoading(true)
    setTermsError(null)

    void (async () => {
      try {
        const response = await fetch(`/api/catalog/attribute-terms?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        const payload: unknown = await response.json()
        if (!response.ok) throw new Error(apiError(payload, 'Failed to load attribute terms'))
        if (!isRecord(payload) || !Array.isArray(payload.docs) || !isRecord(payload.pagination)) {
          throw new Error('The attribute-terms service returned an invalid response.')
        }

        setTerms(payload.docs as AttributeTerm[])
        setTermPagination(payload.pagination as Pagination)
      } catch (caught: unknown) {
        if (controller.signal.aborted) return
        setTermsError(caught instanceof Error ? caught.message : 'Failed to load attribute terms')
      } finally {
        if (!controller.signal.aborted) setTermsLoading(false)
      }
    })()

    return () => controller.abort()
  }, [selectedId, termPage, termSearch, termActive, termsRefreshKey])

  const activeFilters = Number(Boolean(search)) + Number(Boolean(type)) + Number(Boolean(active)) + Number(sort !== 'name')
  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setType('')
    setActive('')
    setSort('name')
  }

  return (
    <div className="space-y-5 py-5 px-2.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-[#eba236] text-white flex items-center justify-center"><Layers className="w-4 h-4" /></span>
            Attributes
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">
            Browse the shared attributes and terms used to describe product options and variations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshKey((key) => key + 1)
            setTermsRefreshKey((key) => key + 1)
          }}
          disabled={loading}
          aria-label="Refresh attributes"
          className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-[#a1a1aa] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-900/20 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-700 dark:text-sky-300 shrink-0 mt-0.5" />
        <div className="text-sm text-sky-900 dark:text-sky-100">
          <p className="font-semibold">Shared platform catalog</p>
          <p className="mt-0.5 text-sky-800 dark:text-sky-200">
            Attributes and terms are shared across vendors and managed by the platform. You can browse them here, but changes must be requested from platform support.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard title="Matching attributes" value={stats.total} note="in the current results" icon={<Layers className="w-5 h-5 text-white" />} iconClass="bg-[#eba236]" />
          <SummaryCard title="Active" value={stats.active} note="in the current results" icon={<CheckCircle className="w-5 h-5 text-white" />} iconClass="bg-emerald-500" />
          <SummaryCard title="Inactive" value={stats.inactive} note="in the current results" icon={<Tag className="w-5 h-5 text-white" />} iconClass="bg-zinc-500" />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 bg-gray-100 dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626]" />)}
        </div>
      ) : null}

      <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search attributes by name or slug…"
              aria-label="Search attributes"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear attribute search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Filter by attribute type" value={type} onChange={(event) => setType(event.target.value as AttributeType | '')} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-700 dark:text-white">
              {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select aria-label="Filter by attribute status" value={active} onChange={(event) => setActive(event.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-700 dark:text-white">
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select aria-label="Sort attributes" value={sort} onChange={(event) => setSort(event.target.value)} className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-700 dark:text-white">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {activeFilters > 0 && (
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-gray-500 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <section className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden" aria-labelledby="attribute-list-heading">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-[#262626] flex items-center justify-between gap-3">
            <div>
              <h2 id="attribute-list-heading" className="font-semibold text-gray-900 dark:text-white">Attribute catalog</h2>
              <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5">Select an attribute to browse its terms.</p>
            </div>
            {pagination && <span className="text-xs text-gray-500 dark:text-[#a1a1aa]">{pagination.totalDocs.toLocaleString()} total</span>}
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <AlertCircle className="w-7 h-7 text-red-500 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Could not load attributes</h3>
              <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1 mb-4">{error}</p>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : loading && attributes.length === 0 ? (
            <div className="p-4 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}
            </div>
          ) : attributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <Layers className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">No attributes found</h3>
              <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Try another search or clear the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-xs text-gray-500 dark:text-[#a1a1aa] border-b border-gray-200 dark:border-[#262626]">
                    <tr>
                      <th scope="col" className="text-left px-4 py-3 font-medium">Name / slug</th>
                      <th scope="col" className="text-left px-3 py-3 font-medium">Type</th>
                      <th scope="col" className="text-right px-4 py-3 font-medium">Terms</th>
                      <th scope="col" className="text-right px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                    {attributes.map((attribute) => (
                      <tr key={attribute.id} className={`transition ${selectedId === attribute.id ? 'bg-[#eba236]/10 dark:bg-[#eba236]/10' : 'hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50'}`}>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedId(attribute.id)}
                            aria-pressed={selectedId === attribute.id}
                            className="w-full text-left min-w-[150px]"
                          >
                            <span className="block font-semibold text-gray-900 dark:text-white">{attribute.name}</span>
                            <span className="block mt-0.5 text-xs text-gray-500 dark:text-[#a1a1aa] font-mono">{attribute.slug}</span>
                          </button>
                        </td>
                        <td className="px-3 py-3"><AttributeTypeBadge type={attribute.type} /></td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{attribute.termsCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right"><StatusBadge active={attribute.is_active} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PageControls page={page} pagination={pagination} loading={loading} label="attributes" onChange={setPage} />
            </>
          )}
        </section>

        <section className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#262626] shadow-sm overflow-hidden" aria-labelledby="attribute-terms-heading">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-[#262626]">
            {selectedAttribute ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a1a1aa]">Attribute terms</p>
                  <h2 id="attribute-terms-heading" className="font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{selectedAttribute.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mt-0.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> <span className="font-mono">{selectedAttribute.slug}</span>
                    <span className="mx-1">·</span><AttributeTypeBadge type={selectedAttribute.type} />
                  </p>
                </div>
                <StatusBadge active={selectedAttribute.is_active} />
              </div>
            ) : (
              <h2 id="attribute-terms-heading" className="font-semibold text-gray-900 dark:text-white">Attribute terms</h2>
            )}
          </div>

          {selectedAttribute ? (
            <>
              <div className="p-3 border-b border-gray-100 dark:border-[#262626] flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={termQuery}
                    onChange={(event) => setTermQuery(event.target.value)}
                    placeholder="Search terms…"
                    aria-label="Search attribute terms"
                    className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 focus:border-[#eba236] text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                  {termQuery && (
                    <button type="button" onClick={() => setTermQuery('')} aria-label="Clear term search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626]">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <select aria-label="Filter terms by status" value={termActive} onChange={(event) => { setTermActive(event.target.value); setTermPage(1) }} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#0a0a0a] text-sm text-gray-700 dark:text-white">
                  <option value="">All statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {termsError ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <AlertCircle className="w-7 h-7 text-red-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Could not load terms</h3>
                  <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1 mb-4">{termsError}</p>
                  <button type="button" onClick={() => setTermsRefreshKey((key) => key + 1)} className="inline-flex items-center gap-2 px-4 py-2 bg-[#eba236] text-white rounded-lg text-sm font-medium">
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                </div>
              ) : termsLoading && terms.length === 0 ? (
                <div className="p-4 space-y-3 animate-pulse">
                  {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg" />)}
                </div>
              ) : terms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <Tag className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">No terms found</h3>
                  <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">
                    {termSearch || termActive ? 'Try another search or status filter.' : 'The platform has not added terms to this attribute yet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-xs text-gray-500 dark:text-[#a1a1aa] border-b border-gray-200 dark:border-[#262626]">
                        <tr>
                          <th scope="col" className="text-left px-4 py-3 font-medium">Term / slug</th>
                          {selectedAttribute.type === 'color' && <th scope="col" className="text-left px-3 py-3 font-medium">Color value</th>}
                          <th scope="col" className="text-right px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                        {terms.map((term) => {
                          const validColor = selectedAttribute.type === 'color' && /^#[0-9a-f]{6}$/i.test(term.value || '')
                          return (
                            <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50">
                              <td className="px-4 py-3">
                                <span className="block font-medium text-gray-900 dark:text-white">{term.name}</span>
                                <span className="block mt-0.5 text-xs text-gray-500 dark:text-[#a1a1aa] font-mono">{term.slug}</span>
                              </td>
                              {selectedAttribute.type === 'color' && (
                                <td className="px-3 py-3">
                                  {validColor ? (
                                    <span className="inline-flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-[#a1a1aa]">
                                      <span className="h-5 w-5 rounded border border-gray-300 dark:border-[#52525b]" style={{ backgroundColor: term.value || undefined }} />
                                      {term.value}
                                    </span>
                                  ) : <span className="text-xs text-gray-400">—</span>}
                                </td>
                              )}
                              <td className="px-4 py-3 text-right"><StatusBadge active={term.is_active} /></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <PageControls page={termPage} pagination={termPagination} loading={termsLoading} label="terms" onChange={setTermPage} />
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Tag className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Select an attribute</h3>
              <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Its terms will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function AttributesPage() {
  return (
    <ClientOnly fallback={<AttributesSkeleton />}>
      <AttributesContent />
    </ClientOnly>
  )
}
