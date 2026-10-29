import React, { useState } from 'react';
import { View, Image, useWindowDimensions, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import {
  HOME_OVERVIEW_KEYS,
  useHomeOverview,
  dataCache,
  type RecommendedProduct
} from '@encreasl/client-services';
import LocationBasedProductCategoriesCarousel from '../components/LocationBasedProductCategoriesCarousel';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';
import { useNavigation } from '../navigation/NavigationContext';
import LocationBasedMerchants from '../components/LocationBasedMerchants';

export default function HomeScreen() {
  // console.log('🏠 HomeScreen: Component initializing...');

  const navigation = useNavigation();

  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const { customerId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();

  // State for location-based features
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // No need for local customerId fetching logic anymore as it's handled in AuthContext

  // BFF single query (docs/BFF-pattern.md): one aggregation endpoint drives
  // Categories + Nearby + Newly Updated + Recommended. Thin frontend.
  const {
    data: overview = null,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useHomeOverview(
    customerId,
    20,
    selectedCategoryId,
    { staleTime: 1000 * 60 * 5 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Pull-to-refresh triggered (TanStack Query)');

      // Clear internal service memory cache to ensure fresh data fetch
      dataCache.clear();

      // Reset queries to clear cache and force fresh fetch
      await Promise.all([
        queryClient.resetQueries({ queryKey: HOME_OVERVIEW_KEYS.all }),
        // Customer ID is now managed by AuthContext and is stable
      ]);

    } catch (error) {
      console.error('Pull-to-refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null, categorySlug: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategorySlug(categorySlug);
  };

  const handleMerchantPress = (merchant: any) => {
    // Navigate to Merchant Details
    console.log('Merchant pressed:', merchant.id);
    navigation.navigate('Merchant', {
      merchantId: merchant.id,
      distanceKm: merchant.distanceKm,
      distanceInMeters: merchant.distanceInMeters
    });
  };

  const handleProductPress = (product: RecommendedProduct) => {
    navigation.navigate('Product', {
      productId: product.id,
      merchantId: product.merchantId,
      merchantProductId: product.merchantProductId,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top safe area above header - brand color */}
      <SafeAreaView style={{ backgroundColor: '#eba236' }} edges={['top']} />

      {/* Mobile Header - Now responsive for tablets */}
      <MobileHeader
        navigation={navigation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchPress={() => {
          // TODO: Implement search modal or toggle search bar
          console.log('Search pressed');
        }}
        onWishlistPress={() => {
          navigation.navigate('Wishlist');
        }}
      />

      {/* Content area with theme background - Clean white screen as requested */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PullToRefreshLayout
          isRefreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ flexGrow: 1, padding: 0, margin: 0 }}
        >
          {/* Banner Image */}
          <Image
            source={require('../../assets/tap2go-campaign-banner(1).png')}
            style={{
              width: width - 20, // Full width minus 10px padding on each side (margin: 10 * 2)
              height: (width - 20) * (300 / 1400), // Maintain aspect ratio based on new width
              margin: 10,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />

          {/* Categories Carousel (BFF-driven) */}
          {customerId ? (
            overviewError ? (
              <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  We couldn&apos;t load nearby merchants right now.
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                  Check your connection and try again.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => void refetchOverview()}
                  style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary }}
                >
                  <Text style={{ color: colors.surface, fontWeight: '600' }}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <LocationBasedProductCategoriesCarousel
                  customerId={customerId}
                  selectedCategorySlug={selectedCategorySlug}
                  onCategorySelect={handleCategorySelect}
                  overviewCategories={overview?.categories ?? null}
                  overviewLoading={overviewLoading}
                />
                <LocationBasedMerchants
                  customerId={customerId}
                  categoryId={selectedCategoryId}
                  onMerchantPress={handleMerchantPress}
                  onProductPress={handleProductPress}
                  overview={overview}
                  overviewLoading={overviewLoading}
                />
              </>
            )
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Please log in to see nearby merchants.</Text>
            </View>
          )}

          {/* Bottom Padding for scroll */}
          <View style={{ height: 5 }} />
        </PullToRefreshLayout>
      </View>
    </View>
  );
}
