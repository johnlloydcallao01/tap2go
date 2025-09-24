'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  orderId: string;
  type: 'payment' | 'refund' | 'payout' | 'fee' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  customerName: string;
  customerEmail: string;
  vendorName?: string;
  description: string;
  processingFee: number;
  netAmount: number;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  referenceId: string;
  gateway: 'stripe' | 'paypal' | 'square' | 'braintree';
  metadata?: {
    cardLast4?: string;
    cardBrand?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export default function AdminFinancialTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockTransactions: Transaction[] = [
          {
            id: 'txn_001',
            orderId: 'ORD-2024-001',
            type: 'payment',
            status: 'completed',
            amount: 45.99,
            currency: 'USD',
            paymentMethod: 'credit_card',
            customerName: 'Sarah Johnson',
            customerEmail: 'sarah.j@email.com',
            vendorName: 'Pizza Palace',
            description: 'Order payment - Large Margherita Pizza + Delivery',
            processingFee: 1.68,
            netAmount: 44.31,
            createdAt: '2024-01-15T10:30:00Z',
            processedAt: '2024-01-15T10:30:15Z',
            referenceId: 'pi_3OkJ8L2eZvKYlo2C0123456789',
            gateway: 'stripe',
            metadata: {
              cardLast4: '4242',
              cardBrand: 'visa',
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            },
          },
          {
            id: 'txn_002',
            orderId: 'ORD-2024-002',
            type: 'payment',
            status: 'failed',
            amount: 32.50,
            currency: 'USD',
            paymentMethod: 'credit_card',
            customerName: 'Mike Chen',
            customerEmail: 'mike.chen@email.com',
            vendorName: 'Burger Barn',
            description: 'Order payment - Double Cheeseburger Combo',
            processingFee: 1.19,
            netAmount: 31.31,
            createdAt: '2024-01-14T18:45:00Z',
            failureReason: 'Insufficient funds',
            referenceId: 'pi_3OkJ8L2eZvKYlo2C0987654321',
            gateway: 'stripe',
            metadata: {
              cardLast4: '1234',
              cardBrand: 'mastercard',
              ipAddress: '192.168.1.101',
            },
          },
          {
            id: 'txn_003',
            orderId: 'ORD-2024-003',
            type: 'refund',
            status: 'completed',
            amount: -28.75,
            currency: 'USD',
            paymentMethod: 'credit_card',
            customerName: 'Emily Rodriguez',
            customerEmail: 'emily.r@email.com',
            vendorName: 'Sushi Zen',
            description: 'Refund for cancelled order - California Roll Set',
            processingFee: -1.05,
            netAmount: -27.70,
            createdAt: '2024-01-14T14:20:00Z',
            processedAt: '2024-01-14T14:22:30Z',
            referenceId: 're_3OkJ8L2eZvKYlo2C0555666777',
            gateway: 'stripe',
            metadata: {
              cardLast4: '5678',
              cardBrand: 'visa',
            },
          },
          {
            id: 'txn_004',
            orderId: 'ORD-2024-004',
            type: 'payment',
            status: 'pending',
            amount: 67.25,
            currency: 'USD',
            paymentMethod: 'paypal',
            customerName: 'David Wilson',
            customerEmail: 'david.w@email.com',
            vendorName: 'Mediterranean Delight',
            description: 'Order payment - Family Feast Platter',
            processingFee: 2.35,
            netAmount: 64.90,
            createdAt: '2024-01-13T20:15:00Z',
            referenceId: 'PAYID-MXYZ123-ABC456789',
            gateway: 'paypal',
          },
          {
            id: 'txn_005',
            orderId: 'ORD-2024-005',
            type: 'payout',
            status: 'completed',
            amount: -1250.00,
            currency: 'USD',
            paymentMethod: 'bank_transfer',
            customerName: 'Vendor Payout',
            customerEmail: 'finance@pizzapalace.com',
            vendorName: 'Pizza Palace',
            description: 'Weekly vendor payout - Jan 8-14, 2024',
            processingFee: 5.00,
            netAmount: -1255.00,
            createdAt: '2024-01-15T09:00:00Z',
            processedAt: '2024-01-15T09:05:00Z',
            referenceId: 'po_3OkJ8L2eZvKYlo2C0111222333',
            gateway: 'stripe',
          },
          {
            id: 'txn_006',
            orderId: 'ORD-2024-006',
            type: 'payment',
            status: 'disputed',
            amount: 89.99,
            currency: 'USD',
            paymentMethod: 'credit_card',
            customerName: 'Lisa Thompson',
            customerEmail: 'lisa.t@email.com',
            vendorName: 'Steakhouse Prime',
            description: 'Order payment - Premium Ribeye Dinner',
            processingFee: 3.15,
            netAmount: 86.84,
            createdAt: '2024-01-12T19:30:00Z',
            processedAt: '2024-01-12T19:30:45Z',
            referenceId: 'pi_3OkJ8L2eZvKYlo2C0444555666',
            gateway: 'stripe',
            metadata: {
              cardLast4: '9876',
              cardBrand: 'amex',
              ipAddress: '192.168.1.102',
            },
          },
        ];

        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.vendorName && transaction.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesMethod = selectedMethod === 'all' || transaction.paymentMethod === selectedMethod;
    
    return matchesSearch && matchesStatus && matchesType && matchesMethod;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      disputed: 'bg-orange-100 text-orange-800',
    };
    
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status: Transaction['status']) => {
    const icons = {
      pending: ClockIcon,
      completed: CheckCircleIcon,
      failed: XCircleIcon,
      cancelled: XCircleIcon,
      disputed: ExclamationTriangleIcon,
    };
    
    return icons[status] || ClockIcon;
  };

  const getTypeIcon = (type: Transaction['type']) => {
    const icons = {
      payment: ArrowDownIcon,
      refund: ArrowUpIcon,
      payout: ArrowUpIcon,
      fee: ArrowUpIcon,
      adjustment: ArrowUpIcon,
    };
    
    return icons[type] || ArrowDownIcon;
  };

  const formatAmount = (amount: number, currency: string) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(absAmount);
    
    return isNegative ? `-${formatted}` : formatted;
  };

  const getPaymentMethodLabel = (method: Transaction['paymentMethod']) => {
    const labels = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      bank_transfer: 'Bank Transfer',
    };
    
    return labels[method] || method;
  };

  const totalVolume = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalFees = filteredTransactions.reduce((sum, t) => sum + t.processingFee, 0);
  const successfulTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
  const successRate = filteredTransactions.length > 0 ? (successfulTransactions / filteredTransactions.length * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Financial Transactions</h1>
            <p className="text-sm lg:text-base text-gray-600">Monitor and manage all payment transactions across the platform.</p>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-lg font-semibold text-gray-900">${totalVolume.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-lg font-semibold text-gray-900">{successRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-lg font-semibold text-gray-900">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Processing Fees</p>
                <p className="text-lg font-semibold text-gray-900">${totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, order ID, customer, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="payment">Payments</option>
              <option value="refund">Refunds</option>
              <option value="payout">Payouts</option>
              <option value="fee">Fees</option>
              <option value="adjustment">Adjustments</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="google_pay">Google Pay</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer/Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  const TypeIcon = getTypeIcon(transaction.type);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'payment' ? 'bg-green-100' :
                              transaction.type === 'refund' ? 'bg-red-100' :
                              transaction.type === 'payout' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <TypeIcon className={`h-4 w-4 ${
                                transaction.type === 'payment' ? 'text-green-600' :
                                transaction.type === 'refund' ? 'text-red-600' :
                                transaction.type === 'payout' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                            <div className="text-sm text-gray-500">Order: {transaction.orderId}</div>
                            <div className="text-xs text-gray-400 capitalize">{transaction.type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                        <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                        {transaction.vendorName && (
                          <div className="text-xs text-gray-400">via {transaction.vendorName}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: ${transaction.processingFee.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Net: {formatAmount(transaction.netAmount, transaction.currency)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getPaymentMethodLabel(transaction.paymentMethod)}</div>
                        {transaction.metadata?.cardLast4 && (
                          <div className="text-xs text-gray-500">
                            •••• {transaction.metadata.cardLast4}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 capitalize">{transaction.gateway}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                        {transaction.failureReason && (
                          <div className="text-xs text-red-500 mt-1">{transaction.failureReason}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                        {transaction.processedAt && (
                          <div className="text-xs text-green-600">
                            Processed: {new Date(transaction.processedAt).toLocaleTimeString()}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-orange-600 hover:text-orange-900 mr-3">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
  );
}
