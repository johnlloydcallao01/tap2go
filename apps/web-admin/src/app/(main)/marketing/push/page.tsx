'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'promotional' | 'transactional' | 'reminder' | 'announcement' | 'alert';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled' | 'failed';
  targeting: {
    audience: string;
    platforms: ('ios' | 'android' | 'web')[];
    userSegments: string[];
    locations?: string[];
    estimatedReach: number;
  };
  schedule: {
    sendAt?: string;
    timezone: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      days?: string[];
      time: string;
    };
  };
  content: {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    actionUrl?: string;
    actionText?: string;
    sound?: string;
    badge?: number;
  };
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
  createdAt: string;
  createdBy: string;
  sentAt?: string;
  lastModified: string;
}

export default function MarketingPushNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockNotifications: PushNotification[] = [
          {
            id: 'push_001',
            title: 'Weekend Special Offers',
            message: 'Don\'t miss out on our weekend special offers! 20% off on all orders.',
            type: 'promotional',
            status: 'sent',
            targeting: {
              audience: 'Active Users',
              platforms: ['ios', 'android'],
              userSegments: ['weekend_customers', 'deal_seekers'],
              locations: ['New York', 'Los Angeles'],
              estimatedReach: 15000,
            },
            schedule: {
              sendAt: '2024-01-20T10:00:00Z',
              timezone: 'America/New_York',
            },
            content: {
              title: 'Weekend Special Offers',
              body: 'Don\'t miss out on our weekend special offers! 20% off on all orders.',
              icon: 'https://example.com/icon.png',
              image: 'https://example.com/promo-image.jpg',
              actionUrl: '/promotions/weekend-special',
              actionText: 'View Offers',
              sound: 'default',
              badge: 1,
            },
            performance: {
              sent: 14850,
              delivered: 14320,
              opened: 4296,
              clicked: 858,
              deliveryRate: 96.4,
              openRate: 30.0,
              clickRate: 20.0,
            },
            createdAt: '2024-01-18T14:30:00Z',
            createdBy: 'Sarah Johnson',
            sentAt: '2024-01-20T10:00:00Z',
            lastModified: '2024-01-19T16:45:00Z',
          },
          {
            id: 'push_002',
            title: 'Order Confirmation',
            message: 'Your order #12345 has been confirmed and is being prepared.',
            type: 'transactional',
            status: 'sent',
            targeting: {
              audience: 'Order Customers',
              platforms: ['ios', 'android', 'web'],
              userSegments: ['recent_orders'],
              estimatedReach: 500,
            },
            schedule: {
              timezone: 'America/New_York',
            },
            content: {
              title: 'Order Confirmation',
              body: 'Your order #12345 has been confirmed and is being prepared.',
              actionUrl: '/orders/12345',
              actionText: 'Track Order',
              sound: 'default',
            },
            performance: {
              sent: 487,
              delivered: 485,
              opened: 425,
              clicked: 380,
              deliveryRate: 99.6,
              openRate: 87.6,
              clickRate: 89.4,
            },
            createdAt: '2024-01-21T09:15:00Z',
            createdBy: 'System',
            sentAt: '2024-01-21T09:15:00Z',
            lastModified: '2024-01-21T09:15:00Z',
          },
          {
            id: 'push_003',
            title: 'New Restaurant Alert',
            message: 'A new restaurant just joined! Check out Mediterranean Delight.',
            type: 'announcement',
            status: 'scheduled',
            targeting: {
              audience: 'All Users',
              platforms: ['ios', 'android'],
              userSegments: ['food_explorers', 'local_customers'],
              locations: ['Downtown'],
              estimatedReach: 8500,
            },
            schedule: {
              sendAt: '2024-01-25T12:00:00Z',
              timezone: 'America/New_York',
            },
            content: {
              title: 'New Restaurant Alert',
              body: 'A new restaurant just joined! Check out Mediterranean Delight.',
              image: 'https://example.com/restaurant-image.jpg',
              actionUrl: '/restaurant/mediterranean-delight',
              actionText: 'Explore Menu',
              sound: 'default',
            },
            performance: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              deliveryRate: 0,
              openRate: 0,
              clickRate: 0,
            },
            createdAt: '2024-01-22T11:20:00Z',
            createdBy: 'Mike Chen',
            lastModified: '2024-01-23T14:10:00Z',
          },
          {
            id: 'push_004',
            title: 'Lunch Reminder',
            message: 'It\'s lunch time! Order from your favorite restaurants.',
            type: 'reminder',
            status: 'draft',
            targeting: {
              audience: 'Lunch Customers',
              platforms: ['ios', 'android'],
              userSegments: ['office_workers', 'lunch_customers'],
              estimatedReach: 5000,
            },
            schedule: {
              timezone: 'America/New_York',
              recurring: {
                frequency: 'daily',
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                time: '11:30',
              },
            },
            content: {
              title: 'Lunch Reminder',
              body: 'It\'s lunch time! Order from your favorite restaurants.',
              actionUrl: '/restaurants?category=lunch',
              actionText: 'Order Now',
              sound: 'default',
            },
            performance: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              deliveryRate: 0,
              openRate: 0,
              clickRate: 0,
            },
            createdAt: '2024-01-23T16:45:00Z',
            createdBy: 'Emily Rodriguez',
            lastModified: '2024-01-24T09:30:00Z',
          },
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error loading push notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus;
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: PushNotification['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: PushNotification['status']) => {
    const icons = {
      draft: PencilIcon,
      scheduled: ClockIcon,
      sent: CheckCircleIcon,
      cancelled: XCircleIcon,
      failed: XCircleIcon,
    };
    
    return icons[status] || PencilIcon;
  };

  const getTypeIcon = (type: PushNotification['type']) => {
    const icons = {
      promotional: '🎯',
      transactional: '📋',
      reminder: '⏰',
      announcement: '📢',
      alert: '🚨',
    };
    
    return icons[type] || '🔔';
  };

  const totalSent = notifications.reduce((sum, n) => sum + n.performance.sent, 0);

  const averageDeliveryRate = notifications.length > 0 
    ? notifications.reduce((sum, n) => sum + n.performance.deliveryRate, 0) / notifications.length 
    : 0;
  const averageOpenRate = notifications.length > 0 
    ? notifications.reduce((sum, n) => sum + n.performance.openRate, 0) / notifications.length 
    : 0;
  const averageClickRate = notifications.length > 0 
    ? notifications.reduce((sum, n) => sum + n.performance.clickRate, 0) / notifications.length 
    : 0;

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Push Notifications</h1>
            <p className="text-sm lg:text-base text-gray-600">Send targeted push notifications to engage your users.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Create Notification
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-lg font-semibold text-gray-900">{totalSent.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageDeliveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageOpenRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageClickRate.toFixed(1)}%</p>
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
                  placeholder="Search notifications..."
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
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="promotional">Promotional</option>
                <option value="transactional">Transactional</option>
                <option value="reminder">Reminder</option>
                <option value="announcement">Announcement</option>
                <option value="alert">Alert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Push Notifications ({filteredNotifications.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const StatusIcon = getStatusIcon(notification.status);

              return (
                <div key={notification.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {notification.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created by {notification.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Reach: {notification.targeting.estimatedReach.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(notification.status)}`}>
                        <StatusIcon className="h-4 w-4 inline mr-1" />
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Notification Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Targeting</p>
                      <div className="text-sm text-gray-900">
                        <p>Audience: {notification.targeting.audience}</p>
                        <p>Platforms: {notification.targeting.platforms.join(', ')}</p>
                        <p>Segments: {notification.targeting.userSegments.join(', ')}</p>
                        {notification.targeting.locations && (
                          <p>Locations: {notification.targeting.locations.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Schedule</p>
                      <div className="text-sm text-gray-900">
                        {notification.schedule.sendAt ? (
                          <p>Send at: {new Date(notification.schedule.sendAt).toLocaleString()}</p>
                        ) : notification.schedule.recurring ? (
                          <div>
                            <p>Recurring: {notification.schedule.recurring.frequency}</p>
                            <p>Time: {notification.schedule.recurring.time}</p>
                            {notification.schedule.recurring.days && (
                              <p>Days: {notification.schedule.recurring.days.join(', ')}</p>
                            )}
                          </div>
                        ) : (
                          <p>Immediate</p>
                        )}
                        <p className="text-gray-500">{notification.schedule.timezone}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Content</p>
                      <div className="text-sm text-gray-900">
                        <p>Title: {notification.content.title}</p>
                        <p className="truncate">Body: {notification.content.body}</p>
                        {notification.content.actionText && (
                          <p>Action: {notification.content.actionText}</p>
                        )}
                        {notification.content.image && (
                          <p className="text-blue-600">📷 Has image</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {notification.performance.sent > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Sent</p>
                        <p className="text-lg font-semibold text-gray-900">{notification.performance.sent.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Delivered</p>
                        <p className="text-lg font-semibold text-blue-600">{notification.performance.delivered.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Opened</p>
                        <p className="text-lg font-semibold text-green-600">{notification.performance.opened.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Clicked</p>
                        <p className="text-lg font-semibold text-purple-600">{notification.performance.clicked.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Open Rate</p>
                        <p className="text-lg font-semibold text-orange-600">{notification.performance.openRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Click Rate</p>
                        <p className="text-lg font-semibold text-teal-600">{notification.performance.clickRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Platform Icons */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">Platforms:</span>
                    {notification.targeting.platforms.map((platform) => (
                      <div key={platform} className="flex items-center space-x-1">
                        {platform === 'ios' && <span className="text-gray-600">📱</span>}
                        {platform === 'android' && <span className="text-green-600">🤖</span>}
                        {platform === 'web' && <ComputerDesktopIcon className="h-4 w-4 text-blue-600" />}
                        <span className="text-xs text-gray-500 capitalize">{platform}</span>
                      </div>
                    ))}
                  </div>

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

                      {notification.status === 'draft' && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Send Now
                        </button>
                      )}

                      {notification.status === 'scheduled' && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                          <StopIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}

                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      {notification.sentAt ? (
                        <span>Sent: {new Date(notification.sentAt).toLocaleDateString()}</span>
                      ) : (
                        <span>Modified: {new Date(notification.lastModified).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or create your first notification.</p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                Create Your First Notification
              </button>
            </div>
          )}
        </div>
      </div>
  );
}
