'use client';

import React, { useState, useEffect } from 'react';
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'social';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetAudience: {
    type: 'all' | 'segment' | 'custom';
    criteria?: string[];
    estimatedReach: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  content: {
    subject?: string;
    message: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  budget?: number;
  createdAt: string;
  createdBy: string;
  lastModified: string;
}

export default function AdminMarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  // Removed unused variable: showCreateModal, setShowCreateModal

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCampaigns: Campaign[] = [
          {
            id: '1',
            name: 'New Year Welcome Campaign',
            description: 'Welcome new users with special offers and introduce them to our platform',
            type: 'email',
            status: 'active',
            targetAudience: {
              type: 'segment',
              criteria: ['new_users', 'last_30_days'],
              estimatedReach: 2500,
            },
            schedule: {
              startDate: '2024-01-01T00:00:00Z',
              endDate: '2024-01-31T23:59:59Z',
              frequency: 'weekly',
            },
            content: {
              subject: 'Welcome to Tap2Go - Get 30% Off Your First Order!',
              message: 'Welcome to the Tap2Go family! We\'re excited to have you on board. Use code WELCOME30 to get 30% off your first order.',
              imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600',
              ctaText: 'Order Now',
              ctaUrl: '/restaurants',
            },
            metrics: {
              sent: 2234,
              delivered: 2198,
              opened: 1456,
              clicked: 567,
              converted: 234,
              revenue: 5670.50,
            },
            budget: 1500,
            createdAt: '2023-12-20T10:00:00Z',
            createdBy: 'John Smith',
            lastModified: '2024-01-15T14:30:00Z',
          },
          {
            id: '2',
            name: 'Weekend Flash Sale Push',
            description: 'Push notification campaign for weekend flash sale promotion',
            type: 'push',
            status: 'scheduled',
            targetAudience: {
              type: 'segment',
              criteria: ['active_users', 'last_7_days'],
              estimatedReach: 8500,
            },
            schedule: {
              startDate: '2024-01-20T18:00:00Z',
              frequency: 'once',
            },
            content: {
              message: '⚡ Flash Sale Alert! 50% off selected restaurants this weekend only. Don\'t miss out!',
              ctaText: 'Shop Now',
              ctaUrl: '/flash-sale',
            },
            metrics: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              converted: 0,
              revenue: 0,
            },
            budget: 800,
            createdAt: '2024-01-15T09:15:00Z',
            createdBy: 'Lisa Wilson',
            lastModified: '2024-01-16T11:20:00Z',
          },
          {
            id: '3',
            name: 'VIP Customer Retention',
            description: 'SMS campaign to re-engage VIP customers who haven\'t ordered recently',
            type: 'sms',
            status: 'completed',
            targetAudience: {
              type: 'custom',
              criteria: ['vip_customers', 'no_order_30_days'],
              estimatedReach: 450,
            },
            schedule: {
              startDate: '2024-01-10T12:00:00Z',
              endDate: '2024-01-12T12:00:00Z',
              frequency: 'once',
            },
            content: {
              message: 'We miss you! As a VIP member, enjoy 25% off your next order. Use code VIP25. Valid for 48 hours.',
              ctaText: 'Order Now',
              ctaUrl: '/restaurants',
            },
            metrics: {
              sent: 445,
              delivered: 442,
              opened: 398,
              clicked: 156,
              converted: 89,
              revenue: 2340.75,
            },
            budget: 200,
            createdAt: '2024-01-08T16:45:00Z',
            createdBy: 'David Brown',
            lastModified: '2024-01-12T15:30:00Z',
          },
          {
            id: '4',
            name: 'Restaurant Partner Spotlight',
            description: 'In-app campaign highlighting featured restaurant partners',
            type: 'in_app',
            status: 'active',
            targetAudience: {
              type: 'all',
              criteria: [],
              estimatedReach: 15000,
            },
            schedule: {
              startDate: '2024-01-05T00:00:00Z',
              endDate: '2024-01-25T23:59:59Z',
              frequency: 'daily',
            },
            content: {
              message: 'Discover amazing new restaurants in your area! Try our featured partners and rate your experience.',
              imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
              ctaText: 'Explore Restaurants',
              ctaUrl: '/featured-restaurants',
            },
            metrics: {
              sent: 12500,
              delivered: 12500,
              opened: 8750,
              clicked: 2100,
              converted: 567,
              revenue: 8900.25,
            },
            createdAt: '2024-01-03T11:20:00Z',
            createdBy: 'Emily Rodriguez',
            lastModified: '2024-01-10T09:45:00Z',
          },
          {
            id: '5',
            name: 'Holiday Season Finale',
            description: 'Final holiday campaign with year-end promotions',
            type: 'email',
            status: 'cancelled',
            targetAudience: {
              type: 'segment',
              criteria: ['all_users', 'active_last_60_days'],
              estimatedReach: 12000,
            },
            schedule: {
              startDate: '2023-12-28T00:00:00Z',
              endDate: '2023-12-31T23:59:59Z',
              frequency: 'once',
            },
            content: {
              subject: 'Last Chance: Holiday Deals End Soon!',
              message: 'Don\'t miss out on our final holiday deals! Get up to 40% off selected restaurants before the year ends.',
              imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
              ctaText: 'Shop Holiday Deals',
              ctaUrl: '/holiday-deals',
            },
            metrics: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              converted: 0,
              revenue: 0,
            },
            budget: 2000,
            createdAt: '2023-12-25T14:15:00Z',
            createdBy: 'Mike Chen',
            lastModified: '2023-12-27T16:00:00Z',
          },
        ];

        setCampaigns(mockCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    const matchesType = selectedType === 'all' || campaign.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return badges[status] || badges.draft;
  };

  const getTypeIcon = (type: Campaign['type']) => {
    const icons = {
      email: EnvelopeIcon,
      sms: DevicePhoneMobileIcon,
      push: MegaphoneIcon,
      in_app: DevicePhoneMobileIcon,
      social: UserGroupIcon,
    };
    
    return icons[type] || MegaphoneIcon;
  };

  const calculateROI = (revenue: number, budget?: number) => {
    if (!budget || budget === 0) return 'N/A';
    return `${(((revenue - budget) / budget) * 100).toFixed(1)}%`;
  };

  const calculateCTR = (clicked: number, delivered: number) => {
    if (delivered === 0) return '0.00';
    return ((clicked / delivered) * 100).toFixed(2);
  };

  // Removed unused function: calculateConversionRate

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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
          <p className="text-sm lg:text-base text-gray-600">Create and manage marketing campaigns across all channels.</p>
        </div>
        <button
          onClick={() => console.log('Create campaign modal would open')}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Campaign
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
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                ${campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
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
                placeholder="Search campaigns by name or description..."
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
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <MegaphoneIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push Notification</option>
              <option value="in_app">In-App</option>
              <option value="social">Social Media</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Campaigns ({filteredCampaigns.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCampaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type);
            return (
              <div key={campaign.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Created by {campaign.createdBy}</span>
                        <span>•</span>
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Target: {campaign.targetAudience.estimatedReach.toLocaleString()} users</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      {campaign.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Campaign Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Sent</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.metrics.sent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.metrics.delivered.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Opened</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.metrics.opened.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">CTR</p>
                    <p className="text-lg font-semibold text-gray-900">{calculateCTR(campaign.metrics.clicked, campaign.metrics.delivered)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.metrics.converted.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-lg font-semibold text-green-600">${campaign.metrics.revenue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Campaign Schedule */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    <strong>Schedule:</strong> {new Date(campaign.schedule.startDate).toLocaleDateString()}
                    {campaign.schedule.endDate && ` - ${new Date(campaign.schedule.endDate).toLocaleDateString()}`}
                    {campaign.schedule.frequency && ` (${campaign.schedule.frequency})`}
                  </span>
                  {campaign.budget && (
                    <>
                      <span>•</span>
                      <span><strong>Budget:</strong> ${campaign.budget}</span>
                      <span>•</span>
                      <span><strong>ROI:</strong> {calculateROI(campaign.metrics.revenue, campaign.budget)}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Analytics
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="p-12 text-center">
            <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => console.log('Create campaign modal would open')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Create Your First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
