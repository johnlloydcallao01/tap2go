'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'social' | 'display';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  targeting: {
    audience: string;
    demographics: string[];
    locations: string[];
    estimatedReach: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    cpc: number;
    roas: number;
  };
  createdAt: string;
  createdBy: string;
  lastModified: string;
}

export default function MarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCampaigns: Campaign[] = [
          {
            id: 'camp_001',
            name: 'New Year Food Festival',
            description: 'Promote our New Year food festival with special discounts and featured restaurants',
            type: 'email',
            status: 'active',
            budget: {
              total: 5000,
              spent: 2340.50,
              remaining: 2659.50,
            },
            targeting: {
              audience: 'All Active Users',
              demographics: ['Age 25-45', 'Food Enthusiasts'],
              locations: ['New York', 'Los Angeles', 'Chicago'],
              estimatedReach: 15000,
            },
            schedule: {
              startDate: '2024-01-15T00:00:00Z',
              endDate: '2024-02-15T23:59:59Z',
              timezone: 'America/New_York',
            },
            performance: {
              impressions: 45670,
              clicks: 3456,
              conversions: 234,
              revenue: 12450.75,
              ctr: 7.57,
              cpc: 0.68,
              roas: 5.32,
            },
            createdAt: '2024-01-10T10:00:00Z',
            createdBy: 'Sarah Johnson',
            lastModified: '2024-01-20T14:30:00Z',
          },
          {
            id: 'camp_002',
            name: 'Weekend Delivery Boost',
            description: 'SMS campaign to increase weekend delivery orders with time-sensitive offers',
            type: 'sms',
            status: 'active',
            budget: {
              total: 2500,
              spent: 1890.25,
              remaining: 609.75,
            },
            targeting: {
              audience: 'Weekend Inactive Users',
              demographics: ['Previous Customers', 'Local Area'],
              locations: ['Downtown', 'Suburbs'],
              estimatedReach: 8500,
            },
            schedule: {
              startDate: '2024-01-20T00:00:00Z',
              endDate: '2024-03-20T23:59:59Z',
              timezone: 'America/New_York',
            },
            performance: {
              impressions: 8234,
              clicks: 1456,
              conversions: 189,
              revenue: 8934.50,
              ctr: 17.69,
              cpc: 1.30,
              roas: 4.73,
            },
            createdAt: '2024-01-18T09:15:00Z',
            createdBy: 'Mike Chen',
            lastModified: '2024-01-21T11:20:00Z',
          },
          {
            id: 'camp_003',
            name: 'Valentine\'s Day Special',
            description: 'Multi-channel campaign for Valentine\'s Day romantic dining experiences',
            type: 'social',
            status: 'completed',
            budget: {
              total: 8000,
              spent: 7850.00,
              remaining: 150.00,
            },
            targeting: {
              audience: 'Couples & Dating Segment',
              demographics: ['Age 20-40', 'Relationship Status: In Relationship'],
              locations: ['Metropolitan Areas'],
              estimatedReach: 25000,
            },
            schedule: {
              startDate: '2024-02-01T00:00:00Z',
              endDate: '2024-02-14T23:59:59Z',
              timezone: 'America/New_York',
            },
            performance: {
              impressions: 89450,
              clicks: 5670,
              conversions: 456,
              revenue: 28945.75,
              ctr: 6.34,
              cpc: 1.38,
              roas: 3.69,
            },
            createdAt: '2024-01-25T16:45:00Z',
            createdBy: 'Emily Rodriguez',
            lastModified: '2024-02-15T09:00:00Z',
          },
          {
            id: 'camp_004',
            name: 'Spring Menu Launch',
            description: 'Push notification campaign to announce new spring menu items',
            type: 'push',
            status: 'draft',
            budget: {
              total: 3000,
              spent: 0,
              remaining: 3000,
            },
            targeting: {
              audience: 'App Users',
              demographics: ['Active Users', 'Food Explorers'],
              locations: ['All Markets'],
              estimatedReach: 12000,
            },
            schedule: {
              startDate: '2024-03-01T00:00:00Z',
              endDate: '2024-03-31T23:59:59Z',
              timezone: 'America/New_York',
            },
            performance: {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              revenue: 0,
              ctr: 0,
              cpc: 0,
              roas: 0,
            },
            createdAt: '2024-02-20T13:30:00Z',
            createdBy: 'David Wilson',
            lastModified: '2024-02-22T10:15:00Z',
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
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    const matchesType = selectedType === 'all' || campaign.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Campaign['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: Campaign['status']) => {
    const icons = {
      draft: PencilIcon,
      active: PlayIcon,
      paused: PauseIcon,
      completed: CheckCircleIcon,
      cancelled: XCircleIcon,
    };
    return icons[status] || PencilIcon;
  };

  const getTypeIcon = (type: Campaign['type']) => {
    const icons = {
      email: '@',
      sms: '💬',
      push: '🔔',
      social: '📱',
      display: '🖥️',
    };
    return icons[type] || '📢';
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.total, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p className="text-sm lg:text-base text-gray-600">Create and manage your marketing campaigns across all channels.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-lg font-semibold text-gray-900">{activeCampaigns}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-lg font-semibold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-lg font-semibold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
                <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
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
                  placeholder="Search campaigns..."
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
                <option value="draft">Draft</option>
                <option value="active">Active</option>
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
                <option value="push">Push</option>
                <option value="social">Social</option>
                <option value="display">Display</option>
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
              const StatusIcon = getStatusIcon(campaign.status);
              const budgetUsed = campaign.budget.total > 0 ? (campaign.budget.spent / campaign.budget.total) * 100 : 0;

              return (
                <div key={campaign.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {campaign.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created by {campaign.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Reach: {campaign.targeting.estimatedReach.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(campaign.status)}`}>
                        <StatusIcon className="h-4 w-4 inline mr-1" />
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Budget Usage</span>
                      <span className="text-gray-900">
                        ${campaign.budget.spent.toLocaleString()} / ${campaign.budget.total.toLocaleString()} ({budgetUsed.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Schedule</p>
                      <div className="text-sm text-gray-900">
                        <p>Start: {new Date(campaign.schedule.startDate).toLocaleDateString()}</p>
                        {campaign.schedule.endDate && (
                          <p>End: {new Date(campaign.schedule.endDate).toLocaleDateString()}</p>
                        )}
                        <p className="text-gray-500">{campaign.schedule.timezone}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Targeting</p>
                      <div className="text-sm text-gray-900">
                        <p>{campaign.targeting.audience}</p>
                        <p className="text-gray-500">
                          {campaign.targeting.locations.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Performance</p>
                      <div className="text-sm text-gray-900">
                        <p>CTR: {campaign.performance.ctr.toFixed(2)}%</p>
                        <p>ROAS: {campaign.performance.roas.toFixed(2)}x</p>
                        <p className="text-green-600">Revenue: ${campaign.performance.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {campaign.performance.impressions > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Impressions</p>
                        <p className="text-lg font-semibold text-gray-900">{campaign.performance.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Clicks</p>
                        <p className="text-lg font-semibold text-blue-600">{campaign.performance.clicks.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Conversions</p>
                        <p className="text-lg font-semibold text-green-600">{campaign.performance.conversions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">CPC</p>
                        <p className="text-lg font-semibold text-purple-600">${campaign.performance.cpc.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-lg font-semibold text-orange-600">${campaign.performance.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>

                      {campaign.status === 'active' && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                          <PauseIcon className="h-4 w-4 mr-1" />
                          Pause
                        </button>
                      )}

                      {(campaign.status === 'draft' || campaign.status === 'paused') && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Start
                        </button>
                      )}

                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last modified: {new Date(campaign.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="p-12 text-center">
              <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or create your first campaign.</p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
