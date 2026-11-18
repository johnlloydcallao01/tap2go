'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@encreasl/client-services'
import { ArrowLeft, Package } from '@/components/ui/IconWrapper'
import { ClientOnly } from '@/components/ClientOnly'
import { ProductCreateForm } from '../_components/ProductCreateForm'

function NewProductSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#262626]" />
      <div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-[#171717]" />
    </div>
  )
}

function NewProductContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/products')
  }
  const handleSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProducts().slice(0, 2) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminMerchantProducts().slice(0, 2) }),
    ])
    router.push('/products')
  }

  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-[#a1a1aa] dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eba236] text-white"><Package className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Create product</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Create a vendor-owned catalog product and configure its outlet listings.</p>
        </div>
      </div>
      <ProductCreateForm onSuccess={handleSuccess} onCancel={handleBack} />
    </div>
  )
}

export default function NewProductPage() {
  return (
    <ClientOnly fallback={<NewProductSkeleton />}>
      <NewProductContent />
    </ClientOnly>
  )
}
