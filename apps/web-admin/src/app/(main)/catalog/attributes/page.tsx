'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services'
import { ClientOnly } from '@/components/ClientOnly'
import {
  AlertCircle, ArrowLeft, Check, ChevronRight, Layers, Palette, Pencil, Plus,
  RefreshCw, Search, Trash2, X,
} from '@/components/ui/IconWrapper'

type AttributeType = 'select' | 'color' | 'button' | 'radio'

type AttributeDoc = {
  id: number
  name: string
  slug: string
  type: AttributeType
  is_active: boolean
}

type TermDoc = {
  id: number
  attribute_id: number
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
  hasNextPage: boolean
  hasPrevPage: boolean
}

type AttributeResponse = {
  docs: AttributeDoc[]
  pagination: Pagination
  stats: { totalAll: number; activeCount: number }
}

type TermResponse = {
  docs: TermDoc[]
  pagination: Pagination
  stats: { totalAll: number; perAttribute: Record<string, number> }
}

type AttributeForm = { name: string; slug: string; type: AttributeType; is_active: boolean }
type TermForm = { name: string; slug: string; value: string; sort_order: string; is_active: boolean }
type DeleteTarget = { kind: 'attribute'; doc: AttributeDoc } | { kind: 'term'; doc: TermDoc }

const attributeTypes: { value: AttributeType; label: string; description: string }[] = [
  { value: 'select', label: 'Select', description: 'Dropdown selection' },
  { value: 'color', label: 'Color', description: 'Color swatches' },
  { value: 'button', label: 'Button', description: 'Button choices' },
  { value: 'radio', label: 'Radio', description: 'Radio choices' },
]

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#eba236] focus:outline-none focus:ring-2 focus:ring-[#eba236]/20 dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-white'
const labelClass = 'mb-1 block text-xs font-medium text-gray-700 dark:text-[#a1a1aa]'

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || result.details || `Request failed (${response.status})`)
  return result as T
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function AttributePageContent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [attributePage, setAttributePage] = useState(1)
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeDoc | null>(null)
  const [termPage, setTermPage] = useState(1)

  const [attributeForm, setAttributeForm] = useState<AttributeForm>({ name: '', slug: '', type: 'select', is_active: true })
  const [editingAttribute, setEditingAttribute] = useState<AttributeDoc | null>(null)
  const [attributeSlugTouched, setAttributeSlugTouched] = useState(false)
  const [attributeSaving, setAttributeSaving] = useState(false)
  const [attributeError, setAttributeError] = useState<string | null>(null)

  const [termForm, setTermForm] = useState<TermForm>({ name: '', slug: '', value: '', sort_order: '0', is_active: true })
  const [editingTerm, setEditingTerm] = useState<TermDoc | null>(null)
  const [termSlugTouched, setTermSlugTouched] = useState(false)
  const [termSaving, setTermSaving] = useState(false)
  const [termError, setTermError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])
  useEffect(() => { setAttributePage(1) }, [debouncedSearch, typeFilter, activeFilter])

  const attributeQuery = useMemo(() => {
    const params = new URLSearchParams({ page: String(attributePage), limit: '100', sort: 'name' })
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (typeFilter) params.set('type', typeFilter)
    if (activeFilter) params.set('is_active', activeFilter)
    return params.toString()
  }, [attributePage, debouncedSearch, typeFilter, activeFilter])

  const attributeResult = useQuery({
    queryKey: QUERY_KEYS.adminCatalogAttributes(attributeQuery),
    queryFn: ({ signal }) => requestJson<AttributeResponse>(`/api/catalog/attributes?${attributeQuery}`, { signal }),
    ...SHARED_QUERY_DEFAULTS,
  })
  const countResult = useQuery({
    queryKey: QUERY_KEYS.adminCatalogAttributeTerms('summary:limit=1'),
    queryFn: ({ signal }) => requestJson<TermResponse>('/api/catalog/attribute-terms?page=1&limit=1', { signal }),
    ...SHARED_QUERY_DEFAULTS,
  })
  const termQuery = useMemo(() => {
    if (!selectedAttribute) return ''
    return new URLSearchParams({
      attribute_id: String(selectedAttribute.id),
      page: String(termPage),
      limit: '100',
      sort: 'sort_order',
    }).toString()
  }, [selectedAttribute, termPage])
  const termResult = useQuery({
    queryKey: QUERY_KEYS.adminCatalogAttributeTerms(termQuery || 'none'),
    queryFn: ({ signal }) => requestJson<TermResponse>(`/api/catalog/attribute-terms?${termQuery}`, { signal }),
    enabled: !!selectedAttribute,
    ...SHARED_QUERY_DEFAULTS,
  })

  const attributes = attributeResult.data?.docs ?? []
  const terms = termResult.data?.docs ?? []
  const attributePagination = attributeResult.data?.pagination
  const termPagination = termResult.data?.pagination
  const busy = attributeResult.isFetching || termResult.isFetching

  const resetAttributeForm = () => {
    setEditingAttribute(null)
    setAttributeForm({ name: '', slug: '', type: 'select', is_active: true })
    setAttributeSlugTouched(false)
    setAttributeError(null)
  }
  const resetTermForm = () => {
    setEditingTerm(null)
    setTermForm({ name: '', slug: '', value: '', sort_order: '0', is_active: true })
    setTermSlugTouched(false)
    setTermError(null)
  }

  const saveAttribute = async (event: React.FormEvent) => {
    event.preventDefault()
    setAttributeError(null)
    const name = attributeForm.name.trim()
    const slug = slugify(attributeForm.slug)
    if (name.length < 2 || name.length > 100) return setAttributeError('Name must be between 2 and 100 characters.')
    if (!slug || slug.length > 100) return setAttributeError('Enter a valid slug using lowercase letters, numbers, and hyphens.')
    if (!attributeTypes.some((item) => item.value === attributeForm.type)) return setAttributeError('Choose a valid attribute type.')

    setAttributeSaving(true)
    try {
      await requestJson(
        editingAttribute ? `/api/catalog/attributes/${editingAttribute.id}` : '/api/catalog/attributes',
        {
          method: editingAttribute ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...attributeForm, name, slug }),
        },
      )
      resetAttributeForm()
      setAttributePage(1)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'attributes'] })
    } catch (error) {
      setAttributeError(error instanceof Error ? error.message : 'Failed to save attribute.')
    } finally {
      setAttributeSaving(false)
    }
  }

  const saveTerm = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedAttribute) return
    setTermError(null)
    const name = termForm.name.trim()
    const slug = slugify(termForm.slug)
    const sortOrder = Number(termForm.sort_order)
    const value = termForm.value.trim()
    if (!name || name.length > 100) return setTermError('Name is required and must be at most 100 characters.')
    if (!slug || slug.length > 100) return setTermError('Enter a valid slug using lowercase letters, numbers, and hyphens.')
    if (!Number.isFinite(sortOrder)) return setTermError('Sort order must be a number.')
    if (selectedAttribute.type === 'color' && value && !/^#[0-9a-fA-F]{6}$/.test(value)) {
      return setTermError('Color value must be a hex color in #RRGGBB format.')
    }

    setTermSaving(true)
    try {
      await requestJson(
        editingTerm ? `/api/catalog/attribute-terms/${editingTerm.id}` : '/api/catalog/attribute-terms',
        {
          method: editingTerm ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            value: value || null,
            sort_order: Math.trunc(sortOrder),
            is_active: termForm.is_active,
            ...(!editingTerm ? { attribute_id: selectedAttribute.id } : {}),
          }),
        },
      )
      resetTermForm()
      await queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'attribute-terms'] })
    } catch (error) {
      setTermError(error instanceof Error ? error.message : 'Failed to save term.')
    } finally {
      setTermSaving(false)
    }
  }

  const editAttribute = (attribute: AttributeDoc) => {
    setEditingAttribute(attribute)
    setAttributeForm({ name: attribute.name, slug: attribute.slug, type: attribute.type, is_active: attribute.is_active })
    setAttributeSlugTouched(true)
    setAttributeError(null)
  }

  const editTerm = (term: TermDoc) => {
    setEditingTerm(term)
    setTermForm({
      name: term.name,
      slug: term.slug,
      value: term.value ?? '',
      sort_order: String(term.sort_order),
      is_active: term.is_active,
    })
    setTermSlugTouched(true)
    setTermError(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const url = deleteTarget.kind === 'attribute'
        ? `/api/catalog/attributes/${deleteTarget.doc.id}`
        : `/api/catalog/attribute-terms/${deleteTarget.doc.id}`
      await requestJson(url, { method: 'DELETE' })
      if (deleteTarget.kind === 'attribute') {
        if (selectedAttribute?.id === deleteTarget.doc.id) setSelectedAttribute(null)
        if (editingAttribute?.id === deleteTarget.doc.id) resetAttributeForm()
        await queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'attributes'] })
      } else {
        if (editingTerm?.id === deleteTarget.doc.id) resetTermForm()
        await queryClient.invalidateQueries({ queryKey: ['admin', 'catalog', 'attribute-terms'] })
      }
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete.')
    } finally {
      setDeleting(false)
    }
  }

  const refresh = () => {
    void attributeResult.refetch()
    void countResult.refetch()
    if (selectedAttribute) void termResult.refetch()
  }

  return (
    <div className="space-y-6 px-2.5 py-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eba236] text-white"><Layers className="h-4 w-4" /></span>
            Product Attributes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#a1a1aa]">Manage shared product attributes and their variation terms.</p>
        </div>
        <button onClick={refresh} disabled={busy} aria-label="Refresh attributes" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 dark:border-[#262626] dark:bg-[#171717] dark:hover:bg-[#262626]">
          <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-[#a1a1aa] ${busy ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {selectedAttribute ? (
        <section className="space-y-5">
          <div>
            <button onClick={() => { setSelectedAttribute(null); setTermPage(1); resetTermForm() }} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All attributes
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure terms: {selectedAttribute.name}</h2>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold dark:border-[#262626] dark:bg-[#0a0a0a]">{attributeTypes.find((type) => type.value === selectedAttribute.type)?.label}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#a1a1aa]">Add values available for this attribute. Active terms can be used on product variations.</p>
          </div>

          <form onSubmit={saveTerm} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#171717]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{editingTerm ? 'Edit term' : 'Add new term'}</h3>
              {editingTerm && <button type="button" onClick={resetTermForm} className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-[#a1a1aa]">Cancel edit</button>}
            </div>
            {termError && <div className="mb-4"><ErrorMessage>{termError}</ErrorMessage></div>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input className={inputClass} value={termForm.name} maxLength={100} onChange={(event) => {
                  const name = event.target.value
                  setTermForm((form) => ({ ...form, name, ...(!termSlugTouched ? { slug: slugify(name) } : {}) }))
                }} />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input className={`${inputClass} font-mono`} value={termForm.slug} maxLength={100} onChange={(event) => {
                  setTermForm((form) => ({ ...form, slug: event.target.value }))
                  setTermSlugTouched(true)
                }} />
              </div>
              <div>
                <label className={labelClass}>{selectedAttribute.type === 'color' ? 'Color value' : 'Value'} {selectedAttribute.type === 'color' && <span className="font-normal">(optional)</span>}</label>
                <div className="flex gap-2">
                  <input className={`${inputClass} font-mono`} value={termForm.value} maxLength={100} placeholder={selectedAttribute.type === 'color' ? '#FF5733' : 'Optional'} onChange={(event) => setTermForm((form) => ({ ...form, value: event.target.value }))} />
                  {selectedAttribute.type === 'color' && <input type="color" aria-label="Choose term color" value={/^#[0-9a-fA-F]{6}$/.test(termForm.value) ? termForm.value : '#eba236'} onChange={(event) => setTermForm((form) => ({ ...form, value: event.target.value }))} className="h-10 w-11 shrink-0 rounded-lg border border-gray-200 bg-white p-1 dark:border-[#262626] dark:bg-[#0a0a0a]" />}
                </div>
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input className={inputClass} type="number" step="1" value={termForm.sort_order} onChange={(event) => setTermForm((form) => ({ ...form, sort_order: event.target.value }))} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-[#a1a1aa]">
                <input type="checkbox" checked={termForm.is_active} onChange={(event) => setTermForm((form) => ({ ...form, is_active: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-[#eba236] focus:ring-[#eba236]" />
                Active
              </label>
              <button type="submit" disabled={termSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#eba236] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c88a20] disabled:opacity-50">
                {termSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingTerm ? 'Save term' : 'Add term'}
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#171717]">
            {termResult.isError ? (
              <div className="space-y-3 p-6"><ErrorMessage>{termResult.error instanceof Error ? termResult.error.message : 'Failed to load attribute terms.'}</ErrorMessage><button onClick={() => void termResult.refetch()} className="text-sm font-semibold text-[#a66f12]">Retry</button></div>
            ) : termResult.isPending ? (
              <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-[#0a0a0a]" />)}</div>
            ) : terms.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">No terms yet</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#a1a1aa]">Add the first value for {selectedAttribute.name} above.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                      <tr><th className="px-4 py-3 text-left font-medium">Term</th><th className="px-4 py-3 text-left font-medium">Slug</th><th className="px-4 py-3 text-left font-medium">Value</th><th className="px-4 py-3 text-right font-medium">Order</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                      {terms.map((term) => (
                        <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{term.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-[#a1a1aa]">{term.slug}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-[#a1a1aa]">
                            {selectedAttribute.type === 'color' && term.value ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border border-gray-300 dark:border-[#444]" style={{ backgroundColor: term.value }} />{term.value}</span> : term.value || '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-[#a1a1aa]">{term.sort_order}</td>
                          <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${term.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-[#262626] dark:text-gray-400'}`}>{term.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => editTerm(term)} title="Edit term" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-[#a1a1aa] dark:hover:bg-blue-900/20"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => { setDeleteError(null); setDeleteTarget({ kind: 'term', doc: term }) }} title="Delete term" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-[#a1a1aa] dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {termPagination && termPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm dark:border-[#262626]">
                    <span className="text-gray-500 dark:text-[#a1a1aa]">Page {termPagination.page} of {termPagination.totalPages}</span>
                    <div className="flex gap-2">
                      <button disabled={!termPagination.hasPrevPage || termResult.isFetching} onClick={() => setTermPage((page) => Math.max(1, page - 1))} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-[#262626]"><ChevronRight className="h-4 w-4 rotate-180" /> Prev</button>
                      <button disabled={!termPagination.hasNextPage || termResult.isFetching} onClick={() => setTermPage((page) => page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-[#262626]">Next <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      ) : (
        <>
          {countResult.isError && <ErrorMessage>{countResult.error instanceof Error ? countResult.error.message : 'Failed to load attribute term counts.'}</ErrorMessage>}
          <section className="grid gap-3 sm:grid-cols-3">
            <Stat title="Total attributes" value={attributeResult.data?.stats.totalAll} />
            <Stat title="Active attributes" value={attributeResult.data?.stats.activeCount} />
            <Stat title="Attribute terms" value={countResult.data?.stats.totalAll} />
          </section>
          <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#171717]">
              <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-[#262626] sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold text-gray-900 dark:text-white">Attributes</h2><p className="text-xs text-gray-500 dark:text-[#a1a1aa]">Configure shared product options and variation types.</p></div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[190px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attributes…" className={`${inputClass} py-2 pl-9`} />
                  </div>
                  <select aria-label="Filter by attribute type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={`${inputClass} w-auto py-2`}>
                    <option value="">All types</option>{attributeTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                  <select aria-label="Filter by status" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className={`${inputClass} w-auto py-2`}>
                    <option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              {attributeResult.isError ? (
                <div className="space-y-3 p-5"><ErrorMessage>{attributeResult.error instanceof Error ? attributeResult.error.message : 'Failed to load attributes.'}</ErrorMessage><button onClick={() => void attributeResult.refetch()} className="text-sm font-semibold text-[#a66f12]">Retry</button></div>
              ) : attributeResult.isPending ? (
                <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-[#0a0a0a]" />)}</div>
              ) : attributes.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Layers className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                  <p className="mt-3 font-semibold text-gray-900 dark:text-white">No attributes found</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-[#a1a1aa]">Add an attribute using the form to get started.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                        <tr><th className="px-4 py-3 text-left font-medium">Name</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-right font-medium">Terms</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
                        {attributes.map((attribute) => (
                          <tr key={attribute.id} className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50">
                            <td className="px-4 py-3"><div className="font-semibold text-gray-900 dark:text-white">{attribute.name}</div><div className="font-mono text-xs text-gray-500 dark:text-[#a1a1aa]">{attribute.slug}</div></td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                                {attribute.type === 'color' && <Palette className="h-3 w-3" />}{attributeTypes.find((type) => type.value === attribute.type)?.label ?? attribute.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => { setSelectedAttribute(attribute); setTermPage(1); resetTermForm() }} className="font-semibold text-[#a66f12] hover:underline dark:text-[#eba236]">{countResult.data ? countResult.data.stats.perAttribute[String(attribute.id)] ?? 0 : '—'}</button>
                            </td>
                            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${attribute.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-[#262626] dark:text-gray-400'}`}>{attribute.is_active ? 'Active' : 'Inactive'}</span></td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button onClick={() => { setSelectedAttribute(attribute); setTermPage(1); resetTermForm() }} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#a66f12] hover:bg-[#eba236]/10 dark:text-[#eba236]">Configure terms</button>
                                <button onClick={() => editAttribute(attribute)} aria-label={`Edit ${attribute.name}`} title="Edit attribute" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-[#a1a1aa] dark:hover:bg-blue-900/20"><Pencil className="h-4 w-4" /></button>
                                <button onClick={() => { setDeleteError(null); setDeleteTarget({ kind: 'attribute', doc: attribute }) }} aria-label={`Delete ${attribute.name}`} title="Delete attribute" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-[#a1a1aa] dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {attributePagination && attributePagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm dark:border-[#262626]">
                      <span className="text-gray-500 dark:text-[#a1a1aa]">{attributePagination.totalDocs} attributes</span>
                      <div className="flex gap-2">
                        <button disabled={!attributePagination.hasPrevPage || attributeResult.isFetching} onClick={() => setAttributePage((page) => Math.max(1, page - 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-[#262626]">Previous</button>
                        <button disabled={!attributePagination.hasNextPage || attributeResult.isFetching} onClick={() => setAttributePage((page) => page + 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-[#262626]">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <form onSubmit={saveAttribute} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#262626] dark:bg-[#171717]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div><h2 className="font-semibold text-gray-900 dark:text-white">{editingAttribute ? 'Edit attribute' : 'Add new attribute'}</h2><p className="mt-1 text-xs text-gray-500 dark:text-[#a1a1aa]">Create a reusable product option and choose how it is selected.</p></div>
                {editingAttribute && <button type="button" onClick={resetAttributeForm} aria-label="Cancel edit" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-[#a1a1aa] dark:hover:bg-[#262626]"><X className="h-4 w-4" /></button>}
              </div>
              {attributeError && <div className="mb-4"><ErrorMessage>{attributeError}</ErrorMessage></div>}
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input value={attributeForm.name} maxLength={100} onChange={(event) => {
                    const name = event.target.value
                    setAttributeForm((form) => ({ ...form, name, ...(!attributeSlugTouched ? { slug: slugify(name) } : {}) }))
                  }} placeholder="e.g. Size" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Slug *</label>
                  <input value={attributeForm.slug} maxLength={100} onChange={(event) => {
                    setAttributeForm((form) => ({ ...form, slug: event.target.value }))
                    setAttributeSlugTouched(true)
                  }} placeholder="e.g. size" className={`${inputClass} font-mono`} />
                  <p className="mt-1 text-xs text-gray-400">Lowercase letters, numbers, and hyphens.</p>
                </div>
                <div>
                  <label className={labelClass}>Type *</label>
                  <select value={attributeForm.type} onChange={(event) => setAttributeForm((form) => ({ ...form, type: event.target.value as AttributeType }))} className={inputClass}>
                    {attributeTypes.map((type) => <option key={type.value} value={type.value}>{type.label} — {type.description}</option>)}
                  </select>
                </div>
                <label className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#262626] dark:bg-[#0a0a0a]">
                  <input type="checkbox" checked={attributeForm.is_active} onChange={(event) => setAttributeForm((form) => ({ ...form, is_active: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#eba236] focus:ring-[#eba236]" />
                  <span><span className="block text-sm font-medium text-gray-800 dark:text-white">Active</span><span className="text-xs text-gray-500 dark:text-[#a1a1aa]">Available for use on product variations.</span></span>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                {editingAttribute && <button type="button" onClick={resetAttributeForm} disabled={attributeSaving} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#262626] dark:text-[#a1a1aa] dark:hover:bg-[#262626]">Cancel</button>}
                <button type="submit" disabled={attributeSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#eba236] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c88a20] disabled:opacity-50">
                  {attributeSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : editingAttribute ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingAttribute ? 'Save attribute' : 'Add attribute'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={() => { if (!deleting) setDeleteTarget(null) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-[#262626] dark:bg-[#171717]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20"><Trash2 className="h-6 w-6 text-red-600" /></div>
            <h2 id="delete-title" className="font-bold text-gray-900 dark:text-white">Delete {deleteTarget.kind === 'attribute' ? 'attribute' : 'term'}?</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#a1a1aa]">This permanently deletes <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget.doc.name}</span>. The request will be rejected if variation data still depends on it.</p>
            {deleteError && <div className="mt-4"><ErrorMessage>{deleteError}</ErrorMessage></div>}
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#262626] dark:text-[#a1a1aa] dark:hover:bg-[#262626]">Cancel</button>
              <button onClick={() => void confirmDelete()} disabled={deleting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleting && <RefreshCw className="h-4 w-4 animate-spin" />}{deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ title, value }: { title: string; value?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#262626] dark:bg-[#171717]">
      <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
    </div>
  )
}

function AttributesSkeleton() {
  return <div className="space-y-4 px-2.5 py-5"><div className="h-8 w-52 animate-pulse rounded bg-gray-200 dark:bg-[#262626]" /><div className="h-36 animate-pulse rounded-xl bg-gray-100 dark:bg-[#171717]" /><div className="h-72 animate-pulse rounded-xl bg-gray-100 dark:bg-[#171717]" /></div>
}

export default function AttributesPage() {
  return <ClientOnly fallback={<AttributesSkeleton />}><AttributePageContent /></ClientOnly>
}
