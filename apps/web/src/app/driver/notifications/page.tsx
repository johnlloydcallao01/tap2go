'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckIcon,
  TrashIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export default function DriverNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'order',
          title: 'New Order Available',
          message: 'Order #ORD-2024-001 is available for pickup at Pizza Palace. Payment: $15.50',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          priority: 'high',
          actionUrl: '/driver/orders/available',
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received $12.50 for completing order #ORD-2024-002',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          priority: 'medium',
        },
        {
          id: '3',
          type: 'system',
          title: 'Weekly Earnings Summary',
          message: 'You earned $894.60 this week with 52 deliveries. Great job!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          priority: 'low',
          actionUrl: '/driver/earnings',
        },
        {
          id: '4',
          type: 'alert',
          title: 'Document Expiring Soon',
          message: 'Your insurance certificate expires in 15 days. Please renew to continue driving.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: false,
          priority: 'high',
          actionUrl: '/driver/documents',
        },
        {
          id: '5',
          type: 'order',
          title: 'Order Completed',
          message: 'Order #ORD-2024-003 has been successfully delivered. Customer rating: 5 stars!',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          priority: 'medium',
        },
        {
          id: '6',
          type: 'system',
          title: 'App Update Available',
          message: 'Version 2.1.0 is now available with improved navigation and bug fixes.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          priority: 'low',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <TruckIcon className="h-5 w-5" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'system':
        return <InformationCircleIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-50';
    }
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-50';
      case 'payment':
        return 'text-green-600 bg-green-50';
      case 'alert':
        return 'text-orange-600 bg-orange-50';
      case 'system':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your delivery activities.</p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Mark all as read
            </button>
          )}
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <BellIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.type === 'order').length}
              </p>
            </div>
            <TruckIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Payments</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'payment').length}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {['all', 'unread', 'order', 'payment', 'alert', 'system'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md ${
              !notification.read ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {notification.priority === 'high' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'} mb-2`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    {notification.actionUrl && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                    title="Mark as read"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  title="Delete notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-500">
            {selectedFilter === 'all' 
              ? 'You have no notifications at the moment.' 
              : `No ${selectedFilter} notifications found.`}
          </p>
        </div>
      )}
    </div>
  );
}
