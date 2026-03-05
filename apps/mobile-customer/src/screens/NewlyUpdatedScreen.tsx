import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import LocationMerchantCard from '../components/LocationMerchantCard';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';
import { 
  useLocationBasedMerchants, 
  useMerchantAddresses,
  LocationBasedMerchant,
  sortMerchantsByRecentlyUpdated
} from '@encreasl/client-services';

export default function NewlyUpdatedScreen({ navigation }: any) {
  const colors = useThemeColors();
  const { customerId } = useAuth();
  
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Fetch all nearby merchants (limit: 50 for now)
  const { 
    data: merchants = [], 
    isLoading, 
    isRefetching,
    refetch 
  } = useLocationBasedMerchants(
    customerId || undefined, 
    null, // No category filter
    50
  );

  // Sort by recently updated
  const sortedMerchants = useMemo(() => {
    return sortMerchantsByRecentlyUpdated(merchants);
  }, [merchants]);

  // Fetch active addresses for merchants
  const { data: addressMap = {} } = useMerchantAddresses(merchants);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleMerchantPress = (merchant: LocationBasedMerchant) => {
    navigation.navigate('Merchant', { 
      merchantId: merchant.id,
      distanceKm: (merchant as any).distanceKm,
      distanceInMeters: (merchant as any).distanceInMeters
    });
  };

  const renderItem = ({ item }: { item: LocationBasedMerchant }) => (
    <View style={styles.cardContainer}>
      <LocationMerchantCard
        merchant={item}
        onPress={handleMerchantPress}
        addressName={addressMap[item.id] || null}
        isWishlisted={isWishlisted(item.id)}
        onToggleWishlist={toggleWishlist}
      />
    </View>
  );

  const showSkeleton = isLoading && !isRefetching;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Newly Updated
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {showSkeleton ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding updated restaurants...
          </Text>
        </View>
      ) : (
        <PullToRefreshLayout
          isRefreshing={isRefetching}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        >
          {sortedMerchants.length > 0 ? (
            sortedMerchants.map(merchant => (
               <View key={merchant.id} style={styles.cardWrapper}>
                 {renderItem({ item: merchant })}
               </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No newly updated restaurants found nearby.
              </Text>
            </View>
          )}
        </PullToRefreshLayout>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardContainer: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});
