'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Store } from '@/components/ui/IconWrapper';
import { OutletForm } from '../_components/OutletForm';

export default function NewOutletPage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/outlets');
  };

  return (
    <div className="space-y-6 py-5 px-2.5">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[#eba236] text-white flex items-center justify-center"><Store className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create new outlet</h1>
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Add a new store branch for your business.</p>
        </div>
      </div>
      <OutletForm onSuccess={() => router.push('/outlets')} onCancel={handleBack} />
    </div>
  );
}
