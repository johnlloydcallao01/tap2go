'use client'

import { Receipt } from '@/components/ui/IconWrapper'
import { OrderForm } from '../_components/OrderForm'

export default function NewOrderPage() {
  return (
    <div className="space-y-6 py-5 px-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eba236] text-white"><Receipt className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New order</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Manually create an order for one of your customers.</p>
        </div>
      </div>
      <OrderForm />
    </div>
  )
}
