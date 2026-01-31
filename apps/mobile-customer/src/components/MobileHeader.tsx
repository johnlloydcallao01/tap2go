import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyles, createResponsiveValue, createResponsiveSpacing, createResponsiveFontSize } from '../hooks/useResponsiveStyles';
import { useThemeColors } from '../contexts/ThemeContext';

interface MobileHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onWishlistPress?: () => void;
}

export default function MobileHeader({
  searchQuery,
  onSearchChange,
  onSearchPress,
  onNotificationPress,
  onWishlistPress
}: MobileHeaderProps) {
  const colors = useThemeColors();

  // Create responsive styles
  const styles = useResponsiveStyles((screenInfo) => ({
    container: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      paddingHorizontal: createResponsiveSpacing(screenInfo, 16),
      paddingVertical: createResponsiveSpacing(screenInfo, 8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: createResponsiveValue(screenInfo, {
        mobile: 56,
        tablet: 64,
        largeTablet: 72,
      }),
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    leftSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    locationIcon: {
      marginRight: createResponsiveSpacing(screenInfo, 8),
    },
    locationText: {
      fontSize: createResponsiveFontSize(screenInfo, 14),
      fontWeight: '600',
      color: '#333',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: createResponsiveSpacing(screenInfo, 8),
      marginLeft: createResponsiveSpacing(screenInfo, 4),
    },
  }));

  return (
    <View style={styles.container}>
      {/* Left Side - Location */}
      <TouchableOpacity style={styles.leftSection}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.locationIcon}
        />
        <Text style={styles.locationText} numberOfLines={1}>
          San Marcelino St...
        </Text>
      </TouchableOpacity>

      {/* Right Side - Icons */}
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSearchPress}
        >
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
