import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyles, createResponsiveValue, createResponsiveSpacing, createResponsiveFontSize } from '../hooks/useResponsiveStyles';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AddressService } from '@encreasl/client-services';
import AddressSelectionModal from './AddressSelectionModal';

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
  const { user, token } = useAuth();
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Fetch active address on mount
  useEffect(() => {
    const fetchActiveAddress = async () => {
      if (!user?.id || !token) return;

      setIsLoadingAddress(true);
      try {
        // 1. Try to get explicitly active address
        const response = await AddressService.getActiveAddress(user.id, token);
        if (response.success && response.address) {
          setSelectedAddress(response.address);
        } else {
          // 2. Fallback: Get most recent user address (matching apps/web logic)
          console.log('No active address found, falling back to most recent...');
          const addressesResponse = await AddressService.getUserAddresses(user.id, token, false);
          if (addressesResponse.success && addressesResponse.addresses && addressesResponse.addresses.length > 0) {
            // API returns sorted by -createdAt, so first is newest
            const mostRecent = addressesResponse.addresses[0];
            setSelectedAddress(mostRecent);
            
            // Optionally try to set it as active in background to fix the data
            // AddressService.setActiveAddressForUser(user.id, mostRecent.id, token).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Failed to load active address:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchActiveAddress();
  }, [user?.id, token]);

  // Create responsive styles
  const styles = useResponsiveStyles((screenInfo) => ({
    container: {
      backgroundColor: 'white',
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
    locationSkeleton: {
      width: createResponsiveValue(screenInfo, {
        mobile: 140,
        tablet: 200,
        largeTablet: 240,
      }),
      height: 14,
      borderRadius: 7,
      backgroundColor: '#E5E7EB',
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

  const handleAddressSelected = (address: any) => {
    setSelectedAddress(address);
    // Optionally trigger a callback to parent if needed
  };

  const displayAddress = selectedAddress 
    ? (selectedAddress.formatted_address || selectedAddress.name || 'Set Address')
    : 'Select Location';

  return (
    <>
      <View style={styles.container}>
        {/* Left Side - Location */}
        <TouchableOpacity 
          style={styles.leftSection}
          onPress={() => setIsAddressModalVisible(true)}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.locationIcon}
          />
          {isLoadingAddress ? (
            <View style={styles.locationSkeleton} />
          ) : (
            <Text style={styles.locationText} numberOfLines={1}>
              {displayAddress}
            </Text>
          )}
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

      <AddressSelectionModal
        isVisible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onAddressSelected={handleAddressSelected}
      />
    </>
  );
}
