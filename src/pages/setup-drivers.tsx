import { useState } from 'react';
import Head from 'next/head';

export default function SetupDrivers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setupDrivers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/setup-drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to setup drivers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Setup Drivers - Tap2Go</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Setup Drivers Database
            </h1>
            
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-600 mb-6">
                Click the button below to add sample driver data to your Firestore database.
              </p>
              
              <button
                onClick={setupDrivers}
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting up drivers...
                  </>
                ) : (
                  'Setup Drivers Database'
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {result && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success!</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{result.message}</p>
                        <div className="mt-2">
                          <p><strong>Added:</strong></p>
                          <ul className="list-disc list-inside">
                            <li>{result.summary.drivers} drivers</li>
                            <li>{result.summary.users} user documents</li>
                            <li>{result.summary.earnings} earnings records</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {result && (
                <div className="mt-6 text-left">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
                  <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600 max-h-40 overflow-y-auto">
                    {result.results.map((item: string, index: number) => (
                      <div key={index} className="mb-1">✅ {item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>This will add sample drivers to your Firestore database:</p>
              <ul className="mt-2 text-left">
                <li>• John Smith (Active motorcycle driver)</li>
                <li>• Maria Garcia (Active bicycle driver)</li>
                <li>• David Johnson (Pending car driver)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
