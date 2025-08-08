'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  position: 'homepage_hero' | 'homepage_secondary' | 'category_top' | 'restaurant_page' | 'checkout';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  priority: number;
  startDate?: string;
  endDate?: string;
  targetAudience: 'all' | 'new_customers' | 'returning_customers' | 'vip';
  clickCount: number;
  impressions: number;
  createdAt: string;
  createdBy: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockBanners: Banner[] = [
          {
            id: '1',
            title: 'Welcome to Tap2Go',
            description: 'Discover amazing restaurants and get your favorite food delivered fast!',
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
            linkUrl: '/restaurants',
            linkText: 'Order Now',
            position: 'homepage_hero',
            status: 'active',
            priority: 1,
            targetAudience: 'all',
            clickCount: 1234,
            impressions: 15678,
            createdAt: '2024-01-01T00:00:00Z',
            createdBy: 'John Smith',
            backgroundColor: '#FF6B35',
            textColor: '#FFFFFF',
          },
          {
            id: '2',
            title: 'Free Delivery This Weekend',
            description: 'Enjoy free delivery on all orders above $20 this weekend only!',
            imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
            linkUrl: '/promotions/free-delivery',
            linkText: 'Learn More',
            position: 'homepage_secondary',
            status: 'scheduled',
            priority: 2,
            startDate: '2024-01-20T00:00:00Z',
            endDate: '2024-01-21T23:59:59Z',
            targetAudience: 'all',
            clickCount: 0,
            impressions: 0,
            createdAt: '2024-01-15T10:30:00Z',
            createdBy: 'Lisa Wilson',
            backgroundColor: '#4CAF50',
            textColor: '#FFFFFF',
          },
          {
            id: '3',
            title: 'New Restaurant Alert',
            description: 'Check out our newest partner restaurant - Mediterranean Delight!',
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
            linkUrl: '/restaurant/mediterranean-delight',
            linkText: 'Visit Restaurant',
            position: 'category_top',
            status: 'active',
            priority: 3,
            targetAudience: 'all',
            clickCount: 567,
            impressions: 8901,
            createdAt: '2024-01-12T14:20:00Z',
            createdBy: 'Mike Johnson',
            backgroundColor: '#2196F3',
            textColor: '#FFFFFF',
          },
          {
            id: '4',
            title: 'VIP Member Benefits',
            description: 'Unlock exclusive deals and faster delivery as a VIP member!',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
            linkUrl: '/membership/vip',
            linkText: 'Become VIP',
            position: 'restaurant_page',
            status: 'inactive',
            priority: 4,
            targetAudience: 'returning_customers',
            clickCount: 234,
            impressions: 3456,
            createdAt: '2024-01-08T09:15:00Z',
            createdBy: 'Sarah Davis',
            backgroundColor: '#9C27B0',
            textColor: '#FFFFFF',
          },
        ];

        setBanners(mockBanners);
      } catch (error) {
        console.error('Error loading banners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         banner.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || banner.status === selectedStatus;
    const matchesPosition = selectedPosition === 'all' || banner.position === selectedPosition;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getPositionLabel = (position: string) => {
    const labels = {
      homepage_hero: 'Homepage Hero',
      homepage_secondary: 'Homepage Secondary',
      category_top: 'Category Top',
      restaurant_page: 'Restaurant Page',
      checkout: 'Checkout Page',
    };
    return labels[position as keyof typeof labels] || position;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getClickThroughRate = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-32 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Banners Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Create and manage promotional banners for your platform.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Create Banner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg font-semibold text-gray-900">
                  {banners.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {banners.reduce((sum, b) => sum + b.impressions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-lg font-semibold text-gray-900">
                  {banners.reduce((sum, b) => sum + b.clickCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TagIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg CTR</p>
                <p className="text-lg font-semibold text-gray-900">
                  {getClickThroughRate(
                    banners.reduce((sum, b) => sum + b.clickCount, 0),
                    banners.reduce((sum, b) => sum + b.impressions, 0)
                  )}%
                </p>
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
                  placeholder="Search banners..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Position Filter */}
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Positions</option>
                <option value="homepage_hero">Homepage Hero</option>
                <option value="homepage_secondary">Homepage Secondary</option>
                <option value="category_top">Category Top</option>
                <option value="restaurant_page">Restaurant Page</option>
                <option value="checkout">Checkout Page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banners List */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Banners ({filteredBanners.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredBanners.map((banner) => (
              <div key={banner.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Banner Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={128}
                        height={80}
                        className="h-20 w-32 object-cover rounded-lg"
                        unoptimized
                      />
                    </div>

                    {/* Banner Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">{banner.title}</h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(banner.status)}`}>
                            {banner.status}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Priority {banner.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{banner.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Position:</span>
                          <span className="ml-1 text-gray-600">{getPositionLabel(banner.position)}</span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Target:</span>
                          <span className="ml-1 text-gray-600">{banner.targetAudience.replace('_', ' ')}</span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Link:</span>
                          <span className="ml-1 text-gray-600 truncate">
                            {banner.linkUrl ? (
                              <a href={banner.linkUrl} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                                {banner.linkText || 'View'}
                              </a>
                            ) : (
                              'No link'
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-1 text-gray-600">{formatDate(banner.createdAt)}</span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Impressions</span>
                            <span className="text-lg font-semibold text-gray-900">{banner.impressions.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Clicks</span>
                            <span className="text-lg font-semibold text-gray-900">{banner.clickCount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">CTR</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {getClickThroughRate(banner.clickCount, banner.impressions)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      {(banner.startDate || banner.endDate) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-sm text-blue-800">
                            <span className="font-medium">Schedule:</span>
                            <span className="ml-1">
                              {banner.startDate && formatDate(banner.startDate)}
                              {banner.startDate && banner.endDate && ' - '}
                              {banner.endDate && formatDate(banner.endDate)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Created by {banner.createdBy}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center space-y-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-2" title="View Banner">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-2" title="Edit Banner">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-2" title="Delete Banner">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Priority Controls */}
                    <div className="flex flex-col space-y-1">
                      <button className="text-gray-600 hover:text-gray-900 p-1" title="Move Up">
                        <ArrowUpIcon className="h-3 w-3" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1" title="Move Down">
                        <ArrowDownIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBanners.length === 0 && (
            <div className="p-12 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or create your first banner.</p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                Create Your First Banner
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
