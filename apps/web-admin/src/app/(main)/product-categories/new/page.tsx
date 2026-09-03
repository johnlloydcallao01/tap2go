'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Tag } from '@/components/ui/IconWrapper'
import { ProductCategoryForm } from '../_components/ProductCategoryForm'

export default function NewProductCategoryPage() {
  const router = useRouter()
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/product-categories')
  }
  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#eba236] text-white flex items-center justify-center">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create product category</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Add a new hierarchical category for products.</p>
        </div>
      </div>
      <ProductCategoryForm onSuccess={() => router.push('/product-categories')} onCancel={handleBack} />
    </div>
  )
}
