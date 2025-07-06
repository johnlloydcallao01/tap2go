import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';

interface FooterNavigationProps {
  navigation: any;
  activeScreen: string;
}

export default function FooterNavigation({ navigation, activeScreen }: FooterNavigationProps) {
  const colors = useThemeColors();

  const tabs = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Orders', icon: 'receipt-outline', screen: 'Orders' },
    { name: 'Cart', icon: 'bag-outline', screen: 'Cart' },
    { name: 'Search', icon: 'search-outline', screen: 'Search' },
    { name: 'Account', icon: 'person-outline', screen: 'Account' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'transparent', // Let parent handle background
      paddingTop: 8,
      paddingBottom: 8,
      height: 60,
    }}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.name}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 4,
          }}
          onPress={() => {
            if (tab.screen !== activeScreen) {
              navigation.navigate(tab.screen);
            }
          }}
        >
          {tab.name === 'Cart' ? (
            // Special elevated circular design for Cart
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -12, // Elevate above other tabs
              shadowColor: colors.text,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 4, // Android shadow
            }}>
              <Ionicons
                name="cart-outline"
                size={22}
                color={colors.textSecondary}
              />
            </View>
          ) : (
            // Regular design for other tabs
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeScreen === tab.screen ? colors.primary : colors.textSecondary}
            />
          )}
          <Text style={{
            fontSize: 10,
            marginTop: tab.name === 'Cart' ? 6 : 2, // Extra spacing for elevated cart
            fontWeight: '500',
            color: activeScreen === tab.screen ? colors.primary : colors.textSecondary,
          }}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
