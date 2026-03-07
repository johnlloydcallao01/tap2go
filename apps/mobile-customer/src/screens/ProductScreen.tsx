import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../contexts/ThemeContext';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../contexts/CartContext';
import ProductModifiers from '../components/ProductModifiers';
import { formatCurrency } from '../utils/format';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';
import { useQueryClient } from '@tanstack/react-query';
import { dataCache } from '@encreasl/client-services';

export default function ProductScreen({ route, navigation }: any) {
  const { merchantProductId: productId, merchantId } = route.params;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isRefetching, error } = useProduct(productId, merchantId);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [modifierSelection, setModifierSelection] = useState<Record<string, string[]>>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 ProductScreen: Pull-to-refresh triggered');
      dataCache.clear();
      await queryClient.resetQueries({ queryKey: ['product', productId, merchantId] });
    } catch (error) {
      console.error('ProductScreen pull-to-refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, productId, merchantId]);
  // Helper function to resolve image URL
  const getImageUrl = (media: any): string | null => {
    if (!media) return null;
    return media.cloudinaryURL || media.url || media.thumbnailURL || null;
  };

  const productImageUrl = product ? getImageUrl(product.media?.primaryImage) : null;

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Calculate if product is wishlisted
  // Note: useWishlist hook currently supports merchant wishlist. 
  // We might need to extend it for products if we want product-level wishlist.
  // The web implementation has both. For now, we'll implement the UI but maybe disable if hook doesn't support it yet.
  // Actually, web uses addMerchantProductToWishlist. My mobile hook only has isWishlisted(merchantId).
  // I should check useWishlist hook capabilities.
  // Assuming for now we might need to update useWishlist later for products.
  // Let's stick to the request: "wishlist functionality... on the merchant cards UI". 
  // The product view request is "product view page... implement it... when we click such products".
  // It doesn't explicitly say "wishlist on product view", but web has it. I should probably add it if easy.
  // For now, I'll focus on the main product details and add to cart.

  const hasInvalidModifiers = useMemo(() => {
    if (!product || !product.modifierGroups || product.modifierGroups.length === 0) {
      return false;
    }
    for (const group of product.modifierGroups) {
      const selectedIds = modifierSelection[group.id] || [];
      const count = selectedIds.length;
      if (group.is_required && count === 0) {
        return true;
      }
      if (group.min_selections > 0 && count < group.min_selections) {
        return true;
      }
      if (typeof group.max_selections === 'number' && count > group.max_selections) {
        return true;
      }
    }
    return false;
  }, [product, modifierSelection]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.basePrice || 0;

    // Add modifiers price
    if (product.modifierGroups) {
      product.modifierGroups.forEach(group => {
        const selectedIds = modifierSelection[group.id] || [];
        if (group.options) {
          group.options.forEach(opt => {
            if (selectedIds.includes(opt.id)) {
              price += opt.price_adjustment || 0;
            }
          });
        }
      });
    }

    return price * quantity;
  }, [product, modifierSelection, quantity]);

  const handleAddToCart = async () => {
    if (hasInvalidModifiers) {
      Alert.alert('Required Options', 'Please make sure all required options are selected.');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);

    // Prepare selected modifiers for CartContext
    const selectedModifierPayload: any[] = [];
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      for (const group of product.modifierGroups) {
        const selectedIds = modifierSelection[group.id] || [];
        const options = group.options || [];
        selectedIds.forEach((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return;
          selectedModifierPayload.push({
            groupId: group.id,
            groupName: group.name,
            isRequired: group.is_required,
            optionId: opt.id,
            name: opt.name,
            price: opt.price_adjustment || 0,
          });
        });
      }
    }

    try {
      await addToCart({
        merchantId: Number(merchantId),
        productId: Number(product.id),
        merchantProductId: Number(product.merchantProductId || product.id), // Fallback if missing, but should be there
        quantity,
        priceAtAdd: product.basePrice,
        selectedModifiers: selectedModifierPayload,
      });
      setIsAddingToCart(false);
      navigation.goBack();
    } catch (e: any) {
      setIsAddingToCart(false);
      Alert.alert('Error', e.message || 'Failed to add to cart');
    }
  };

  const showSkeleton = isLoading || refreshing || isRefetching;

  if (showSkeleton) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <PullToRefreshLayout
          isRefreshing={refreshing || isRefetching}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Skeleton image */}
          <View style={{ width: '100%', height: 300, backgroundColor: '#F3F4F6' }}>
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + 10 }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {/* Skeleton content */}
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ width: '60%', height: 28, borderRadius: 8, backgroundColor: '#E5E7EB' }} />
              <View style={{ width: '25%', height: 24, borderRadius: 8, backgroundColor: '#E5E7EB' }} />
            </View>
            <View style={{ width: '90%', height: 16, borderRadius: 8, backgroundColor: '#F3F4F6', marginBottom: 8 }} />
            <View style={{ width: '70%', height: 16, borderRadius: 8, backgroundColor: '#F3F4F6', marginBottom: 24 }} />
            <View style={{ width: '40%', height: 20, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 12 }} />
                <View style={{ width: '50%', height: 16, borderRadius: 8, backgroundColor: '#F3F4F6' }} />
              </View>
            ))}
          </View>
        </PullToRefreshLayout>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Failed to load product details</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <PullToRefreshLayout
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {productImageUrl ? (
            <Image
              source={{ uri: productImageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={64} color={colors.border} />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Wishlist Button (Optional - for now just placeholder or if we extend wishlist hook) */}
          {/* 
          <TouchableOpacity 
            style={[styles.wishlistButton, { top: insets.top + 10 }]}
            onPress={() => {}}
          >
            <Ionicons name="heart-outline" size={24} color="#000" />
          </TouchableOpacity>
          */}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {formatCurrency(product.basePrice || 0)}
              </Text>
              {product.compareAtPrice && product.compareAtPrice > (product.basePrice || 0) && (
                <Text style={[styles.comparePrice, { color: colors.textSecondary }]}>
                  {formatCurrency(product.compareAtPrice)}
                </Text>
              )}
            </View>
          </View>

          {product.shortDescription ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {product.shortDescription}
            </Text>
          ) : null}

          {/* Modifiers */}
          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <ProductModifiers
              modifierGroups={product.modifierGroups}
              selected={modifierSelection}
              onChange={setModifierSelection}
            />
          )}
        </View>
      </PullToRefreshLayout>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: colors.card }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>

          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: colors.border }]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            { backgroundColor: hasInvalidModifiers ? '#ccc' : colors.primary }
          ]}
          onPress={handleAddToCart}
          disabled={hasInvalidModifiers || isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addToCartText}>
              Add to Order • {formatCurrency(totalPrice)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  wishlistButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
  },
  comparePrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 15,
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
