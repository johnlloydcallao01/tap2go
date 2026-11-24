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
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearPendingCheckoutSession,
  getCheckoutPaymentStatus,
  getPendingCheckoutSession,
  reconcileCheckoutPayment,
  savePendingCheckoutSession,
} from '../services/checkoutReturn';
import type { AccountOverview } from '../services/account';
import { fetchCustomerWallet } from '../services/customerWallet';
import { useMerchantOrderAvailability } from '../hooks/useMerchantOrderAvailability';
import {
  AVAILABLE_PAYMENT_METHODS,
  BANK_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  type BankCode,
  type PaymentMethod,
} from '../utils/paymentMethods';

const PAYMONGO_MINIMUM_AMOUNT_PHP = 1;
const CHECKOUT_PLATFORM_FEE = 2;

function isCheckoutPaymentMethod(value: string): value is PaymentMethod {
  return AVAILABLE_PAYMENT_METHODS.some((method) => method === value);
}

type CheckoutDisplayItem = {
  id: string | number;
  quantity: number;
  imageUrl?: string | null;
  productName: string;
  selectedVariationName?: string | null;
  productSize?: string | null;
  subtotal: number;
};

function isCanonicalE164Phone(value: string): boolean {
  return value === value.trim() && /^\+[1-9]\d{7,14}$/.test(value);
}

function getPhilippineNationalNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (value.trim().startsWith('+63') || (digits.startsWith('63') && digits.length > 10)) {
    return digits.slice(2, 12);
  }
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return digits;
  return '';
}

function isPhilippineE164Phone(value: string): boolean {
  return isCanonicalE164Phone(value) && /^\+639\d{9}$/.test(value);
}

function distanceToMeters(distance: { value?: string | number; unit?: string } | null | undefined): number | null {
  if (!distance || distance.value == null) return null;
  const value = Number(distance.value);
  if (!Number.isFinite(value) || value < 0) return null;
  const unit = String(distance.unit || '').trim().toLowerCase();
  if (unit === 'm' || unit === 'meter' || unit === 'meters') return value;
  if (unit === 'km' || unit === 'kilometer' || unit === 'kilometers') return value * 1000;
  return null;
}

type PayMongoCheckoutResponse = {
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      next_action?: {
        redirect?: { url?: string };
        code?: { image_url?: string };
      };
    };
  };
  errors?: { detail?: string }[];
};

type CheckoutRequest = (
  step: string,
  request: () => Promise<Response>,
) => Promise<{ response: Response; data: PayMongoCheckoutResponse }>;

async function attachSelectedPaymentMethod(args: {
  publicKey: string;
  paymentIntentId: string;
  clientKey: string;
  paymentMethod: PaymentMethod;
  bankCode: BankCode | null;
  customerId: string;
  orderId: string;
  merchantId: string;
  customerName: string;
  customerEmail: string;
  request?: CheckoutRequest;
  onSessionSaved?: () => void;
  onAttachStarted?: () => void;
}) {
  const request = args.request || (async (_step, send) => {
    const response = await send();
    const data = await response.json().catch(() => ({}));
    return { response, data };
  });
  const bankOptions = BANK_OPTIONS[args.paymentMethod];
  const billing = {
    name: args.customerName || 'Tap2Go Customer',
    email: args.customerEmail || 'customer@example.com',
    phone: '',
    address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'PH' },
  };
  const { response: methodResponse, data: methodData } = await request(
    'payment_method',
    () => fetch('https://api.paymongo.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${args.publicKey}:`)}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: args.paymentMethod,
            billing,
            ...(bankOptions && args.bankCode ? { details: { bank_code: args.bankCode } } : {}),
          },
        },
      }),
    }),
  );
  const paymentMethodId = methodData?.data?.id;
  if (!methodResponse.ok || !paymentMethodId) {
    throw new Error(methodData?.errors?.[0]?.detail || 'Could not create the selected payment method.');
  }

  await savePendingCheckoutSession({
    customerId: args.customerId,
    merchantId: args.merchantId,
    orderId: args.orderId,
    paymentIntentId: args.paymentIntentId,
    createdAt: new Date().toISOString(),
  });
  args.onSessionSaved?.();

  const appReturnUrl = Linking.createURL('checkout/return', {
    queryParams: {
      payment_intent_id: args.paymentIntentId,
      merchantId: args.merchantId,
      order_id: args.orderId,
    },
  });
  const returnUrl =
    `https://app.tap2goph.com/checkout/${args.merchantId}/return?` +
    `payment_intent_id=${encodeURIComponent(args.paymentIntentId)}` +
    `&order_id=${encodeURIComponent(args.orderId)}` +
    `&app_redirect=${encodeURIComponent(appReturnUrl)}`;

  args.onAttachStarted?.();
  const { response: attachResponse, data: attachData } = await request(
    'paymongo_attach',
    () => fetch(
      `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(args.paymentIntentId)}/attach`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${args.publicKey}:`)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: args.clientKey,
              return_url: returnUrl,
            },
          },
        }),
      },
    ),
  );
  if (!attachResponse.ok) {
    throw new Error(attachData?.errors?.[0]?.detail || 'PayMongo could not attach the selected method.');
  }
  return { attachData, appReturnUrl };
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const merchantIdParam = typeof params.id === 'string' ? params.id : params.merchantId as string;
  const merchantId = merchantIdParam ? Number(merchantIdParam) : NaN;
  const retryOrderId = typeof params.retryOrderId === 'string' ? params.retryOrderId : null;
  const isPaymentRetry = Boolean(retryOrderId);
  const merchantAvailability = useMerchantOrderAvailability(merchantId);

  const {
    getMerchantCart,
    isLoading: isCartLoading,
    loadError: cartLoadError,
    markCheckedOut,
    reload,
  } = useCart();
  const { user, customerId, token, updateUser } = useAuth();
  const paymentPreferenceUserId = user?.id ?? customerId;
  const queryClient = useQueryClient();
  const walletQuery = useQuery({
    queryKey: ['customer-wallet', String(user?.id ?? customerId ?? '')],
    enabled: Boolean(token && (user?.id ?? customerId)),
    queryFn: ({ signal }) => {
      if (!token) throw new Error('Sign in to load your wallet balance.');
      return fetchCustomerWallet(token, signal);
    },
  });
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
  const [recipientPhoneNational, setRecipientPhoneNational] = useState(
    typeof user?.phone === 'string' ? getPhilippineNationalNumber(user.phone) : '',
  );
  const recipientPhone = recipientPhoneNational ? `+63${recipientPhoneNational}` : '';
  const [isSavingRecipientPhone, setIsSavingRecipientPhone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bankCode, setBankCode] = useState<BankCode | null>(null);
  const paymentMethodEditedRef = useRef(false);
  const paymentMethodEditedUserIdRef = useRef<string | null>(null);
  const paymentPreferenceUserIdRef = useRef<string | null>(null);
  const selectedPaymentMethodRef = useRef<PaymentMethod | null>(null);
  useEffect(() => {
    if (paymentPreferenceUserId == null) return;
    let active = true;
    const preferenceUserId = String(paymentPreferenceUserId);
    if (paymentPreferenceUserIdRef.current !== preferenceUserId) {
      paymentPreferenceUserIdRef.current = preferenceUserId;
      const hasSelectionForUser = paymentMethodEditedRef.current && (
        paymentMethodEditedUserIdRef.current === null ||
        paymentMethodEditedUserIdRef.current === preferenceUserId
      );
      if (hasSelectionForUser && selectedPaymentMethodRef.current) {
        paymentMethodEditedUserIdRef.current = preferenceUserId;
        void AsyncStorage.setItem(
          `tap2go:checkout-payment-method:${preferenceUserId}`,
          selectedPaymentMethodRef.current,
        ).catch((error) => {
          console.error('[checkout] failed to save the selected payment method:', error);
        });
      } else {
        paymentMethodEditedRef.current = false;
        paymentMethodEditedUserIdRef.current = null;
        selectedPaymentMethodRef.current = null;
        setPaymentMethod(null);
        setBankCode(null);
      }
    }
    const restorePaymentMethod = async () => {
      try {
        const savedMethod = await AsyncStorage.getItem(
          `tap2go:checkout-payment-method:${preferenceUserId}`,
        );
        if (active && !paymentMethodEditedRef.current && savedMethod && isCheckoutPaymentMethod(savedMethod)) {
          selectedPaymentMethodRef.current = savedMethod;
          setPaymentMethod(savedMethod);
        }
      } catch (error) {
        console.error('[checkout] failed to restore the last payment method:', error);
      }
    };
    void restorePaymentMethod();
    return () => {
      active = false;
    };
  }, [paymentPreferenceUserId]);

  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    paymentMethodEditedRef.current = true;
    paymentMethodEditedUserIdRef.current = paymentPreferenceUserId == null
      ? null
      : String(paymentPreferenceUserId);
    if (selectedPaymentMethodRef.current !== method) setBankCode(null);
    selectedPaymentMethodRef.current = method;
    setPaymentMethod(method);
    if (paymentPreferenceUserId == null) return;
    void AsyncStorage.setItem(
      `tap2go:checkout-payment-method:${paymentPreferenceUserId}`,
      method,
    ).catch((error) => {
      console.error('[checkout] failed to save the last payment method:', error);
    });
  }, [paymentPreferenceUserId]);

  const [isPaying, setIsPaying] = useState(false);
  const [hasResolvedInitialPaymentCheck, setHasResolvedInitialPaymentCheck] = useState(false);
  const [isCheckingPaymentState, setIsCheckingPaymentState] = useState(false);
  const [hasPendingRecovery, setHasPendingRecovery] = useState(false);
  const [pendingRecoveryOrderId, setPendingRecoveryOrderId] = useState<string | null>(null);
  const [retryOrder, setRetryOrder] = useState<{
    id: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    platformFee: number;
    priorityFee: number;
    discountTotal: number;
    freeDeliveryApplied: boolean;
    fulfillmentType: string;
    deliveryDistanceMeters: number | null;
    merchantId: string;
    merchantName: string;
    merchantLogoUrl: string | null;
    deliveryLocation: {
      label: string | null;
      formattedAddress: string | null;
      contactName: string | null;
      contactPhone: string | null;
    } | null;
    recipientPhone: string | null;
    items: {
      id: string | number;
      quantity: number;
      imageUrl: string | null;
      productName: string;
      subtotal: number;
    }[];
  } | null>(null);
  const [retryOrderError, setRetryOrderError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrIntentId, setQrIntentId] = useState<string | null>(null);
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);
  const reconcileInFlightRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigatedToReturnRef = useRef(false);
  const qrNavigationInProgressRef = useRef(false);
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);
  const isRecipientPhoneValid = isPhilippineE164Phone(recipientPhone);
  const isRecipientPhoneSaved = isRecipientPhoneValid && recipientPhone === user?.phone;

  useEffect(() => {
    if (typeof user?.phone === 'string' && user.phone.trim()) {
      setRecipientPhoneNational((current) => current || getPhilippineNationalNumber(user.phone || ''));
    }
  }, [user?.phone]);

  const merchantCart = getMerchantCart(String(merchantId));
  const hasActiveCartItems = Boolean(merchantCart?.items.length);
  const showExistingPaymentBlock = !hasActiveCartItems && (hasPendingRecovery || isCheckingPaymentState);
  const merchantName = isPaymentRetry
    ? retryOrder?.merchantName || 'Merchant'
    : merchantCart?.merchantName || 'Merchant';
  const merchantLogoUrl = isPaymentRetry
    ? retryOrder?.merchantLogoUrl || null
    : merchantCart?.merchantLogoUrl;
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
  const [deliveryQuoteResolved, setDeliveryQuoteResolved] = useState(false);
  const deliveryQuoteCacheKeyRef = useRef<string | null>(null);
  const deliveryQuoteRequestRef = useRef(0);

  const deliveryCharge = deliveryAvailable
    ? deliveryFee + priorityFee + CHECKOUT_PLATFORM_FEE
    : 0;
  const orderTotal = Math.max(0, totalSubtotal + deliveryCharge - deliveryDiscount);
  const checkoutSubtotal = isPaymentRetry ? retryOrder?.subtotal || 0 : totalSubtotal;
  const checkoutDeliveryAvailable = isPaymentRetry
    ? retryOrder?.fulfillmentType === 'delivery'
    : deliveryAvailable;
  const checkoutDeliveryFee = isPaymentRetry ? retryOrder?.deliveryFee || 0 : deliveryFee;
  const checkoutPlatformFee = isPaymentRetry
    ? retryOrder?.platformFee || 0
    : CHECKOUT_PLATFORM_FEE;
  const checkoutPriorityFee = isPaymentRetry ? retryOrder?.priorityFee || 0 : priorityFee;
  const checkoutDeliveryDistance = isPaymentRetry
    ? retryOrder?.deliveryDistanceMeters ?? null
    : deliveryDistanceMeters;
  const checkoutDeliveryPriorityCharge = checkoutDeliveryFee + checkoutPriorityFee;
  const checkoutDeliveryCharge = checkoutDeliveryPriorityCharge + checkoutPlatformFee;
  const checkoutDiscountTotal = isPaymentRetry ? retryOrder?.discountTotal || 0 : deliveryDiscount;
  const checkoutFreeDeliveryApplied = isPaymentRetry
    ? retryOrder?.freeDeliveryApplied === true
    : freeDeliveryApplied;
  const checkoutTotal = isPaymentRetry ? retryOrder?.total || 0 : orderTotal;
  const checkoutItems: CheckoutDisplayItem[] = isPaymentRetry
    ? retryOrder?.items || []
    : (merchantCart?.items || []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        productName: item.productName,
        selectedVariationName: item.selectedVariationName,
        productSize: item.productSize,
        subtotal: item.subtotal,
      }));
  const checkoutRecipientPhone = isPaymentRetry
    ? retryOrder?.recipientPhone || ''
    : recipientPhone;
  const checkoutRecipientPhoneNational = isPaymentRetry
    ? getPhilippineNationalNumber(checkoutRecipientPhone)
    : recipientPhoneNational;
  const isCheckoutBelowMinimum = isPaymentRetry
    ? checkoutTotal < PAYMONGO_MINIMUM_AMOUNT_PHP
    : isBelowPayMongoMinimum;

  useEffect(() => {
    if (!retryOrderId) {
      setRetryOrder(null);
      setRetryOrderError(null);
      return;
    }
    if (!user?.id) {
      setRetryOrder(null);
      setRetryOrderError('Sign in again before paying for this order.');
      return;
    }

    let active = true;
    setRetryOrder(null);
    setRetryOrderError(null);
    const query = new URLSearchParams({
      userId: String(user.id),
      orderId: retryOrderId,
    });
    fetch(`${apiConfig.baseUrl}/orders/aggregate?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Could not load this order.');
        if (
          String(data?.id) !== retryOrderId ||
          Number(data?.merchant?.id) !== merchantId ||
          String(data?.status).toLowerCase() !== 'pending' ||
          data?.isPaid === true ||
          data?.canResumePayment !== true
        ) {
          throw new Error('This order is no longer awaiting payment.');
        }
        const total = Number(data?.total);
        if (!Number.isFinite(total) || total < PAYMONGO_MINIMUM_AMOUNT_PHP) {
          throw new Error('This order has an invalid payment total.');
        }
        if (active) {
          setRetryOrder({
            id: retryOrderId,
            total,
            subtotal: Number(data?.subtotal) || 0,
            deliveryFee: Number(data?.deliveryFee) || 0,
            platformFee: Number(data?.platformFee) || 0,
            priorityFee: Number(data?.priorityFee) || 0,
            discountTotal: Number(data?.discountTotal) || 0,
            freeDeliveryApplied: data?.freeDeliveryApplied === true,
            fulfillmentType: String(data?.fulfillmentType || ''),
            deliveryDistanceMeters: Number.isFinite(Number(data?.delivery?.distanceMeters))
              ? Number(data.delivery.distanceMeters)
              : null,
            merchantId: String(data.merchant.id),
            merchantName: data.merchant.outletName || data.merchant.name || 'Merchant',
            merchantLogoUrl: typeof data.merchant.logo === 'string' ? data.merchant.logo : null,
            deliveryLocation: data?.deliveryLocation
              ? {
                  label: typeof data.deliveryLocation.label === 'string' ? data.deliveryLocation.label : null,
                  formattedAddress: typeof data.deliveryLocation.formattedAddress === 'string'
                    ? data.deliveryLocation.formattedAddress
                    : null,
                  contactName: typeof data.deliveryLocation.contactName === 'string'
                    ? data.deliveryLocation.contactName
                    : null,
                  contactPhone: typeof data.deliveryLocation.contactPhone === 'string'
                    ? data.deliveryLocation.contactPhone
                    : null,
                }
              : null,
            recipientPhone: data?.deliveryLocation?.contactPhone || data?.customer?.user?.phone || null,
            items: Array.isArray(data?.items)
              ? data.items.map((item: any) => ({
                  id: item.id,
                  quantity: Number(item.quantity) || 1,
                  imageUrl: typeof item.image === 'string' ? item.image : null,
                  productName: String(item.name || 'Item'),
                  subtotal: Number(item.total) || 0,
                }))
              : [],
          });
        }
      })
      .catch((error) => {
        if (active) {
          setRetryOrder(null);
          setRetryOrderError(error instanceof Error ? error.message : 'Could not load this order.');
        }
      })
    return () => {
      active = false;
    };
  }, [merchantId, retryOrderId, user?.id]);

  const handleSaveRecipientPhone = async () => {
    if (!user?.id || (!token && !apiConfig.payloadApiKey)) {
      Alert.alert('Sign in required', 'Sign in again before saving your delivery phone number.');
      return;
    }
    if (!isPhilippineE164Phone(recipientPhone)) {
      Alert.alert('Invalid phone number', 'Enter the 10-digit Philippine mobile number after +63, such as 9468748743.');
      return;
    }
    if (recipientPhone === user.phone || isSavingRecipientPhone) return;

    setIsSavingRecipientPhone(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiConfig.payloadApiKey) {
        headers.Authorization = `users API-Key ${apiConfig.payloadApiKey}`;
      } else if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${apiConfig.baseUrl}/users/${user.id}?depth=2`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ phone: recipientPhone }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result?.errors?.[0]?.message || result?.message || 'Failed to save delivery phone number.',
        );
      }

      updateUser({ ...user, phone: recipientPhone });
      Alert.alert('Phone number saved', 'Your delivery phone number is saved in E.164 format.');
    } catch (error) {
      console.error('[checkout] recipient phone save failed:', error);
      Alert.alert(
        'Could not save phone number',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSavingRecipientPhone(false);
    }
  };

  const navigateToQrPayment = useCallback(
    (imageUrl: string, trace?: {
      checkoutRequestId?: string;
      payStartedAt?: number;
      paymentIntentId?: string;
      orderId?: string;
      amount?: number;
      merchantId?: string;
      merchantName?: string;
    }) => {
      router.push({
        pathname: '/checkout/qr',
        params: {
          qrImage: imageUrl,
          amount: String(trace?.amount ?? orderTotal),
          merchantId: trace?.merchantId || String(merchantId),
          merchantName: trace?.merchantName || merchantName,
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
    if (isPaymentRetry || !merchantId || !activeAddressId || !customerId || !token) return;

    const cacheKey = `${merchantId}:${activeAddressId}`;
    if (deliveryQuoteCacheKeyRef.current === cacheKey) return;
    deliveryQuoteCacheKeyRef.current = cacheKey;
    const requestId = ++deliveryQuoteRequestRef.current;

    setDeliveryFeeLoading(true);
    setDeliveryQuoteResolved(false);
    setDeliveryAvailable(false);
    setDeliveryFee(0);
    setPriorityFee(0);
    setDeliveryDiscount(0);
    setFreeDeliveryApplied(false);
    setDeliveryDistanceMeters(null);
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
      if (requestId !== deliveryQuoteRequestRef.current) return;

      if (quoteData?.data?.available === false) {
        setDeliveryFeeError(quoteData?.data?.error || 'Delivery is currently unavailable. Please try again later.');
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
      if (requestId !== deliveryQuoteRequestRef.current) return;
      deliveryQuoteCacheKeyRef.current = null;
      setDeliveryFeeError(err?.message || 'Could not estimate delivery fee');
    } finally {
      if (requestId === deliveryQuoteRequestRef.current) {
        setDeliveryFeeLoading(false);
        setDeliveryQuoteResolved(true);
      }
    }
  }, [activeAddressId, customerId, isPaymentRetry, merchantId, token]);

  useEffect(() => {
    fetchDeliveryQuote();
  }, [fetchDeliveryQuote]);

  const handleAddressSelected = useCallback(async () => {
    dataCache.clear();
    await queryClient.resetQueries({ queryKey: ADDRESS_KEYS.all });
    deliveryQuoteCacheKeyRef.current = null;
    deliveryQuoteRequestRef.current += 1;
    setDeliveryQuoteResolved(false);
    setIsAddressModalVisible(false);
  }, [queryClient]);


  const availablePaymentMethods = AVAILABLE_PAYMENT_METHODS;

  const renderPaymentSection = (showQrProgress = true) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      {showQrProgress && qrImage ? (
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
            const config = PAYMENT_METHOD_OPTIONS[key];

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.paymentMethodCard,
                  isSelected && styles.paymentMethodCardSelected,
                ]}
                onPress={() => selectPaymentMethod(key)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                    {config.srcs.map((src, index) => (
                      <Image
                        key={`${key}-${index}`}
                        source={src}
                        style={{
                          width: 32,
                          height: 20,
                          marginRight: index === config.srcs.length - 1 ? 0 : 4,
                        }}
                        resizeMode="contain"
                      />
                    ))}
                    {key === 'wallet' && (
                      <Ionicons name="wallet-outline" size={24} color="#0F766E" />
                    )}
                  </View>
                  <Text style={styles.paymentMethodText}>{config.label}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.selectedIcon}>
                    <Ionicons name="checkmark-circle" size={16} color="#000" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {paymentMethod === 'wallet' && (
        <Text style={{ color: '#475569', fontSize: 13, marginTop: 10 }}>
          {walletQuery.isLoading
            ? 'Checking your wallet balance…'
            : walletQuery.data
              ? `Available balance: ${formatCurrency(walletQuery.data.balanceMinor / 100)}. The server checks the balance before placing your order.`
              : 'Your wallet balance could not be loaded. Try again or choose another payment method.'}
        </Text>
      )}
      {paymentMethod && BANK_OPTIONS[paymentMethod] ? (
        <View style={styles.bankSelection}>
          <Text style={styles.bankSelectionTitle}>Choose your bank</Text>
          <View style={styles.bankOptionsGrid}>
            {BANK_OPTIONS[paymentMethod]?.map((bank) => {
              const isSelected = bankCode === bank.code;
              return (
                <TouchableOpacity
                  key={bank.code}
                  style={[
                    styles.bankOption,
                    isSelected && styles.bankOptionSelected,
                  ]}
                  onPress={() => setBankCode(bank.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bankOptionText}>{bank.label}</Text>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={18} color="#0F766E" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );

  const isFormValid = useMemo(() => {
    if (!apiConfig.isPaymongoSandbox && !paymentMethod) return false;
    if (
      !apiConfig.isPaymongoSandbox &&
      paymentMethod &&
      BANK_OPTIONS[paymentMethod] &&
      !BANK_OPTIONS[paymentMethod]?.some((bank) => bank.code === bankCode)
    ) return false;
    if (!activeAddressId) return false;
    return true;
  }, [paymentMethod, bankCode, activeAddressId]);
  const retryBankOptions = paymentMethod ? BANK_OPTIONS[paymentMethod] : undefined;
  const isRetryMethodValid = Boolean(
    paymentMethod &&
    (!retryBankOptions || retryBankOptions.some((bank) => bank.code === bankCode)),
  );

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
    if (isPaymentRetry) return;
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

      let paymentStatus = await getCheckoutPaymentStatus({
        paymentIntentId: pendingSession.paymentIntentId,
        orderId: pendingSession.orderId,
      });

      if (paymentStatus.status === 'pending' && user?.id) {
        try {
          const reconciled = await reconcileCheckoutPayment({
            orderId: pendingSession.orderId,
            customerId: String(user.id),
            paymentIntentId: pendingSession.paymentIntentId,
          });
          if (reconciled) {
            paymentStatus = await getCheckoutPaymentStatus({
              paymentIntentId: pendingSession.paymentIntentId,
              orderId: pendingSession.orderId,
            });
          }
        } catch (reconciliationError) {
          console.error('[checkout-pay] server payment reconciliation deferred:', reconciliationError);
        }
      }

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
  }, [customerId, getMerchantCart, isCartLoading, isPaymentRetry, merchantId, redirectToCheckoutReturn, reload, user?.id]);

  useEffect(() => {
    if (isPaymentRetry) {
      setHasResolvedInitialPaymentCheck(true);
      return;
    }
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
  }, [isCartLoading, isPaymentRetry, reconcileExistingPayment]);

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

  const handleRetryPayNow = async () => {
    const selectedPaymentMethod = selectedPaymentMethodRef.current;
    if (!retryOrder || !retryOrderId || !user?.id || !token || !selectedPaymentMethod) {
      Alert.alert('Payment details missing', 'Select a payment method and try again.');
      return;
    }
    const bankOptions = BANK_OPTIONS[selectedPaymentMethod];
    if (bankOptions && !bankOptions.some((bank) => bank.code === bankCode)) {
      Alert.alert('Select your bank', 'Choose the bank you want to pay from.');
      return;
    }

    setIsPaying(true);
    qrNavigationInProgressRef.current = false;
    let keepSpinnerForQr = false;
    try {
      const requestHeaders = {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      };
      const retryAttemptId = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      const resumeResponse = await fetch(`${apiConfig.baseUrl}/checkout/payment-resume`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          orderId: Number(retryOrder.id),
          paymentMethod: selectedPaymentMethod,
          retryAttemptId,
          ...(bankCode ? { bankCode } : {}),
        }),
      });
      const resumeData = await resumeResponse.json().catch(() => ({}));
      if (!resumeResponse.ok) {
        console.error('[checkout-retry] payment resume rejected', {
          status: resumeResponse.status,
          code: resumeData?.code || null,
          providerErrorCode: resumeData?.providerErrorCode || null,
          error: resumeData?.error || null,
        });
        const code = resumeData?.code ? ` [${resumeData.code}]` : '';
        const providerErrorCode = resumeData?.providerErrorCode
          ? ` [PayMongo: ${resumeData.providerErrorCode}]`
          : '';
        throw new Error(
          `${resumeData?.error || 'Could not start a fresh payment attempt.'}${code}${providerErrorCode} (HTTP ${resumeResponse.status})`,
        );
      }
      if (resumeData.state === 'paid' && resumeData.wallet === true) {
        await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] });
        hasNavigatedToReturnRef.current = true;
        router.replace({
          pathname: '/order-success',
          params: {
            orderId: String(resumeData.orderId || retryOrder.id),
            merchantId: retryOrder.merchantId,
          },
        });
        return;
      }
      if (resumeData.state === 'paid' || resumeData.state === 'processing') {
        if (resumeData.paymentIntentId) {
          redirectToCheckoutReturn(
            String(resumeData.paymentIntentId),
            String(resumeData.orderId || retryOrder.id),
            retryOrder.merchantId,
          );
          return;
        }
        throw new Error(resumeData.message || 'Payment confirmation is still in progress.');
      }
      if (
        resumeData.state !== 'retry' ||
        resumeData.paymentMethod !== selectedPaymentMethod ||
        !resumeData.paymentIntentId ||
        !resumeData.clientKey ||
        !resumeData.transactionId
      ) {
        throw new Error(resumeData.message || 'Could not create a fresh payment attempt.');
      }

      const publicKey = apiConfig.paymongoPublicKey;
      if (!publicKey) throw new Error('Payment is temporarily unavailable.');
      const { appReturnUrl } = await attachSelectedPaymentMethod({
        publicKey,
        paymentIntentId: String(resumeData.paymentIntentId),
        clientKey: String(resumeData.clientKey),
        paymentMethod: selectedPaymentMethod,
        bankCode,
        customerId: String(user.id),
        merchantId: retryOrder.merchantId,
        orderId: retryOrder.id,
        customerName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        customerEmail: user.email || 'customer@example.com',
      });

      const confirmationResponse = await fetch(`${apiConfig.baseUrl}/checkout/payment-resume`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          orderId: Number(retryOrder.id),
          transactionId: resumeData.transactionId,
          confirmAttached: true,
        }),
      });
      const confirmation = await confirmationResponse.json().catch(() => ({}));
      if (!confirmationResponse.ok) {
        throw new Error(confirmation?.error || 'Payment was sent, but confirmation is still processing.');
      }
      if (confirmation.state === 'paid' || confirmation.state === 'processing') {
        redirectToCheckoutReturn(
          String(confirmation.paymentIntentId || resumeData.paymentIntentId),
          String(confirmation.orderId || retryOrder.id),
          retryOrder.merchantId,
        );
        return;
      }
      if (confirmation.state === 'qr' && confirmation.qrImage) {
        setQrImage(String(confirmation.qrImage));
        setQrIntentId(String(resumeData.paymentIntentId));
        setQrOrderId(retryOrder.id);
        navigateToQrPayment(String(confirmation.qrImage), {
          paymentIntentId: String(resumeData.paymentIntentId),
          orderId: retryOrder.id,
          amount: retryOrder.total,
          merchantId: retryOrder.merchantId,
          merchantName: retryOrder.merchantName,
        });
        qrNavigationInProgressRef.current = true;
        keepSpinnerForQr = true;
        return;
      }
      if (confirmation.state === 'redirect' && confirmation.redirectUrl) {
        const subscription = Linking.addEventListener('url', ({ url }) => {
          if (url.startsWith('gcash://')) void Linking.openURL(url);
        });
        const result = await WebBrowser.openAuthSessionAsync(confirmation.redirectUrl, appReturnUrl);
        subscription.remove();
        if (result.type === 'success' && result.url) {
          hasNavigatedToReturnRef.current = true;
          return;
        }
        Alert.alert(
          'Payment not completed',
          'Choose Pay again to start a fresh payment attempt.',
        );
        return;
      }
      throw new Error(confirmation.message || 'The payment provider returned an unsupported action.');
    } catch (error) {
      console.error('[checkout-retry] payment attempt failed:', error);
      Alert.alert(
        'Payment not completed',
        error instanceof Error ? error.message : 'Please choose a method and try again.',
      );
    } finally {
      if (!keepSpinnerForQr) setIsPaying(false);
    }
  };

  const handleSandboxPay = async () => {
    if (merchantAvailability.isUnavailable) {
      Alert.alert('Merchant unavailable', merchantAvailability.unavailableMessage || 'This merchant is not accepting orders.');
      return;
    }
    if (!user || !customerId || !activeAddressId || !token) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!isRecipientPhoneValid || !isRecipientPhoneSaved) {
      Alert.alert(
        'Save a valid phone number',
        'Enter the 10-digit Philippine mobile number after +63 and save it before paying.',
      );
      return;
    }

    if (deliveryFeeLoading || !deliveryQuoteResolved) {
      Alert.alert('Please wait', 'We are still calculating your delivery fee.');
      return;
    }

    if (!deliveryAvailable) {
      Alert.alert(
        'Delivery unavailable',
        deliveryFeeError || 'We could not confirm Lalamove delivery for this address. Please try again later.',
      );
      return;
    }

    if (deliveryFee <= 0 && !freeDeliveryApplied) {
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
        contactPhone: recipientPhone,
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
    if (isPaymentRetry) {
      await handleRetryPayNow();
      return;
    }

    if (merchantAvailability.isUnavailable) {
      Alert.alert('Merchant unavailable', merchantAvailability.unavailableMessage || 'This merchant is not accepting orders.');
      return;
    }
    if (!user || !customerId || !activeAddressId || !token) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!isRecipientPhoneValid || !isRecipientPhoneSaved) {
      Alert.alert(
        'Save a valid phone number',
        'Enter the 10-digit Philippine mobile number after +63 and save it before paying.',
      );
      return;
    }

    const selectedPaymentMethod = selectedPaymentMethodRef.current;
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    const bankOptions = BANK_OPTIONS[selectedPaymentMethod];
    if (bankOptions && !bankOptions.some((bank) => bank.code === bankCode)) {
      Alert.alert('Select your bank', 'Choose the bank you want to pay from.');
      return;
    }

    if (deliveryFeeLoading || !deliveryQuoteResolved) {
      Alert.alert('Please wait', 'We are still calculating your delivery fee.');
      return;
    }

    if (!deliveryAvailable) {
      Alert.alert(
        'Delivery unavailable',
        deliveryFeeError || 'We could not confirm Lalamove delivery for this address. Please try again later.',
      );
      return;
    }

    if (deliveryFee <= 0 && !freeDeliveryApplied) {
      Alert.alert(
        'Delivery fee unavailable',
        deliveryFeeError || 'We could not calculate your delivery fee. Please try again.',
      );
      return;
    }

    if (isBelowPayMongoMinimum && selectedPaymentMethod !== 'wallet') {
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
      paymentMethod: selectedPaymentMethod,
      cartItemCount: merchantCart.items.length,
    });

    setIsPaying(true);
    qrNavigationInProgressRef.current = false;
    let pendingCheckoutSessionSaved = false;
    let paymentAttachStarted = false;
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
              contactPhone: recipientPhone,
              paymentMethod: selectedPaymentMethod,
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
        if (!cartUnavailable) {
          await reload();
        }
        throw new Error(preparedCheckout?.error || 'Failed to prepare checkout');
      }

      const createdOrderId = preparedCheckout?.data?.orderId;
      const payment = preparedCheckout?.data?.payment;
      if (!createdOrderId) {
        throw new Error('Checkout preparation returned no order ID');
      }
      markCheckedOut(merchantCart.items.map((item) => item.id));
      if (!payment || payment.failed) {
        throw new Error('Checkout did not return a usable payment session.');
      }
      if (!preparedCheckout?.data?.reused) {
        updateAccountOverviewAfterOrder(Number(preparedCheckout.data.total) || orderTotal);
      }
      if (payment.paid) {
        await clearPendingCheckoutSession(String(customerId), String(merchantId));
        if (payment.wallet) {
          await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] });
        }
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

      const { attachData, appReturnUrl } = await attachSelectedPaymentMethod({
        publicKey: pk,
        paymentIntentId: intentId,
        clientKey: cKey,
        paymentMethod: selectedPaymentMethod,
        bankCode,
        customerId: String(customerId),
        merchantId: String(merchantId),
        orderId: String(createdOrderId),
        customerName: [user.firstName, user.lastName].filter(Boolean).join(' '),
        customerEmail: user.email || 'customer@example.com',
        request: timedRequest,
        onSessionSaved: () => {
          pendingCheckoutSessionSaved = true;
        },
        onAttachStarted: () => {
          paymentAttachStarted = true;
        },
      });

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
        if (!paymentAttachStarted) {
          await clearPendingCheckoutSession(String(customerId), String(merchantId));
        } else {
          try {
            await reconcileExistingPayment(true, true);
          } catch (reconcileError) {
            console.error('[checkout-pay] pending payment recovery failed after payment error:', reconcileError);
          }
          if (hasNavigatedToReturnRef.current) return;
          Alert.alert(
            'Payment Processing',
            'We could not confirm whether your payment completed. Your checkout is saved; check Orders before trying again.',
            [{ text: 'Go to Orders', onPress: () => router.replace('/(tabs)/orders') }],
          );
          return;
        }
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

  if (!isPaymentRetry && (isCartLoading || !hasResolvedInitialPaymentCheck)) {
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

  if (isPaymentRetry && retryOrderError) {
    return (
      <SafeAreaView style={styles.paymentStateContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#B45309" />
        <Text style={styles.paymentStateTitle}>Unable to load this order</Text>
        <Text style={styles.paymentStateMessage}>{retryOrderError}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.paymentStateButton}>
          <Text style={styles.paymentStateButtonText}>Back to order</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isPaymentRetry && !retryOrder) {
    return (
      <SafeAreaView style={styles.paymentStateContainer}>
        <ActivityIndicator size="large" color="#F3A823" />
        <Text style={styles.paymentStateTitle}>Loading checkout</Text>
        <Text style={styles.paymentStateMessage}>Please wait while we load your unpaid order.</Text>
      </SafeAreaView>
    );
  }

  if (cartLoadError && !isPaymentRetry) {
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

  if (!isPaymentRetry && (!merchantCart || merchantCart.items.length === 0)) {
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
              accessibilityRole="button"
            >
              <Text style={styles.paymentStateButtonText}>View order</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/orders')}
            style={styles.paymentStateSecondaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.paymentStateSecondaryButtonText}>Go to Orders</Text>
          </TouchableOpacity>
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
              <Text style={styles.subtitleText}>
                {isPaymentRetry ? `Checkout · Order #${retryOrder?.id}` : 'Checkout'}
              </Text>
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
          {isPaymentRetry ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText}>
                  {retryOrder?.fulfillmentType === 'delivery'
                    ? retryOrder.deliveryLocation?.formattedAddress || 'Delivery address unavailable'
                    : 'Pickup order'}
                </Text>
                {retryOrder?.deliveryLocation?.label ? (
                  <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
                    {retryOrder.deliveryLocation.label}
                  </Text>
                ) : null}
                {retryOrder?.deliveryLocation?.contactName ? (
                  <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
                    {retryOrder.deliveryLocation.contactName}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
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
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient phone number *</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isPaymentRetry || isRecipientPhoneValid || !recipientPhoneNational.trim()
                ? '#D1D5DB'
                : '#DC2626',
              borderRadius: 10,
              paddingLeft: 12,
            }}
          >
            <Text style={{ color: '#111827', fontSize: 15, paddingVertical: 11 }}>+63</Text>
            <TextInput
              value={checkoutRecipientPhoneNational}
              onChangeText={(value) => setRecipientPhoneNational(value.replace(/\D/g, '').slice(0, 11))}
              placeholder="9468748743"
              maxLength={11}
              keyboardType="number-pad"
              textContentType="telephoneNumber"
              accessibilityLabel="Philippine delivery recipient phone number"
              editable={!isPaymentRetry && !isPaying && !isSavingRecipientPhone}
              style={{
                flex: 1,
                paddingHorizontal: 8,
                paddingVertical: 11,
                color: '#111827',
                fontSize: 15,
              }}
            />
          </View>
          <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 6 }}>
            {isPaymentRetry
              ? 'Recipient phone number used for this order.'
              : 'Enter the 10-digit Philippine mobile number after +63, then save it before paying.'}
          </Text>
          {!isPaymentRetry && recipientPhoneNational.trim() && !isRecipientPhoneValid ? (
            <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 4 }}>
              Enter 10 digits starting with 9. Do not include the leading 0 or country code.
            </Text>
          ) : null}
          {!isPaymentRetry ? (
            <TouchableOpacity
              onPress={handleSaveRecipientPhone}
              disabled={!isRecipientPhoneValid || isRecipientPhoneSaved || isSavingRecipientPhone || isPaying}
              accessibilityRole="button"
              style={{
                alignSelf: 'flex-start',
                marginTop: 10,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: isRecipientPhoneValid && !isRecipientPhoneSaved && !isSavingRecipientPhone
                  ? '#0F766E'
                  : '#D1D5DB',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                {isSavingRecipientPhone
                  ? 'Saving...'
                  : isRecipientPhoneSaved
                    ? 'Phone number saved'
                    : 'Save phone number'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryCard}>
            {checkoutItems.map((item) => (
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
              <Text style={styles.subtotalValue}>{formatCurrency(checkoutSubtotal)}</Text>
            </View>
            {checkoutDeliveryAvailable ? (
              <View style={styles.deliveryFeeRow}>
                <Text style={styles.subtotalLabel}>Delivery & priority fee</Text>
                {!isPaymentRetry && deliveryFeeLoading ? (
                  <ActivityIndicator size="small" color="#f97316" />
                ) : checkoutFreeDeliveryApplied ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#6B7280', fontSize: 12, textDecorationLine: 'line-through' }}>
                      {formatCurrency(checkoutDeliveryPriorityCharge)}
                    </Text>
                    <Text style={[
                      styles.subtotalValue,
                      { color: checkoutPlatformFee > 0 ? '#111827' : '#15803D' },
                    ]}>
                      {checkoutPlatformFee > 0
                        ? formatCurrency(checkoutPlatformFee)
                        : 'FREE'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.subtotalValue}>
                    {checkoutDeliveryCharge > 0 ? formatCurrency(checkoutDeliveryCharge) : 'FREE'}
                  </Text>
                )}
              </View>
            ) : null}
            {checkoutFreeDeliveryApplied && (isPaymentRetry || !deliveryFeeLoading) ? (
              <Text style={{ color: '#15803D', fontSize: 12, marginTop: 4 }}>
                New-user offer: delivery and priority fee waived within 5 km.
              </Text>
            ) : null}
            {isPaymentRetry && !checkoutFreeDeliveryApplied && checkoutDiscountTotal > 0 ? (
              <View style={styles.deliveryFeeRow}>
                <Text style={styles.subtotalLabel}>Discount</Text>
                <Text style={[styles.subtotalValue, { color: '#15803D' }]}>
                  -{formatCurrency(checkoutDiscountTotal)}
                </Text>
              </View>
            ) : null}
            {checkoutDeliveryAvailable &&
              (isPaymentRetry || !deliveryFeeLoading) &&
              checkoutDeliveryDistance != null && (
              <View style={styles.deliveryDistanceRow}>
                <Text style={styles.deliveryDistanceLabel}>Delivery Distance</Text>
                <Text style={styles.deliveryDistanceValue}>
                  ~{(checkoutDeliveryDistance / 1000).toFixed(1)} km
                </Text>
              </View>
            )}
            {!isPaymentRetry && deliveryQuoteResolved && !deliveryFeeLoading && deliveryFeeError ? (
              <Text style={styles.deliveryFeeErrorText}>
                Delivery fee unavailable — {deliveryFeeError}
              </Text>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(checkoutTotal)}</Text>
            </View>
          </View>
        </View>

        {isCheckoutBelowMinimum && (
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

        {!isPaymentRetry && showExistingPaymentBlock && (
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
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => router.push(`/order/${pendingRecoveryOrderId}`)}
                      accessibilityRole="button"
                    >
                      <Text style={{ color: '#0F766E', fontSize: 13, fontWeight: '700' }}>
                        Resume payment
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.replace('/(tabs)/orders')}
                      accessibilityRole="button"
                    >
                      <Text style={{ color: '#0F766E', fontSize: 13, fontWeight: '700' }}>
                        Go to Orders
                      </Text>
                    </TouchableOpacity>
                  </View>
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

        {(isPaymentRetry || !apiConfig.isPaymongoSandbox) &&
          renderPaymentSection(!isPaymentRetry)}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotalRow}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(checkoutTotal)}</Text>
        </View>
        {qrImage && !isPaymentRetry ? (
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
        ) : isPaymentRetry ? (
          <TouchableOpacity
            style={[styles.payButton, (!isRetryMethodValid || isPaying) && styles.payButtonDisabled]}
            onPress={handlePayNow}
            disabled={!isRetryMethodValid || isPaying}
            accessibilityRole="button"
            accessibilityLabel={`Pay ${formatCurrency(checkoutTotal)} for order ${retryOrder?.id}`}
          >
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay {formatCurrency(checkoutTotal)}</Text>
            )}
          </TouchableOpacity>
        ) : apiConfig.isPaymongoSandbox ? (
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: '#8b5cf6' },
              (!isFormValid || !isRecipientPhoneSaved || isPaying || merchantAvailability.isUnavailable || deliveryFeeLoading || !deliveryQuoteResolved || !deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied)) &&
                styles.payButtonDisabled,
            ]}
            onPress={handleSandboxPay}
            disabled={!isFormValid || !isRecipientPhoneSaved || isPaying || merchantAvailability.isUnavailable || deliveryFeeLoading || !deliveryQuoteResolved || !deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied)}
          >
            {isPaying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {deliveryFeeLoading
                  ? 'Calculating delivery fee...'
                  : (!deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied))
                    ? 'Delivery fee unavailable'
                    : `Simulate Payment (Sandbox)`}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.payButton,
              (!isFormValid || !isRecipientPhoneSaved || isPaying || merchantAvailability.isUnavailable || showExistingPaymentBlock || isBelowPayMongoMinimum || deliveryFeeLoading || !deliveryQuoteResolved || !deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied)) &&
                styles.payButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={!isFormValid || !isRecipientPhoneSaved || isPaying || merchantAvailability.isUnavailable || showExistingPaymentBlock || isBelowPayMongoMinimum || deliveryFeeLoading || !deliveryQuoteResolved || !deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied)}
          >
            {isPaying || (isCheckingPaymentState && !hasActiveCartItems) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {deliveryFeeLoading
                  ? 'Calculating delivery fee...'
                  : (!deliveryAvailable || (deliveryFee <= 0 && !freeDeliveryApplied))
                    ? 'Delivery fee unavailable'
                    : `Pay ${formatCurrency(orderTotal)}`}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {!isPaymentRetry ? (
        <AddressSelectionModal
          isVisible={isAddressModalVisible}
          onClose={() => setIsAddressModalVisible(false)}
          onAddressSelected={handleAddressSelected}
        />
      ) : null}
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
  bankSelection: {
    marginTop: 12,
    gap: 8,
  },
  bankSelectionTitle: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  bankOptionsGrid: {
    gap: 8,
  },
  bankOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  bankOptionSelected: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  bankOptionText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '500',
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
  paymentStateSecondaryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0F766E',
    backgroundColor: '#FFFFFF',
  },
  paymentStateSecondaryButtonText: {
    color: '#0F766E',
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
