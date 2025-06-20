'use client';

import React, { useState, useEffect } from 'react';
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
  XCircleIcon,
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
  // Removed unused variable: showCreateModal

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
            targetAudience: 'returning_customers',
            clickCount: 567,
            impressions: 8901,
            createdAt: '2024-01-10T14:20:00Z',
            createdBy: 'David Brown',
            backgroundColor: '#2196F3',
            textColor: '#FFFFFF',
          },
          {
            id: '4',
            title: 'VIP Member Benefits',
            description: 'Become a VIP member and enjoy exclusive discounts and perks!',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
            linkUrl: '/membership/vip',
            linkText: 'Join VIP',
            position: 'restaurant_page',
            status: 'active',
            priority: 4,
            targetAudience: 'new_customers',
            clickCount: 234,
            impressions: 3456,
            createdAt: '2024-01-05T09:15:00Z',
            createdBy: 'Emily Rodriguez',
            backgroundColor: '#9C27B0',
            textColor: '#FFFFFF',
          },
          {
            id: '5',
            title: 'Holiday Special Ended',
            description: 'Thank you for participating in our holiday special promotion!',
            imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
            position: 'homepage_hero',
            status: 'expired',
            priority: 1,
            startDate: '2023-12-01T00:00:00Z',
            endDate: '2023-12-31T23:59:59Z',
            targetAudience: 'all',
            clickCount: 2345,
            impressions: 23456,
            createdAt: '2023-11-25T16:45:00Z',
            createdBy: 'Mike Chen',
            backgroundColor: '#FF5722',
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
    const matchesSearch = 
      banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || banner.status === selectedStatus;
    const matchesPosition = selectedPosition === 'all' || banner.position === selectedPosition;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusBadge = (status: Banner['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
    };
    
    return badges[status] || badges.inactive;
  };

  const getPositionLabel = (position: Banner['position']) => {
    const labels = {
      homepage_hero: 'Homepage Hero',
      homepage_secondary: 'Homepage Secondary',
      category_top: 'Category Top',
      restaurant_page: 'Restaurant Page',
      checkout: 'Checkout Page',
    };
    
    return labels[position] || position;
  };

  const handleStatusChange = (bannerId: string, newStatus: Banner['status']) => {
    setBanners(prev => 
      prev.map(banner => 
        banner.id === bannerId ? { ...banner, status: newStatus } : banner
      )
    );
  };

  const handlePriorityChange = (bannerId: string, direction: 'up' | 'down') => {
    setBanners(prev => {
      const bannerIndex = prev.findIndex(b => b.id === bannerId);
      if (bannerIndex === -1) return prev;
      
      const newBanners = [...prev];
      const currentBanner = newBanners[bannerIndex];
      
      if (direction === 'up' && currentBanner.priority > 1) {
        // Find banner with priority - 1 and swap
        const targetIndex = newBanners.findIndex(b => b.priority === currentBanner.priority - 1);
        if (targetIndex !== -1) {
          newBanners[targetIndex].priority = currentBanner.priority;
          currentBanner.priority = currentBanner.priority - 1;
        }
      } else if (direction === 'down') {
        // Find banner with priority + 1 and swap
        const targetIndex = newBanners.findIndex(b => b.priority === currentBanner.priority + 1);
        if (targetIndex !== -1) {
          newBanners[targetIndex].priority = currentBanner.priority;
          currentBanner.priority = currentBanner.priority + 1;
        }
      }
      
      return newBanners.sort((a, b) => a.priority - b.priority);
    });
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Create and manage promotional banners across the platform.</p>
        </div>
        <button
          onClick={() => console.log('Create banner modal would open')}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Banner
        </button>
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
              <EyeIcon className="h-6 w-6 text-blue-600" />
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
              <TagIcon className="h-6 w-6 text-purple-600" />
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
              <PhotoIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg CTR</p>
              <p className="text-lg font-semibold text-gray-900">
                {calculateCTR(
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
                placeholder="Search banners by title or description..."
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
          {filteredBanners.sort((a, b) => a.priority - b.priority).map((banner) => (
            <div key={banner.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                {/* Banner Image */}
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-24 w-40 object-cover rounded-lg"
                  />
                </div>

                {/* Banner Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{banner.title}</h4>
                      <p className="text-sm text-gray-600">{banner.description}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(banner.status)}`}>
                        {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                      </span>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        Priority {banner.priority}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Position</p>
                      <p className="text-sm text-gray-900">{getPositionLabel(banner.position)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Target Audience</p>
                      <p className="text-sm text-gray-900">{banner.targetAudience.replace('_', ' ')}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Impressions</p>
                      <p className="text-sm text-gray-900">{banner.impressions.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Clicks (CTR)</p>
                      <p className="text-sm text-gray-900">
                        {banner.clickCount.toLocaleString()} ({calculateCTR(banner.clickCount, banner.impressions)}%)
                      </p>
                    </div>
                  </div>

                  {/* Link Info */}
                  {banner.linkUrl && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Link:</strong> {banner.linkUrl}
                        {banner.linkText && <span> • Button: &quot;{banner.linkText}&quot;</span>}
                      </p>
                    </div>
                  )}

                  {/* Schedule Info */}
                  {(banner.startDate || banner.endDate) && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Schedule:</strong>
                        {banner.startDate && ` From ${new Date(banner.startDate).toLocaleDateString()}`}
                        {banner.endDate && ` to ${new Date(banner.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Preview
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>

                      {banner.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(banner.id, 'inactive')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Deactivate
                        </button>
                      )}

                      {banner.status === 'inactive' && (
                        <button
                          onClick={() => handleStatusChange(banner.id, 'active')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      )}

                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    {/* Priority Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePriorityChange(banner.id, 'up')}
                        disabled={banner.priority === 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePriorityChange(banner.id, 'down')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Created Info */}
                  <div className="mt-2 text-xs text-gray-500">
                    Created by {banner.createdBy} on {new Date(banner.createdAt).toLocaleDateString()}
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
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => console.log('Create banner modal would open')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Create Your First Banner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
