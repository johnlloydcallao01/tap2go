import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart, MerchantCartSummary, CartItem } from '../contexts/CartContext';
import { useThemeColors } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/format';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';

const CartSkeleton = () => {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ 
          backgroundColor: '#fff', 
          borderRadius: 12, 
          padding: 16,
          borderWidth: 1,
          borderColor: '#eee'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ width: '60%', height: 20, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 4 }} />
              <View style={{ width: '30%', height: 14, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
             <View style={{ width: 80, height: 16, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
             <View style={{ width: 60, height: 16, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default function CartScreen({ navigation }: any) {
  const { getAllMerchantCarts, removeFromCart, reload, isLoading } = useCart();
  const colors = useThemeColors();
  const merchantCarts = getAllMerchantCarts();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const showSkeleton = isLoading || refreshing;

  const handleMerchantPress = (merchantId: string) => {
    navigation.navigate('MerchantCart', { merchantId });
  };

  const handleDeleteCart = (merchantId: string, items: CartItem[]) => {
    Alert.alert(
      "Delete Cart",
      "Are you sure you want to delete this cart?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            items.forEach((item) => {
              removeFromCart(item.id);
            });
          }
        }
      ]
    );
  };

  const handleMoreOptions = (cart: MerchantCartSummary) => {
      Alert.alert(
          cart.merchantName,
          "Select an option",
          [
              {
                  text: "Add more items",
                  onPress: () => handleMerchantPress(cart.merchantId)
              },
              {
                  text: "Delete cart",
                  style: "destructive",
                  onPress: () => handleDeleteCart(cart.merchantId, cart.items)
              },
              {
                  text: "Cancel",
                  style: "cancel"
              }
          ]
      );
  };

  const renderMerchantCart = (cart: MerchantCartSummary) => (
    <View
      key={cart.merchantId}
      style={[styles.merchantCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Merchant Header */}
      <View style={styles.merchantHeader}>
        <View style={styles.merchantInfoContainer}>
          {cart.merchantLogoUrl ? (
            <Image 
              source={{ uri: cart.merchantLogoUrl }} 
              style={styles.merchantLogo} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.merchantLogoPlaceholder, { backgroundColor: colors.background }]}>
               <Ionicons name="storefront" size={20} color={colors.text} style={{ opacity: 0.6 }} />
            </View>
          )}
          <View style={styles.merchantTextContainer}>
            <Text style={[styles.merchantName, { color: colors.text }]} numberOfLines={1}>
              {cart.merchantName}
            </Text>
            <View style={styles.deliveryInfoContainer}>
              <Text style={[styles.deliveryText, { color: colors.text, opacity: 0.6 }]}>10-25 mins</Text>
              <View style={styles.dotSeparator} />
              <Ionicons name="bicycle" size={12} color="#e81c63" />
              <Text style={[styles.deliveryFreeText, { color: '#e81c63' }]}> Free</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
            style={styles.moreOptionsButton}
            onPress={() => handleMoreOptions(cart)}
        >
             <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
      </View>

      {/* Items Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll} contentContainerStyle={styles.itemsScrollContent}>
        {cart.items.map((item) => (
          <View key={item.id} style={[styles.itemImageContainer, { backgroundColor: colors.background }]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <Ionicons name="fast-food-outline" size={20} color={colors.border} />
            )}
             {item.quantity > 1 && (
                <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{item.quantity}</Text>
                </View>
             )}
          </View>
        ))}
         <TouchableOpacity
            style={[styles.addItemButton, { borderColor: colors.border }]}
            onPress={() => handleMerchantPress(cart.merchantId)}
         >
            <Ionicons name="add" size={20} color={colors.text} />
         </TouchableOpacity>
      </ScrollView>

      {/* Subtotal & Action */}
      <View style={[styles.footerContainer, { borderTopColor: colors.border }]}>
        <View style={styles.subtotalRow}>
          <Text style={[styles.subtotalLabel, { color: colors.text }]}>Subtotal</Text>
          <Text style={[styles.subtotalValue, { color: colors.text }]}>{formatCurrency(cart.subtotal)}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.viewCartButton, { borderColor: colors.border }]}
          onPress={() => handleMerchantPress(cart.merchantId)}
        >
          <Text style={[styles.viewCartText, { color: colors.text }]}>View your cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Carts</Text>
          {merchantCarts.length > 0 && (
            <View style={styles.cartCountContainer}>
               <Text style={[styles.cartCountText, { color: colors.text, opacity: 0.6 }]}>
                   {merchantCarts.length} {merchantCarts.length === 1 ? 'cart' : 'carts'}
               </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <PullToRefreshLayout
        isRefreshing={refreshing}
        onRefresh={handleRefresh}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {showSkeleton ? (
          <CartSkeleton />
        ) : merchantCarts.length > 0 ? (
          <View style={styles.cartList}>
            {merchantCarts.map((cart) => renderMerchantCart(cart))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                 <Ionicons name="cart-outline" size={40} color={colors.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6 }]}>
              Looks like you haven&apos;t added any items to your cart yet. Start browsing to find delicious food!
            </Text>
            <TouchableOpacity 
              style={[styles.browseButton, { backgroundColor: '#eba236' }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="restaurant-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 100 }} /> 
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cartCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  cartCountText: {
      fontSize: 14,
      fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
      paddingVertical: 16,
      paddingHorizontal: 12,
  },
  cartList: {
      gap: 16,
  },
  merchantCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  merchantInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  merchantLogoPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  merchantLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
  },
  merchantTextContainer: {
      flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  deliveryInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  deliveryText: {
      fontSize: 12,
  },
  dotSeparator: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#ccc',
      marginHorizontal: 6,
  },
  deliveryFreeText: {
      fontSize: 12,
      fontWeight: '600',
  },
  moreOptionsButton: {
      padding: 4,
  },
  itemsScroll: {
      marginBottom: 16,
  },
  itemsScrollContent: {
      gap: 10,
      alignItems: 'center',
  },
  itemImageContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  },
  itemImage: {
      width: 48,
      height: 48,
      borderRadius: 8,
  },
  badgeContainer: {
      position: 'absolute',
      top: -6,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: '#fff',
  },
  badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
  },
  addItemButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      borderStyle: 'dashed',
  },
  footerContainer: {
      borderTopWidth: 1,
      paddingTop: 12,
      gap: 12,
  },
  subtotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  subtotalLabel: {
      fontSize: 14,
      fontWeight: '600',
  },
  subtotalValue: {
      fontSize: 14,
      fontWeight: '600',
  },
  viewCartButton: {
      width: '100%',
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  viewCartText: {
      fontSize: 14,
      fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 280,
  },
  browseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
