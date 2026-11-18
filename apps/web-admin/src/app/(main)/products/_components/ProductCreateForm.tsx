'use client'

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Building, DollarSign, Loader2, Package, Plus, Tag, Trash2 } from 'lucide-react'
import { MediaUploader } from '@/components/cms/MediaUploader'

type Vendor = { id: number; businessName: string; isActive: boolean }
type Outlet = { id: number; outletName: string; outletCode: string; isActive: boolean }
type ProductCategory = { id: number; name: string }
type AttributeOption = { id: number; name: string; slug: string; type: string }
type AttributeTerm = { id: number; attribute_id: number; name: string; slug: string; value: string | null }
type ProductOption = {
  id: number
  name: string
  productType: 'simple' | 'variable' | 'grouped'
  isActive: boolean
  assignedOutletIds: number[]
}
type VariationDraft = {
  id: number
  name: string
  shortDescription: string
  basePrice: string
  compareAtPrice: string
  stockQuantity: string
  imageId?: string | number
  isVisible: boolean
  termIds: Record<number, string>
}
type GroupedItemDraft = { id: number; productId: string; defaultQuantity: string }

const VISIBILITY_OPTIONS = [
  { value: 'visible', label: 'Visible (shop and search)' },
  { value: 'catalog', label: 'Catalog only' },
  { value: 'search', label: 'Search only' },
  { value: 'hidden', label: 'Hidden' },
]
const APPROVAL_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'disapproved', label: 'Disapproved' },
]
const PRODUCT_TYPES = [
  { value: 'simple', label: 'Simple product', description: 'One product with a single price and stock quantity.' },
  { value: 'variable', label: 'Variable product', description: 'A parent product with separately priced attribute variations.' },
  { value: 'grouped', label: 'Grouped product', description: 'A collection of existing simple or variable products.' },
] as const

function messageFrom(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') return data.error
  return fallback
}

async function fetchAllDocs<T>(path: string): Promise<T[]> {
  const docs: T[] = []
  let page = 1
  let totalPages = 1
  do {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('page', String(page))
    url.searchParams.set('limit', '100')
    const response = await fetch(url.toString(), { cache: 'no-store' })
    const data: unknown = await response.json().catch(() => null)
    if (!response.ok) throw new Error(messageFrom(data, 'Failed to load product options.'))
    if (!data || typeof data !== 'object') throw new Error('The product options response was invalid.')
    const result = data as { docs?: unknown; pagination?: { totalPages?: unknown } }
    if (Array.isArray(result.docs)) docs.push(...result.docs as T[])
    const totalPagesValue = result.pagination?.totalPages
    totalPages = Number.isInteger(totalPagesValue) ? Number(totalPagesValue) : 1
    page += 1
  } while (page <= totalPages)
  return docs
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

function validNonNegative(value: string) {
  return value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
}

function validWholeNumber(value: string, minimum = 0) {
  return value !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= minimum
}

export function ProductCreateForm({ onSuccess, onCancel }: { onSuccess: () => void | Promise<void>; onCancel: () => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [attributes, setAttributes] = useState<AttributeOption[]>([])
  const [termsByAttribute, setTermsByAttribute] = useState<Record<number, AttributeTerm[]>>({})
  const [loadingAttributeIds, setLoadingAttributeIds] = useState<number[]>([])
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [vendorOptionsLoading, setVendorOptionsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [sku, setSku] = useState('')
  const [productType, setProductType] = useState<'simple' | 'variable' | 'grouped'>('simple')
  const [basePrice, setBasePrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('0')
  const [priceOverride, setPriceOverride] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | number | undefined>()
  const [additionalImages, setAdditionalImages] = useState<(string | number)[]>([])
  const [catalogVisibility, setCatalogVisibility] = useState('visible')
  const [approvalStatus, setApprovalStatus] = useState('approved')
  const [isActive, setIsActive] = useState(true)
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>([])
  const [variations, setVariations] = useState<VariationDraft[]>([])
  const [groupedItems, setGroupedItems] = useState<GroupedItemDraft[]>([])
  const [assignmentScope, setAssignmentScope] = useState<'all' | 'outlet'>('all')
  const [outletId, setOutletId] = useState('')
  const nextRowId = useRef(0)

  const activeOutlets = useMemo(() => outlets.filter((outlet) => outlet.isActive), [outlets])
  const targetOutletIds = useMemo(() => {
    if (assignmentScope === 'all') return activeOutlets.map((outlet) => outlet.id)
    const selected = activeOutlets.find((outlet) => String(outlet.id) === outletId)
    return selected ? [selected.id] : []
  }, [activeOutlets, assignmentScope, outletId])
  const eligibleGroupedProducts = useMemo(
    () => productOptions.filter((product) =>
      product.isActive &&
      (product.productType === 'simple' || product.productType === 'variable') &&
      targetOutletIds.length > 0 &&
      targetOutletIds.every((targetId) => product.assignedOutletIds.includes(targetId)),
    ),
    [productOptions, targetOutletIds],
  )

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name))
  }, [name, slugEdited])

  useEffect(() => {
    let active = true
    async function loadOptions() {
      setLoadError(null)
      try {
        const [vendorDocs, categoryDocs, attributeDocs] = await Promise.all([
          fetchAllDocs<Vendor>('/api/vendors?isActive=true&sort=businessName'),
          fetchAllDocs<ProductCategory>('/api/product-categories?isActive=true&sort=name'),
          fetchAllDocs<AttributeOption>('/api/catalog/attributes?is_active=true&sort=name'),
        ])
        if (!active) return
        setVendors(vendorDocs.filter((vendor) => Number.isSafeInteger(Number(vendor.id)) && vendor.isActive !== false))
        setCategories(categoryDocs
          .filter((category) => Number.isSafeInteger(Number(category.id)) && Boolean(category.name))
          .map((category) => ({ id: Number(category.id), name: category.name })))
        setAttributes(attributeDocs
          .filter((attribute) => Number.isSafeInteger(Number(attribute.id)) && Boolean(attribute.name))
          .map((attribute) => ({ ...attribute, id: Number(attribute.id) })))
      } catch (cause) {
        if (active) setLoadError(cause instanceof Error ? cause.message : 'Failed to load product options.')
      }
    }
    void loadOptions()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!vendorId) {
      setOutlets([])
      setProductOptions([])
      return
    }
    let active = true
    async function loadVendorOptions() {
      setVendorOptionsLoading(true)
      setLoadError(null)
      setOutlets([])
      setProductOptions([])
      setOutletId('')
      setGroupedItems([])
      try {
        const [outletDocs, productResponse] = await Promise.all([
          fetchAllDocs<Outlet>(`/api/merchants?vendor=${encodeURIComponent(vendorId)}&isActive=true&sort=outletName`),
          fetch(`/api/products?includeOptions=true&vendorId=${encodeURIComponent(vendorId)}`, { cache: 'no-store' }),
        ])
        const productData: unknown = await productResponse.json().catch(() => null)
        if (!productResponse.ok) throw new Error(messageFrom(productData, 'Failed to load products for this vendor.'))
        if (!active) return
        setOutlets(outletDocs
          .filter((outlet) => Number.isSafeInteger(Number(outlet.id)) && outlet.isActive !== false)
          .map((outlet) => ({ ...outlet, id: Number(outlet.id) })))
        const options = productData && typeof productData === 'object' && 'productOptions' in productData
          ? (productData as { productOptions?: unknown }).productOptions
          : null
        setProductOptions(Array.isArray(options)
          ? options.filter((product): product is ProductOption =>
              Boolean(product) &&
              typeof product === 'object' &&
              Number.isSafeInteger(Number((product as ProductOption).id)) &&
              typeof (product as ProductOption).name === 'string',
            ).map((product) => ({
              ...product,
              id: Number(product.id),
              assignedOutletIds: Array.isArray(product.assignedOutletIds) ? product.assignedOutletIds.map(Number) : [],
            }))
          : [])
      } catch (cause) {
        if (active) setLoadError(cause instanceof Error ? cause.message : 'Failed to load vendor outlets and products.')
      } finally {
        if (active) setVendorOptionsLoading(false)
      }
    }
    void loadVendorOptions()
    return () => { active = false }
  }, [vendorId])

  async function loadAttributeTerms(attributeId: number) {
    if (termsByAttribute[attributeId] || loadingAttributeIds.includes(attributeId)) return
    setLoadingAttributeIds((current) => [...current, attributeId])
    try {
      const terms = await fetchAllDocs<AttributeTerm>(
        `/api/catalog/attribute-terms?attribute_id=${attributeId}&is_active=true&sort=sort_order`,
      )
      setTermsByAttribute((current) => ({ ...current, [attributeId]: terms }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load attribute values.')
    } finally {
      setLoadingAttributeIds((current) => current.filter((id) => id !== attributeId))
    }
  }

  function toggleAttribute(attributeId: number) {
    if (selectedAttributeIds.includes(attributeId)) {
      setSelectedAttributeIds((current) => current.filter((id) => id !== attributeId))
      setVariations((current) => current.map((variation) => {
        const termIds = { ...variation.termIds }
        delete termIds[attributeId]
        return { ...variation, termIds }
      }))
      return
    }
    setSelectedAttributeIds((current) => [...current, attributeId])
    void loadAttributeTerms(attributeId)
  }

  function addVariation() {
    const termIds: Record<number, string> = {}
    for (const attributeId of selectedAttributeIds) {
      termIds[attributeId] = String(termsByAttribute[attributeId]?.[0]?.id || '')
    }
    setVariations((current) => [...current, {
      id: ++nextRowId.current,
      name: '',
      shortDescription: '',
      basePrice: '',
      compareAtPrice: '',
      stockQuantity: '0',
      isVisible: true,
      termIds,
    }])
  }

  function updateVariation(variationId: number, patch: Partial<VariationDraft>) {
    setVariations((current) => current.map((variation) =>
      variation.id === variationId ? { ...variation, ...patch } : variation,
    ))
  }

  function addGroupedItem() {
    const productId = eligibleGroupedProducts.find(
      (product) => !groupedItems.some((item) => item.productId === String(product.id)),
    )?.id
    setGroupedItems((current) => [...current, {
      id: ++nextRowId.current,
      productId: productId ? String(productId) : '',
      defaultQuantity: '1',
    }])
  }

  function updateGroupedItem(itemId: number, patch: Partial<GroupedItemDraft>) {
    setGroupedItems((current) => current.map((item) => item.id === itemId ? { ...item, ...patch } : item))
  }

  function variationPlaceholder(variation: VariationDraft, index: number) {
    const termNames = selectedAttributeIds.map((attributeId) => {
      const termId = Number(variation.termIds[attributeId])
      return termsByAttribute[attributeId]?.find((term) => term.id === termId)?.name
    }).filter(Boolean)
    return termNames.length ? termNames.join(' / ') : `Variation ${index + 1}`
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!vendorId) return setError('Choose a vendor for this product.')
    if (vendorOptionsLoading) return setError('Wait for the selected vendor’s outlets to finish loading.')
    if (activeOutlets.length === 0) return setError('The selected vendor has no active outlets to assign this product to.')
    if (assignmentScope === 'outlet' && !outletId) return setError('Select an outlet for this product.')
    if (name.trim().length < 2 || name.trim().length > 200) return setError('Product name must be between 2 and 200 characters.')
    if (!slugify(slug)) return setError('Enter a valid product slug.')
    if (sku.trim() && sku.trim().length < 2) return setError('SKU must be at least 2 characters if provided.')
    if (shortDescription.length > 500) return setError('Short description cannot exceed 500 characters.')
    if (description.length > 10000) return setError('Full description cannot exceed 10,000 characters.')
    if (productType === 'simple' && !validNonNegative(basePrice)) return setError('Enter a valid base price greater than or equal to zero.')
    if (productType === 'simple' && compareAtPrice !== '' && !validNonNegative(compareAtPrice)) return setError('Compare-at price must be greater than or equal to zero.')
    if (productType === 'simple' && !validWholeNumber(stockQuantity)) return setError('Initial stock must be a whole number zero or greater.')
    if (priceOverride !== '' && !validNonNegative(priceOverride)) return setError('Outlet price override must be zero or greater.')

    if (productType === 'variable') {
      if (selectedAttributeIds.length === 0) return setError('Select at least one product attribute for variations.')
      if (variations.length === 0) return setError('Add at least one variation.')
      if (loadingAttributeIds.length > 0) return setError('Wait for selected attribute values to finish loading.')
      const combinations = new Set<string>()
      for (const [index, variation] of variations.entries()) {
        if (!validNonNegative(variation.basePrice)) return setError(`Enter a valid price for variation ${index + 1}.`)
        if (variation.compareAtPrice !== '' && !validNonNegative(variation.compareAtPrice)) {
          return setError(`Compare-at price for variation ${index + 1} must be zero or greater.`)
        }
        if (!validWholeNumber(variation.stockQuantity)) {
          return setError(`Stock for variation ${index + 1} must be a whole number zero or greater.`)
        }
        if (variation.shortDescription.trim().length > 500) {
          return setError(`Short description for variation ${index + 1} cannot exceed 500 characters.`)
        }
        const termIds = selectedAttributeIds.map((attributeId) => Number(variation.termIds[attributeId]))
        if (termIds.some((termId) => !Number.isSafeInteger(termId) || termId < 1)) {
          return setError(`Select one value for every attribute in variation ${index + 1}.`)
        }
        const combination = selectedAttributeIds.map((attributeId, termIndex) => `${attributeId}:${termIds[termIndex]}`).join('|')
        if (combinations.has(combination)) return setError('Each variation must use a unique combination of attribute values.')
        combinations.add(combination)
      }
    }

    if (productType === 'grouped') {
      if (groupedItems.length === 0) return setError('Add at least one product to this grouped product.')
      const childIds = groupedItems.map((item) => Number(item.productId))
      if (childIds.some((id) => !eligibleGroupedProducts.some((product) => product.id === id))) {
        return setError('Each grouped product must be active and assigned to every selected outlet.')
      }
      if (new Set(childIds).size !== childIds.length) return setError('A grouped product cannot contain the same product more than once.')
      if (groupedItems.some((item) => !validWholeNumber(item.defaultQuantity, 1))) {
        return setError('Grouped product quantities must be whole numbers of at least one.')
      }
    }

    const body = {
      vendorId: Number(vendorId),
      name: name.trim(),
      slug: slugify(slug),
      sku: sku.trim(),
      productType,
      basePrice: productType === 'simple' ? Number(basePrice) : null,
      compareAtPrice: productType === 'simple' && compareAtPrice !== '' ? Number(compareAtPrice) : null,
      stockQuantity: productType === 'simple' ? Number(stockQuantity) : 0,
      priceOverride: priceOverride === '' ? null : Number(priceOverride),
      shortDescription: shortDescription.trim(),
      description,
      categories: selectedCategories,
      primaryImage: primaryImage || null,
      additionalImages: additionalImages.filter(Boolean).map(Number),
      catalogVisibility,
      approvalStatus,
      isActive,
      assignment: assignmentScope === 'all'
        ? { scope: 'all' }
        : { scope: 'outlet', outletId: Number(outletId) },
      ...(productType === 'variable' && {
        variableProduct: {
          attributeIds: selectedAttributeIds,
          variations: variations.map((variation) => ({
            name: variation.name,
            shortDescription: variation.shortDescription,
            imageId: variation.imageId || null,
            basePrice: Number(variation.basePrice),
            compareAtPrice: variation.compareAtPrice === '' ? null : Number(variation.compareAtPrice),
            stockQuantity: Number(variation.stockQuantity),
            isVisible: variation.isVisible,
            values: selectedAttributeIds.map((attributeId) => ({
              attributeId,
              termId: Number(variation.termIds[attributeId]),
            })),
          })),
        },
      }),
      ...(productType === 'grouped' && {
        groupedItems: groupedItems.map((item) => ({
          productId: Number(item.productId),
          defaultQuantity: Number(item.defaultQuantity),
        })),
      }),
    }

    setSaving(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new Error(messageFrom(data, 'Failed to create product.'))
      await onSuccess()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#eba236] focus:ring-2 focus:ring-[#eba236]/20 dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white'
  const labelClass = 'text-xs font-medium text-gray-700 dark:text-[#a1a1aa]'
  const formDisabled = saving || vendorOptionsLoading || loadingAttributeIds.length > 0

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#171717]">
      <div className="space-y-7 p-5 sm:p-6">
        {(error || loadError) && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || loadError}</span>
          </div>
        )}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Building className="h-4 w-4 text-[#eba236]" /> Vendor and outlet assignment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Vendor owner *
              <select required value={vendorId} onChange={(event) => {
                setVendorId(event.target.value)
                setAssignmentScope('all')
                setError(null)
              }} className={inputClass}>
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.businessName || `Vendor #${vendor.id}`} (#{vendor.id})</option>)}
              </select>
              <span className="mt-1 block font-normal text-gray-500">The master product will belong to this vendor.</span>
            </label>
            <div className={labelClass}>
              Assign product to *
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-[#333]">
                  <input type="radio" name="assignmentScope" checked={assignmentScope === 'all'} onChange={() => setAssignmentScope('all')} className="mt-0.5 accent-[#eba236]" />
                  <span><span className="block font-medium text-gray-900 dark:text-white">All active outlets</span><span className="text-xs font-normal text-gray-500">{activeOutlets.length} available</span></span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-[#333]">
                  <input type="radio" name="assignmentScope" checked={assignmentScope === 'outlet'} onChange={() => setAssignmentScope('outlet')} className="mt-0.5 accent-[#eba236]" />
                  <span><span className="block font-medium text-gray-900 dark:text-white">One outlet</span><span className="text-xs font-normal text-gray-500">Choose a single outlet</span></span>
                </label>
              </div>
              {assignmentScope === 'outlet' && (
                <select required value={outletId} onChange={(event) => setOutletId(event.target.value)} className={inputClass} disabled={!vendorId || vendorOptionsLoading}>
                  <option value="">Select an active outlet</option>
                  {activeOutlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.outletName} ({outlet.outletCode})</option>)}
                </select>
              )}
              {vendorId && activeOutlets.length === 0 && (
                <span className={`mt-1 block font-normal ${vendorOptionsLoading ? 'text-gray-500' : 'text-amber-700'}`}>
                  {vendorOptionsLoading
                    ? 'No active outlets found or still loading…'
                    : 'This vendor has no active outlets. Add an outlet before creating the product.'}
                </span>
              )}
            </div>
            {productType === 'simple' && (
              <label className={labelClass}>
                Initial stock at each assigned outlet
                <input type="number" min="0" step="1" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} className={inputClass} />
              </label>
            )}
            <label className={labelClass}>
              Outlet price override
              <input type="number" min="0" step="0.01" value={priceOverride} onChange={(event) => setPriceOverride(event.target.value)} className={inputClass} placeholder="Leave blank to use product pricing" />
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Package className="h-4 w-4 text-[#eba236]" /> Product information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Product name *
              <input required minLength={2} maxLength={200} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="e.g. Chicken rice bowl" />
            </label>
            <label className={labelClass}>
              Slug *
              <input required value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value) }} className={`${inputClass} font-mono`} placeholder="chicken-rice-bowl" />
            </label>
            <label className={labelClass}>
              SKU <span className="font-normal text-gray-400">(optional, unique)</span>
              <input value={sku} onChange={(event) => setSku(event.target.value)} className={`${inputClass} font-mono`} placeholder="CHK-RICE-01" />
            </label>
            <label className={labelClass}>
              Product type *
              <select value={productType} onChange={(event) => {
                setProductType(event.target.value as 'simple' | 'variable' | 'grouped')
                setSelectedAttributeIds([])
                setVariations([])
                setGroupedItems([])
                setError(null)
              }} className={inputClass}>
                {PRODUCT_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <span className="mt-1 block font-normal text-gray-500">{PRODUCT_TYPES.find((option) => option.value === productType)?.description}</span>
            </label>
            <label className={labelClass}>
              Catalog visibility *
              <select value={catalogVisibility} onChange={(event) => setCatalogVisibility(event.target.value)} className={inputClass}>
                {VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className={labelClass}>
              Approval status *
              <select value={approvalStatus} onChange={(event) => setApprovalStatus(event.target.value)} className={inputClass}>
                {APPROVAL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <div className="flex items-end gap-5 pb-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-[#eba236]" />
                Active
              </label>
            </div>
            <label className={`${labelClass} sm:col-span-2`}>
              Short description <span className="font-normal text-gray-400">(max 500 characters)</span>
              <textarea maxLength={500} rows={3} value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={inputClass} placeholder="A brief product description" />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Full description <span className="font-normal text-gray-400">(plain text, max 10,000 characters)</span>
              <textarea maxLength={10000} rows={7} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} placeholder="Describe this product for customers. Line breaks are preserved." />
            </label>
          </div>
        </section>

        {productType === 'simple' && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><DollarSign className="h-4 w-4 text-emerald-600" /> Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>Base price *<input required type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className={inputClass} placeholder="0.00" /></label>
              <label className={labelClass}>Compare-at price<input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} className={inputClass} placeholder="Optional" /></label>
            </div>
          </section>
        )}

        {productType === 'variable' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Attributes and variations</h2>
              <p className="mt-1 text-xs text-gray-500">Select shared catalog attributes, then define every variation’s values, price, stock, visibility, and image.</p>
            </div>
            {attributes.length > 0 ? (
              <div className="rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                <p className={`${labelClass} mb-2`}>Attributes used for variations *</p>
                <div className="flex flex-wrap gap-2">
                  {attributes.map((attribute) => (
                    <label key={attribute.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                      <input type="checkbox" checked={selectedAttributeIds.includes(attribute.id)} onChange={() => toggleAttribute(attribute.id)} className="accent-[#eba236]" />
                      {attribute.name}
                    </label>
                  ))}
                </div>
                {!selectedAttributeIds.length && <p className="mt-2 text-xs text-amber-700">Select at least one active catalog attribute.</p>}
              </div>
            ) : <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">No active product attributes found or still loading. Configure attributes before creating a variable product.</p>}

            {variations.map((variation, index) => (
              <div key={variation.id} className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-[#333]">
                <div className="flex items-start justify-between">
                  <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">Variation {index + 1}</h3><p className="text-xs text-gray-500">The variation SKU is generated by the CMS.</p></div>
                  <button type="button" onClick={() => setVariations((current) => current.filter((item) => item.id !== variation.id))} className="text-xs font-medium text-red-600">Remove</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedAttributeIds.map((attributeId) => {
                    const attribute = attributes.find((item) => item.id === attributeId)
                    const terms = termsByAttribute[attributeId] || []
                    return (
                      <label key={attributeId} className={labelClass}>
                        {attribute?.name || 'Attribute'} *
                        <select required value={variation.termIds[attributeId] || ''} onChange={(event) => updateVariation(variation.id, { termIds: { ...variation.termIds, [attributeId]: event.target.value } })} className={inputClass} disabled={loadingAttributeIds.includes(attributeId)}>
                          <option value="">{loadingAttributeIds.includes(attributeId) ? 'Loading values…' : 'Choose a value'}</option>
                          {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                        </select>
                        {!loadingAttributeIds.includes(attributeId) && terms.length === 0 && <span className="mt-1 block font-normal text-amber-700">No active values configured for this attribute.</span>}
                      </label>
                    )
                  })}
                  <label className={`${labelClass} sm:col-span-2`}>Variation name <span className="font-normal text-gray-400">(optional)</span><input value={variation.name} onChange={(event) => updateVariation(variation.id, { name: event.target.value })} className={inputClass} placeholder={variationPlaceholder(variation, index)} /></label>
                  <label className={labelClass}>Base price *<input required type="number" min="0" step="0.01" value={variation.basePrice} onChange={(event) => updateVariation(variation.id, { basePrice: event.target.value })} className={inputClass} /></label>
                  <label className={labelClass}>Compare-at price<input type="number" min="0" step="0.01" value={variation.compareAtPrice} onChange={(event) => updateVariation(variation.id, { compareAtPrice: event.target.value })} className={inputClass} /></label>
                  <label className={labelClass}>Stock quantity<input type="number" min="0" step="1" value={variation.stockQuantity} onChange={(event) => updateVariation(variation.id, { stockQuantity: event.target.value })} className={inputClass} /></label>
                  <label className={`${labelClass} sm:col-span-2`}>Short description <span className="font-normal">(max 500 characters)</span><textarea maxLength={500} rows={2} value={variation.shortDescription} onChange={(event) => updateVariation(variation.id, { shortDescription: event.target.value })} className={inputClass} /></label>
                  <div className="sm:col-span-2"><span className={labelClass}>Variation image</span><MediaUploader value={variation.imageId} onChange={(id) => updateVariation(variation.id, { imageId: id || undefined })} accept="image/*" maxSize={10} /></div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-white"><input type="checkbox" checked={variation.isVisible} onChange={(event) => updateVariation(variation.id, { isVisible: event.target.checked })} className="h-4 w-4 accent-[#eba236]" />Visible to customers</label>
                </div>
              </div>
            ))}
            <button type="button" disabled={!selectedAttributeIds.length || loadingAttributeIds.length > 0} onClick={addVariation} className="inline-flex items-center gap-2 rounded-lg border border-[#eba236] px-3 py-2 text-sm font-medium text-[#a66a08] disabled:opacity-50"><Plus className="h-4 w-4" /> Add variation</button>
          </section>
        )}

        {productType === 'grouped' && (
          <section className="space-y-4">
            <div><h2 className="text-sm font-semibold text-gray-900 dark:text-white">Grouped products</h2><p className="mt-1 text-xs text-gray-500">Add active simple or variable products from the same vendor. They must already be assigned to every outlet selected above.</p></div>
            {groupedItems.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-[#333] sm:grid-cols-[1fr_150px_auto]">
                <label className={labelClass}>Product {index + 1} *
                  <select required value={item.productId} onChange={(event) => updateGroupedItem(item.id, { productId: event.target.value })} className={inputClass}>
                    <option value="">Select an active assigned product</option>
                    {eligibleGroupedProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.productType})</option>)}
                  </select>
                </label>
                <label className={labelClass}>Default quantity *
                  <input required type="number" min="1" step="1" value={item.defaultQuantity} onChange={(event) => updateGroupedItem(item.id, { defaultQuantity: event.target.value })} className={inputClass} />
                </label>
                <button type="button" onClick={() => setGroupedItems((current) => current.filter((groupedItem) => groupedItem.id !== item.id))} className="self-end rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-red-600 dark:border-[#333]"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" disabled={!eligibleGroupedProducts.some((product) => !groupedItems.some((item) => item.productId === String(product.id)))} onClick={addGroupedItem} className="inline-flex items-center gap-2 rounded-lg border border-[#eba236] px-3 py-2 text-sm font-medium text-[#a66a08] disabled:opacity-50"><Plus className="h-4 w-4" /> Add product</button>
            {eligibleGroupedProducts.length === 0 && (
              <p className={`text-xs ${vendorOptionsLoading ? 'text-gray-500' : 'text-amber-700'}`}>
                {vendorOptionsLoading
                  ? 'Eligible outlet products are still loading…'
                  : 'No active simple or variable products are assigned to every selected outlet.'}
              </p>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Tag className="h-4 w-4 text-emerald-600" /> Categories</h2>
          {categories.length ? (
            <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-3 dark:border-[#333]">
              {categories.map((category) => (
                <label key={category.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${selectedCategories.includes(category.id) ? 'border-[#eba236] bg-[#eba236] text-white' : 'border-gray-200 text-gray-700 dark:border-[#333] dark:text-[#a1a1aa]'}`}>
                  <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => setSelectedCategories((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} className="sr-only" />
                  {category.name}
                </label>
              ))}
            </div>
          ) : <p className="rounded-xl border border-gray-200 p-3 text-sm text-gray-500 dark:border-[#333]">No categories found or still loading… Category assignment is optional.</p>}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Product media</h2>
          <div className="space-y-5">
            <div><label className={labelClass}>Primary image</label><MediaUploader value={primaryImage} onChange={(id) => setPrimaryImage(id || undefined)} accept="image/*" maxSize={10} /></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className={labelClass}>Additional images</span><button type="button" disabled={additionalImages.length >= 20} onClick={() => setAdditionalImages((current) => [...current, ''])} className="inline-flex items-center gap-1 text-xs font-medium text-[#a66a08] disabled:opacity-50"><Plus className="h-3.5 w-3.5" /> Add image</button></div>
              {additionalImages.map((imageId, index) => (
                <div key={`image-${index}`} className="rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                  <div className="mb-2 flex items-center justify-between"><span className="text-xs text-gray-500">Image {index + 1}</span><button type="button" onClick={() => setAdditionalImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-medium text-red-600">Remove</button></div>
                  <MediaUploader value={imageId || undefined} onChange={(id) => setAdditionalImages((current) => current.map((value, itemIndex) => itemIndex === index ? id : value))} accept="image/*" maxSize={10} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-[#262626] dark:bg-[#0a0a0a] sm:px-6">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-[#333] dark:bg-[#171717] dark:text-[#a1a1aa]">Cancel</button>
        <button type="submit" disabled={formDisabled || !vendorId || activeOutlets.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-[#eba236] px-6 py-2 text-sm font-semibold text-white hover:bg-[#c88a20] disabled:cursor-not-allowed disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create product
        </button>
      </div>
    </form>
  )
}
