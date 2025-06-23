'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  StarIcon,
  ChartBarIcon,
  TrophyIcon,
  HeartIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  joinDate: string;
  favoriteItems: string[];
  rating: number;
  isVip: boolean;
  status: 'active' | 'inactive' | 'blocked';
  loyaltyPoints: number;
}

interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  topSpenders: Customer[];
  customerRetentionRate: number;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    avatar: '/api/placeholder/40/40',
    totalOrders: 23,
    totalSpent: 567.89,
    averageOrderValue: 24.69,
    lastOrderDate: '2024-01-20',
    joinDate: '2023-08-15',
    favoriteItems: ['Margherita Pizza', 'Caesar Salad'],
    rating: 5,
    isVip: true,
    status: 'active',
    loyaltyPoints: 1250,
  },
  {
    id: '2',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1-555-0124',
    totalOrders: 18,
    totalSpent: 432.50,
    averageOrderValue: 24.03,
    lastOrderDate: '2024-01-19',
    joinDate: '2023-09-22',
    favoriteItems: ['Pepperoni Pizza', 'Chicken Wings'],
    rating: 4,
    isVip: false,
    status: 'active',
    loyaltyPoints: 865,
  },
  {
    id: '3',
    name: 'Emily Wilson',
    email: 'emily.wilson@email.com',
    phone: '+1-555-0125',
    avatar: '/api/placeholder/40/40',
    totalOrders: 31,
    totalSpent: 789.25,
    averageOrderValue: 25.46,
    lastOrderDate: '2024-01-18',
    joinDate: '2023-06-10',
    favoriteItems: ['Vegetarian Pizza', 'Greek Salad', 'Tiramisu'],
    rating: 5,
    isVip: true,
    status: 'active',
    loyaltyPoints: 1580,
  },
  {
    id: '4',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0126',
    totalOrders: 7,
    totalSpent: 156.75,
    averageOrderValue: 22.39,
    lastOrderDate: '2024-01-15',
    joinDate: '2023-12-05',
    favoriteItems: ['Hawaiian Pizza'],
    rating: 3,
    isVip: false,
    status: 'active',
    loyaltyPoints: 315,
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa.brown@email.com',
    phone: '+1-555-0127',
    totalOrders: 45,
    totalSpent: 1234.80,
    averageOrderValue: 27.44,
    lastOrderDate: '2024-01-21',
    joinDate: '2023-03-18',
    favoriteItems: ['Meat Lovers Pizza', 'Buffalo Wings', 'Chocolate Cake'],
    rating: 5,
    isVip: true,
    status: 'active',
    loyaltyPoints: 2470,
  },
];

const mockStats: CustomerStats = {
  totalCustomers: 1247,
  newCustomersThisMonth: 89,
  returningCustomers: 892,
  averageLifetimeValue: 156.75,
  topSpenders: mockCustomers.slice(0, 3),
  customerRetentionRate: 71.5,
};

export default function VendorCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalSpent');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCustomers(mockCustomers);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'totalSpent':
        return b.totalSpent - a.totalSpent;
      case 'totalOrders':
        return b.totalOrders - a.totalOrders;
      case 'lastOrder':
        return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      case 'joinDate':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      )
    ));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Insights</h1>
              <p className="text-gray-600">Understand your customers and build relationships</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HeartIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Returning Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.returningCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Lifetime Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageLifetimeValue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Customers */}
      {stats && (
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-orange-500" />
              Top Customers
            </h2>
            <p className="text-gray-600 mt-1">Your most valuable customers</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topSpenders.map((customer, index) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      {customer.avatar ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-12 h-12 rounded-full"
                          />
                        </>
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <div className="flex">{renderStars(customer.rating)}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium text-gray-900">${customer.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium text-gray-900">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Order:</span>
                      <span className="font-medium text-gray-900">${customer.averageOrderValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="totalSpent">Sort by Total Spent</option>
                <option value="totalOrders">Sort by Total Orders</option>
                <option value="lastOrder">Sort by Last Order</option>
                <option value="joinDate">Sort by Join Date</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{sortedCustomers.length} customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Customers</h2>
        </div>
        <div className="p-6">
          {sortedCustomers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No customers found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCustomers.map((customer) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {customer.avatar ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-12 h-12 rounded-full"
                          />
                        </>
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{customer.name}</h3>
                          {customer.isVip && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{customer.email}</span>
                          <span>{customer.phone}</span>
                          <div className="flex">{renderStars(customer.rating)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Orders</p>
                          <p className="font-medium text-gray-900">{customer.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Spent</p>
                          <p className="font-medium text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Order</p>
                          <p className="font-medium text-gray-900">{formatDate(customer.lastOrderDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Favorite Items:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.favoriteItems.slice(0, 3).map((item, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item}
                            </span>
                          ))}
                          {customer.favoriteItems.length > 3 && (
                            <span className="text-xs text-gray-500">+{customer.favoriteItems.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Loyalty Points</p>
                        <p className="font-medium text-orange-600">{customer.loyaltyPoints} pts</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
