'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface PaymentMethod {
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

interface PayMongoTestData {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
  apiStatus: string;
  responseStatus: number;
  credentials: {
    publicKey: string;
    secretKey: string;
  };
  realPaymentIntent: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    client_key: string;
    payment_method_allowed: string[];
    description: string;
  };
  supportedPaymentMethods: string[];
  paymentMethodDetails: Record<string, PaymentMethod>;
}

interface PaymentProcessResult {
  success: boolean;
  message: string;
  paymentIntent: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    client_key: string;
    payment_method: string;
    description: string;
  };
  checkoutUrl?: string;
  realPaymentFlow?: boolean;
  nextSteps: {
    title: string;
    steps: string[];
    redirectUrl?: string;
  };
}

export default function PayMongoTestPage() {
  const [testData, setTestData] = useState<PayMongoTestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<PaymentProcessResult | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch('/api/paymongo/simple-test');
        const data = await response.json();
        
        if (data.success) {
          setTestData(data);
        } else {
          setError(data.details || 'PayMongo test failed');
        }
      } catch {
        setError('Failed to connect to PayMongo API');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  const processPayment = async () => {
    if (!selectedMethod || !testData) return;

    setProcessingPayment(true);
    setPaymentResult(null);
    setError(null);

    try {
      const response = await fetch('/api/paymongo/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          amount: testData.realPaymentIntent.amount / 100, // Convert from centavos
          description: testData.realPaymentIntent.description,
          customerInfo: {
            name: 'Test Customer',
            email: 'test@tap2go.com',
            phone: '+639123456789'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setPaymentResult(result);

        // If there's a checkout URL, redirect to it
        if (result.checkoutUrl) {
          console.log('Redirecting to payment URL:', result.checkoutUrl);
          window.open(result.checkoutUrl, '_blank');
        }
      } else {
        setError(result.error || 'Payment processing failed');
      }
    } catch (err) {
      setError('Failed to process payment');
      console.error('Payment processing error:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing PayMongo connection...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">PayMongo Test Failed</h1>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const sampleOrder = {
    items: [
      { name: 'Chicken Adobo Rice Bowl', price: 180, quantity: 1 },
      { name: 'Iced Coffee', price: 85, quantity: 1 }
    ],
    subtotal: 265,
    deliveryFee: 35,
    total: 300
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tap2Go PayMongo Test</h1>
              <p className="text-sm text-gray-500">Payment Integration Verification</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Status */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">PayMongo Integration Status</h2>
              <p className="text-green-600 font-medium">{testData.message}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Environment</p>
              <p className="font-semibold text-green-700">{testData.environment}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">API Status</p>
              <p className="font-semibold text-blue-700">{testData.apiStatus}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Response Code</p>
              <p className="font-semibold text-purple-700">{testData.responseStatus}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Simulation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Checkout Simulation</h3>
            
            {/* Order Summary */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2">
                {sampleOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₱{item.price}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₱{sampleOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₱{sampleOrder.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₱{sampleOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Available Payment Methods</h4>
              <div className="space-y-3">
                {testData.supportedPaymentMethods.map((methodKey) => {
                  const method = testData.paymentMethodDetails[methodKey];
                  if (!method) return null;
                  
                  return (
                    <div
                      key={methodKey}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedMethod === methodKey
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(methodKey)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                        {method.available && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={processPayment}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              disabled={!selectedMethod || processingPayment}
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : selectedMethod ? (
                `Pay ₱${sampleOrder.total} with ${testData.paymentMethodDetails[selectedMethod]?.name}`
              ) : (
                'Select Payment Method'
              )}
            </button>

            {/* Payment Result */}
            {paymentResult && (
              <div className={`mt-6 p-4 border rounded-lg ${
                paymentResult.realPaymentFlow
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  paymentResult.realPaymentFlow
                    ? 'text-orange-900'
                    : 'text-green-900'
                }`}>
                  {paymentResult.realPaymentFlow ? '🔥' : '✅'} {paymentResult.nextSteps.title}
                </h4>

                {paymentResult.realPaymentFlow && (
                  <div className="mb-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-orange-800 font-medium text-sm">
                      🎯 <strong>REAL PAYMENT READY!</strong> This will process an actual ₱300.00 transaction.
                    </p>
                  </div>
                )}

                <div className={`text-sm space-y-1 ${
                  paymentResult.realPaymentFlow
                    ? 'text-orange-800'
                    : 'text-green-800'
                }`}>
                  {paymentResult.nextSteps.steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-2 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                {paymentResult.checkoutUrl && (
                  <div className="mt-4 space-y-2">
                    <a
                      href={paymentResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full text-center font-bold py-3 px-4 rounded-lg text-white transition-colors ${
                        paymentResult.realPaymentFlow
                          ? 'bg-orange-600 hover:bg-orange-700 animate-pulse'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {paymentResult.realPaymentFlow
                        ? `🚀 PROCEED TO REAL ${testData.paymentMethodDetails[selectedMethod]?.name?.toUpperCase()} PAYMENT`
                        : `🚀 Proceed to ${testData.paymentMethodDetails[selectedMethod]?.name}`
                      }
                    </a>
                    {paymentResult.realPaymentFlow && (
                      <p className="text-xs text-orange-600 text-center">
                        ⚠️ Clicking above will redirect you to the actual payment provider and process a real transaction
                      </p>
                    )}
                  </div>
                )}

                <div className={`mt-3 text-xs ${
                  paymentResult.realPaymentFlow
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  Payment Intent ID: {paymentResult.paymentIntent.id}
                </div>
              </div>
            )}
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Details</h3>
            
            {/* API Credentials */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">API Credentials</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Public Key:</span>
                  <span className="font-mono">{testData.credentials.publicKey}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Secret Key:</span>
                  <span className="font-mono">{testData.credentials.secretKey}</span>
                </div>
              </div>
            </div>

            {/* Real Payment Intent */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Real Payment Intent</h4>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{testData.realPaymentIntent.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span>₱{(testData.realPaymentIntent.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Currency:</span>
                  <span>{testData.realPaymentIntent.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize">{testData.realPaymentIntent.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-xs">{testData.realPaymentIntent.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allowed Methods:</span>
                  <span className="text-xs">{testData.realPaymentIntent.payment_method_allowed.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Raw JSON Response */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Raw JSON Response</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                <pre>{JSON.stringify(testData, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
