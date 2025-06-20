import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FooterNavigation from '../components/FooterNavigation';

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered!',
      message: 'Your order from Pizza Corner has been delivered. Enjoy your meal!',
      time: '5 minutes ago',
      read: false,
      icon: 'checkmark-circle',
      iconColor: '#10b981',
    },
    {
      id: '2',
      type: 'promotion',
      title: '20% Off Today!',
      message: 'Get 20% off on all orders from Burger Palace. Use code SAVE20.',
      time: '1 hour ago',
      read: false,
      icon: 'pricetag',
      iconColor: '#f3a823',
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order from Sushi Express has been confirmed and is being prepared.',
      time: '2 hours ago',
      read: true,
      icon: 'restaurant',
      iconColor: '#6366f1',
    },
    {
      id: '4',
      type: 'system',
      title: 'New Restaurant Added',
      message: 'Green Bowl is now available in your area. Check out their healthy options!',
      time: '1 day ago',
      read: true,
      icon: 'storefront',
      iconColor: '#8b5cf6',
    },
    {
      id: '5',
      type: 'order',
      title: 'Order Cancelled',
      message: 'Your order from Thai Garden has been cancelled. Refund will be processed within 3-5 business days.',
      time: '2 days ago',
      read: true,
      icon: 'close-circle',
      iconColor: '#ef4444',
    },
    {
      id: '6',
      type: 'promotion',
      title: 'Free Delivery Weekend',
      message: 'Enjoy free delivery on all orders this weekend. No minimum order required!',
      time: '3 days ago',
      read: true,
      icon: 'bicycle',
      iconColor: '#10b981',
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      {/* Content area with light background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', flex: 1 }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            onPress={markAllAsRead}
            style={{
              backgroundColor: '#f3a823',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 120,
            height: 120,
            backgroundColor: '#f3f4f6',
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <Ionicons name="notifications-outline" size={60} color="#9ca3af" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
            No notifications yet
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
            We'll notify you about order updates, promotions, and more!
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {/* Unread Count */}
          {unreadCount > 0 && (
            <View style={{ 
              backgroundColor: '#fef3c7', 
              paddingHorizontal: 16, 
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#fde68a',
            }}>
              <Text style={{ color: '#92400e', fontSize: 14, fontWeight: '600' }}>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View style={{ padding: 16 }}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
                style={{
                  backgroundColor: notification.read ? '#fff' : '#f0f9ff',
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: notification.read ? '#e5e7eb' : '#f3a823',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${notification.iconColor}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons 
                      name={notification.icon as any} 
                      size={20} 
                      color={notification.iconColor} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: notification.read ? '600' : 'bold', 
                        color: '#111827',
                        flex: 1,
                      }}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#f97316',
                          marginLeft: 8,
                          marginTop: 4,
                        }} />
                      )}
                    </View>
                    
                    <Text style={{ 
                      color: '#6b7280', 
                      fontSize: 14, 
                      lineHeight: 20,
                      marginBottom: 8,
                    }}>
                      {notification.message}
                    </Text>
                    
                    <Text style={{ 
                      color: '#9ca3af', 
                      fontSize: 12,
                      fontWeight: '500',
                    }}>
                      {notification.time}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      {/* Footer Navigation - positioned above bottom safe area */}
      <FooterNavigation navigation={navigation} activeScreen="Home" />

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}
