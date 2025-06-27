import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';
import FooterNavigation from '../components/FooterNavigation';

export default function CartScreen({ navigation }: any) {
  const { cart, getCartItemCount, addToCart, clearCart } = useCart();
  const itemCount = getCartItemCount();

  // Demo function to add a test item
  const addTestItem = () => {
    const testItem = {
      id: `test-${Date.now()}`,
      name: 'Test Burger',
      description: 'A delicious test burger',
      price: 12.99,
      image: 'https://example.com/burger.jpg',
      restaurantId: 'test-restaurant',
      category: 'Burgers',
      available: true,
    };
    addToCart(testItem, 1);
  };

  return (
    <View style={styles.container}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
          {cart && (
            <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content area with light background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cart && cart.items.length > 0 ? (
          <View>
            <Text style={styles.itemCount}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
            </Text>

            {cart.items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  <Text style={styles.itemDescription}>{item.menuItem.description}</Text>
                  <Text style={styles.itemPrice}>
                    ${item.menuItem.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${item.totalPrice.toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>${cart.deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>${cart.tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${cart.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add some delicious items to get started!
            </Text>
            <TouchableOpacity onPress={addTestItem} style={styles.testButton}>
              <Text style={styles.testButtonText}>Add Test Item</Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </View>

      {/* Footer Navigation - positioned above bottom safe area */}
      <FooterNavigation navigation={navigation} activeScreen="Cart" />

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemCount: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#9ca3af',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f3a823',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#f3a823',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
