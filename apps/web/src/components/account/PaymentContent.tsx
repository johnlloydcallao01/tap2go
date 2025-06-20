'use client';

import React, { useState } from 'react';
import {
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'apple_pay' | 'google_pay';
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  isDefault: boolean;
  brand: string;
}

export default function PaymentContent() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      cardNumber: '**** **** **** 1234',
      expiryDate: '12/25',
      cardholderName: 'John Lloyd',
      isDefault: true,
      brand: 'Visa',
    },
    {
      id: '2',
      type: 'credit',
      cardNumber: '**** **** **** 5678',
      expiryDate: '08/26',
      cardholderName: 'John Lloyd',
      isDefault: false,
      brand: 'Mastercard',
    },
    {
      id: '3',
      type: 'paypal',
      cardNumber: 'john.lloyd@email.com',
      expiryDate: '',
      cardholderName: 'John Lloyd',
      isDefault: false,
      brand: 'PayPal',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (paymentId: string) => {
    setPaymentMethods(methods => methods.map(method => ({
      ...method,
      isDefault: method.id === paymentId
    })));
  };

  const handleDeletePayment = (paymentId: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== paymentId));
  };

  const getPaymentIcon = (type: string, brand: string) => {
    if (type === 'paypal') {
      return (
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">PP</span>
        </div>
      );
    }
    
    if (brand === 'Visa') {
      return (
        <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">V</span>
        </div>
      );
    }
    
    if (brand === 'Mastercard') {
      return (
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">MC</span>
        </div>
      );
    }
    
    return <CreditCardIcon className="h-8 w-8 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Methods</h1>
            <p className="text-gray-600">Manage your payment methods for faster checkout</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800 text-sm">
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getPaymentIcon(method.type, method.brand)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {method.brand} {method.type === 'paypal' ? '' : method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                    </h3>
                    {method.isDefault && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p className="font-medium">{method.cardholderName}</p>
                    <p className="text-lg font-mono">{method.cardNumber}</p>
                    {method.expiryDate && (
                      <p className="text-sm">Expires {method.expiryDate}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePayment(method.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods yet</h3>
          <p className="text-gray-600 mb-6">Add a payment method to make ordering faster and easier</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center mx-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Payment Method
          </button>
        </div>
      )}

      {/* Add Payment Method Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Payment Method</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
                  Set as default payment method
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
