import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
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
import { useFocusEffect, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useNavigation } from '../navigation/NavigationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { apiConfig } from '../config/environment';
import AddressSelectionModal from '../components/AddressSelectionModal';
import {
  dataCache,
  ADDRESS_KEYS,
  useActiveAddress,
} from '@encreasl/client-services';
import { useQueryClient } from '@tanstack/react-query';
import {
  clearPendingCheckoutSession,
  getCheckoutPaymentStatus,
  getPendingCheckoutSession,
  savePendingCheckoutSession,
} from '../services/checkoutReturn';
import type { AccountOverview } from '../services/account';
import { useMerchantOrderAvailability } from '../hooks/useMerchantOrderAvailability';

type PaymentMethod =
  | 'card'
  | 'gcash'
  | 'grab_pay'
  | 'paymaya'
  | 'billease'
  | 'dob'
  | 'brankas'
  | 'qrph';

const PAYMONGO_MINIMUM_AMOUNT_PHP = 1;

function distanceToMeters(distance: { value?: string | number; unit?: string } | null | undefined): number | null {
  if (!distance || distance.value == null) return null;
  const value = Number(distance.value);
  if (!Number.isFinite(value) || value < 0) return null;
  const unit = String(distance.unit || '').trim().toLowerCase();
  if (unit === 'm' || unit === 'meter' || unit === 'meters') return value;
  if (unit === 'km' || unit === 'kilometer' || unit === 'kilometers') return value * 1000;
  return null;
}

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
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const merchantIdParam = typeof params.id === 'string' ? params.id : params.merchantId as string;
  const merchantId = merchantIdParam ? Number(merchantIdParam) : NaN;
  const merchantAvailability = useMerchantOrderAvailability(merchantId);

  const {
    getMerchantCart,
    isLoading: isCartLoading,
    loadError: cartLoadError,
    markCheckedOut,
    reload,
  } = useCart();
  const { user, customerId, token } = useAuth();
  const queryClient = useQueryClient();
  const updateAccountOverviewAfterOrder = useCallback((orderTotal: number) => {
    const userId = user?.id ?? customerId;
    if (userId == null) return;
    queryClient.setQueryData<AccountOverview>(
      ['account-overview', String(userId)],
      (overview) => overview
        ? {
            ...overview,
            stats: {
              ...overview.stats,
              orderCount: overview.stats.orderCount + 1,
              totalSpent: overview.stats.totalSpent + orderTotal,
            },
          }
        : overview,
    );
  }, [customerId, queryClient, user?.id]);

  const {
    data: activeAddress = null,
    isLoading: isLoadingAddress,
  } = useActiveAddress(user?.id ? String(user.id) : undefined, token || undefined);

  const activeAddressId = activeAddress?.id ? String(activeAddress.id) : null;

  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [hasResolvedInitialPaymentCheck, setHasResolvedInitialPaymentCheck] = useState(false);
  const [isCheckingPaymentState, setIsCheckingPaymentState] = useState(false);
  const [hasPendingRecovery, setHasPendingRecovery] = useState(false);
  const [pendingRecoveryOrderId, setPendingRecoveryOrderId] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrIntentId, setQrIntentId] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const reconcileInFlightRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigatedToReturnRef = useRef(false);
  const qrNavigationInProgressRef = useRef(false);
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);

  const merchantCart = getMerchantCart(String(merchantId));
  const hasActiveCartItems = Boolean(merchantCart?.items.length);
  const showExistingPaymentBlock = !hasActiveCartItems && (hasPendingRecovery || isCheckingPaymentState);
  const merchantName = merchantCart?.merchantName || 'Merchant';
  const merchantLogoUrl = merchantCart?.merchantLogoUrl;
  const totalSubtotal = merchantCart?.subtotal || 0;
  const isBelowPayMongoMinimum = totalSubtotal < PAYMONGO_MINIMUM_AMOUNT_PHP;

  // ── Delivery fee (only shown when Lalamove is active) ──────────────────────
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [priorityFee, setPriorityFee] = useState(0);
  const [deliveryDiscount, setDeliveryDiscount] = useState(0);
  const [freeDeliveryApplied, setFreeDeliveryApplied] = useState(false);
  const [deliveryDistanceMeters, setDeliveryDistanceMeters] = useState<number | null>(null);
  const [deliveryFeeLoading, setDeliveryFeeLoading] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);
  const deliveryQuoteCacheKeyRef = useRef<string | null>(null);

  const deliveryCharge = deliveryAvailable ? deliveryFee + priorityFee : 0;
  const orderTotal = Math.max(0, totalSubtotal + deliveryCharge - deliveryDiscount);

  const navigateToQrPayment = useCallback(
    (imageUrl: string, trace?: {
      checkoutRequestId?: string;
      payStartedAt?: number;
      paymentIntentId?: string;
      orderId?: string;
    }) => {
      router.push({
        pathname: '/checkout/qr',
        params: {
          qrImage: imageUrl,
          amount: String(orderTotal),
          merchantId: String(merchantId),
          merchantName,
          checkoutRequestId: trace?.checkoutRequestId,
          payStartedAt: trace?.payStartedAt !== undefined ? String(trace.payStartedAt) : undefined,
          paymentIntentId: trace?.paymentIntentId,
          orderId: trace?.orderId,
        },
      });
    },
    [merchantId, merchantName, orderTotal, router],
  );

  const fetchDeliveryQuote = useCallback(async () => {
    if (!merchantId || !activeAddressId || !customerId || !token || deliveryFeeLoading) return;

    const cacheKey = `${merchantId}:${activeAddressId}`;
    if (deliveryQuoteCacheKeyRef.current === cacheKey) return;
    deliveryQuoteCacheKeyRef.current = cacheKey;

    setDeliveryFeeLoading(true);
    setDeliveryFeeError(null);

    try {
      const cmsHeaders = {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      };

      const quoteRes = await fetch(`${apiConfig.baseUrl}/delivery/quote`, {
        method: 'POST',
        headers: cmsHeaders,
        body: JSON.stringify({
          merchantId,
          addressId: Number(activeAddressId),
        }),
      });

      const quoteData = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quoteData?.error || 'Could not get delivery quote');

      if (quoteData?.data?.available === false) {
        setDeliveryAvailable(false);
        setDeliveryFee(0);
        setPriorityFee(0);
        setDeliveryDiscount(0);
        setFreeDeliveryApplied(false);
        setDeliveryDistanceMeters(null);
        return;
      }
      setDeliveryAvailable(true);

      setDeliveryFee(Number(quoteData?.data?.deliveryFee) || 0);
      setPriorityFee(Number(quoteData?.data?.priorityFee) || 0);
      setDeliveryDiscount(Number(quoteData?.data?.deliveryDiscount) || 0);
      setFreeDeliveryApplied(quoteData?.data?.freeDeliveryApplied === true);

      // Lalamove returns distance as { value, unit } (value in meters unless unit is km)
      const distance = quoteData?.data?.distance as { value?: string | number; unit?: string } | null;
      setDeliveryDistanceMeters(distanceToMeters(distance));
    } catch (err: any) {
      deliveryQuoteCacheKeyRef.current = null;
      setDeliveryFee(0);
      setPriorityFee(0);
      setDeliveryDiscount(0);
      setFreeDeliveryApplied(false);
      setDeliveryDistanceMeters(null);
      setDeliveryFeeError(err?.message || 'Could not estimate delivery fee');
    } finally {
      setDeliveryFeeLoading(false);
    }
  }, [merchantId, activeAddressId, customerId, token, deliveryFeeLoading]);

  useEffect(() => {
    fetchDeliveryQuote();
  }, [fetchDeliveryQuote]);

  const handleAddressSelected = useCallback(async () => {
    dataCache.clear();
    await queryClient.resetQueries({ queryKey: ADDRESS_KEYS.all });
    deliveryQuoteCacheKeyRef.current = null;
    setIsAddressModalVisible(false);
  }, [queryClient]);


  // Filter out 'card' just like the web app
  const availablePaymentMethods = (Object.keys(methodLogos) as PaymentMethod[]).filter(
    (key) => key !== 'card'
  );

  const isFormValid = useMemo(() => {
    if (!apiConfig.isPaymongoSandbox && !paymentMethod) return false;
    if (!activeAddressId) return false;
    return true;
  }, [paymentMethod, activeAddressId]);

  const redirectToCheckoutReturn = useCallback(
    (paymentIntentId: string, orderId: string, merchantKey: string) => {
      if (hasNavigatedToReturnRef.current) {
        return;
      }

      hasNavigatedToReturnRef.current = true;
      router.replace({
        pathname: '/checkout/return',
        params: {
          payment_intent_id: paymentIntentId,
          merchantId: merchantKey,
          order_id: orderId,
        },
      });
    },
    [router],
  );

  const reconcileExistingPayment = useCallback(async (showLoader = false, blockOnPending = false) => {
    if (!customerId || Number.isNaN(merchantId) || reconcileInFlightRef.current) {
      return;
    }

    reconcileInFlightRef.current = true;

    try {
      const customerKey = String(customerId);
      const merchantKey = String(merchantId);
      if (isCartLoading) {
        setHasPendingRecovery(false);
        setPendingRecoveryOrderId(null);
        return;
      }

      if (getMerchantCart(merchantKey)?.items.length) {
        setHasPendingRecovery(false);
        setPendingRecoveryOrderId(null);
        return;
      }

      const pendingSession = await getPendingCheckoutSession(customerKey, merchantKey);

      if (!pendingSession || !isPendingSessionFresh(pendingSession.createdAt)) {
        if (pendingSession) {
          await clearPendingCheckoutSession(customerKey, merchantKey);
        }
        setHasPendingRecovery(false);
        setPendingRecoveryOrderId(null);
        return;
      }

      if (showLoader) {
        setIsCheckingPaymentState(true);
      }

      const paymentStatus = await getCheckoutPaymentStatus({
        paymentIntentId: pendingSession.paymentIntentId,
        orderId: pendingSession.orderId,
      });

      if (getMerchantCart(merchantKey)?.items.length) {
        setHasPendingRecovery(false);
        setPendingRecoveryOrderId(null);
        return;
      }

      if (paymentStatus.status === 'paid') {
        redirectToCheckoutReturn(
          paymentStatus.paymentIntentId || pendingSession.paymentIntentId,
          paymentStatus.orderId,
          merchantKey,
        );
        return;
      }

      if (paymentStatus.status === 'failed') {
        await clearPendingCheckoutSession(customerKey, merchantKey);
        setHasPendingRecovery(false);
        setPendingRecoveryOrderId(null);
        await reload();
        return;
      }

      setHasPendingRecovery(blockOnPending && paymentStatus.status === 'pending');
      setPendingRecoveryOrderId(
        blockOnPending && paymentStatus.status === 'pending'
          ? paymentStatus.orderId || pendingSession.orderId
          : null,
      );
    } catch (error) {
      console.error('Checkout payment reconciliation failed:', error);
    } finally {
      reconcileInFlightRef.current = false;
      if (showLoader) {
        setIsCheckingPaymentState(false);
      }
    }
  }, [customerId, getMerchantCart, isCartLoading, merchantId, redirectToCheckoutReturn, reload]);

  useEffect(() => {
    if (isCartLoading) return;
    let active = true;
    reconcileExistingPayment(true, true)
      .catch(() => undefined)
      .finally(() => {
        if (active) setHasResolvedInitialPaymentCheck(true);
      });

    return () => {
      active = false;
    };
  }, [isCartLoading, reconcileExistingPayment]);

  useFocusEffect(
    useCallback(() => {
      if (qrNavigationInProgressRef.current) {
        qrNavigationInProgressRef.current = false;
        setIsPaying(false);
      }
    }, []),
  );

  useEffect(() => {
    if (!hasPendingRecovery) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    pollingIntervalRef.current = setInterval(() => {
      reconcileExistingPayment(false, true).catch(() => undefined);
    }, 2500);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [hasPendingRecovery, reconcileExistingPayment]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        reconcileExistingPayment(true, true).catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [reconcileExistingPayment]);

  useEffect(() => {
    if (!qrIntentId || !customerId) return;

    let cancelled = false;
    const intervalId = setInterval(async () => {
      if (cancelled) return;
      try {
        const paymentStatus = await getCheckoutPaymentStatus({ paymentIntentId: qrIntentId });
        if (paymentStatus.status === 'paid') {
          clearInterval(intervalId);
          if (!cancelled) {
            redirectToCheckoutReturn(qrIntentId, paymentStatus.orderId || qrOrderId || '', String(merchantId));
          }
        } else if (paymentStatus.status === 'failed') {
          clearInterval(intervalId);
          if (!cancelled) {
            Alert.alert('Payment Failed', 'Your QR Ph payment was not completed.');
            setQrImage(null);
            setQrIntentId(null);
            setQrOrderId(null);
            setHasPendingRecovery(true);
            reconcileExistingPayment(false).catch(() => undefined);
            if (pathname === '/checkout/qr') {
              router.back();
            }
          }
        }
      } catch {
        // keep polling
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [qrIntentId, qrOrderId, customerId, merchantId, pathname, redirectToCheckoutReturn, reconcileExistingPayment, router]);

  const handleSandboxPay = async () => {
    if (merchantAvailability.isUnavailable) {
      Alert.alert('Merchant unavailable', merchantAvailability.unavailableMessage || 'This merchant is not accepting orders.');
      return;
    }
    if (!user || !customerId || !activeAddressId || !token) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (deliveryFeeLoading) {
      Alert.alert('Please wait', 'We are still calculating your delivery fee.');
      return;
    }

    if (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied) {
      Alert.alert(
        'Delivery fee unavailable',
        deliveryFeeError || 'We could not calculate your delivery fee. Please try again.',
      );
      return;
    }

    setIsPaying(true);
    try {
      const response = await fetch(`${apiConfig.baseUrl}/checkout/prepare-v2`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
        merchantId,
        addressId: Number(activeAddressId),
        cartItemIds: merchantCart.items.map((item: any) => Number(item.id)),
        paymentMethod: 'gcash',
        expectedTotal: orderTotal,
        idempotencyKey: `checkout-sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        }),
      });
      const prepared = await response.json();
      if (!response.ok) {
        if (prepared?.code === 'CHECKOUT_REVIEW_REQUIRED' && prepared?.data) {
        setDeliveryFee(Number(prepared.data.deliveryFee) || 0);
        setPriorityFee(Number(prepared.data.priorityFee) || 0);
        setDeliveryDiscount(Number(prepared.data.deliveryDiscount) || 0);
        setFreeDeliveryApplied(prepared.data.freeDeliveryApplied === true);
        Alert.alert('Review updated total', 'Delivery pricing or promotion eligibility changed. Please review the updated total and try again.');
        return;
        }
        throw new Error(prepared?.error || 'Failed to prepare sandbox checkout');
      }
      const data = prepared?.data;
      const createdOrderId = data?.orderId;
      if (!createdOrderId || !data?.payment?.paid) {
        throw new Error('Sandbox checkout was not confirmed as paid.');
      }
      markCheckedOut(merchantCart.items.map((item: any) => item.id));
      updateAccountOverviewAfterOrder(Number(data.total) || orderTotal);
      await reload();

      hasNavigatedToReturnRef.current = true;
      router.replace({
        pathname: '/order-success',
        params: { orderId: String(createdOrderId), merchantId: String(merchantId) },
      });
    } catch (error) {
      console.error('Sandbox payment error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process sandbox order');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayNow = async () => {
    if (merchantAvailability.isUnavailable) {
      Alert.alert('Merchant unavailable', merchantAvailability.unavailableMessage || 'This merchant is not accepting orders.');
      return;
    }
    if (!user || !customerId || !activeAddressId || !token) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (deliveryFeeLoading) {
      Alert.alert('Please wait', 'We are still calculating your delivery fee.');
      return;
    }

    if (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied) {
      Alert.alert(
        'Delivery fee unavailable',
        deliveryFeeError || 'We could not calculate your delivery fee. Please try again.',
      );
      return;
    }

    if (isBelowPayMongoMinimum) {
      Alert.alert(
        'Checkout total too low',
        'This checkout is below the PayMongo minimum of PHP 1.00. Please review your cart or choose the required priced options before paying.',
      );
      return;
    }

    const checkoutRequestId = `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    if (!checkoutIdempotencyKeyRef.current) {
      checkoutIdempotencyKeyRef.current =
        `checkout-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    const payStartedAt = Date.now();
    console.info('[checkout-pay] started', {
      checkoutRequestId,
      paymentMethod,
      cartItemCount: merchantCart.items.length,
    });

    setIsPaying(true);
    qrNavigationInProgressRef.current = false;
    let pendingCheckoutSessionSaved = false;
    let cartUnavailable = false;
    try {
      const pk = apiConfig.paymongoPublicKey;
      if (!pk) {
        throw new Error('Missing PayMongo public key');
      }

      const checkoutHeaders = {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
        'X-Request-ID': checkoutRequestId,
      };

      const timedRequest = async (step: string, request: () => Promise<Response>) => {
        const requestStartedAt = Date.now();
        try {
          const response = await request();
          const data = await response.json();
          console.info('[checkout-pay] request timing', {
            checkoutRequestId,
            step,
            durationMs: Date.now() - requestStartedAt,
            status: response.status,
            ...(data?.timings ? { serverTimings: data.timings } : {}),
          });
          return { response, data };
        } catch (error) {
          console.info('[checkout-pay] request timing', {
            checkoutRequestId,
            step,
            durationMs: Date.now() - requestStartedAt,
            outcome: 'error',
          });
          throw error;
        }
      };

      const { response: checkoutPrepareRes, data: preparedCheckout } = await timedRequest(
        'checkout_prepare',
        () =>
          fetch(`${apiConfig.baseUrl}/checkout/prepare-v2`, {
            method: 'POST',
            headers: checkoutHeaders,
            body: JSON.stringify({
              merchantId,
              addressId: Number(activeAddressId),
              cartItemIds: merchantCart.items.map((item: any) => Number(item.id)),
              paymentMethod,
              expectedTotal: orderTotal,
              idempotencyKey: checkoutIdempotencyKeyRef.current,
            }),
          }),
      );
      if (!checkoutPrepareRes.ok) {
        cartUnavailable = preparedCheckout?.code === 'CHECKOUT_CART_UNAVAILABLE';
        if (preparedCheckout?.code === 'CHECKOUT_REVIEW_REQUIRED' && preparedCheckout?.data) {
          const updated = preparedCheckout.data;
          setDeliveryAvailable(updated.deliveryAvailable !== false);
          setDeliveryFee(Number(updated.deliveryFee) || 0);
          setPriorityFee(Number(updated.priorityFee) || 0);
          setDeliveryDiscount(Number(updated.deliveryDiscount) || 0);
          setFreeDeliveryApplied(updated.freeDeliveryApplied === true);
          const distance = updated.distance as { value?: string | number; unit?: string } | null;
          setDeliveryDistanceMeters(distanceToMeters(distance));
          checkoutIdempotencyKeyRef.current = null;
          Alert.alert(
            'Review updated total',
            'Delivery pricing or promotion eligibility changed. Please review the updated total and try again.',
          );
          return;
        }
        throw new Error(preparedCheckout?.error || 'Failed to prepare checkout');
      }

      const createdOrderId = preparedCheckout?.data?.orderId;
      const payment = preparedCheckout?.data?.payment;
      if (!createdOrderId) {
        throw new Error('Checkout preparation returned no order ID');
      }
      if (!payment || payment.failed) {
        throw new Error('Checkout did not return a usable payment session.');
      }
      markCheckedOut(merchantCart.items.map((item) => item.id));
      if (!preparedCheckout?.data?.reused) {
        updateAccountOverviewAfterOrder(Number(preparedCheckout.data.total) || orderTotal);
      }
      if (payment.paid) {
        await clearPendingCheckoutSession(String(customerId), String(merchantId));
        await reload();
        hasNavigatedToReturnRef.current = true;
        router.replace({
          pathname: '/order-success',
          params: { orderId: String(createdOrderId), merchantId: String(merchantId) },
        });
        return;
      }

      const intentId = typeof payment.paymentIntentId === 'string' ? payment.paymentIntentId : '';
      const cKey = typeof payment.clientKey === 'string' ? payment.clientKey : '';
      if (!intentId || !cKey) {
        throw new Error('Checkout payment preparation returned no payment intent.');
      }

      await savePendingCheckoutSession({
        customerId: String(customerId),
        merchantId: String(merchantId),
        orderId: String(createdOrderId),
        paymentIntentId: intentId,
        createdAt: new Date().toISOString(),
      });
      pendingCheckoutSessionSaved = true;

      const billing = {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Tap2Go Customer',
        email: user.email || 'customer@example.com',
        phone: '',
        address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'PH' },
      };
      const paymentMethodRequest = timedRequest('payment_method', () =>
        fetch('https://api.paymongo.com/v1/payment_methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(pk + ':')}`,
          },
          body: JSON.stringify({
            data: { attributes: { type: paymentMethod, billing } },
          }),
        }),
      );
      const { response: pmResponse, data: pmData } = await paymentMethodRequest;
      if (!pmResponse.ok) {
        throw new Error(pmData?.errors?.[0]?.detail || 'Failed to create payment method');
      }
      const paymentMethodId = pmData?.data?.id;
      if (!paymentMethodId) {
        throw new Error('Payment provider returned no payment method.');
      }

      // 6. Attach Payment Method to Payment Intent
      // PayMongo requires an absolute http/https return_url, so we send the user to our web bridge.
      // The bridge then forwards to the exact runtime app URL, which is critical in Expo Go where
      // the live app URL is exp://... instead of the standalone app scheme.
      const appReturnUrl = Linking.createURL('checkout/return', {
        queryParams: {
          payment_intent_id: intentId,
          merchantId: String(merchantId),
          order_id: String(createdOrderId),
        },
      });
      const returnUrlAPI =
        `https://app.tap2goph.com/checkout/${merchantId}/return?` +
        `payment_intent_id=${encodeURIComponent(intentId)}` +
        `&order_id=${encodeURIComponent(String(createdOrderId))}` +
        `&app_redirect=${encodeURIComponent(appReturnUrl)}`;
      
      const { response: attachResponse, data: attachData } = await timedRequest(
        'paymongo_attach',
        () =>
          fetch(`https://api.paymongo.com/v1/payment_intents/${intentId}/attach`, {
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
                  return_url: returnUrlAPI,
                },
              },
            }),
          }),
      );

      if (!attachResponse.ok) {
        throw new Error(attachData?.errors?.[0]?.detail || 'Failed to attach payment method');
      }

      const status = attachData?.data?.attributes?.status;
      const nextAction = attachData?.data?.attributes?.next_action;

      if (status === 'awaiting_next_action' && nextAction) {
        if (nextAction.redirect?.url) {
          // Setup gcash intent handler before opening the browser
          const subscription = Linking.addEventListener('url', ({ url }) => {
            if (url.startsWith('gcash://')) {
              Linking.openURL(url);
            }
          });

          const result = await WebBrowser.openAuthSessionAsync(nextAction.redirect.url, appReturnUrl);

          subscription.remove();

          if (result.type === 'success' && result.url) {
            // Expo Router already handles the incoming deep link. Doing an extra manual
            // replace here causes duplicate mounts of the return/success screens.
            hasNavigatedToReturnRef.current = true;
            return;
          } else {
            setIsPaying(false);
            setHasPendingRecovery(true);
            reconcileExistingPayment(true).catch(() => undefined);
          }
        } else if (nextAction.code?.image_url) {
          setQrImage(nextAction.code.image_url);
          setQrIntentId(intentId);
          setQrOrderId(String(createdOrderId));
          console.info('[checkout-pay] qr ready', {
            checkoutRequestId,
            durationMs: Date.now() - payStartedAt,
          });
          navigateToQrPayment(nextAction.code.image_url, {
            checkoutRequestId,
            payStartedAt,
            paymentIntentId: intentId,
            orderId: String(createdOrderId),
          });
          qrNavigationInProgressRef.current = true;
          return;
        }
      } else if (status === 'succeeded') {
        redirectToCheckoutReturn(intentId, String(createdOrderId), String(merchantId));
      } else {
        throw new Error(`Unexpected payment status: ${status}`);
      }
      
    } catch (error) {
      console.info('[checkout-pay] failed', {
        checkoutRequestId,
        durationMs: Date.now() - payStartedAt,
        outcome: 'error',
      });
      console.error('Payment error:', error);
      if (cartUnavailable) {
        try {
          await reload();
        } catch (refreshError) {
          console.error('[checkout-pay] cart refresh failed after checkout conflict:', refreshError);
        }
        try {
          await reconcileExistingPayment(true, true);
        } catch (reconcileError) {
          console.error('[checkout-pay] pending payment recovery failed after checkout conflict:', reconcileError);
        }
      }
      if (pendingCheckoutSessionSaved && customerId && !Number.isNaN(merchantId)) {
        await clearPendingCheckoutSession(String(customerId), String(merchantId));
      }
      Alert.alert('Payment Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      if (!qrNavigationInProgressRef.current) {
        setIsPaying(false);
      }
    }
  };

  if (isPaying) {
    return (
      <SafeAreaView style={styles.paymentStateContainer}>
        <ActivityIndicator size="large" color="#F3A823" />
        <Text style={styles.paymentStateTitle}>
          {paymentMethod === 'qrph' ? 'Preparing your QR Ph payment' : 'Preparing your payment'}
        </Text>
        <Text style={styles.paymentStateMessage}>
          Please wait while we securely prepare your payment.
        </Text>
      </SafeAreaView>
    );
  }

  if (isCartLoading || !hasResolvedInitialPaymentCheck) {
    return (
      <SafeAreaView style={styles.paymentStateContainer}>
        <ActivityIndicator size="large" color="#F3A823" />
        <Text style={styles.paymentStateTitle}>Loading checkout</Text>
        <Text style={styles.paymentStateMessage}>
          Please wait while we load your cart and check for an existing payment.
        </Text>
      </SafeAreaView>
    );
  }

  if (cartLoadError) {
    return (
      <SafeAreaView style={styles.paymentStateContainer}>
        <Ionicons name="cloud-offline-outline" size={40} color="#B45309" />
        <Text style={styles.paymentStateTitle}>We couldn’t load your cart</Text>
        <Text style={styles.paymentStateMessage}>
          Check your connection and try again. Your cart has not been treated as empty.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setHasResolvedInitialPaymentCheck(false);
            void reload();
          }}
          style={styles.paymentStateButton}
        >
          <Text style={styles.paymentStateButtonText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!merchantCart || merchantCart.items.length === 0) {
    if (qrImage) {
      return (
        <SafeAreaView style={styles.paymentStateContainer}>
          <Ionicons name="qr-code-outline" size={40} color="#0F766E" />
          <Text style={styles.paymentStateTitle}>Your QR Ph payment is ready</Text>
          <Text style={styles.paymentStateMessage}>
            Return to the QR payment screen to scan and complete your payment.
          </Text>
          <TouchableOpacity
            onPress={() => navigateToQrPayment(qrImage, {
              paymentIntentId: qrIntentId || undefined,
              orderId: qrOrderId || undefined,
            })}
            style={styles.paymentStateButton}
          >
            <Text style={styles.paymentStateButtonText}>View QR code</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    if (hasPendingRecovery) {
      return (
        <SafeAreaView style={styles.paymentStateContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.paymentStateTitle}>Payment confirmation in progress</Text>
          <Text style={styles.paymentStateMessage}>
            Your payment is linked to an existing order. We will only mark it paid after provider confirmation.
          </Text>
          {pendingRecoveryOrderId ? (
            <TouchableOpacity
              onPress={() => router.push(`/order/${pendingRecoveryOrderId}`)}
              style={styles.paymentStateButton}
            >
              <Text style={styles.paymentStateButtonText}>View order</Text>
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      );
    }

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

      {(apiConfig.isPaymongoSandbox || apiConfig.isLalamoveSandbox) && (
        <View style={styles.sandboxBanner}>
          <Ionicons name="flask-outline" size={14} color="#fff" />
          <Text style={styles.sandboxBannerText}>
            Sandbox Mode
            {apiConfig.isPaymongoSandbox && ' · PayMongo Test'}
            {apiConfig.isLalamoveSandbox && ' · Lalamove Test'}
            {' — No real money is used'}
          </Text>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {merchantAvailability.isUnavailable && (
          <View style={{ marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#FEF3C7', flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sunny-outline" size={18} color="#92400E" style={{ marginRight: 8 }} />
            <Text style={{ flex: 1, color: '#78350F', fontSize: 13, fontWeight: '600' }}>
              {merchantAvailability.unavailableMessage}
            </Text>
          </View>
        )}
        <View style={[styles.section, styles.addressSection]}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            style={styles.addressRow}
            onPress={() => setIsAddressModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
            {isLoadingAddress ? (
              <View style={{ flex: 1 }}>
                <View style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 4 }} />
                <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
              </View>
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>
                {activeAddress
                  ? activeAddress.formatted_address || activeAddress.name
                  : 'No address set — tap to add'}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

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
                    {item.selectedVariationName ? (
                      <Text style={styles.orderItemSub}>{item.selectedVariationName}</Text>
                    ) : item.productSize ? (
                      <Text style={styles.orderItemSub}>Size: {item.productSize}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.orderItemPrice}>{formatCurrency(item.subtotal)}</Text>
              </View>
            ))}
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>{formatCurrency(totalSubtotal)}</Text>
            </View>
            {deliveryAvailable ? (
              <View style={styles.deliveryFeeRow}>
                <Text style={styles.subtotalLabel}>Delivery & priority fee</Text>
                {deliveryFeeLoading ? (
                  <ActivityIndicator size="small" color="#f97316" />
                ) : freeDeliveryApplied ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#6B7280', fontSize: 12, textDecorationLine: 'line-through' }}>
                      {formatCurrency(deliveryCharge)}
                    </Text>
                    <Text style={[styles.subtotalValue, { color: '#15803D' }]}>FREE</Text>
                  </View>
                ) : (
                  <Text style={styles.subtotalValue}>
                    {deliveryCharge > 0 ? formatCurrency(deliveryCharge) : 'Calculating…'}
                  </Text>
                )}
              </View>
            ) : null}
            {freeDeliveryApplied && !deliveryFeeLoading ? (
              <Text style={{ color: '#15803D', fontSize: 12, marginTop: 4 }}>
                New-user offer: delivery and priority fee waived within 5 km.
              </Text>
            ) : null}
            {deliveryAvailable && !deliveryFeeLoading && deliveryDistanceMeters != null && (
              <View style={styles.deliveryDistanceRow}>
                <Text style={styles.deliveryDistanceLabel}>Delivery Distance</Text>
                <Text style={styles.deliveryDistanceValue}>
                  ~{(deliveryDistanceMeters / 1000).toFixed(1)} km
                </Text>
              </View>
            )}
            {deliveryAvailable && deliveryFeeError ? (
              <Text style={styles.deliveryFeeErrorText}>
                Delivery fee unavailable — {deliveryFeeError}
              </Text>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(orderTotal)}</Text>
            </View>
          </View>
        </View>

        {isBelowPayMongoMinimum && (
          <View style={styles.section}>
            <View style={styles.minimumAmountCard}>
              <View style={styles.minimumAmountIconWrap}>
                <Ionicons name="alert-circle-outline" size={20} color="#B45309" />
              </View>
              <View style={styles.minimumAmountContent}>
                <Text style={styles.minimumAmountTitle}>Checkout total is below PHP 1.00</Text>
                <Text style={styles.minimumAmountText}>
                  PayMongo rejects payments below PHP 1.00. This usually means one of the items in the cart has an incomplete or underpriced configuration.
                </Text>
              </View>
            </View>
          </View>
        )}

        {showExistingPaymentBlock && (
          <View style={styles.section}>
            <View style={styles.processingCard}>
              <View style={styles.processingIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#92400E" />
              </View>
              <View style={styles.processingContent}>
                <Text style={styles.processingTitle}>
                  {hasPendingRecovery ? 'Payment confirmation in progress' : 'Checking payment status'}
                </Text>
                <Text style={styles.processingText}>
                  {hasPendingRecovery
                    ? 'This unpaid attempt is attached to an existing order. Continue or check its status from Orders; we will only mark it paid after provider confirmation.'
                    : 'Please wait while we verify whether this checkout already has a completed payment.'}
                </Text>
                {hasPendingRecovery && pendingRecoveryOrderId ? (
                  <TouchableOpacity
                    onPress={() => router.push(`/order/${pendingRecoveryOrderId}`)}
                    style={{ alignSelf: 'flex-start', marginTop: 10 }}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: '#0F766E', fontSize: 13, fontWeight: '700' }}>
                      Resume payment
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {hasPendingRecovery ? (
                <ActivityIndicator color="#F59E0B" />
              ) : (
                <Ionicons name="time-outline" size={20} color="#92400E" />
              )}
            </View>
          </View>
        )}

        {!apiConfig.isPaymongoSandbox && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {qrImage ? (
            <View style={styles.activeQrPaymentCard}>
              <View style={styles.activeQrPaymentIcon}>
                <Ionicons name="qr-code-outline" size={22} color="#0F766E" />
              </View>
              <View style={styles.activeQrPaymentContent}>
                <Text style={styles.activeQrPaymentTitle}>QR Ph payment in progress</Text>
                <Text style={styles.activeQrPaymentText}>
                  Your payment is waiting to be scanned and confirmed.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigateToQrPayment(qrImage, {
                  paymentIntentId: qrIntentId || undefined,
                  orderId: qrOrderId || undefined,
                })}
                accessibilityRole="button"
                accessibilityLabel="Return to QR Ph payment"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color="#0F766E" />
              </TouchableOpacity>
            </View>
          ) : (
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
          )}
        </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(orderTotal)}</Text>
        </View>
        {qrImage ? (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => navigateToQrPayment(qrImage, {
              paymentIntentId: qrIntentId || undefined,
              orderId: qrOrderId || undefined,
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.payButtonText}>View QR Code</Text>
          </TouchableOpacity>
        ) : apiConfig.isPaymongoSandbox ? (
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: '#8b5cf6' },
              (!isFormValid || isPaying || merchantAvailability.isUnavailable || deliveryFeeLoading || (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied)) &&
                styles.payButtonDisabled,
            ]}
            onPress={handleSandboxPay}
            disabled={!isFormValid || isPaying || merchantAvailability.isUnavailable || deliveryFeeLoading || (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied)}
          >
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {deliveryFeeLoading
                  ? 'Calculating delivery fee...'
                  : deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied
                    ? 'Delivery fee unavailable'
                    : `Simulate Payment (Sandbox)`}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.payButton,
              (!isFormValid || isPaying || merchantAvailability.isUnavailable || showExistingPaymentBlock || isBelowPayMongoMinimum || deliveryFeeLoading || (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied)) &&
                styles.payButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={!isFormValid || isPaying || merchantAvailability.isUnavailable || showExistingPaymentBlock || isBelowPayMongoMinimum || deliveryFeeLoading || (deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied)}
          >
            {isPaying || (isCheckingPaymentState && !hasActiveCartItems) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {deliveryFeeLoading
                  ? 'Calculating delivery fee...'
                  : deliveryAvailable && deliveryFee <= 0 && !freeDeliveryApplied
                    ? 'Delivery fee unavailable'
                    : `Pay ${formatCurrency(orderTotal)}`}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <AddressSelectionModal
        isVisible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onAddressSelected={handleAddressSelected}
      />
    </View>
  );
}

const PENDING_SESSION_MAX_AGE_MS = 1000 * 60 * 15;

function isPendingSessionFresh(createdAt: string): boolean {
  const createdAtMs = Date.parse(createdAt);
  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  return Date.now() - createdAtMs <= PENDING_SESSION_MAX_AGE_MS;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sandboxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  sandboxBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
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
  deliveryFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  deliveryDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  deliveryDistanceLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  deliveryDistanceValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  deliveryFeeErrorText: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f97316',
  },
  processingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  minimumAmountCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  minimumAmountIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimumAmountContent: {
    flex: 1,
  },
  minimumAmountTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 4,
  },
  minimumAmountText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
  },
  processingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContent: {
    flex: 1,
  },
  activeQrPaymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  activeQrPaymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeQrPaymentContent: {
    flex: 1,
  },
  activeQrPaymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#115E59',
    marginBottom: 4,
  },
  activeQrPaymentText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#0F766E',
  },
  processingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  processingText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
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
    paddingTop: 20,
    paddingBottom: 44,
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
  paymentStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F9FAFB',
  },
  paymentStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  paymentStateMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
  },
  paymentStateButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0F766E',
  },
  paymentStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
