'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  ShoppingBagIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckIcon,
  TrashIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newRestaurants: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'promotion' | 'system'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Simulate loading notifications data
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'order',
          title: 'Order Delivered!',
          message: 'Your order from Pizza Palace has been delivered. Enjoy your meal!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          actionUrl: '/account/orders',
          actionText: 'View Order',
        },
        {
          id: '2',
          type: 'promotion',
          title: 'Weekend Special: 20% Off!',
          message: 'Get 20% off your next order this weekend. Use code WEEKEND20.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          actionUrl: '/account/promotions',
          actionText: 'View Offers',
        },
        {
          id: '3',
          type: 'order',
          title: 'Order Confirmed',
          message: 'Your order #ORD-2024-003 from Burger Junction has been confirmed.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: true,
          actionUrl: '/account/orders/track',
          actionText: 'Track Order',
        },
        {
          id: '4',
          type: 'system',
          title: 'New Restaurant Added!',
          message: 'Sushi Zen is now available in your area. Check out their amazing menu!',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          actionUrl: '/restaurants',
          actionText: 'Browse Menu',
        },
        {
          id: '5',
          type: 'alert',
          title: 'Payment Method Expiring',
          message: 'Your credit card ending in 1234 expires next month. Please update your payment method.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          read: false,
          actionUrl: '/account/payment',
          actionText: 'Update Payment',
        },
        {
          id: '6',
          type: 'promotion',
          title: 'Loyalty Points Earned!',
          message: 'You earned 25 loyalty points from your recent order. You now have 2,365 points!',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true,
          actionUrl: '/account/loyalty',
          actionText: 'View Points',
        },
        {
          id: '7',
          type: 'order',
          title: 'Order Cancelled',
          message: 'Your order from Taco Fiesta was cancelled due to restaurant closure. Full refund processed.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          read: true,
        },
      ]);

      setSettings({
        orderUpdates: true,
        promotions: true,
        newRestaurants: false,
        systemAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      });

      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingBagIcon;
      case 'promotion':
        return GiftIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      case 'system':
        return InformationCircleIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'promotion':
        return 'bg-green-100 text-green-600';
      case 'alert':
        return 'bg-red-100 text-red-600';
      case 'system':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'order':
        return notification.type === 'order';
      case 'promotion':
        return notification.type === 'promotion';
      case 'system':
        return notification.type === 'system';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your orders and special offers</p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
            { key: 'promotion', label: 'Promotions', count: notifications.filter(n => n.type === 'promotion').length },
            { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'unread' | 'order' | 'promotion' | 'system')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && settings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notification Types</h3>
                <div className="space-y-3">
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', description: 'Status updates for your orders' },
                    { key: 'promotions', label: 'Promotions & Offers', description: 'Special deals and discounts' },
                    { key: 'newRestaurants', label: 'New Restaurants', description: 'When new restaurants join' },
                    { key: 'systemAlerts', label: 'System Alerts', description: 'Important account notifications' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(setting.key as keyof NotificationSettings, !settings[setting.key as keyof NotificationSettings])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key as keyof NotificationSettings] ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Delivery Methods</h3>
                <div className="space-y-3">
                  {[
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'In-app notifications' },
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Text message alerts' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(setting.key as keyof NotificationSettings, !settings[setting.key as keyof NotificationSettings])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[setting.key as keyof NotificationSettings] ? 'bg-orange-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[setting.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read 
                        ? 'border-gray-200 bg-white' 
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-3">
                            <a
                              href={notification.actionUrl}
                              className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                            >
                              {notification.actionText} →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'You\'re all caught up! No new notifications.'
                  : `No ${filter} notifications found.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
