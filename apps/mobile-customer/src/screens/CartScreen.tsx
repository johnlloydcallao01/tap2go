import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart, MerchantCartSummary } from '../contexts/CartContext';
import { useThemeColors } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/format';
import { useNavigation } from '../navigation/NavigationContext';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';

const CartSkeleton = () => {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2].map((i) => (
        <View key={i} style={{ 
          backgroundColor: '#fff', 
          borderRadius: 16, 
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ width: '60%', height: 16, backgroundColor: '#f3f4f6', borderRadius: 4, marginBottom: 4 }} />
              <View style={{ width: '40%', height: 12, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
             <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' }} />
             <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: '#f3f4f6' }} />
          </View>
          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
             <View style={{ width: 60, height: 16, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
             <View style={{ width: 80, height: 16, backgroundColor: '#f3f4f6', borderRadius: 4 }} />
          </View>
          <View style={{ height: 40, borderRadius: 20, backgroundColor: '#f3f4f6' }} />
        </View>
      ))}
    </View>
  );
};

export default function CartScreen() {
  const navigation = useNavigation();
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

  const showSkeleton = isLoading && merchantCarts.length === 0;

  const handleMerchantPress = (merchantId: string) => {
    navigation.navigate('MerchantCart', { merchantId });
  };

  const handleMoreOptions = (cart: MerchantCartSummary) => {
      Alert.alert(
          cart.merchantName,
          "Select an option",
          [
              {
                  text: "Add more items",
                  onPress: () => navigation.navigate('Merchant', { merchantId: cart.merchantId })
              },
              {
                  text: "Delete cart",
                  style: "destructive",
                  onPress: () => {
                    cart.items.forEach((item) => removeFromCart(item.id));
                  }
              },
              {
                  text: "Cancel",
                  style: "cancel"
              }
          ]
      );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Carts</Text>
          <Text style={styles.headerCount}>{merchantCarts.length} carts</Text>
        </View>
      </SafeAreaView>

      <PullToRefreshLayout 
        isRefreshing={refreshing} 
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      >
        {showSkeleton ? (
          <CartSkeleton />
        ) : merchantCarts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }} 
              style={{ width: 120, height: 120, marginBottom: 24, opacity: 0.5 }}
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven&apos;t added anything to your cart yet.
            </Text>
            <TouchableOpacity
              style={[styles.shopButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {merchantCarts.map((cart) => (
              <View
                key={cart.merchantId}
                style={styles.cartCard}
              >
                {/* Merchant Header */}
                <View style={styles.merchantHeader}>
                  <View style={styles.merchantInfo}>
                    {cart.merchantLogoUrl ? (
                      <Image source={{ uri: cart.merchantLogoUrl }} style={styles.merchantLogo} />
                    ) : (
                      <View style={[styles.merchantLogo, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6B7280' }}>
                          {cart.merchantName.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.merchantName}>{cart.merchantName}</Text>
                      {/* Placeholder for delivery info to match screenshot style */}
                      <Text style={styles.deliveryInfo}>
                        10-25 mins • <Text style={{ color: '#E11D48', fontWeight: '500' }}>Free</Text>
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                      onPress={() => handleMoreOptions(cart)}
                      style={{ padding: 4 }}
                  >
                      <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Items Row */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.itemsRow}
                >
                  {cart.items.map((item) => (
                    <View key={item.id} style={styles.itemWrapper}>
                      <Image
                        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                        style={styles.itemImage}
                      />
                      {item.quantity > 1 && (
                        <View style={styles.quantityBadge}>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  {/* Add Button */}
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Merchant', { merchantId: cart.merchantId })}
                  >
                    <Ionicons name="add" size={20} color="#374151" />
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.divider} />

                {/* Subtotal */}
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>{formatCurrency(cart.subtotal || 0)}</Text>
                </View>

                {/* View Cart Button */}
                <TouchableOpacity
                  style={styles.viewCartButton}
                  onPress={() => handleMerchantPress(cart.merchantId)}
                >
                  <Text style={styles.viewCartText}>View your cart</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </PullToRefreshLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingRight: 16,
  },
  itemWrapper: {
    position: 'relative',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  quantityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 4,
  },
  quantityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewCartButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
