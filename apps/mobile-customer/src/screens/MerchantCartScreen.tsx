import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useThemeColors } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/format';

export default function MerchantCartScreen({ route, navigation }: any) {
  const { merchantId } = route.params;
  const colors = useThemeColors();
  const { getMerchantCart, updateQuantity, removeFromCart } = useCart();

  const merchantCart = getMerchantCart(merchantId);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  if (!merchantCart) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Cart</Text>
                <View style={{ width: 40 }} />
            </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Your cart is empty for this merchant</Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f9fafb' }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff', zIndex: 10 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{merchantCart.merchantName || 'Cart'}</Text>
            <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.merchantSection}>
             <View style={styles.merchantHeader}>
                 {/* Placeholder for merchant logo if available */}
                 <View style={styles.merchantLogoPlaceholder}>
                     <Ionicons name="storefront" size={20} color="#666" />
                 </View>
                 <Text style={styles.merchantName}>{merchantCart.merchantName}</Text>
             </View>
             
             {merchantCart.items.map((item) => (
                 <View key={item.id} style={styles.cartItem}>
                     <View style={styles.itemRow}>
                         {item.menuItem.image ? (
                             <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
                         ) : (
                             <View style={styles.itemImagePlaceholder} />
                         )}
                         <View style={styles.itemDetails}>
                             <Text style={styles.itemName}>{item.menuItem.name}</Text>
                             <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
                             {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                 <Text style={styles.modifiersText}>
                                     {item.selectedModifiers.map(m => m.name).join(', ')}
                                 </Text>
                             )}
                         </View>
                     </View>
                     
                     <View style={styles.actionsRow}>
                         <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                             <Text style={styles.removeText}>Remove</Text>
                         </TouchableOpacity>
                         
                         <View style={styles.quantityControl}>
                             <TouchableOpacity 
                                onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                                style={styles.qtyButton}
                             >
                                 <Text style={styles.qtyButtonText}>-</Text>
                             </TouchableOpacity>
                             <Text style={styles.qtyText}>{item.quantity}</Text>
                             <TouchableOpacity 
                                onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                                style={styles.qtyButton}
                             >
                                 <Text style={styles.qtyButtonText}>+</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                 </View>
             ))}
        </View>
        
        <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(merchantCart.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>{formatCurrency(59)}</Text>
            </View>
             <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 }]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(merchantCart.subtotal + 59)}</Text>
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Text style={styles.checkoutTotal}>{formatCurrency(merchantCart.subtotal + 59)}</Text>
          </TouchableOpacity>
      </View>
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
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  merchantSection: {
      marginBottom: 24,
  },
  merchantHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
  },
  merchantLogoPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  merchantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
  },
  cartItem: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  itemRow: {
      flexDirection: 'row',
      marginBottom: 12,
  },
  itemImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
  },
  itemImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: '#eee',
      marginRight: 12,
  },
  itemDetails: {
      flex: 1,
      justifyContent: 'center',
  },
  itemName: {
      fontSize: 15,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
  },
  itemPrice: {
      fontSize: 14,
      color: '#666',
  },
  modifiersText: {
      fontSize: 12,
      color: '#888',
      marginTop: 2,
  },
  actionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#f5f5f5',
      paddingTop: 12,
  },
  removeText: {
      color: '#ef4444',
      fontSize: 13,
      fontWeight: '500',
  },
  quantityControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
  },
  qtyButton: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
  },
  qtyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
  },
  qtyText: {
      marginHorizontal: 12,
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
  },
  summarySection: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  summaryLabel: {
      fontSize: 14,
      color: '#666',
  },
  summaryValue: {
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
  },
  totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
  },
  totalValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
  },
  footer: {
      padding: 16,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
  },
  checkoutButton: {
      backgroundColor: '#f3a823',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 30,
  },
  checkoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  },
  checkoutTotal: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  }
});
