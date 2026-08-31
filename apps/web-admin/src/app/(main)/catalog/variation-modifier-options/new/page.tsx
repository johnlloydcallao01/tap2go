'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Coins } from '@/components/ui/IconWrapper'
import { VariationModifierOptionForm } from '../_components/VariationModifierOptionForm'

export default function NewVariationModifierOptionPage() {
  const router = useRouter()
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/catalog/variation-modifier-options')
  }
  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#eba236] text-white flex items-center justify-center"><Coins className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New variation modifier option</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Create a variation modifier option for a group.</p>
        </div>
      </div>
      <VariationModifierOptionForm onSuccess={() => router.push('/catalog/variation-modifier-options')} onCancel={handleBack} />
    </div>
  )
}
