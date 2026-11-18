'use client'

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, DollarSign, Loader2, Package, Tag } from '@/components/ui/IconWrapper'
import { MediaUploader } from '@/components/cms/MediaUploader'

export type ProductDoc = {
  id: number
  name: string
  slug: string
  sku: string | null
  productType: 'simple' | 'variable' | 'grouped'
  basePrice: number | null
  compareAtPrice: number | null
  shortDescription: string | null
  description?: unknown
  descriptionText?: string
  categories: { id: number; name: string; slug: string }[]
  tags?: ProductTag[]
  primaryImage: { id: number; url: string | null } | null
  isActive: boolean
  catalogVisibility: string
  assignedOutlets?: {
    id: number
    outletName: string
    outletCode: string
    isActive: boolean
    isListingActive: boolean
    isAvailable: boolean
  }[]
}

type Outlet = {
  id: string
  outletName: string
  outletCode: string
  isActive: boolean
}

type ProductCategory = {
  id: number
  name: string
}

type ProductTag = {
  id: number
  name: string
  slug: string
  tag_type: string
  color: string | null
  is_active: boolean
}

type ProductType = ProductDoc['productType']

type AttributeOption = {
  id: number
  name: string
  slug: string
  type: string
}

type AttributeTerm = {
  id: number
  attribute_id: number
  name: string
  slug: string
  value: string | null
}

type ProductOption = {
  id: number
  name: string
  slug: string
  productType: ProductType
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

type GroupedItemDraft = {
  id: number
  productId: string
  defaultQuantity: string
}

type ProductFormProps = {
  mode: 'create' | 'edit'
  initial?: ProductDoc
  onCancel: () => void
  onSuccess: () => void | Promise<void>
}

const VISIBILITY_OPTIONS = [
  { value: 'visible', label: 'Visible (shop and search)' },
  { value: 'catalog', label: 'Catalog only' },
  { value: 'search', label: 'Search only' },
  { value: 'hidden', label: 'Hidden' },
]

const PRODUCT_TYPES: { value: ProductType; label: string; description: string }[] = [
  { value: 'simple', label: 'Simple product', description: 'A single product with its own price.' },
  { value: 'variable', label: 'Variable product', description: 'A product with option-based variations, such as size or color.' },
  { value: 'grouped', label: 'Grouped product', description: 'A collection of existing products sold together.' },
]

function responseError(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error
  }
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
    const data = await response.json()
    if (!response.ok) throw new Error(responseError(data, 'Failed to load product options.'))
    if (Array.isArray(data.docs)) docs.push(...data.docs as T[])
    totalPages = Number.isInteger(data.pagination?.totalPages) ? data.pagination.totalPages : 1
    page += 1
  } while (page <= totalPages)

  return docs
}

export function ProductForm({ mode, initial, onCancel, onSuccess }: ProductFormProps) {
  const isEdit = mode === 'edit'
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [tags, setTags] = useState<ProductTag[]>(initial?.tags || [])
  const [selectedTags, setSelectedTags] = useState<number[]>(initial?.tags?.map((tag) => tag.id) || [])
  const [tagsLoadError, setTagsLoadError] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<AttributeOption[]>([])
  const [termsByAttribute, setTermsByAttribute] = useState<Record<number, AttributeTerm[]>>({})
  const [loadingAttributeIds, setLoadingAttributeIds] = useState<number[]>([])
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(initial?.name || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [sku, setSku] = useState(initial?.sku || '')
  const [basePrice, setBasePrice] = useState(initial?.basePrice == null ? '' : String(initial.basePrice))
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice == null ? '' : String(initial.compareAtPrice))
  const [stockQuantity, setStockQuantity] = useState('0')
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || '')
  const [description, setDescription] = useState(initial?.descriptionText || '')
  const [descriptionChanged, setDescriptionChanged] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initial?.categories.map((category) => category.id) || [],
  )
  const [primaryImage, setPrimaryImage] = useState<string | number | undefined>(initial?.primaryImage?.id)
  const [catalogVisibility, setCatalogVisibility] = useState(initial?.catalogVisibility || 'visible')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [productType, setProductType] = useState<ProductType>(initial?.productType || 'simple')
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>([])
  const [variations, setVariations] = useState<VariationDraft[]>([])
  const [groupedItems, setGroupedItems] = useState<GroupedItemDraft[]>([])
  const [assignmentScope, setAssignmentScope] = useState<'all' | 'outlet'>('all')
  const [outletId, setOutletId] = useState('')
  const nextRowId = useRef(0)

  const activeOutlets = useMemo(() => outlets.filter((outlet) => outlet.isActive), [outlets])
  const targetOutletIds = useMemo(() => {
    if (assignmentScope === 'all') return activeOutlets.map((outlet) => Number(outlet.id))
    const selectedOutlet = activeOutlets.find((outlet) => String(outlet.id) === outletId)
    return selectedOutlet ? [Number(selectedOutlet.id)] : []
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
    let active = true
    async function loadOptions() {
      setLoadingOptions(true)
      setError(null)
      try {
        const categoryRequest = fetch('/api/product-categories?limit=100&isActive=true', { cache: 'no-store' })
        const outletRequest = isEdit
          ? Promise.resolve(null)
          : fetch('/api/outlets', { cache: 'no-store' })
        const attributeRequest = isEdit
          ? Promise.resolve([])
          : fetchAllDocs<AttributeOption>('/api/catalog/attributes?is_active=true')
        const productOptionsRequest = isEdit
          ? Promise.resolve(null)
          : fetch('/api/products?includeOptions=true&limit=1', { cache: 'no-store' })
        const tagRequest = isEdit
          ? fetchAllDocs<ProductTag>('/api/catalog/tags?is_active=true').catch((loadError: unknown) => {
              if (active) setTagsLoadError(loadError instanceof Error ? loadError.message : 'Failed to load product tags.')
              return null
            })
          : Promise.resolve(null)
        const [categoryResponse, outletResponse, attributeDocs, productOptionsResponse, tagDocs] = await Promise.all([
          categoryRequest,
          outletRequest,
          attributeRequest,
          productOptionsRequest,
          tagRequest,
        ])
        const categoryData = await categoryResponse.json()
        const outletData = outletResponse ? await outletResponse.json() : null
        const productOptionsData = productOptionsResponse ? await productOptionsResponse.json() : null
        if (!categoryResponse.ok) throw new Error(responseError(categoryData, 'Failed to load categories.'))
        if (outletResponse && !outletResponse.ok) {
          throw new Error(responseError(outletData, 'Failed to load outlets.'))
        }
        if (productOptionsResponse && !productOptionsResponse.ok) {
          throw new Error(responseError(productOptionsData, 'Failed to load vendor products.'))
        }
        if (!active) return
        setCategories(
          Array.isArray(categoryData.docs)
            ? categoryData.docs
                .filter((category: ProductCategory) => Number.isInteger(Number(category.id)) && category.name)
                .map((category: ProductCategory) => ({ id: Number(category.id), name: category.name }))
            : [],
        )
        if (isEdit && Array.isArray(tagDocs)) {
          const options = new Map<number, ProductTag>()
          for (const tag of [...tagDocs, ...(initial?.tags || [])]) {
            if (Number.isSafeInteger(Number(tag.id)) && tag.name) options.set(Number(tag.id), { ...tag, id: Number(tag.id) })
          }
          setTags(Array.from(options.values()))
          setTagsLoadError(null)
        }
        if (Array.isArray(outletData?.outlets)) setOutlets(outletData.outlets)
        setAttributes(attributeDocs.filter((attribute) => Number.isInteger(Number(attribute.id)) && attribute.name))
        setProductOptions(
          Array.isArray(productOptionsData?.productOptions)
            ? productOptionsData.productOptions
                .filter((product: ProductOption) => Number.isInteger(Number(product.id)) && product.name)
                .map((product: ProductOption) => ({
                  ...product,
                  id: Number(product.id),
                  assignedOutletIds: Array.isArray(product.assignedOutletIds) ? product.assignedOutletIds.map(Number) : [],
                }))
            : [],
        )
      } catch (loadError) {
        if (active) {
          const message = loadError instanceof Error ? loadError.message : 'Failed to load product options.'
          setError(message)
        }
      } finally {
        if (active) setLoadingOptions(false)
      }
    }

    void loadOptions()
    return () => {
      active = false
    }
  }, [isEdit])

  function toggleCategory(categoryId: number) {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    )
  }

  function toggleTag(tagId: number) {
    setSelectedTags((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  async function loadAttributeTerms(attributeId: number) {
    if (termsByAttribute[attributeId] || loadingAttributeIds.includes(attributeId)) return
    setLoadingAttributeIds((current) => [...current, attributeId])
    try {
      const terms = await fetchAllDocs<AttributeTerm>(
        `/api/catalog/attribute-terms?attribute_id=${attributeId}&is_active=true`,
      )
      setTermsByAttribute((current) => ({ ...current, [attributeId]: terms }))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load attribute values.')
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
    setGroupedItems((current) => current.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item,
    ))
  }

  function variationLabel(variation: VariationDraft, index: number) {
    if (variation.name.trim()) return variation.name.trim()
    const terms = selectedAttributeIds.map((attributeId) => {
      const termId = Number(variation.termIds[attributeId])
      return termsByAttribute[attributeId]?.find((term) => term.id === termId)?.name
    }).filter(Boolean)
    return terms.length ? terms.join(' / ') : `Variation ${index + 1}`
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const submittedProductType = isEdit ? initial?.productType || productType : productType
    if (name.trim().length < 2) {
      setError('Product name must be at least 2 characters.')
      return
    }
    if (submittedProductType === 'simple' && (initial?.productType === 'simple' || !isEdit)) {
      if (basePrice === '' || !Number.isFinite(Number(basePrice)) || Number(basePrice) < 0) {
        setError('Enter a valid product price.')
        return
      }
    }
    if (submittedProductType === 'simple' && basePrice !== '' && (!Number.isFinite(Number(basePrice)) || Number(basePrice) < 0)) {
      setError('Base price must be greater than or equal to zero.')
      return
    }
    if (submittedProductType === 'simple' && compareAtPrice !== '' && (!Number.isFinite(Number(compareAtPrice)) || Number(compareAtPrice) < 0)) {
      setError('Compare-at price must be greater than or equal to zero.')
      return
    }
    if (!isEdit && submittedProductType === 'simple' && (!Number.isSafeInteger(Number(stockQuantity)) || Number(stockQuantity) < 0)) {
      setError('Initial stock quantity must be a whole number zero or greater.')
      return
    }
    if (!isEdit && assignmentScope === 'outlet' && !outletId) {
      setError('Select an outlet for this product.')
      return
    }
    if (!isEdit && submittedProductType === 'variable') {
      if (selectedAttributeIds.length === 0) {
        setError('Select at least one product attribute for variations.')
        return
      }
      if (variations.length === 0) {
        setError('Add at least one variation.')
        return
      }
      if (loadingAttributeIds.length > 0) {
        setError('Wait for the selected attribute values to finish loading.')
        return
      }
      const combinations = new Set<string>()
      for (const [index, variation] of variations.entries()) {
        if (variation.basePrice === '' || !Number.isFinite(Number(variation.basePrice)) || Number(variation.basePrice) < 0) {
          setError(`Enter a valid price for variation ${index + 1}.`)
          return
        }
        if (variation.compareAtPrice !== '' && (!Number.isFinite(Number(variation.compareAtPrice)) || Number(variation.compareAtPrice) < 0)) {
          setError(`Enter a valid compare-at price for variation ${index + 1}.`)
          return
        }
        if (variation.stockQuantity !== '' && (!Number.isSafeInteger(Number(variation.stockQuantity)) || Number(variation.stockQuantity) < 0)) {
          setError(`Stock quantity for variation ${index + 1} must be a whole number zero or greater.`)
          return
        }
        const selectedTerms = selectedAttributeIds.map((attributeId) => Number(variation.termIds[attributeId]))
        if (selectedTerms.some((termId) => !Number.isSafeInteger(termId) || termId <= 0)) {
          setError(`Select a value for every attribute in variation ${index + 1}.`)
          return
        }
        const combination = selectedAttributeIds.map((attributeId, termIndex) => `${attributeId}:${selectedTerms[termIndex]}`).join('|')
        if (combinations.has(combination)) {
          setError('Each variation must use a unique combination of attribute values.')
          return
        }
        combinations.add(combination)
      }
    }
    if (!isEdit && submittedProductType === 'grouped') {
      if (groupedItems.length === 0) {
        setError('Add at least one product to this grouped product.')
        return
      }
      const childIds = groupedItems.map((item) => Number(item.productId))
      if (childIds.some((id) => !eligibleGroupedProducts.some((product) => product.id === id))) {
        setError('Each grouped product must be active and assigned to every selected outlet.')
        return
      }
      if (new Set(childIds).size !== childIds.length) {
        setError('A grouped product cannot contain the same product more than once.')
        return
      }
      if (groupedItems.some((item) => !Number.isSafeInteger(Number(item.defaultQuantity)) || Number(item.defaultQuantity) < 1)) {
        setError('Grouped product quantities must be whole numbers of at least one.')
        return
      }
    }

    const body = {
      name: name.trim(),
      slug: slug.trim(),
      sku: sku.trim(),
      basePrice: submittedProductType === 'simple' && basePrice !== '' ? Number(basePrice) : null,
      compareAtPrice: submittedProductType === 'simple' && compareAtPrice !== '' ? Number(compareAtPrice) : null,
      shortDescription: shortDescription.trim(),
      ...(!isEdit || descriptionChanged ? { description } : {}),
      categories: selectedCategories,
      ...(isEdit ? { tags: selectedTags } : {}),
      primaryImage: primaryImage || null,
      catalogVisibility,
      isActive,
      ...(!isEdit && {
        productType: submittedProductType,
        ...(submittedProductType === 'simple' && { stockQuantity: Number(stockQuantity) }),
        assignment: assignmentScope === 'all'
          ? { scope: 'all' }
          : { scope: 'outlet', outletId: Number(outletId) },
        ...(submittedProductType === 'variable' && {
          variableProduct: {
            attributeIds: selectedAttributeIds,
            variations: variations.map((variation) => ({
              name: variation.name,
              shortDescription: variation.shortDescription,
              imageId: variation.imageId || null,
              basePrice: Number(variation.basePrice),
              compareAtPrice: variation.compareAtPrice === '' ? null : Number(variation.compareAtPrice),
              stockQuantity: variation.stockQuantity === '' ? 0 : Number(variation.stockQuantity),
              isVisible: variation.isVisible,
              values: selectedAttributeIds.map((attributeId) => ({
                attributeId,
                termId: Number(variation.termIds[attributeId]),
              })),
            })),
          },
        }),
        ...(submittedProductType === 'grouped' && {
          groupedItems: groupedItems.map((item) => ({
            productId: Number(item.productId),
            defaultQuantity: Number(item.defaultQuantity),
          })),
        }),
      }),
    }

    setSaving(true)
    try {
      const response = await fetch(isEdit ? `/api/products/${initial?.id}` : '/api/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(responseError(data, `Failed to ${isEdit ? 'update' : 'create'} product.`))
      await onSuccess()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : `Failed to ${isEdit ? 'update' : 'create'} product.`)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#eba236] focus:ring-2 focus:ring-[#eba236]/20 dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white'
  const labelClass = 'text-xs font-medium text-gray-700 dark:text-[#a1a1aa]'
  const formDisabled = saving || loadingAttributeIds.length > 0 || (!isEdit && activeOutlets.length === 0)

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#171717]">
      <div className="space-y-6 p-5 sm:p-6">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Package className="h-4 w-4 text-[#eba236]" /> Basic information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>
                  Product name *
                  <input required minLength={2} maxLength={200} value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="e.g. Chicken rice bowl" />
                </label>
                {isEdit && (
                  <label className={`${labelClass} sm:col-span-2`}>
                    Slug *
                    <input required value={slug} onChange={(event) => setSlug(event.target.value)} className={`${inputClass} font-mono`} />
                  </label>
                )}
                <label className={labelClass}>
                  SKU <span className="font-normal text-gray-400">(optional)</span>
                  <input value={sku} onChange={(event) => setSku(event.target.value)} className={`${inputClass} font-mono`} placeholder="e.g. CHK-RICE-01" />
                </label>
                <label className={labelClass}>
                  Product type *
                  {isEdit ? (
                    <input readOnly value={initial?.productType || 'simple'} className={`${inputClass} capitalize opacity-80`} />
                  ) : (
                    <>
                      <select
                        value={productType}
                        onChange={(event) => {
                          const nextType = event.target.value as ProductType
                          setProductType(nextType)
                          setSelectedAttributeIds([])
                          setVariations([])
                          setGroupedItems([])
                          setError(null)
                        }}
                        className={inputClass}
                      >
                        {PRODUCT_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <span className="mt-1 block font-normal text-gray-500">{PRODUCT_TYPES.find((option) => option.value === productType)?.description}</span>
                    </>
                  )}
                </label>
                <label className={labelClass}>
                  Catalog visibility
                  <select value={catalogVisibility} onChange={(event) => setCatalogVisibility(event.target.value)} className={inputClass}>
                    {VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Short description <span className="font-normal text-gray-400">(max 500 characters)</span>
                  <textarea maxLength={500} rows={3} value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={inputClass} placeholder="A brief description of this product" />
                </label>
              </div>
            </section>

            <section>
              <label className={`${labelClass} block`}>
                Full description
                <textarea
                  rows={8}
                  maxLength={10000}
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                    setDescriptionChanged(true)
                  }}
                  className={inputClass}
                  placeholder="Describe this product for customers"
                />
                <span className="mt-1 block font-normal text-gray-500">Plain text only. Line breaks are preserved.</span>
              </label>
            </section>

            {(!isEdit && productType === 'simple') || (isEdit && initial?.productType === 'simple') ? (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><DollarSign className="h-4 w-4 text-emerald-600" /> Pricing</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Base price *
                    <input type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className={inputClass} placeholder="0.00" />
                  </label>
                  <label className={labelClass}>
                    Compare-at price
                    <input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} className={inputClass} placeholder="Optional" />
                  </label>
                  {!isEdit && (
                    <label className={labelClass}>
                      Initial stock at each assigned outlet
                      <input type="number" min="0" step="1" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} className={inputClass} />
                    </label>
                  )}
                </div>
              </section>
            ) : null}

            {!isEdit && productType === 'variable' && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Attributes and variations</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#a1a1aa]">
                    Choose shared catalog attributes, then add each sellable combination with its own price, stock, and image.
                  </p>
                </div>
                {attributes.length ? (
                  <div className="rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                    <p className={`${labelClass} mb-2`}>Attributes used for variations *</p>
                    <div className="flex flex-wrap gap-2">
                      {attributes.map((attribute) => (
                        <label key={attribute.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                          <input
                            type="checkbox"
                            checked={selectedAttributeIds.includes(attribute.id)}
                            onChange={() => toggleAttribute(attribute.id)}
                            className="accent-[#eba236]"
                          />
                          {attribute.name}
                        </label>
                      ))}
                    </div>
                    {!selectedAttributeIds.length && (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Select at least one active catalog attribute before adding variations.</p>
                    )}
                  </div>
                ) : loadingOptions ? (
                  <p className="text-sm text-gray-500">Active product attributes are still loading…</p>
                ) : (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                    No active product attributes are available. Ask your platform administrator to configure shared attributes before creating a variable product.
                  </p>
                )}

                <div className="space-y-3">
                  {variations.map((variation, index) => (
                    <div key={variation.id} className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-[#333]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Variation {index + 1}</h3>
                          <p className="text-xs text-gray-500">SKU is generated automatically after saving.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVariations((current) => current.filter((item) => item.id !== variation.id))}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedAttributeIds.map((attributeId) => {
                          const attribute = attributes.find((item) => item.id === attributeId)
                          const terms = termsByAttribute[attributeId] || []
                          return (
                            <label key={attributeId} className={labelClass}>
                              {attribute?.name || 'Attribute'} *
                              <select
                                required
                                value={variation.termIds[attributeId] || ''}
                                onChange={(event) => updateVariation(variation.id, {
                                  termIds: { ...variation.termIds, [attributeId]: event.target.value },
                                })}
                                className={inputClass}
                                disabled={loadingAttributeIds.includes(attributeId)}
                              >
                                <option value="">
                                  {loadingAttributeIds.includes(attributeId) ? 'Loading values…' : 'Choose a value'}
                                </option>
                                {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                              </select>
                              {!loadingAttributeIds.includes(attributeId) && terms.length === 0 && (
                                <span className="mt-1 block font-normal text-amber-700">No active values are configured for this attribute.</span>
                              )}
                            </label>
                          )
                        })}
                        <label className={`${labelClass} sm:col-span-2`}>
                          Variation name <span className="font-normal text-gray-400">(optional; defaults to selected values)</span>
                          <input value={variation.name} onChange={(event) => updateVariation(variation.id, { name: event.target.value })} className={inputClass} placeholder={variationLabel(variation, index)} />
                        </label>
                        <label className={labelClass}>
                          Price *
                          <input type="number" min="0" step="0.01" required value={variation.basePrice} onChange={(event) => updateVariation(variation.id, { basePrice: event.target.value })} className={inputClass} placeholder="0.00" />
                        </label>
                        <label className={labelClass}>
                          Compare-at price
                          <input type="number" min="0" step="0.01" value={variation.compareAtPrice} onChange={(event) => updateVariation(variation.id, { compareAtPrice: event.target.value })} className={inputClass} placeholder="Optional" />
                        </label>
                        <label className={labelClass}>
                          Stock quantity
                          <input type="number" min="0" step="1" value={variation.stockQuantity} onChange={(event) => updateVariation(variation.id, { stockQuantity: event.target.value })} className={inputClass} />
                        </label>
                        <label className={`${labelClass} sm:col-span-2`}>
                          Short description
                          <textarea maxLength={500} rows={2} value={variation.shortDescription} onChange={(event) => updateVariation(variation.id, { shortDescription: event.target.value })} className={inputClass} />
                        </label>
                        <div className="sm:col-span-2">
                          <span className={labelClass}>Variation image</span>
                          <MediaUploader value={variation.imageId} onChange={(id) => updateVariation(variation.id, { imageId: id || undefined })} accept="image/*" maxSize={10} />
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                          <input type="checkbox" checked={variation.isVisible} onChange={(event) => updateVariation(variation.id, { isVisible: event.target.checked })} className="h-4 w-4 accent-[#eba236]" />
                          Visible to customers
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!selectedAttributeIds.length || loadingAttributeIds.length > 0}
                  onClick={addVariation}
                  className="rounded-lg border border-[#eba236] px-3 py-2 text-sm font-medium text-[#a66a08] hover:bg-[#eba236]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add variation
                </button>
              </section>
            )}

            {!isEdit && productType === 'grouped' && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Grouped products</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#a1a1aa]">
                    Add existing simple or variable products. Each child must already be actively listed at every outlet selected below.
                  </p>
                </div>
                {groupedItems.map((item, index) => {
                  const selectedProduct = productOptions.find((product) => product.id === Number(item.productId))
                  const selectedProductEligible = eligibleGroupedProducts.some((product) => product.id === selectedProduct?.id)
                  return (
                    <div key={item.id} className="grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-[#333] sm:grid-cols-[1fr_150px_auto]">
                      <label className={labelClass}>
                        Product {index + 1} *
                        <select
                          required
                          value={item.productId}
                          onChange={(event) => updateGroupedItem(item.id, { productId: event.target.value })}
                          className={inputClass}
                        >
                          <option value="">Select an active assigned product</option>
                          {selectedProduct && !selectedProductEligible && (
                            <option value={selectedProduct.id} disabled>
                              {selectedProduct.name} — not assigned to every selected outlet
                            </option>
                          )}
                          {eligibleGroupedProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.productType})
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        Default quantity *
                        <input type="number" min="1" step="1" required value={item.defaultQuantity} onChange={(event) => updateGroupedItem(item.id, { defaultQuantity: event.target.value })} className={inputClass} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setGroupedItems((current) => current.filter((groupedItem) => groupedItem.id !== item.id))}
                        className="self-end rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-[#333] dark:hover:bg-red-900/20"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
                <button
                  type="button"
                  disabled={!eligibleGroupedProducts.some((product) => !groupedItems.some((item) => item.productId === String(product.id)))}
                  onClick={addGroupedItem}
                  className="rounded-lg border border-[#eba236] px-3 py-2 text-sm font-medium text-[#a66a08] hover:bg-[#eba236]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add product
                </button>
                {eligibleGroupedProducts.length === 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {loadingOptions
                      ? 'Eligible products are still loading…'
                      : 'No eligible products are assigned to the selected outlet scope yet. Create and assign simple products first.'}
                  </p>
                )}
              </section>
            )}

            {!isEdit ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Assign to outlets *</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-[#333]">
                    <input type="radio" name="assignmentScope" checked={assignmentScope === 'all'} onChange={() => setAssignmentScope('all')} className="mt-0.5 accent-[#eba236]" />
                    <span><span className="block font-medium text-gray-900 dark:text-white">All active outlets</span><span className="text-xs text-gray-500">Create a listing at each of your {activeOutlets.length} active outlets.</span></span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-[#333]">
                    <input type="radio" name="assignmentScope" checked={assignmentScope === 'outlet'} onChange={() => setAssignmentScope('outlet')} className="mt-0.5 accent-[#eba236]" />
                    <span><span className="block font-medium text-gray-900 dark:text-white">One outlet</span><span className="text-xs text-gray-500">Choose a single active outlet.</span></span>
                  </label>
                </div>
                {assignmentScope === 'outlet' && (
                  <select value={outletId} onChange={(event) => setOutletId(event.target.value)} className={inputClass} aria-label="Select outlet">
                    <option value="">Select an active outlet</option>
                    {activeOutlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.outletName} ({outlet.outletCode})</option>)}
                  </select>
                )}
                {activeOutlets.length === 0 && (
                  <p className={`mt-2 text-xs ${loadingOptions ? 'text-gray-500' : 'text-amber-700'}`}>
                    {loadingOptions ? 'Your active outlets are still loading…' : 'You need an active outlet before creating a product listing.'}
                  </p>
                )}
              </section>
            ) : (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Outlet assignments</h2>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                  {initial?.assignedOutlets?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {initial.assignedOutlets.map((outlet) => (
                        <span key={outlet.id} className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#262626] dark:text-[#a1a1aa]">
                          {outlet.outletName}{outlet.isActive ? '' : ' (inactive)'}
                        </span>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No outlet listings are currently assigned.</p>}
                  <p className="mt-2 text-xs text-gray-500 dark:text-[#a1a1aa]">Editing product details does not change outlet assignments.</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Tag className="h-4 w-4 text-emerald-600" /> Categories</h2>
              {categories.length ? (
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                  {categories.map((category) => (
                    <label key={category.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                      <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} className="accent-[#eba236]" />
                      {category.name}
                    </label>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">{loadingOptions ? 'Active product categories are still loading…' : 'No active product categories are available.'}</p>}
            </section>

            {isEdit && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Tag className="h-4 w-4 text-blue-600" /> Product tags</h2>
                {tags.length ? (
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-[#333]">
                    {tags.map((tag) => (
                      <label key={tag.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 dark:bg-[#0a0a0a] dark:text-[#a1a1aa]">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                          className="accent-[#eba236]"
                        />
                        {tag.name}{!tag.is_active ? ' (inactive)' : ''}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{tagsLoadError || (loadingOptions ? 'Product tags are still loading…' : 'No product tags are available.')}</p>
                )}
              </section>
            )}

            <section>
              <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Product image</h2>
              <MediaUploader value={primaryImage} onChange={(id) => setPrimaryImage(id || undefined)} accept="image/*" maxSize={10} />
            </section>

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-[#eba236]" />
              Active
            </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-[#262626] dark:bg-[#0a0a0a] sm:px-6">
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-[#333] dark:bg-[#171717] dark:text-[#a1a1aa]">Cancel</button>
        <button type="submit" disabled={formDisabled} className="inline-flex items-center gap-2 rounded-lg bg-[#eba236] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c88a20] disabled:cursor-not-allowed disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {isEdit ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  )
}
