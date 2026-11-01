import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatCurrency } from '../utils/format';
import { getCheckoutPaymentStatus } from '../services/checkoutReturn';

export default function QrPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrImage = typeof params.qrImage === 'string' ? params.qrImage : '';
  const merchantName = typeof params.merchantName === 'string' ? params.merchantName : 'Merchant';
  const amount = typeof params.amount === 'string' ? Number(params.amount) : NaN;
  const redirectUrl = typeof params.redirectUrl === 'string' ? params.redirectUrl : '';
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const paymentIntentId = typeof params.paymentIntentId === 'string' ? params.paymentIntentId : '';
  const merchantId = typeof params.merchantId === 'string' ? params.merchantId : '';
  const [paymentFailed, setPaymentFailed] = useState(false);
  const checkoutRequestId =
    typeof params.checkoutRequestId === 'string' ? params.checkoutRequestId : '';
  const payStartedAt = typeof params.payStartedAt === 'string' ? Number(params.payStartedAt) : NaN;

  useEffect(() => {
    if (checkoutRequestId && Number.isFinite(payStartedAt)) {
      console.info('[checkout-pay] qr screen shown', {
        checkoutRequestId,
        durationMs: Date.now() - payStartedAt,
      });
    }
  }, [checkoutRequestId, payStartedAt]);

  useEffect(() => {
    if (!paymentIntentId && !orderId) return;
    let active = true;
    let checking = false;
    const checkPayment = async () => {
      if (checking) return;
      checking = true;
      try {
        const status = await getCheckoutPaymentStatus({
          paymentIntentId: paymentIntentId || undefined,
          orderId: orderId || undefined,
        });
        if (!active) return;
        if (status.status === 'paid' && status.orderId) {
          router.replace({
            pathname: '/checkout/return',
            params: {
              payment_intent_id: status.paymentIntentId || paymentIntentId,
              merchantId,
              order_id: status.orderId || orderId,
            },
          });
        } else if (status.status === 'failed') {
          setPaymentFailed(true);
        }
      } catch {
        // A temporary lookup failure is not evidence that the payment failed.
      } finally {
        checking = false;
      }
    };
    void checkPayment();
    const interval = setInterval(checkPayment, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [merchantId, orderId, paymentIntentId, router]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to checkout"
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{redirectUrl ? 'Payment' : 'QR Ph Payment'}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.merchantBadge}>
          <Ionicons name="storefront-outline" size={16} color="#0F766E" />
          <Text style={styles.merchantName} numberOfLines={1}>{merchantName}</Text>
        </View>

        <Text style={styles.title}>{redirectUrl ? 'Continue your payment' : 'Scan to pay'}</Text>
        <Text style={styles.subtitle}>
          {redirectUrl
            ? 'Continue in the payment provider to complete this order.'
            : 'Use your banking or e-wallet app on another device to scan this QR Ph code.'}
        </Text>

        {qrImage ? (
          <View style={styles.qrCard}>
            <Image source={{ uri: qrImage }} style={styles.qrImage} resizeMode="contain" />
          </View>
        ) : redirectUrl ? (
          <TouchableOpacity
            style={styles.openPaymentButton}
            onPress={() => Linking.openURL(redirectUrl)}
            accessibilityRole="button"
          >
            <Text style={styles.openPaymentButtonText}>Open payment provider</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.missingQrCard}>
            <Ionicons name="alert-circle-outline" size={32} color="#B45309" />
            <Text style={styles.missingQrText}>The payment QR code is unavailable.</Text>
          </View>
        )}

        {Number.isFinite(amount) && (
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount due</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          </View>
        )}

        {paymentFailed ? (
          <View style={styles.failedStatus}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.failedText}>Payment was not completed. You can retry from this order.</Text>
          </View>
        ) : (qrImage || redirectUrl) ? (
          <View style={styles.pendingStatus}>
            <ActivityIndicator size="small" color="#0F766E" />
            <Text style={styles.pendingText}>Waiting for payment confirmation</Text>
          </View>
        ) : null}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backToCheckoutButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Text style={styles.backToCheckoutText}>Back to checkout</Text>
          </TouchableOpacity>
          {orderId ? (
            <TouchableOpacity
              style={styles.viewOrderButton}
              onPress={() => router.push(`/order/${orderId}`)}
              activeOpacity={0.75}
            >
              <Text style={styles.viewOrderText}>{paymentFailed ? 'Retry from order' : 'View order'}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.footerHint}>
            Your payment will remain in progress until it is confirmed.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  merchantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
  },
  merchantName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#115E59',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  qrCard: {
    width: 280,
    height: 280,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  missingQrCard: {
    width: 280,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  missingQrText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
  },
  amountCard: {
    width: 280,
    maxWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  pendingText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: '500',
  },
  failedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  failedText: { flex: 1, fontSize: 13, color: '#b91c1c', fontWeight: '500' },
  openPaymentButton: {
    width: 280,
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 16,
  },
  openPaymentButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backToCheckoutButton: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingVertical: 15,
  },
  backToCheckoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  viewOrderButton: { alignItems: 'center', paddingVertical: 10 },
  viewOrderText: { color: '#374151', fontSize: 14, fontWeight: '600' },
  footerHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 10,
  },
});
