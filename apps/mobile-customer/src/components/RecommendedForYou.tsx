import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useRecommendedProducts,
  useMarketplaceProductCategoriesByIds,
  isUncategorizedId,
  UNCATEGORIZED_PRODUCT_CATEGORY_ID,
  type RecommendedProduct,
  type MarketplaceProductCategory,
  type LocationBasedMerchant,
} from '@encreasl/client-services';
import { useThemeColors } from '../contexts/ThemeContext';
import { useNavigation } from '../navigation/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { fetchEffectiveModifierGroups } from '../services/product';
import { apiConfig } from '../config/environment';
import { formatCurrency } from '../utils/format';
import { getMerchantOrderUnavailableMessage } from '../utils/merchantAvailability';

interface RecommendedForYouProps {
  customerId?: string | null;
  /** When a merchant-category filter is active, hide (matches Newly Updated). */
  categoryId?: string | null;
  onProductPress?: (product: RecommendedProduct) => void;
  /**
   * Already-loaded Nearby merchants (copies Newly Updated derive pattern:
   * `sortMerchantsByRecentlyUpdated(allMerchants)` with zero extra fetch).
   * Used as the location gate — no `limit=9999` refetch.
   * Unused in BFF mode.
   */
  eligibleMerchants?: LocationBasedMerchant[] | null;
  /**
   * BFF-provided products/pills (docs/BFF-pattern.md): when defined, no raw
   * queries fire. `undefined` keeps the legacy scoped-query path.
   */
  overviewProducts?: RecommendedProduct[] | null;
  overviewCategories?: MarketplaceProductCategory[] | null;
  overviewHasOrphans?: boolean;
  overviewLoading?: boolean;
  overviewError?: boolean;
  onRetryOverview?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

function ProductCardSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View
      style={{
        width: cardWidth,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        padding: 10,
      }}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          borderRadius: 8,
          backgroundColor: '#E5E7EB',
          marginBottom: 8,
        }}
      />
      <View
        style={{
          width: '80%',
          height: 12,
          borderRadius: 6,
          backgroundColor: '#E5E7EB',
          marginBottom: 6,
        }}
      />
      <View
        style={{
          width: '50%',
          height: 10,
          borderRadius: 5,
          backgroundColor: '#E5E7EB',
        }}
      />
    </View>
  );
}

export default function RecommendedForYou({
  customerId,
  categoryId,
  onProductPress,
  eligibleMerchants = null,
  overviewProducts,
  overviewCategories,
  overviewHasOrphans,
  overviewLoading = false,
  overviewError = false,
  onRetryOverview,
  onLayout,
}: RecommendedForYouProps) {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { addToCart, getMerchantCart, updateQuantity } = useCart();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  // BFF mode: overview response drives products + pills (no raw queries).
  const useBff = overviewProducts !== undefined;

  // Copies Nearby fetching pattern (`LocationBasedMerchants.tsx:118-128`):
  // small-limit single query, `enabled !!customerId`, `staleTime 5min`
  // matching memory TTL (no skeleton flash). Hidden when the merchant
  // filter is active (copies Newly Updated `!categoryId` gate) → no fetch.
  // Pool 48 scoped to eligible merchants (copies merchant-menu per-merchant
  // limit) — never the global 9999+400 waterfall.
  // Skipped entirely in BFF mode.
  // Legacy fallback pool: full eligible-merchant catalogue (no cut — the
  // grid pages through everything with Show More). Unused in BFF mode.
  const poolLimit = 500;
  const { data: fetchedProducts = [], isLoading: productsLoading } = useRecommendedProducts(
    customerId,
    poolLimit,
    {
      // Match the service memory-cache TTL (5 min): background revalidations
      // resolve from memory (copies Nearby caller comment).
      staleTime: 1000 * 60 * 5,
      enabled: !categoryId && !useBff,
      eligibleMerchants,
    },
  );
  // Scoped categories (copies merchant-menu `:280` + merchant-categories
  // `:171-175`): only `where[id][in]=collectedIds`, never global 30.
  // Skipped entirely in BFF mode (backend already scoped them).
  const collectedCategoryIds = useMemo(() => {
    if (useBff) return [];
    const ids: (number | string)[] = [];
    fetchedProducts.forEach((p) => (p.categoryIds || []).forEach((id) => ids.push(id)));
    return Array.from(new Set(ids.map(String)));
  }, [useBff, fetchedProducts]);
  const { data: fetchedCategories = [] } = useMarketplaceProductCategoriesByIds(
    collectedCategoryIds,
  );
  const allProducts = React.useMemo(
    () => (useBff ? (overviewProducts ?? []) : fetchedProducts),
    [useBff, overviewProducts, fetchedProducts],
  );
  const categories = React.useMemo(
    () => (useBff ? (overviewCategories ?? []) : fetchedCategories),
    [useBff, overviewCategories, fetchedCategories],
  );
  const isLoading = useBff ? overviewLoading : productsLoading;

  // ── Pool-driven product-category pills (same as web) ──
  // Only categories owning products in the current location-gated pool get
  // pills — including the "Uncategorized" pseudo pill, shown only when the
  // pool actually contains orphan products (zero categories).
  const poolCategoryIds = useMemo(() => {
    const s = new Set<string>();
    allProducts.forEach((p) => (p.categoryIds || []).forEach((id) => s.add(String(id))));
    return s;
  }, [allProducts]);

  const poolHasOrphans = useMemo(
    () =>
      useBff
        ? (overviewHasOrphans === true)
        : allProducts.some((p) => !p.categoryIds || p.categoryIds.length === 0),
    [useBff, overviewHasOrphans, allProducts],
  );

  const displayCategories = useMemo<MarketplaceProductCategory[]>(
    () => [
      ...categories.filter((c) => poolCategoryIds.has(String(c.id))),
      ...(poolHasOrphans
        ? [{ id: UNCATEGORIZED_PRODUCT_CATEGORY_ID, name: 'Uncategorized', slug: UNCATEGORIZED_PRODUCT_CATEGORY_ID }]
        : []),
    ],
    [categories, poolCategoryIds, poolHasOrphans],
  );

  const categoryFiltered = useMemo(() => {
    if (activeCategoryId == null) return allProducts;
    if (isUncategorizedId(activeCategoryId)) {
      return allProducts.filter((p) => !p.categoryIds || p.categoryIds.length === 0);
    }
    return allProducts.filter((p) => (p.categoryIds || []).map(String).includes(activeCategoryId));
  }, [allProducts, activeCategoryId]);

  const activeCategoryName = useMemo(() => {
    if (activeCategoryId == null) return null;
    if (isUncategorizedId(activeCategoryId)) return 'Uncategorized';
    return categories.find((c) => String(c.id) === activeCategoryId)?.name ?? null;
  }, [activeCategoryId, categories]);

  // Drop a stale active pill when the new pool no longer contains it.
  React.useEffect(() => {
    if (activeCategoryId == null) return;
    if (isUncategorizedId(activeCategoryId)) {
      if (!allProducts.some((p) => !p.categoryIds || p.categoryIds.length === 0)) {
        setActiveCategoryId(null);
      }
      return;
    }
    if (!poolCategoryIds.has(activeCategoryId)) setActiveCategoryId(null);
  }, [allProducts, poolCategoryIds, activeCategoryId]);

  // No display cut: every eligible product shows, paged via Show More.
  // Cutting here drops eligible products — never do that again.
  const products = categoryFiltered;

  // ── Progressive Show More (same as web `/` LocationBasedMerchants:
  // visibleCount init step, +step per tap, button hides when all shown) ──
  const GRID_PAGE_STEP = 6;
  const [visibleCount, setVisibleCount] = useState<number>(GRID_PAGE_STEP);

  // Restart paging whenever the visible set changes (copies web effect on
  // filters/activeCategoryId).
  React.useEffect(() => {
    setVisibleCount(GRID_PAGE_STEP);
  }, [activeCategoryId, categoryFiltered.length]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMore = visibleCount < products.length;

  if (!customerId) return null;
  // Filtered merchant search shows merchants only — same as Newly Updated.
  if (categoryId) return null;

  const loading = useBff
    ? isLoading
    : isLoading && allProducts.length === 0;
  if (!loading && allProducts.length === 0 && !overviewError) return null;

  // Match MerchantScreen's two-column product-card width while allowing for
  // this grid's 2px shadow padding on either side.
  const gridItemWidth = (width - 32 - 12 - 4) / 2;

  const handlePress = (product: RecommendedProduct) => {
    if (onProductPress) {
      onProductPress(product);
      return;
    }
    navigation.navigate('Product', {
      productId: product.id,
      merchantId: product.merchantId,
      merchantProductId: product.merchantProductId,
    });
  };

  const handleAddToCart = async (product: RecommendedProduct) => {
    const merchant = eligibleMerchants?.find((candidate) => String(candidate.id) === String(product.merchantId));
    const availability = merchant ?? product.merchantAvailability;
    const unavailableMessage = availability ? getMerchantOrderUnavailableMessage(availability) : null;
    if (unavailableMessage) {
      Alert.alert('Merchant unavailable', unavailableMessage);
      return;
    }

    const openProductDetails = () => handlePress(product);
    if (product.productType === 'variable' || product.productType === 'grouped') {
      openProductDetails();
      return;
    }

    try {
      if (product.hasRequiredModifiers) {
        openProductDetails();
        return;
      }

      const modifierGroups = await fetchEffectiveModifierGroups(
        product.id,
        null,
        product.merchantId,
      );
      if (modifierGroups.some((group) => group.is_required || group.min_selections > 0)) {
        openProductDetails();
        return;
      }

      let merchantProductId = product.merchantProductId;
      if (!merchantProductId) {
        const query = new URLSearchParams({
          'where[merchant_id][equals]': String(product.merchantId),
          'where[product_id][equals]': String(product.id),
          depth: '0',
        });
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiConfig.payloadApiKey) {
          headers.Authorization = `users API-Key ${apiConfig.payloadApiKey}`;
        }
        const response = await fetch(`${apiConfig.baseUrl}/merchant-products?${query}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch merchant product details');
        }
        const data = await response.json();
        merchantProductId = data.docs?.[0]?.id;
        if (!merchantProductId) {
          Alert.alert('Error', 'Product not available at this merchant.');
          return;
        }
      }

      const merchantCart = getMerchantCart(String(product.merchantId));
      const existingItem = merchantCart?.items.find(
        (item) =>
          Number(item.merchantProduct) === Number(merchantProductId) &&
          (!item.selectedModifiers || item.selectedModifiers.length === 0),
      );
      if (existingItem && !existingItem.isPending) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        Alert.alert('Cart Updated', `${product.name} quantity increased.`);
        return;
      }

      await addToCart({
        merchantId: Number(product.merchantId),
        productId: Number(product.id),
        merchantProductId: Number(merchantProductId),
        quantity: 1,
        priceAtAdd: product.basePrice ?? 0,
        productName: product.name,
        imageUrl: product.imageUrl,
        merchantName: product.merchantName,
        compareAtPrice: product.compareAtPrice,
        selectedModifiers: [],
      });
      Alert.alert('Added to Cart', `${product.name} added to your cart.`);
    } catch (error) {
      console.error('Error adding home product to cart:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to add item to cart. Please try again.',
      );
    }
  };

  const handleSelectCategory = (id: string) => {
    setActiveCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.sectionContainer} onLayout={onLayout}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              {activeCategoryName ?? 'Recommended For You'}
            </Text>
            {!loading && categoryFiltered.length > 0 && (
              <Text style={styles.subtitle}>
                {categoryFiltered.length} product{categoryFiltered.length === 1 ? '' : 's'} from
                local merchants
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Product category pills (same taxonomy + active style as web) ── */}
      {displayCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsList}
          style={styles.pillsContainer}
        >
          {displayCategories.map((c) => {
            const id = String(c.id);
            const active = activeCategoryId === id;
            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.85}
                onPress={() => handleSelectCategory(id)}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {overviewError ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Recommendations couldn&apos;t load.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRetryOverview}
            style={styles.showMoreBtn}
          >
            <Text style={styles.showMoreText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.gridList}>
          {[1, 2, 3, 4].map((key) => (
            <ProductCardSkeleton key={key} cardWidth={gridItemWidth} />
          ))}
        </View>
      ) : products.length > 0 ? (
        <>
          <View style={styles.gridList}>
            {visibleProducts.map((product) => {
              const eligibleMerchant = eligibleMerchants?.find(
                (merchant) => String(merchant.id) === String(product.merchantId),
              );
              const availability = eligibleMerchant ?? product.merchantAvailability;
              const merchantUnavailable = Boolean(
                availability && getMerchantOrderUnavailableMessage(availability),
              );
              return (
                <TouchableOpacity
                  key={`${product.merchantProductId}-${product.id}`}
                  style={[styles.productCard, { width: gridItemWidth }]}
                  activeOpacity={0.9}
                  onPress={() => handlePress(product)}
                >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${product.name} to cart`}
                    style={styles.addButton}
                    disabled={merchantUnavailable}
                    onPress={() => void handleAddToCart(product)}
                  >
                    <Ionicons name={merchantUnavailable ? 'time-outline' : 'add'} size={20} color="#333" />
                  </TouchableOpacity>
                </View>
                <View style={styles.productContent}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  {merchantUnavailable && (
                    <Text style={styles.unavailableText}>Merchant on vacation</Text>
                  )}
                  {product.productType === 'simple' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      {product.basePrice !== null && (
                        <Text style={styles.price}>{formatCurrency(product.basePrice)}</Text>
                      )}
                      {product.compareAtPrice != null &&
                        product.basePrice != null &&
                        product.compareAtPrice > product.basePrice && (
                          <Text style={styles.comparePrice}>
                            {formatCurrency(product.compareAtPrice)}
                          </Text>
                        )}
                    </View>
                  ) : (
                    <Text style={styles.variableText}>
                      {product.productType === 'grouped' ? 'Show Grouped Items' : 'Show Variations'}
                    </Text>
                  )}
                  {product.shortDescription ? (
                    <Text style={styles.shortDescription} numberOfLines={2}>
                      {product.shortDescription}
                    </Text>
                  ) : null}
                </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {hasMore && (
            <View style={styles.showMoreWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setVisibleCount((c) => Math.min(c + GRID_PAGE_STEP, products.length))
                }
                style={styles.showMoreBtn}
              >
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>
            </View>
          )}
          {!hasMore && products.length > GRID_PAGE_STEP && (
            <View style={styles.endOfListWrapper}>
              <Text style={styles.endOfListText}>You&apos;ve seen it all</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No products in this category nearby.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 0,
    // Tight gap to Newly Updated: gridList carries padding for shadows,
    // so keep only 4 here (matching header rhythm).
    marginBottom: 4,
  },
  header: {
    marginBottom: 8,
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
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pillsContainer: {
    marginBottom: 12,
  },
  pillsList: {
    paddingRight: 16,
    gap: 8,
  },
  pill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  // Same active style as web MerchantProductCategoriesCarousel.
  pillActive: {
    backgroundColor: '#eba236',
    borderColor: '#eba236',
  },
  pillInactive: {
    backgroundColor: '#fff',
    borderColor: '#D1D5DB',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#fff',
  },
  pillTextInactive: {
    color: '#374151',
  },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    // Room for card shadows so they are not clipped sitting on the edge.
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
  showMoreWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  // Same look as web `/` Show more (gray-100 pill, centered).
  showMoreBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  endOfListWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  endOfListText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  productCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    // NOTE: no overflow:'hidden' here — it kills the box shadow.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  productContent: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 36,
  },
  unavailableText: {
    marginBottom: 4,
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  comparePrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  variableText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#eba236',
  },
  shortDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    lineHeight: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
