import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function AccountScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person-outline', title: 'Edit Profile', subtitle: 'Update your personal information' },
        { icon: 'location-outline', title: 'Addresses', subtitle: 'Manage delivery addresses' },
        { icon: 'card-outline', title: 'Payment Methods', subtitle: 'Add or edit payment options' },
      ]
    },
    {
      section: 'Orders',
      items: [
        { icon: 'receipt-outline', title: 'Order History', subtitle: 'View your past orders' },
        { icon: 'heart-outline', title: 'Favorites', subtitle: 'Your favorite restaurants and dishes' },
        { icon: 'star-outline', title: 'Reviews', subtitle: 'Rate and review your orders' },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle-outline', title: 'Help Center', subtitle: 'Get answers to common questions' },
        { icon: 'chatbubble-outline', title: 'Contact Support', subtitle: 'Chat with our support team' },
        { icon: 'document-text-outline', title: 'Terms & Privacy', subtitle: 'Read our policies' },
      ]
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      {/* Content area with light background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
            Account
          </Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Section */}
        <View style={{
          backgroundColor: '#fff',
          margin: 16,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginRight: 16,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                John Doe
              </Text>
              <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                john.doe@example.com
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 14 }}>
                  4.9 • 127 orders
                </Text>
              </View>
            </View>
            <TouchableOpacity style={{
              backgroundColor: '#f97316',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                Gold
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={{
          backgroundColor: '#fff',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f97316' }}>127</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Orders</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>$2,340</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Saved</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>23</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={{
          backgroundColor: '#fff',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
            Preferences
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: '#111827' }}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#f97316' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: '#111827' }}>
                Location Services
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#e5e7eb', true: '#f97316' }}
              thumbColor={locationEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#111827',
              padding: 20,
              paddingBottom: 12,
            }}>
              {section.section}
            </Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopWidth: itemIndex > 0 ? 1 : 0,
                  borderTopColor: '#f3f4f6',
                }}
              >
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, color: '#111827', marginBottom: 2 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={{
          backgroundColor: '#fff',
          marginHorizontal: 16,
          marginBottom: 32,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, color: '#ef4444', fontWeight: '600' }}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}
