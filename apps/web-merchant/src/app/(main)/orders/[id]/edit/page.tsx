'use client'

import { useParams, notFound } from 'next/navigation'
import { Receipt } from '@/components/ui/IconWrapper'
import { OrderForm } from '../../_components/OrderForm'

export default function EditOrderPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  if (!/^\d+$/.test(id)) notFound()

  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eba236] text-white"><Receipt className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit order</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Update the order details for one of your outlets.</p>
        </div>
      </div>
      <OrderForm orderId={id} />
    </div>
  )
}
