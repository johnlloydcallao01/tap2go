import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  LocationBasedMerchant,
  sortMerchantsByRecentlyUpdated,
  useLocationBasedMerchants,
  useMerchantAddresses
} from '@encreasl/client-services';
import LocationMerchantCard from './LocationMerchantCard';
import RecommendedForYou from './RecommendedForYou';
import { useThemeColors } from '../contexts/ThemeContext';
import { useWishlist } from '../hooks/useWishlist';
import { useNavigation } from '../navigation/NavigationContext';
import type { RecommendedProduct, HomeOverview } from '@encreasl/client-services';

interface LocationBasedMerchantsProps {
  customerId?: string;
  limit?: number;
  categoryId?: string | null;
  onMerchantPress?: (merchant: LocationBasedMerchant) => void;
  onProductPress?: (product: RecommendedProduct) => void;
  /**
   * BFF-provided overview (docs/BFF-pattern.md): when defined, Nearby /
   * Newly Updated / Recommended render from it instead of firing their own
   * raw queries. `undefined` keeps the legacy hook path (other screens).
   */
  overview?: HomeOverview | null;
  overviewLoading?: boolean;
}

function MerchantCardSkeleton({ width }: { width: number }) {
  return (
    <View
      style={{
        width: width * 0.75,
        marginRight: 16,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        padding: 16,
      }}
    >
      <View
        style={{
          width: '100%',
          height: 140,
          borderRadius: 12,
          backgroundColor: '#E5E7EB',
          marginBottom: 12,
        }}
      />
      <View
        style={{
          width: '60%',
          height: 12,
          borderRadius: 6,
          backgroundColor: '#E5E7EB',
          marginBottom: 8,
        }}
      />
      <View
        style={{
          width: '40%',
          height: 10,
          borderRadius: 5,
          backgroundColor: '#E5E7EB',
        }}
      />
    </View>
  );
}

function VerticalMerchantCardSkeleton() {
  return (
    <View
      style={{
        width: '100%',
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        padding: 16,
      }}
    >
      <View
        style={{
          width: '100%',
          height: 140,
          borderRadius: 12,
          backgroundColor: '#E5E7EB',
          marginBottom: 12,
        }}
      />
      <View
        style={{
          width: '60%',
          height: 12,
          borderRadius: 6,
          backgroundColor: '#E5E7EB',
          marginBottom: 8,
        }}
      />
      <View
        style={{
          width: '40%',
          height: 10,
          borderRadius: 5,
          backgroundColor: '#E5E7EB',
        }}
      />
    </View>
  );
}

export default function LocationBasedMerchants({
  customerId,
  limit = 20,
  categoryId,
  onMerchantPress,
  onProductPress,
  overview,
  overviewLoading = false
}: LocationBasedMerchantsProps) {
  const { isWishlisted, toggleWishlist } = useWishlist({ includeDocs: false });
  const navigation = useNavigation();
  // BFF mode: single overview response drives all sections (no raw queries).
  const useBff = overview !== undefined;

  const {
    data: allMerchants = [],
    isLoading,
  } = useLocationBasedMerchants(
    customerId,
    categoryId,
    limit,
    // Match the service memory-cache TTL (5 min): background revalidations
    // resolve from memory instead of churning every global staleTime.
    // Skipped entirely when the BFF overview provides the data.
    { staleTime: 1000 * 60 * 5, enabled: !useBff }
  );

  // Apply limit logic for display:
  // If no category filter (categoryId is null), show max 8 items.
  // Otherwise, show all (or up to limit passed in props)
  const merchants = useMemo(() => {
    if (useBff) {
      return categoryId
        ? (overview?.filteredMerchants ?? [])
        : (overview?.nearbyMerchants ?? []);
    }
    if (!categoryId) {
      return allMerchants.slice(0, 8);
    }
    return allMerchants;
  }, [useBff, overview, allMerchants, categoryId]);

  // Check if we have more than 8 merchants to show the chevron
  const showChevron = useBff
    ? (!categoryId && (overview?.hasMoreNearby === true))
    : (!categoryId && allMerchants.length > 8);

  // Fetch active addresses for merchants (legacy path only — BFF embeds
  // activeAddressName, eliminating the N+1).
  const { data: legacyAddressMap = {} } = useMerchantAddresses(useBff ? [] : merchants);
  const addressMap = useMemo<Record<string, string>>(() => {
    if (!useBff) return legacyAddressMap as Record<string, string>;
    const map: Record<string, string> = {};
    for (const m of merchants) {
      const name = (m as { activeAddressName?: string | null }).activeAddressName;
      if (name) map[String(m.id)] = name;
    }
    return map;
  }, [useBff, legacyAddressMap, merchants]);

  // Skeleton only on first load with no rows: background refetches resolve
  // from cache and must not flash skeletons over rendered cards.
  const loading = useBff
    ? (overviewLoading && merchants.length === 0)
    : (isLoading && allMerchants.length === 0);

  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  // Compute newly updated merchants (Client-side sort using shared logic)
  // Only shown when no category filter is active, matching web logic.
  // In BFF mode the backend already owns the sort.
  const newlyUpdatedMerchantsFull = useMemo(() => {
    if (categoryId) return [];
    if (useBff) return overview?.newlyUpdatedMerchants ?? [];
    return sortMerchantsByRecentlyUpdated(allMerchants);
  }, [useBff, overview, allMerchants, categoryId]);

  const newlyUpdatedMerchants = useMemo(() => {
    if (useBff) return newlyUpdatedMerchantsFull;
    return newlyUpdatedMerchantsFull.slice(0, 8);
  }, [useBff, newlyUpdatedMerchantsFull]);

  const showChevronNewlyUpdated = useBff
    ? (overview?.hasMoreNewlyUpdated === true)
    : (newlyUpdatedMerchantsFull.length > 8);

  const handleNavigateToNearby = () => {
    navigation.navigate('NearbyRestaurants');
  };

  const handleNavigateToNewlyUpdated = () => {
    navigation.navigate('NewlyUpdated');
  };

  if (!customerId) return null;

  // Newly Updated only ever exists on the unfiltered home view
  const showNewlyUpdatedSection = !categoryId && (loading || newlyUpdatedMerchants.length > 0);

  return (
    <View style={styles.container}>
      {/* ================= Nearby Merchants Section ================= */}
      <View style={styles.sectionContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              {categoryId ? 'Filtered Merchants' : 'Nearby Merchants'}
            </Text>
            {showChevron && (
              <TouchableOpacity
                onPress={handleNavigateToNearby}
                style={styles.chevronButton}
              >
                <Ionicons name="chevron-forward" size={16} color="#333" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          categoryId ? (
            <View style={styles.verticalList}>
              {[1, 2, 3].map(key => (
                <VerticalMerchantCardSkeleton key={key} />
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 16}
            >
              {[1, 2, 3].map(key => (
                <MerchantCardSkeleton key={key} width={width} />
              ))}
            </ScrollView>
          )
        ) : merchants.length > 0 ? (
          categoryId ? (
            <View style={styles.verticalList}>
              {merchants.map((merchant) => (
                <View
                  key={merchant.id}
                  style={{ width: '100%', marginBottom: 16 }}
                >
                  <LocationMerchantCard
                    merchant={merchant}
                    onPress={onMerchantPress}
                    addressName={addressMap[merchant.id] || null}
                    isWishlisted={isWishlisted(merchant.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </View>
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 16} // card width + margin
            >
              {merchants.map((merchant) => (
                <View
                  key={merchant.id}
                  style={{ width: width * 0.75, marginRight: 16 }}
                >
                  <LocationMerchantCard
                    merchant={merchant}
                    onPress={onMerchantPress}
                    addressName={addressMap[merchant.id] || null}
                    isWishlisted={isWishlisted(merchant.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No merchants found nearby.
            </Text>
          </View>
        )}
      </View>

      {/* ================= Recommended For You (location-gated products) ================= */}
      {/* BFF mode: products + pills come from the overview response. */}
      {/* Legacy mode: reuses the already-loaded Nearby merchants */}
      {/* (`allMerchants`, limit=20) with zero extra location fetch. */}
      <RecommendedForYou
        customerId={customerId}
        categoryId={categoryId}
        onProductPress={onProductPress}
        eligibleMerchants={useBff ? null : allMerchants}
        overviewProducts={useBff ? (overview?.recommendedProducts ?? null) : undefined}
        overviewCategories={useBff ? (overview?.recommendedCategories ?? null) : undefined}
        overviewHasOrphans={useBff ? (overview?.recommendedHasOrphans === true) : undefined}
        overviewLoading={useBff ? overviewLoading : undefined}
      />

      {/* Newly Updated Section - Independent skeleton rendered in its real position */}
      {showNewlyUpdatedSection && (
        <View style={styles.sectionContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>
                Newly Updated
              </Text>
              {!loading && showChevronNewlyUpdated && (
                <TouchableOpacity
                  onPress={handleNavigateToNewlyUpdated}
                  style={styles.chevronButton}
                >
                  <Ionicons name="chevron-forward" size={16} color="#333" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 16}
            >
              {[1, 2, 3].map(key => (
                <MerchantCardSkeleton key={`newly-${key}`} width={width} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 16} // card width + margin
            >
              {newlyUpdatedMerchants.map((merchant) => (
                <View
                  key={`newly-${merchant.id}`}
                  style={{ width: width * 0.75, marginRight: 16 }}
                >
                  <LocationMerchantCard
                    merchant={merchant}
                    onPress={onMerchantPress}
                    addressName={addressMap[merchant.id] || null}
                    isWishlisted={isWishlisted(merchant.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 0,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chevronButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  list: {
    // Items handle their own spacing
  },
  horizontalList: {
    paddingRight: 16,
  },
  verticalList: {
    paddingHorizontal: 0,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  }
});
