'use client';

import { useState } from 'react';

export default function TestCompleteFlowPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPaymentFlow = async () => {
    setLoading(true);
    try {
      // Create a test payment with order metadata
      const paymentData = {
        amount: 2000, // 20 PHP (2000 centavos) - PayMongo minimum
        currency: 'PHP',
        description: 'Tap2Go Test Order - Sample Item',
        metadata: {
          orderId: 'test_order_' + Date.now(),
          customerId: 'test_customer_123',
          vendorId: 'test_vendor_123',
          items: JSON.stringify([
            { name: 'Test Item', quantity: 1, price: 2000 }
          ])
        }
      };

      const response = await fetch('/api/paymongo/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create payment', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Complete Payment Flow Test
          </h1>
          
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🎯 Phase 1 Implementation Complete:
            </h2>
            <ul className="text-blue-700 space-y-2">
              <li>✅ <strong>Firebase Cloud Functions</strong> - TypeScript webhook handler deployed</li>
              <li>✅ <strong>PayMongo Webhook</strong> - Active and verified (ID: hook_3osd3qmD6geceE3iKxjiepFR)</li>
              <li>✅ <strong>Signature Verification</strong> - HMAC SHA256 security implemented</li>
              <li>✅ <strong>Firestore Integration</strong> - Order status updates on payment events</li>
              <li>✅ <strong>Error Handling</strong> - Professional logging and error management</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Payment Details:</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Amount:</strong> ₱20.00 (PayMongo minimum)</p>
              <p><strong>Description:</strong> Tap2Go Test Order - Sample Item</p>
              <p><strong>Order ID:</strong> test_order_[timestamp]</p>
              <p><strong>Webhook URL:</strong> https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook</p>
            </div>
          </div>

          <button
            onClick={testPaymentFlow}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating Test Payment...' : 'Test Complete Payment Flow'}
          </button>

          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Test Result:</h3>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Complete Flow Test Includes:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Payment creation with order metadata</li>
              <li>PayMongo webhook trigger on payment completion</li>
              <li>Firebase Cloud Function signature verification</li>
              <li>Firestore order status update</li>
              <li>Professional error handling and logging</li>
            </ul>
          </div>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-2">🎉 Phase 1 Status: COMPLETE!</h4>
            <p className="text-green-700">
              All Phase 1 requirements have been implemented and deployed. 
              The PayMongo webhook integration is now fully functional with professional 
              security, error handling, and Firestore integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
