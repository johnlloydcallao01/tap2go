'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,

  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'promotional' | 'transactional' | 'reminder' | 'alert' | 'announcement';
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  targeting: {
    audience: 'all_users' | 'segment' | 'custom';
    segments?: string[];
    locations?: string[];
    deviceTypes?: string[];
    estimatedReach: number;
  };
  scheduling: {
    sendNow: boolean;
    scheduledAt?: string;
    timezone?: string;
    recurring?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      endDate?: string;
    };
  };
  content: {
    title: string;
    body: string;
    imageUrl?: string;
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
    dismissed: number;
    conversionRate: number;
    revenue?: number;
  };
  createdAt: string;
  createdBy: string;
  sentAt?: string;
  lastModified: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  variables: string[];
  usageCount: number;
}

export default function AdminMarketingPush() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  // Removed unused variable: showCreateModal, setShowCreateModal
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates'>('notifications');

  useEffect(() => {
    const loadPushData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockNotifications: PushNotification[] = [
          {
            id: 'push_001',
            title: 'Weekend Flash Sale',
            message: '⚡ 50% off selected restaurants this weekend only!',
            type: 'promotional',
            status: 'sent',
            targeting: {
              audience: 'segment',
              segments: ['active_users', 'weekend_orderers'],
              deviceTypes: ['ios', 'android'],
              estimatedReach: 8500,
            },
            scheduling: {
              sendNow: false,
              scheduledAt: '2024-01-20T18:00:00Z',
              timezone: 'America/New_York',
            },
            content: {
              title: 'Weekend Flash Sale! 🔥',
              body: '50% off selected restaurants this weekend only. Don\'t miss out!',
              imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
              actionUrl: '/flash-sale',
              actionText: 'Shop Now',
              sound: 'default',
              badge: 1,
            },
            performance: {
              sent: 8234,
              delivered: 8156,
              opened: 3267,
              clicked: 892,
              dismissed: 1456,
              conversionRate: 10.84,
              revenue: 15670.50,
            },
            createdAt: '2024-01-18T10:00:00Z',
            createdBy: 'Lisa Wilson',
            sentAt: '2024-01-20T18:00:15Z',
            lastModified: '2024-01-20T17:45:00Z',
          },
          {
            id: 'push_002',
            title: 'Order Delivered',
            message: 'Your order from Pizza Palace has been delivered! Enjoy your meal 🍕',
            type: 'transactional',
            status: 'sent',
            targeting: {
              audience: 'custom',
              estimatedReach: 1,
            },
            scheduling: {
              sendNow: true,
            },
            content: {
              title: 'Order Delivered! 🍕',
              body: 'Your order from Pizza Palace has been delivered! Enjoy your meal.',
              actionUrl: '/order/ORD-2024-001',
              actionText: 'Rate Order',
              sound: 'delivery',
              badge: 1,
            },
            performance: {
              sent: 1,
              delivered: 1,
              opened: 1,
              clicked: 1,
              dismissed: 0,
              conversionRate: 100,
            },
            createdAt: '2024-01-21T14:30:00Z',
            createdBy: 'System',
            sentAt: '2024-01-21T14:30:05Z',
            lastModified: '2024-01-21T14:30:00Z',
          },
          {
            id: 'push_003',
            title: 'New Restaurant Launch',
            message: 'Discover Mediterranean Delight - Now available in your area!',
            type: 'announcement',
            status: 'scheduled',
            targeting: {
              audience: 'segment',
              segments: ['local_users'],
              locations: ['Downtown', 'University District'],
              deviceTypes: ['ios', 'android'],
              estimatedReach: 3200,
            },
            scheduling: {
              sendNow: false,
              scheduledAt: '2024-01-25T12:00:00Z',
              timezone: 'America/New_York',
            },
            content: {
              title: 'New Restaurant Alert! 🆕',
              body: 'Discover Mediterranean Delight - Now available in your area with authentic flavors!',
              imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
              actionUrl: '/restaurant/mediterranean-delight',
              actionText: 'Explore Menu',
              sound: 'default',
              badge: 1,
            },
            performance: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              dismissed: 0,
              conversionRate: 0,
            },
            createdAt: '2024-01-22T09:15:00Z',
            createdBy: 'David Brown',
            lastModified: '2024-01-23T11:20:00Z',
          },
          {
            id: 'push_004',
            title: 'Cart Abandonment Reminder',
            message: 'You left something delicious in your cart! Complete your order now.',
            type: 'reminder',
            status: 'sent',
            targeting: {
              audience: 'segment',
              segments: ['cart_abandoners'],
              estimatedReach: 450,
            },
            scheduling: {
              sendNow: false,
              scheduledAt: '2024-01-21T20:00:00Z',
              timezone: 'America/New_York',
              recurring: {
                enabled: true,
                frequency: 'daily',
                endDate: '2024-02-21T20:00:00Z',
              },
            },
            content: {
              title: 'Don\'t forget your order! 🛒',
              body: 'You left something delicious in your cart! Complete your order now and get 10% off.',
              actionUrl: '/cart',
              actionText: 'Complete Order',
              sound: 'reminder',
              badge: 1,
            },
            performance: {
              sent: 423,
              delivered: 418,
              opened: 156,
              clicked: 67,
              dismissed: 89,
              conversionRate: 15.83,
              revenue: 2340.75,
            },
            createdAt: '2024-01-20T16:30:00Z',
            createdBy: 'Emily Rodriguez',
            sentAt: '2024-01-21T20:00:10Z',
            lastModified: '2024-01-21T19:45:00Z',
          },
          {
            id: 'push_005',
            title: 'System Maintenance Alert',
            message: 'Scheduled maintenance tonight from 2-4 AM. Service may be temporarily unavailable.',
            type: 'alert',
            status: 'failed',
            targeting: {
              audience: 'all_users',
              estimatedReach: 25000,
            },
            scheduling: {
              sendNow: false,
              scheduledAt: '2024-01-19T21:00:00Z',
              timezone: 'America/New_York',
            },
            content: {
              title: 'Maintenance Notice ⚠️',
              body: 'Scheduled maintenance tonight from 2-4 AM. Service may be temporarily unavailable.',
              sound: 'alert',
              badge: 1,
            },
            performance: {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              dismissed: 0,
              conversionRate: 0,
            },
            createdAt: '2024-01-19T15:45:00Z',
            createdBy: 'Mike Chen',
            lastModified: '2024-01-19T21:05:00Z',
          },
        ];

        const mockTemplates: NotificationTemplate[] = [
          {
            id: 'template_001',
            name: 'Order Confirmation',
            category: 'Transactional',
            title: 'Order Confirmed! 🎉',
            message: 'Your order from {{restaurant_name}} has been confirmed. Estimated delivery: {{delivery_time}}',
            variables: ['restaurant_name', 'delivery_time', 'order_total'],
            usageCount: 1250,
          },
          {
            id: 'template_002',
            name: 'Promotional Discount',
            category: 'Marketing',
            title: 'Special Offer Just for You! 🎁',
            message: 'Get {{discount_percentage}}% off your next order from {{restaurant_name}}. Use code: {{promo_code}}',
            variables: ['discount_percentage', 'restaurant_name', 'promo_code'],
            usageCount: 890,
          },
          {
            id: 'template_003',
            name: 'Driver Nearby',
            category: 'Delivery',
            title: 'Your driver is nearby! 🚗',
            message: '{{driver_name}} is approaching with your order from {{restaurant_name}}. ETA: {{eta}} minutes',
            variables: ['driver_name', 'restaurant_name', 'eta'],
            usageCount: 2340,
          },
          {
            id: 'template_004',
            name: 'Weekly Digest',
            category: 'Engagement',
            title: 'Your Weekly Food Journey 📊',
            message: 'You ordered {{order_count}} times this week and saved {{savings_amount}} with our deals!',
            variables: ['order_count', 'savings_amount', 'favorite_cuisine'],
            usageCount: 156,
          },
        ];

        setNotifications(mockNotifications);
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error loading push data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPushData();
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
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: PushNotification['status']) => {
    const icons = {
      draft: ClockIcon,
      scheduled: ClockIcon,
      sent: CheckCircleIcon,
      failed: XCircleIcon,
      cancelled: ExclamationTriangleIcon,
    };
    
    return icons[status] || ClockIcon;
  };

  const getTypeLabel = (type: PushNotification['type']) => {
    const labels = {
      promotional: 'Promotional',
      transactional: 'Transactional',
      reminder: 'Reminder',
      alert: 'Alert',
      announcement: 'Announcement',
    };
    
    return labels[type] || type;
  };

  const calculateOpenRate = (opened: number, delivered: number) => {
    if (delivered === 0) return '0.00';
    return ((opened / delivered) * 100).toFixed(2);
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    if (opened === 0) return '0.00';
    return ((clicked / opened) * 100).toFixed(2);
  };

  const totalSent = notifications.reduce((sum, n) => sum + n.performance.sent, 0);
  const totalDelivered = notifications.reduce((sum, n) => sum + n.performance.delivered, 0);
  const totalOpened = notifications.reduce((sum, n) => sum + n.performance.opened, 0);
  const totalRevenue = notifications.reduce((sum, n) => sum + (n.performance.revenue || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <p className="text-sm lg:text-base text-gray-600">Send targeted push notifications to engage and retain customers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center text-sm">
            <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
            Test Notification
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Notification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
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
              <p className="text-lg font-semibold text-gray-900">
                {totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0'}%
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
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {calculateOpenRate(totalOpened, totalDelivered)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
              <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'notifications', name: 'Notifications', icon: BellIcon },
              { id: 'templates', name: 'Templates', icon: DevicePhoneMobileIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'notifications' | 'templates')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications by title or message..."
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
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
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
                    <option value="alert">Alert</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const StatusIcon = getStatusIcon(notification.status);
                  return (
                    <div key={notification.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <BellIcon className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{notification.content.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{notification.content.body}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Created by {notification.createdBy}</span>
                              <span>•</span>
                              <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{getTypeLabel(notification.type)}</span>
                              <span>•</span>
                              <span>Target: {notification.targeting.estimatedReach.toLocaleString()} users</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(notification.status)}`}>
                            <StatusIcon className="h-4 w-4 inline mr-1" />
                            {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Scheduling Info */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4 text-sm">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          {notification.scheduling.sendNow ? (
                            <span className="text-gray-700">Sent immediately</span>
                          ) : (
                            <span className="text-gray-700">
                              Scheduled for: {notification.scheduling.scheduledAt
                                ? new Date(notification.scheduling.scheduledAt).toLocaleString()
                                : 'Not scheduled'}
                            </span>
                          )}
                          {notification.scheduling.recurring?.enabled && (
                            <span className="text-blue-600">
                              • Recurring {notification.scheduling.recurring.frequency}
                            </span>
                          )}
                          {notification.sentAt && (
                            <span className="text-green-600">
                              • Sent: {new Date(notification.sentAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      {notification.performance.sent > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Sent</p>
                            <p className="text-lg font-semibold text-gray-900">{notification.performance.sent.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-lg font-semibold text-green-600">{notification.performance.delivered.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Opened</p>
                            <p className="text-lg font-semibold text-blue-600">{notification.performance.opened.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Open Rate</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {calculateOpenRate(notification.performance.opened, notification.performance.delivered)}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Clicked</p>
                            <p className="text-lg font-semibold text-orange-600">{notification.performance.clicked.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">CTR</p>
                            <p className="text-lg font-semibold text-red-600">
                              {calculateClickRate(notification.performance.clicked, notification.performance.opened)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Revenue Impact */}
                      {notification.performance.revenue && notification.performance.revenue > 0 && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Revenue Generated</span>
                            <span className="text-lg font-semibold text-green-600">
                              ${notification.performance.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-green-600">
                            Conversion Rate: {notification.performance.conversionRate.toFixed(2)}%
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

                          {notification.status === 'draft' && (
                            <>
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700">
                                <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                                Send Now
                              </button>
                            </>
                          )}

                          {notification.status === 'scheduled' && (
                            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          )}

                          {notification.status === 'sent' && (
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                              <ChartBarIcon className="h-4 w-4 mr-1" />
                              Analytics
                            </button>
                          )}

                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          Last modified: {new Date(notification.lastModified).toLocaleDateString()}
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
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={() => console.log('Create notification modal would open')}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                  >
                    Create Your First Notification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notification Templates</h3>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.category}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Used {template.usageCount} times
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Title:</p>
                      <p className="text-sm text-gray-900 mb-2">{template.title}</p>
                      <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                      <p className="text-sm text-gray-900">{template.message}</p>
                    </div>

                    {template.variables.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <span key={variable} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-100 text-orange-700 px-3 py-2 rounded text-sm hover:bg-orange-200">
                        Use Template
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                        <TrashIcon className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
            <p className="text-gray-600 mb-4">Push notification creation functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
