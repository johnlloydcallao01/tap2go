'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Package } from '@/components/ui/IconWrapper'
import { ClientOnly } from '@/components/ClientOnly'
import { ProductForm, type ProductDoc } from '@/components/products/ProductForm'

function ProductPageSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#262626]" />
      <div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-[#171717]" />
    </div>
  )
}

function EditProductContent() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  if (!/^[1-9]\d*$/.test(id)) notFound()

  const [product, setProduct] = useState<ProductDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadProduct() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/products/${id}`, { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load product.')
        if (active) setProduct(data.doc as ProductDoc)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load product.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadProduct()
    return () => {
      active = false
    }
  }, [id])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/products')
  }

  if (loading) return <ProductPageSkeleton />
  if (error || !product) {
    return (
      <div className="space-y-6 py-5 px-2.5">
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-[#262626] dark:bg-[#171717]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20"><AlertCircle className="h-7 w-7 text-red-500" /></div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Failed to load product</h2>
          <p className="mt-1 text-sm text-gray-500">{error || 'Product not found.'}</p>
          <Link href="/products" className="mt-4 rounded-lg bg-[#eba236] px-4 py-2 text-sm font-medium text-white">Back to products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eba236] text-white"><Package className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Edit product</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">#{product.id} · {product.name}</p>
        </div>
      </div>
      <ProductForm
        mode="edit"
        initial={product}
        onCancel={handleBack}
        onSuccess={() => router.push('/products')}
      />
    </div>
  )
}

export default function EditProductPage() {
  return (
    <ClientOnly fallback={<ProductPageSkeleton />}>
      <EditProductContent />
    </ClientOnly>
  )
}
