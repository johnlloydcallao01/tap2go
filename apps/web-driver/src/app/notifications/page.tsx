'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
  DocumentTextIcon,
  BellSlashIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'document' | 'rating';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          title: 'New Order Available',
          message: 'There is a new delivery order available in your area. Tap to view details.',
          type: 'order',
          isRead: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          actionUrl: '/orders',
          actionText: 'View Order',
        },
        {
          id: '2',
          title: 'Payment Received',
          message: 'You have received a payment of $15.75 for order #ORD-2024-002.',
          type: 'payment',
          isRead: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          actionUrl: '/earnings',
          actionText: 'View Earnings',
        },
        {
          id: '3',
          title: 'Order Completed',
          message: 'Order #ORD-2024-001 has been successfully delivered. Great job!',
          type: 'order',
          isRead: true,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        },
        {
          id: '4',
          title: 'New Rating Received',
          message: 'You received a 5-star rating from John Smith. Keep up the good work!',
          type: 'rating',
          isRead: true,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          id: '5',
          title: 'Document Expiring Soon',
          message: 'Your vehicle insurance will expire in 30 days. Please update it to continue driving.',
          type: 'document',
          isRead: false,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          actionUrl: '/documents',
          actionText: 'Update Document',
        },
        {
          id: '6',
          title: 'System Maintenance',
          message: 'The app will be under maintenance on Sunday, January 28th from 2 AM to 4 AM.',
          type: 'system',
          isRead: true,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
        {
          id: '7',
          title: 'Bonus Opportunity',
          message: 'Complete 10 deliveries this weekend to earn a $50 bonus!',
          type: 'payment',
          isRead: true,
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    setShowDropdown(null);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    setShowDropdown(null);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'system':
        return <BellIcon className="h-5 w-5 text-purple-600" />;
      case 'document':
        return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
      case 'rating':
        return <StarIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100';
      case 'payment':
        return 'bg-green-100';
      case 'system':
        return 'bg-purple-100';
      case 'document':
        return 'bg-orange-100';
      case 'rating':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

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
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            onClick={deleteAllNotifications}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          <span className="text-gray-700 font-medium whitespace-nowrap">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'unread' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('order')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'order' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setFilter('payment')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'payment' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFilter('document')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'document' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'system' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === notification.id ? null : notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        >
                          <EllipsisHorizontalIcon className="h-5 w-5" />
                        </button>
                        {showDropdown === notification.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <CheckIcon className="h-4 w-4 mr-2" />
                                  Mark as read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  {notification.actionUrl && notification.actionText && (
                    <div className="mt-3">
                      <a
                        href={notification.actionUrl}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {notification.actionText}
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <BellSlashIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500 mb-6">
              {filter !== 'all'
                ? `No ${filter} notifications found. Try changing your filter.`
                : "You don't have any notifications yet."}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View All Notifications
              </button>
            )}
          </div>
        )}
      </div>

      {/* Settings Link */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellIcon className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-medium text-gray-900">Notification Preferences</p>
            <p className="text-sm text-gray-600">Customize which notifications you receive and how</p>
          </div>
        </div>
        <a
          href="/settings"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          Manage Settings
        </a>
      </div>
    </div>
  );
}
