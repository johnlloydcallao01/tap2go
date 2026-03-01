import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart, MerchantCartSummary } from '../contexts/CartContext';
import { useThemeColors } from '../contexts/ThemeContext';

export default function CartScreen({ navigation }: any) {
  const { getAllMerchantCarts, clearCart } = useCart();
  const merchantCarts = getAllMerchantCarts();
  const colors = useThemeColors();

  const handleMerchantPress = (merchantId: string) => {
    navigation.navigate('MerchantCart', { merchantId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Carts</Text>
          {merchantCarts.length > 0 && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {merchantCarts.length > 0 ? (
          <View style={styles.cartList}>
            {merchantCarts.map((cart: MerchantCartSummary) => (
              <TouchableOpacity
                key={cart.merchantId}
                style={[styles.merchantCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleMerchantPress(cart.merchantId)}
              >
                <View style={styles.merchantInfo}>
                  <View style={styles.merchantHeader}>
                    <Text style={[styles.merchantName, { color: colors.text }]}>{cart.merchantName}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text} opacity={0.5} />
                  </View>
                  
                  <View style={styles.cartPreview}>
                    <Text style={[styles.itemCount, { color: colors.text }]}>
                      {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.subtotal, { color: colors.primary }]}>
                      ${cart.subtotal.toFixed(2)}
                    </Text>
                  </View>
                  
                  {/* Preview of first few items */}
                  <View style={styles.itemsPreview}>
                    {cart.items.slice(0, 2).map((item, index) => (
                      <Text key={item.id} style={[styles.previewItemText, { color: colors.text }]} numberOfLines={1}>
                        • {item.quantity}x {item.menuItem.name}
                      </Text>
                    ))}
                    {cart.items.length > 2 && (
                      <Text style={[styles.moreItemsText, { color: colors.text }]}>
                        + {cart.items.length - 2} more...
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your carts are empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text }]}>
              Explore restaurants and add items to your cart!
            </Text>
            <TouchableOpacity 
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cartList: {
    gap: 16,
  },
  merchantCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '700',
  },
  cartPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemsPreview: {
    gap: 4,
  },
  previewItemText: {
    fontSize: 13,
    opacity: 0.8,
  },
  moreItemsText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
