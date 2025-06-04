'use client';

import { useState } from 'react';

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<string>('Click "Refresh Logs" to see Firebase Function logs...');
  const [loading, setLoading] = useState(false);

  const refreshLogs = async () => {
    setLoading(true);
    try {
      // This would typically call a backend API to get Firebase logs
      // For now, we'll show instructions
      setLogs(`
Firebase Functions Logs - Manual Check Required:

To view real-time webhook logs, run this command in your terminal:
firebase functions:log --only paymongoWebhook

Recent webhook events should show:
✅ &quot;PayMongo webhook received&quot;
✅ &quot;Webhook signature verified successfully&quot;
✅ &quot;Processing successful payment&quot;
✅ &quot;Order status updated to paid&quot;

If you see errors:
❌ &quot;Missing PayMongo signature header&quot;
❌ &quot;Invalid webhook signature&quot;
❌ &quot;Invalid webhook payload&quot;

This indicates the webhook security is working correctly.

To test the complete flow:
1. Go to /paymongo-test
2. Create a payment with GCash
3. Complete the payment
4. Check these logs for webhook processing
      `);
    } catch (error) {
      setLogs('Error fetching logs: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            📊 Webhook Logs Monitor
          </h1>
          
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🔍 How to Monitor Webhook Events:
            </h2>
            <div className="text-blue-700 space-y-2">
              <p><strong>Command:</strong> <code>firebase functions:log --only paymongoWebhook</code></p>
              <p><strong>Webhook URL:</strong> https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook</p>
              <p><strong>Webhook ID:</strong> hook_3osd3qmD6geceE3iKxjiepFR</p>
            </div>
          </div>

          <button
            onClick={refreshLogs}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 mb-6"
          >
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </button>

          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-96">
            <pre>{logs}</pre>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">✅ Success Indicators:</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• &quot;Webhook signature verified successfully&quot;</li>
                <li>• &quot;Processing successful payment&quot;</li>
                <li>• &quot;Order status updated to paid&quot;</li>
                <li>• HTTP 200 responses</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error Indicators:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• &quot;Invalid webhook signature&quot;</li>
                <li>• &quot;Missing signature&quot;</li>
                <li>• &quot;Invalid payload&quot;</li>
                <li>• HTTP 401/400/500 responses</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Testing Steps:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open terminal and run: <code>firebase functions:log --only paymongoWebhook</code></li>
              <li>Go to <a href="/paymongo-test" className="text-blue-600 hover:underline">/paymongo-test</a></li>
              <li>Create and complete a test payment</li>
              <li>Watch the terminal for webhook events</li>
              <li>Verify order status updates in Firestore</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
