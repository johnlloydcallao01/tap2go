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
import { useTheme, useThemeColors } from '../contexts/ThemeContext';
import DarkModeSettings from '../components/DarkModeSettings';
import SystemThemeValidator from '../components/SystemThemeValidator';


export default function AccountScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [showThemeValidator, setShowThemeValidator] = React.useState(false);
  const colors = useThemeColors();

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
      section: 'Settings',
      items: [
        { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Manage your notification preferences' },
        { icon: 'location-outline', title: 'Location Services', subtitle: 'Control location access' },
        { icon: 'shield-checkmark-outline', title: 'Privacy & Security', subtitle: 'Manage your privacy settings' },
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: colors.primary }} edges={['top']} />

      {/* Content area with theme background */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
            Account
          </Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Section */}
        <View style={{
          backgroundColor: colors.surface,
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
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                John Doe
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
                john.doe@example.com
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={{ marginLeft: 4, color: colors.textSecondary, fontSize: 14 }}>
                  4.9 • 127 orders
                </Text>
              </View>
            </View>
            <TouchableOpacity style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Text style={{ color: colors.surface, fontWeight: '600', fontSize: 14 }}>
                Gold
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={{
          backgroundColor: colors.surface,
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
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>127</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Orders</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>$2,340</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Saved</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>23</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Dark Mode Settings */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <DarkModeSettings />
        </View>

        {/* Theme Validator (Development Tool) */}
        {__DEV__ && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setShowThemeValidator(!showThemeValidator)}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bug" size={24} color={colors.primary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.text,
                  marginLeft: 12,
                }}>
                  Theme Detection Validator
                </Text>
              </View>
              <Ionicons
                name={showThemeValidator ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showThemeValidator && (
              <View style={{ marginTop: 12 }}>
                <SystemThemeValidator />
              </View>
            )}
          </View>
        )}

        {/* Settings */}
        <View style={{
          backgroundColor: colors.surface,
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
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
            Preferences
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.surface : colors.textSecondary}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                Location Services
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={locationEnabled ? colors.surface : colors.textSecondary}
            />
          </View>
        </View>

        {/* Menu Items */}
        {menuItems.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{
              backgroundColor: colors.surface,
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
              color: colors.text,
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
                  borderTopColor: colors.border,
                }}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, color: colors.text, marginBottom: 2 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={{
          backgroundColor: colors.surface,
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


    </View>
  );
}
