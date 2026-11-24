import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  View,
  Image,
  FlatList,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import {
  ADDRESS_KEYS,
  AddressService,
  useHomeOverview,
  HomeOverviewService,
  HOME_OVERVIEW_KEYS,
  clearHomeOverviewCache,
  type RecommendedProduct
} from '@encreasl/client-services';
import LocationBasedProductCategoriesCarousel from '../components/LocationBasedProductCategoriesCarousel';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';
import { useNavigation } from '../navigation/NavigationContext';
import LocationBasedMerchants from '../components/LocationBasedMerchants';

const HOME_OVERVIEW_STALE_TIME_MS = 30_000;
const HOME_BANNER_AUTOPLAY_INTERVAL_MS = 5_000;
const HOME_BANNER_ASPECT_RATIO = 2.65;
const HOME_BANNERS = [
  require('../../assets/home-banners/banner-1.jpg'),
  require('../../assets/home-banners/banner-2.jpg'),
  require('../../assets/home-banners/banner-3.jpg'),
  require('../../assets/home-banners/banner-4.jpg'),
  require('../../assets/home-banners/banner-5.jpg'),
  require('../../assets/home-banners/banner-6.jpg'),
  require('../../assets/home-banners/banner-7.jpg'),
  require('../../assets/home-banners/banner-8.jpg'),
];

export default function HomeScreen() {
  // console.log('🏠 HomeScreen: Component initializing...');

  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const colors = useThemeColors();
  const { customerId, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerListRef = useRef<FlatList<number>>(null);
  const bannerInteraction = useRef(false);
  const bannerWidth = width - 32;
  const bannerHeight = bannerWidth / HOME_BANNER_ASPECT_RATIO;

  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerInteraction.current) return;

      const nextIndex = (activeBannerIndex + 1) % HOME_BANNERS.length;
      bannerListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: nextIndex !== 0,
      });
      setActiveBannerIndex(nextIndex);
    }, HOME_BANNER_AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeBannerIndex, width]);

  // State for location-based features
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshInProgress = useRef(false);
  const [recommendationsVisible, setRecommendationsVisible] = useState(false);
  const scrollOffset = useRef(0);
  const viewportHeight = useRef(0);
  const recommendationsTop = useRef<number | null>(null);

  const maybeLoadRecommendations = () => {
    if (
      recommendationsTop.current !== null &&
      recommendationsTop.current <= scrollOffset.current + viewportHeight.current + 400
    ) {
      setRecommendationsVisible(true);
    }
  };

  // No need for local customerId fetching logic anymore as it's handled in AuthContext

  // Load above-the-fold data first; the recommendations section is fetched
  // separately when its layout approaches the viewport.
  const {
    data: overview = null,
    isLoading: overviewLoading,
    isFetching: overviewFetching,
    isError: overviewError,
  } = useHomeOverview(
    customerId,
    20,
    selectedCategoryId,
    {
      staleTime: HOME_OVERVIEW_STALE_TIME_MS,
      refetchInterval: 60_000,
      section: 'primary',
    },
  );
  const recommendationsQuery = useHomeOverview(
    customerId,
    20,
    selectedCategoryId,
    {
      staleTime: HOME_OVERVIEW_STALE_TIME_MS,
      refetchInterval: 60_000,
      enabled: recommendationsVisible && !overviewFetching && !selectedCategoryId,
      section: 'recommendations',
    },
  );

  const forceRefetchHome = async (
    requests: {
      queryKey: ReturnType<typeof HOME_OVERVIEW_KEYS.detail>;
      section: 'all' | 'primary' | 'recommendations';
      mirrorRecommendations?: boolean;
    }[],
    showRefreshIndicator = false,
    refreshActiveAddress = false,
  ) => {
    if (!customerId) return;
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    if (showRefreshIndicator) setRefreshing(true);
    try {
      if (showRefreshIndicator) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      if (refreshActiveAddress && user?.id) {
        AddressService.clearCache();
        await queryClient.resetQueries({
          queryKey: ADDRESS_KEYS.active(String(user.id)),
          exact: true,
        });
      }
      clearHomeOverviewCache();
      const queryKeysToCancel = requests.flatMap(({ queryKey, mirrorRecommendations }) => [
        queryKey,
        ...(mirrorRecommendations
          ? [
              HOME_OVERVIEW_KEYS.detail(
                String(customerId),
                20,
                selectedCategoryId,
                'recommendations',
              ),
            ]
          : []),
      ]);
      await Promise.all(
        queryKeysToCancel.map((queryKey) => queryClient.cancelQueries({ queryKey, exact: true })),
      );
      const results = await Promise.all(
        requests.map(({ queryKey, section }) =>
          queryClient.fetchQuery({
            queryKey,
            staleTime: 0,
            queryFn: () =>
              HomeOverviewService.getHomeOverview({
                customerId: String(customerId),
                limit: 20,
                categoryId: selectedCategoryId,
                section,
                forceRefresh: true,
              }),
          }),
        ),
      );
      requests.forEach((request, index) => {
        if (request.mirrorRecommendations && results[index]) {
          queryClient.setQueryData(
            HOME_OVERVIEW_KEYS.detail(
              String(customerId),
              20,
              selectedCategoryId,
              'recommendations',
            ),
            results[index],
          );
        }
      });
    } catch (error) {
      console.error('Home refresh failed:', error);
    } finally {
      refreshInProgress.current = false;
      if (showRefreshIndicator) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    const requests: {
      queryKey: ReturnType<typeof HOME_OVERVIEW_KEYS.detail>;
      section: 'all' | 'primary' | 'recommendations';
      mirrorRecommendations?: boolean;
    }[] = [
      {
        queryKey: HOME_OVERVIEW_KEYS.detail(customerId || '', 20, selectedCategoryId, 'primary'),
        section: selectedCategoryId ? 'primary' : 'all',
        mirrorRecommendations: !selectedCategoryId,
      },
    ];
    return forceRefetchHome(requests, true, true);
  };

  const retryOverview = () =>
    forceRefetchHome([
      {
        queryKey: HOME_OVERVIEW_KEYS.detail(customerId || '', 20, selectedCategoryId, 'primary'),
        section: 'primary',
      },
    ]);

  const retryRecommendations = () =>
    forceRefetchHome([
      {
        queryKey: HOME_OVERVIEW_KEYS.detail(customerId || '', 20, selectedCategoryId, 'recommendations'),
        section: 'recommendations',
      },
    ]);

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
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
          maybeLoadRecommendations();
        }}
      >
        <PullToRefreshLayout
          isRefreshing={refreshing}
          onRefresh={onRefresh}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
            maybeLoadRecommendations();
          }}
          scrollEventThrottle={100}
          contentContainerStyle={{ flexGrow: 1, padding: 0, margin: 0 }}
        >
          <View>
            <FlatList
              ref={bannerListRef}
              data={HOME_BANNERS}
              horizontal
              pagingEnabled
              initialNumToRender={1}
              keyExtractor={(_, index) => `home-banner-${index}`}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={() => {
                bannerInteraction.current = true;
              }}
              onMomentumScrollBegin={() => {
                bannerInteraction.current = true;
              }}
              onScrollEndDrag={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveBannerIndex(index);
                bannerInteraction.current = false;
              }}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveBannerIndex(index);
                bannerInteraction.current = false;
              }}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    width,
                    height: bannerHeight + 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: bannerWidth,
                      height: bannerHeight,
                      borderRadius: 12,
                      backgroundColor: '#fff7ed',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Image
                      source={item}
                      accessible
                      accessibilityLabel={`Featured promotion ${index + 1} of ${HOME_BANNERS.length}`}
                      resizeMode="contain"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                        backgroundColor: '#fff7ed',
                      }}
                    />
                  </View>
                </View>
              )}
            />
          </View>

          {/* Categories Carousel (BFF-driven) */}
          {customerId ? (
            overviewError && !overview ? (
              <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  We couldn&apos;t load nearby merchants right now.
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                  Check your connection and try again.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => void retryOverview()}
                  style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary }}
                >
                  <Text style={{ color: colors.surface, fontWeight: '600' }}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {overviewError && overview ? (
                  <Text
                    accessibilityRole="alert"
                    style={{
                      color: colors.textSecondary,
                      paddingHorizontal: 16,
                      paddingTop: 8,
                    }}
                  >
                    Couldn&apos;t refresh right now. Showing your last loaded results.
                  </Text>
                ) : null}
                <LocationBasedProductCategoriesCarousel
                  customerId={customerId}
                  selectedCategorySlug={selectedCategorySlug}
                  onCategorySelect={handleCategorySelect}
                  overviewCategories={overview?.categories ?? null}
                  overviewLoading={overviewLoading || refreshing}
                />
                <LocationBasedMerchants
                  customerId={customerId}
                  categoryId={selectedCategoryId}
                  onMerchantPress={handleMerchantPress}
                  onProductPress={handleProductPress}
                  overview={overview}
                  overviewLoading={overviewLoading || refreshing}
                  recommendationsOverview={recommendationsQuery.data}
                  recommendationsLoading={
                    refreshing ||
                    overviewLoading ||
                    overviewFetching ||
                    !recommendationsVisible ||
                    recommendationsQuery.isLoading
                  }
                  recommendationsError={
                    recommendationsQuery.isError && !recommendationsQuery.data
                  }
                  onRetryRecommendations={() => void retryRecommendations()}
                  onRecommendationsLayout={(top) => {
                    recommendationsTop.current = top;
                    maybeLoadRecommendations();
                  }}
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
