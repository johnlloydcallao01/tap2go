'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface BankingDetails {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  isVerified: boolean;
  isPrimary: boolean;
  addedDate: string;
  lastUsed?: string;
  status: 'active' | 'pending' | 'suspended';
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'debit_card' | 'paypal';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
  addedDate: string;
}

const mockBankingDetails: BankingDetails[] = [
  {
    id: '1',
    accountHolderName: 'Restaurant Business LLC',
    bankName: 'Chase Bank',
    accountNumber: '****1234',
    routingNumber: '021000021',
    accountType: 'checking',
    isVerified: true,
    isPrimary: true,
    addedDate: '2024-01-15',
    lastUsed: '2024-01-20',
    status: 'active',
  },
  {
    id: '2',
    accountHolderName: 'Restaurant Business LLC',
    bankName: 'Bank of America',
    accountNumber: '****5678',
    routingNumber: '026009593',
    accountType: 'savings',
    isVerified: false,
    isPrimary: false,
    addedDate: '2024-01-10',
    status: 'pending',
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'bank_account',
    name: 'Chase Business Checking',
    details: 'Ending in 1234',
    isDefault: true,
    isVerified: true,
    addedDate: '2024-01-15',
  },
  {
    id: '2',
    type: 'debit_card',
    name: 'Business Debit Card',
    details: 'Visa ending in 9876',
    isDefault: false,
    isVerified: true,
    addedDate: '2024-01-10',
  },
];

export default function VendorBankingSettings() {
  const [bankingDetails, setBankingDetails] = useState<BankingDetails[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankingDetails | null>(null);

  useEffect(() => {
    const loadBankingInfo = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBankingDetails(mockBankingDetails);
        setPaymentMethods(mockPaymentMethods);
      } catch (error) {
        console.error('Error loading banking details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBankingInfo();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banking Details</h1>
              <p className="text-gray-600">Manage your bank accounts and payment methods</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/settings" className="btn-secondary">
                Back to Settings
              </Link>
              <button
                onClick={() => setShowAddBankForm(true)}
                className="btn-primary flex items-center"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Add Bank Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Secure Banking</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Your banking information is encrypted and securely stored. We use bank-level security to protect your financial data.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Bank Account */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Primary Bank Account</h2>
          <p className="text-gray-600 mt-1">Your main account for receiving payouts</p>
        </div>
        <div className="p-6">
          {bankingDetails.filter(account => account.isPrimary).map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{account.bankName}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Primary
                      </span>
                      {account.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Account Holder:</span> {account.accountHolderName}</p>
                      <p><span className="font-medium">Account Number:</span> {account.accountNumber}</p>
                      <p><span className="font-medium">Routing Number:</span> {account.routingNumber}</p>
                      <p><span className="font-medium">Account Type:</span> {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</p>
                      <p><span className="font-medium">Added:</span> {formatDate(account.addedDate)}</p>
                      {account.lastUsed && (
                        <p><span className="font-medium">Last Used:</span> {formatDate(account.lastUsed)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                    {getStatusIcon(account.status)}
                    <span className="ml-1 capitalize">{account.status}</span>
                  </span>
                  <button
                    onClick={() => setEditingAccount(account)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Bank Accounts */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Additional Bank Accounts</h2>
              <p className="text-gray-600 mt-1">Backup accounts and alternative payment methods</p>
            </div>
            <button
              onClick={() => setShowAddBankForm(true)}
              className="btn-secondary flex items-center"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Add Account
            </button>
          </div>
        </div>
        <div className="p-6">
          {bankingDetails.filter(account => !account.isPrimary).length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No additional bank accounts added</p>
              <button
                onClick={() => setShowAddBankForm(true)}
                className="mt-4 btn-primary"
              >
                Add Bank Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bankingDetails.filter(account => !account.isPrimary).map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <BanknotesIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900">{account.bankName}</h3>
                          {account.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Account:</span> {account.accountNumber}</p>
                          <p><span className="font-medium">Type:</span> {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</p>
                          <p><span className="font-medium">Added:</span> {formatDate(account.addedDate)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                        {getStatusIcon(account.status)}
                        <span className="ml-1 capitalize">{account.status}</span>
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Set as Primary
                      </button>
                      <button
                        onClick={() => setEditingAccount(account)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payout Schedule */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Payout Schedule</h2>
          <p className="text-gray-600 mt-1">Configure when and how you receive payments</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Frequency
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="weekly">Weekly (Mondays)</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payout Amount
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="50">$50.00</option>
                <option value="100">$100.00</option>
                <option value="250">$250.00</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button className="btn-primary">
              Save Payout Settings
            </button>
          </div>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Account Verification Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>To receive payouts, all bank accounts must be verified. This typically takes 1-2 business days.</p>
              <p className="mt-1">Required documents: Bank statement or voided check</p>
            </div>
            <div className="mt-3">
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                Upload Verification Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bank Form Modal Placeholder */}
      {showAddBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Bank Account</h3>
            <p className="text-gray-600 mb-4">Bank account setup functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddBankForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal Placeholder */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Bank Account</h3>
            <p className="text-gray-600 mb-4">Editing {editingAccount.bankName} account</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Debug */}
      {paymentMethods.length > 0 && (
        <div className="hidden">
          Debug: {paymentMethods.length} payment methods loaded
        </div>
      )}
    </div>
  );
}
