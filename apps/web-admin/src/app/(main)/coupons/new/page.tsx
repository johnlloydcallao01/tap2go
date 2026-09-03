'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Ticket } from '@/components/ui/IconWrapper'
import { CouponForm } from '../_components/CouponForm'

export default function NewCouponPage() {
  const router = useRouter()
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/coupons')
  }
  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#eba236] text-white flex items-center justify-center"><Ticket className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create coupon</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">New promo code for a brand, branch, or the whole platform.</p>
        </div>
      </div>
      <CouponForm onSuccess={() => router.push('/coupons')} onCancel={handleBack} />
    </div>
  )
}
