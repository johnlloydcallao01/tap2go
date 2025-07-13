import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Thank you for using Tap2Go!
        </p>
        <div className="space-y-3">
          <Link
            href="/paymongo-test"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Payment Test
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
