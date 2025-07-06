import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyles, createResponsiveValue, createResponsiveSpacing, createResponsiveFontSize } from '../hooks/useResponsiveStyles';
import { useThemeColors } from '../contexts/ThemeContext';

interface MobileHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNotificationPress?: () => void;
  onWishlistPress?: () => void;
}

export default function MobileHeader({
  searchQuery,
  onSearchChange,
  onNotificationPress,
  onWishlistPress
}: MobileHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const colors = useThemeColors();

  // Create responsive styles
  const styles = useResponsiveStyles((screenInfo) => ({
    container: {
      shadowColor: colors.isDark ? '#ffffff' : '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: createResponsiveSpacing(screenInfo, 16),
      paddingVertical: createResponsiveSpacing(screenInfo, 12),
      minHeight: createResponsiveValue(screenInfo, {
        mobile: 56,
        tablet: 64,
        largeTablet: 72,
      }),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      width: createResponsiveValue(screenInfo, {
        mobile: 32,
        tablet: 36,
        largeTablet: 40,
      }),
      height: createResponsiveValue(screenInfo, {
        mobile: 32,
        tablet: 36,
        largeTablet: 40,
      }),
      backgroundColor: 'white',
      borderRadius: createResponsiveValue(screenInfo, {
        mobile: 8,
        tablet: 10,
        largeTablet: 12,
      }),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: createResponsiveSpacing(screenInfo, 12),
    },
    logoText: {
      fontWeight: 'bold',
      fontSize: createResponsiveFontSize(screenInfo, 18),
      color: colors.primary,
    },
    locationSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationIcon: {
      marginRight: createResponsiveSpacing(screenInfo, 8),
    },
    locationTextContainer: {
      flex: 1,
    },
    locationTitle: {
      fontSize: createResponsiveFontSize(screenInfo, 16),
      fontWeight: '600',
      color: 'white',
    },
    locationSubtitle: {
      fontSize: createResponsiveFontSize(screenInfo, 14),
      color: 'white',
      opacity: 0.9,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: createResponsiveSpacing(screenInfo, 8),
      marginLeft: createResponsiveSpacing(screenInfo, 4),
    },
    searchContainer: {
      paddingHorizontal: createResponsiveSpacing(screenInfo, 16),
      paddingBottom: createResponsiveSpacing(screenInfo, 16),
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: createResponsiveValue(screenInfo, {
        mobile: 20,
        tablet: 22,
        largeTablet: 24,
      }),
      paddingHorizontal: createResponsiveSpacing(screenInfo, 12),
      paddingVertical: createResponsiveSpacing(screenInfo, 8),
      borderWidth: isSearchFocused ? 2 : 1,
      borderColor: isSearchFocused ? colors.primary : colors.border,
      height: createResponsiveValue(screenInfo, {
        mobile: 41,
        tablet: 43,
        largeTablet: 45,
      }),

    },
    searchIcon: {
      marginRight: createResponsiveSpacing(screenInfo, 8),
    },
    searchInput: {
      flex: 1,
      fontSize: createResponsiveFontSize(screenInfo, 14),
      color: colors.text,
      paddingVertical: 0,
    },
    clearButton: {
      marginLeft: createResponsiveSpacing(screenInfo, 8),
    },
  }));

  return (
    <View
      style={[styles.container, { backgroundColor: colors.primary }]}
    >
      {/* Top Row - Logo, Location, Wishlist, Notifications */}
      <View style={styles.topRow}>
        {/* Left Side - Logo and Location */}
        <View style={styles.leftSection}>
          {/* Logo */}
          <TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>T</Text>
            </View>
          </TouchableOpacity>

          {/* Location */}
          <View style={styles.locationSection}>
            <Ionicons
              name="location"
              size={24}
              color="white"
              style={styles.locationIcon}
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>Ayala Blvd</Text>
              <Text style={styles.locationSubtitle}>Current Location</Text>
            </View>
          </View>
        </View>

        {/* Right Icons */}
        <View style={styles.rightSection}>
          {/* Wishlist */}
          <TouchableOpacity onPress={onWishlistPress} style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            {/* Notification Badge */}
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 12,
              height: 12,
              backgroundColor: colors.notification,
              borderRadius: 6,
            }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Pizza Hut 50% OFF Flash Sale!"
            placeholderTextColor={colors.textSecondary}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
