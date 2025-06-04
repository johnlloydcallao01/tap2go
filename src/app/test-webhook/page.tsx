'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/paymongo/create-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to create webhook', details: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔗 PayMongo Webhook Creation Test
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Firebase Cloud Function URL:</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">
                https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook
              </code>
            </div>
          </div>

          <button
            onClick={createWebhook}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating Webhook...' : 'Create PayMongo Webhook'}
          </button>

          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Result:</h3>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">What this does:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Creates a webhook endpoint in PayMongo</li>
              <li>Points to our deployed Firebase Cloud Function</li>
              <li>Listens for payment.paid, payment.failed, and source.chargeable events</li>
              <li>Enables real-time payment notifications for Tap2Go</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
