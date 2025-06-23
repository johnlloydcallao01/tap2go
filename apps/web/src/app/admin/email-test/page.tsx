'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    messageId?: string;
    metadata?: Record<string, unknown>;
    emailService?: Record<string, unknown>;
    error?: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail,
          testType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/email/send');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status check failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            📧 Email Service Test Panel
          </h1>

          {/* Status Check */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Service Status
            </h2>
            <button
              onClick={checkStatus}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Check Email Service Status
            </button>
          </div>

          {/* Test Form */}
          <form onSubmit={handleTest} className="space-y-6">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="your-email@example.com"
              />
            </div>

            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="basic">Basic Configuration Test</option>
                <option value="order_confirmation">Order Confirmation Email</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !testEmail}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Test Email...' : 'Send Test Email'}
            </button>
          </form>

          {/* Results */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {result.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <div className="space-y-2 text-sm">
                {result.messageId && (
                  <p><strong>Message ID:</strong> {result.messageId}</p>
                )}
                {result.metadata && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                {result.emailService && (
                  <div>
                    <strong>Service Status:</strong>
                    <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.emailService, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🧪 Development Testing
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>✅ No domain setup required for testing!</strong></p>
              <p>• Emails will be sent from Resend&apos;s test domain (onboarding@resend.dev)</p>
              <p>• Test emails may go to your spam folder</p>
              <p>• You only need a valid RESEND_API_KEY in your .env.local</p>
              <p>• When ready for production, set up your custom domain</p>
            </div>
          </div>

          {/* Quick Setup */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🚀 Quick Setup
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. Get API key: <a href="https://resend.com/api-keys" target="_blank" className="text-blue-600 hover:underline">resend.com/api-keys</a></p>
              <p>2. Add to .env.local: <code className="bg-gray-200 px-1 rounded">RESEND_API_KEY=re_your_key</code></p>
              <p>3. Set: <code className="bg-gray-200 px-1 rounded">ENABLE_EMAIL_NOTIFICATIONS=true</code></p>
              <p>4. Test above! 🎉</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
