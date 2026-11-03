import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../hooks/useWishlist';
import LocationMerchantCard from '../components/LocationMerchantCard';
import { useThemeColors } from '../contexts/ThemeContext';
import { LocationBasedMerchant, useMerchantAddresses } from '@encreasl/client-services';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';

import { useNavigation } from '../navigation/NavigationContext';

type WishlistMerchant = LocationBasedMerchant & {
  activeAddress?: { formatted_address?: string | null } | null;
};

function getActiveAddressName(merchant: LocationBasedMerchant): string | null {
  const activeAddress = (merchant as WishlistMerchant).activeAddress;
  return typeof activeAddress?.formatted_address === 'string'
    ? activeAddress.formatted_address
    : null;
}

export default function WishlistScreen() {
  const navigation = useNavigation();
  const {
    wishlistDocs,
    isLoading,
    isRefetching,
    isError,
    isWishlisted,
    toggleWishlist,
    refetch,
  } = useWishlist({ includeDocs: true });
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  const merchants = useMemo(() => {
    return wishlistDocs
      .map((doc) => doc.merchant)
      .filter((merchant): merchant is LocationBasedMerchant =>
        !!merchant && typeof merchant === 'object'
      );
  }, [wishlistDocs]);

  const merchantsNeedingAddress = useMemo(
    () => merchants.filter((merchant) => !getActiveAddressName(merchant)),
    [merchants],
  );
  const { data: addressMap = {} } = useMerchantAddresses(merchantsNeedingAddress);

  const handleMerchantPress = (merchant: LocationBasedMerchant) => {
    navigation.navigate('Merchant', { 
      merchantId: merchant.id,
      distanceKm: (merchant as any).distanceKm,
      distanceInMeters: (merchant as any).distanceInMeters
    });
  };

  const handleRefresh = useCallback(async () => {
    // Force refetch of wishlist
    await refetch();
  }, [refetch]);

  const showSkeleton = isLoading || isRefetching;

  const contentStyle = useMemo(() => {
    if (merchants.length === 0 && !showSkeleton) {
      return styles.emptyContainer;
    }
    return styles.listContent;
  }, [merchants.length, showSkeleton]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Wishlist
        </Text>
      </View>

      <PullToRefreshLayout 
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        contentContainerStyle={contentStyle}
      >
        {showSkeleton ? (
          [1, 2, 3].map(key => (
            <View key={key} style={styles.cardWrapper}>
              <View
                style={{
                  width: '100%',
                  // Mimic LocationMerchantCard height roughly
                  height: width * 0.6, 
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  padding: 16,
                }}
              >
                <View style={{ width: '100%', height: '60%', borderRadius: 12, backgroundColor: '#E5E7EB', marginBottom: 12 }} />
                <View style={{ width: '60%', height: 16, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
                <View style={{ width: '40%', height: 16, borderRadius: 8, backgroundColor: '#E5E7EB' }} />
              </View>
            </View>
          ))
        ) : isError && merchants.length === 0 ? (
          <>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cloud-offline-outline" size={60} color="#9ca3af" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Couldn&apos;t load your wishlist
            </Text>
            <Text style={styles.emptySubtitle}>
              Please check your connection and try again.
            </Text>
            <TouchableOpacity onPress={() => void refetch()} style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        ) : merchants.length === 0 ? (
          <>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="heart-outline" size={60} color="#9ca3af" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Your wishlist is empty
            </Text>
            <Text style={styles.emptySubtitle}>
              Save your favorite restaurants to find them easily later!
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreButtonText}>
                Explore Restaurants
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {isError && (
              <View style={styles.refreshError}>
                <Text style={styles.refreshErrorText}>Couldn&apos;t refresh your wishlist.</Text>
                <TouchableOpacity onPress={() => void refetch()}>
                  <Text style={styles.refreshErrorAction}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            {merchants.map((merchant) => (
              <View key={merchant.id} style={styles.cardWrapper}>
                <LocationMerchantCard
                  merchant={merchant}
                  onPress={handleMerchantPress}
                  addressName={getActiveAddressName(merchant) || addressMap[merchant.id] || null}
                  isWishlisted={isWishlisted(merchant.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </View>
            ))}
          </>
        )}
      </PullToRefreshLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontSize: 16,
  },
  exploreButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  refreshError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  refreshErrorText: {
    color: '#991b1b',
    flex: 1,
  },
  refreshErrorAction: {
    color: '#b91c1c',
    fontWeight: '600',
    marginLeft: 12,
  },
});
