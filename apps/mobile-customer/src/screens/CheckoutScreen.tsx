import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '../navigation/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { CheckoutAddressSection } from '../components/checkout/CheckoutAddressSection';
import { apiConfig } from '../config/environment';

type PaymentMethod =
  | 'card'
  | 'gcash'
  | 'grab_pay'
  | 'paymaya'
  | 'billease'
  | 'dob'
  | 'brankas'
  | 'qrph';

const methodLogos: Record<PaymentMethod, { srcs: any[]; label: string; icon: any }> = {
  card: {
    srcs: [
      require('../../assets/payment-logos/visa.png'),
      require('../../assets/payment-logos/mastercard.png')
    ],
    label: 'Cards (Visa/Mastercard)',
    icon: 'card-outline'
  },
  gcash: {
    srcs: [require('../../assets/payment-logos/gcash.png')],
    label: 'GCash',
    icon: 'wallet-outline'
  },
  grab_pay: {
    srcs: [require('../../assets/payment-logos/grabpay.png')],
    label: 'GrabPay',
    icon: 'wallet-outline'
  },
  paymaya: {
    srcs: [require('../../assets/payment-logos/maya.png')],
    label: 'Maya',
    icon: 'wallet-outline'
  },
  billease: {
    srcs: [require('../../assets/payment-logos/billease.png')],
    label: 'BillEase (BNPL)',
    icon: 'cash-outline'
  },
  dob: {
    srcs: [
      require('../../assets/payment-logos/bpi.png'),
      require('../../assets/payment-logos/ubp.png')
    ],
    label: 'Online Banking (BPI/UBP)',
    icon: 'business-outline'
  },
  brankas: {
    srcs: [
      require('../../assets/payment-logos/bdo.png'),
      require('../../assets/payment-logos/metrobank.png'),
      require('../../assets/payment-logos/landbank.png')
    ],
    label: 'Online Banking (BDO/Metrobank/LandBank)',
    icon: 'business-outline'
  },
  qrph: {
    srcs: [require('../../assets/payment-logos/qrph.png')],
    label: 'QR Ph',
    icon: 'qr-code-outline'
  },
};

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const merchantIdParam = typeof params.id === 'string' ? params.id : params.merchantId as string;
  const merchantId = merchantIdParam ? Number(merchantIdParam) : NaN;

  const { getMerchantCart } = useCart();
  const { user } = useAuth();
  
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [isPaying, setIsPaying] = useState(false);

  const merchantCart = getMerchantCart(String(merchantId));
  const merchantName = merchantCart?.merchantName || 'Merchant';
  const merchantLogoUrl = merchantCart?.merchantLogoUrl;
  const totalSubtotal = merchantCart?.subtotal || 0;

  // Filter out 'card' just like the web app
  const availablePaymentMethods = (Object.keys(methodLogos) as PaymentMethod[]).filter(
    (key) => key !== 'card'
  );

  const isFormValid = useMemo(() => {
    if (!paymentMethod) return false;
    if (!activeAddressId) return false;
    // Don't validate card details right now since we are deferring to PayMongo redirect logic natively
    return true;
  }, [paymentMethod, activeAddressId]);

  const handlePayNow = async () => {
    if (!user || !activeAddressId) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsPaying(true);
    try {
      const pk = apiConfig.paymongoPublicKey;
      if (!pk) {
        throw new Error('Missing PayMongo public key');
      }

      // 1. Create Payment Method directly with PayMongo API (like the web app does)
      const billing = {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Tap2Go Customer',
        email: user.email || 'customer@example.com',
        phone: '',
        address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'PH' },
      };

      const pmPayload: any = {
        data: {
          attributes: {
            type: paymentMethod,
            billing,
          },
        },
      };

      const pmResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(pk + ':')}`, // Base64 encode the public key
        },
        body: JSON.stringify(pmPayload),
      });
      const pmData = await pmResponse.json();

      if (!pmResponse.ok) {
        throw new Error(pmData?.errors?.[0]?.detail || 'Failed to create payment method');
      }
      
      const paymentMethodId = pmData.data.id;

      // 2. Create Payment Intent via CMS
      const intentResponse = await fetch(`${apiConfig.baseUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `users API-Key ${apiConfig.payloadApiKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(totalSubtotal * 100), // Amount in cents
          currency: 'PHP',
          payment_method_allowed: [paymentMethod],
          description: `Order from ${merchantName}`,
          metadata: {
            userId: user.id,
            merchantId,
            addressId: activeAddressId,
          },
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.error || 'Failed to create payment intent');
      }

      // Check how the CMS returns the data. It might be nested in a `data` object
      const intentId = intentData?.data?.id ? String(intentData.data.id) : null;
      const cKey = intentData?.data?.attributes?.client_key ? String(intentData.data.attributes.client_key) : null;

      if (!intentId || !cKey) {
        throw new Error('Missing intent/client_key from CMS response');
      }

      // 3. Attach Payment Method to Payment Intent
      // PayMongo requires a valid standard http/https URL format for return_url.
      // In a real production app, you would use a universal link here (e.g. https://yourdomain.com/checkout/return)
      // Since this is just to satisfy the PayMongo API requirement for redirect flows (like 3DS or GCash auth),
      // we can pass a generic web URL that won't necessarily be hit because we will intercept it natively or poll.
      const returnUrl = `http://localhost:3000/checkout/${merchantId}/return`;
      
      const attachResponse = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${intentId}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(pk + ':')}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                client_key: cKey,
                payment_method: paymentMethodId,
                return_url: returnUrl,
              },
            },
          }),
        }
      );
      
      const attachData = await attachResponse.json();
      
      if (!attachResponse.ok) {
        throw new Error(attachData?.errors?.[0]?.detail || 'Failed to attach payment method');
      }

      const status = attachData?.data?.attributes?.status;
      const nextAction = attachData?.data?.attributes?.next_action;

      if (status === 'awaiting_next_action' && nextAction?.redirect?.url) {
        // Just like the web app, we redirect the user to the PayMongo authorization URL
        // They will complete the 3DS or GCash auth, and PayMongo will redirect them back
        // to the returnUrl we provided earlier.
        Alert.alert(
          'Complete Payment',
          'You will be redirected to complete your payment securely.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsPaying(false),
            },
            {
              text: 'Continue',
              onPress: () => {
                // In React Native, we use Linking to open external browser URLs
                import('react-native').then(({ Linking }) => {
                  Linking.openURL(nextAction.redirect.url);
                });
                navigation.navigate('Orders'); // We can navigate them to orders while they pay externally
              },
            },
          ]
        );
      } else if (status === 'succeeded') {
        Alert.alert('Success', 'Payment completed successfully!');
        navigation.navigate('Orders');
      } else {
        throw new Error(`Unexpected payment status: ${status}`);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsPaying(false);
    }
  };

  if (!merchantCart || merchantCart.items.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={{ width: 32 }} />
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items found for this merchant.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {merchantLogoUrl ? (
              <Image source={{ uri: merchantLogoUrl }} style={styles.merchantLogo} />
            ) : (
              <View style={styles.merchantLogoPlaceholder}>
                <Ionicons name="storefront" size={16} color="#6B7280" />
              </View>
            )}
            <View>
              <Text style={styles.merchantNameText}>{merchantName}</Text>
              <Text style={styles.subtitleText}>Checkout</Text>
            </View>
          </View>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CheckoutAddressSection 
          onAddressChange={setActiveAddressId}
          style={styles.section}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryCard}>
            {merchantCart.items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.orderItemImage} />
                  ) : (
                    <View style={styles.orderItemImagePlaceholder} />
                  )}
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemName}>{item.productName}</Text>
                    {item.productSize && (
                      <Text style={styles.orderItemSub}>Size: {item.productSize}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.orderItemPrice}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>{formatCurrency(totalSubtotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodsGrid}>
            {availablePaymentMethods.map((key) => {
              const isSelected = paymentMethod === key;
              const config = methodLogos[key];
              
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.paymentMethodCard,
                    isSelected && styles.paymentMethodCardSelected
                  ]}
                  onPress={() => setPaymentMethod(key)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                      {config.srcs.length > 0 ? (
                        config.srcs.map((src, index) => (
                          <Image 
                            key={index} 
                            source={src} 
                            style={{ width: 32, height: 20, marginRight: index === config.srcs.length - 1 ? 0 : 4 }} 
                            resizeMode="contain" 
                          />
                        ))
                      ) : (
                        <Ionicons name={config.icon} size={24} color="#6B7280" style={{ width: 32, textAlign: 'center' }} />
                      )}
                    </View>
                    <Text style={styles.paymentMethodText}>{config.label}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIcon}>
                      <Ionicons name="checkmark-circle" size={16} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(totalSubtotal)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!isFormValid || isPaying) && styles.payButtonDisabled
          ]}
          onPress={handlePayNow}
          disabled={!isFormValid || isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatCurrency(totalSubtotal)}
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
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  merchantLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  merchantLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  orderItemQty: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
    marginTop: 2,
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  orderItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paymentMethodsGrid: {
    gap: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentMethodCardSelected: {
    borderColor: '#000',
    backgroundColor: '#F9FAFB',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32, // for safe area bottom
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  payButton: {
    backgroundColor: '#eba236',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
