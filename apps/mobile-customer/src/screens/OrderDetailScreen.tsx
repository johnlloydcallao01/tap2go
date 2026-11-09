import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiConfig } from '../../src/config/environment';
import { formatCurrency } from '../../src/utils/format';
import { PullToRefreshLayout } from '../../src/components/PullToRefreshLayout';

const CMS_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `users API-Key ${apiConfig.payloadApiKey}`,
};

type DeliveryBooking = {
  id: number;
  lalamove_order_id?: string | null;
  share_link?: string | null;
  service_type?: string | null;
  status?: string;
  lalamove_raw_status?: string | null;
  delivery_fee?: number | null;
  currency?: string | null;
  priority_fee?: number | null;
  rider_remarks?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  driver_plate_number?: string | null;
  driver_photo_url?: string | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  driver_location_updated_at?: string | null;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  distance_meters?: number | null;
};

type OrderItem = {
  id: number;
  product_name_snapshot?: string;
  price_at_purchase?: number;
  quantity?: number;
  total_price?: number;
  product?: any;
  options_snapshot?: any;
};

type DeliveryLocation = {
  id: number;
  order?: any;
  formatted_address?: string | null;
  street?: string | null;
  floor_unit_room?: string | null;
  delivery_instructions?: string | null;
  coordinates?: { lat?: number; lng?: number } | null;
  notes?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  label?: string | null;
  merchant_formatted_address?: string | null;
  merchant_street?: string | null;
  merchant_floor_unit_room?: string | null;
  merchant_delivery_instructions?: string | null;
  merchant_label?: string | null;
};

type OrderDetail = {
  id: number;
  status?: string;
  fulfillment_type?: string;
  total?: number;
  subtotal?: number;
  delivery_fee?: number;
  platform_fee?: number;
  delivery_service_type?: string;
  delivery_status?: string;
  delivery_tracking_link?: string | null;
  lalamove_order_id?: string | null;
  placed_at?: string;
  merchant?: any;
  customer?: any;
  deliveryBooking?: DeliveryBooking | null;
  deliveryLocation?: DeliveryLocation | null;
  items?: OrderItem[];
  isPaid?: boolean;
  paymentStatus?: string;
  paymentMethod?: string | null;
  canResumePayment?: boolean;
  priorityFeePaymentPending?: boolean;
  priorityFeePaymentFailed?: boolean;
  priorityFeePaymentRefunded?: boolean;
};

type AppRatingState = {
  eligible: boolean;
  submitted: boolean;
  rating: number | null;
  comment: string | null;
};

function isCompletedOrder(order: OrderDetail | null): boolean {
  if (!order || ['cancelled', 'canceled'].includes(String(order.status || '').toLowerCase())) {
    return false;
  }
  return order.status === 'delivered' ||
    (order.fulfillment_type === 'delivery' && order.delivery_status === 'completed');
}

const STATUS_STEPS = [
  { key: 'accepted', label: 'Order Confirmed', icon: 'checkmark-circle' as const },
  { key: 'assigning_driver', label: 'Assigning Driver', icon: 'search' as const },
  { key: 'driver_assigned', label: 'On Going', icon: 'bicycle' as const },
  { key: 'picked_up', label: 'Picked Up', icon: 'navigate' as const },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle' as const },
];

// Old status values map onto the new Lalamove-based steps
const STATUS_ALIASES: Record<string, number> = {
  preparing: 1, // → assigning_driver
  ready_for_pickup: 2, // → driver_assigned
  on_delivery: 3, // → picked_up
  delivered: 4, // → completed
};

function getStatusColor(status: string): string {
  if (status === 'canceled' || status === 'cancelled') return '#ef4444';
  if (status === 'expired' || status === 'rejected') return '#ef4444';
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'accepted': return '#3b82f6';
    case 'assigning_driver': return '#8b5cf6';
    case 'driver_assigned': return '#10b981';
    case 'picked_up': return '#06b6d4';
    case 'completed': return '#10b981';
    default: return '#6b7280';
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'assigning_driver': return 'Assigning Driver';
    case 'driver_assigned':  return 'On Going';
    case 'picked_up':        return 'Picked Up';
    case 'completed':        return 'Completed';
    case 'canceled':         return 'Cancelled';
    case 'rejected':         return 'Rejected';
    case 'expired':          return 'Expired';
    default:
      return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}

function getActiveStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  return STATUS_ALIASES[status] ?? 0;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const OrderDetailSkeleton = () => {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Status Banner */}
      <View style={{
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        gap: 12,
      }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#F3F4F6' }} />
        <View style={{ flex: 1 }}>
          <View style={{ width: '40%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
          <View style={{ width: '55%', height: 12, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
        </View>
      </View>

      {/* Status Timeline */}
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              marginRight: 8,
            }} />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  width: i === 3 ? '50%' : '65%',
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: i < 4 ? '#F3F4F6' : '#E5E7EB',
                }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Rider Section */}
      <View>
        <View style={{ width: '30%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 12 }} />
        <View style={{
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          gap: 12,
        }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6' }} />
          <View style={{ flex: 1 }}>
            <View style={{ width: '45%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
            <View style={{ width: '30%', height: 12, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
          </View>
        </View>
      </View>

      {/* Items Section */}
      <View>
        <View style={{ width: '30%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 12 }} />
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
              <View style={{ width: 32, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6', marginRight: 8 }} />
              <View style={{ flex: 1, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
            </View>
          ))}
        </View>
      </View>

      {/* Price Breakdown */}
      <View>
        <View style={{ width: '25%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 12 }} />
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const }}>
              <View style={{ width: 64, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
              <View style={{ width: 48, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [resumingPayment, setResumingPayment] = useState(false);
  const [showRiderInfo, setShowRiderInfo] = useState(false);
  const [showPriorityFeeModal, setShowPriorityFeeModal] = useState(false);
  const [priorityFeeAmount, setPriorityFeeAmount] = useState('');
  const [addingPriorityFee, setAddingPriorityFee] = useState(false);
  const [appRating, setAppRating] = useState<AppRatingState | null>(null);
  const [appRatingLoading, setAppRatingLoading] = useState(false);
  const [appRatingValue, setAppRatingValue] = useState<number | null>(null);
  const [appRatingComment, setAppRatingComment] = useState('');
  const [appRatingEditing, setAppRatingEditing] = useState(false);
  const [appRatingSubmitting, setAppRatingSubmitting] = useState(false);
  const [appRatingError, setAppRatingError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async (forceRefresh = false) => {
    if (!id || !user?.id) return;
    try {
      const params = new URLSearchParams({
        userId: String(user.id),
        orderId: String(id),
      });
      if (forceRefresh) params.set('refresh', 'true');
      const res = await fetch(
        `${apiConfig.baseUrl}/orders/aggregate?${params.toString()}`,
        {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'omit',
        },
      );
      if (!res.ok) throw new Error('Order not found');
      const agg = await res.json();
      if (!agg) throw new Error('Order not found');

      // Map aggregation response to existing types
      let deliveryBooking: DeliveryBooking | null = null;
      if (agg.delivery) {
        const d = agg.delivery;
        deliveryBooking = {
          id: d.id,
          lalamove_order_id: d.lalamoveOrderId,
          share_link: d.shareLink,
          status: d.status,
          lalamove_raw_status: d.rawStatus,
          delivery_fee: d.deliveryFee,
          priority_fee: d.priorityFee,
          rider_remarks: d.riderRemarks,
          distance_meters: d.distanceMeters,
          driver_name: d.driver?.name,
          driver_phone: d.driver?.phone,
          driver_plate_number: d.driver?.plateNumber,
          driver_photo_url: d.driver?.photoUrl,
          driver_lat: d.driver?.lat,
          driver_lng: d.driver?.lng,
          driver_location_updated_at: d.driver?.locationUpdatedAt,
        };
      }

      let deliveryLocation: DeliveryLocation | null = null;
      if (agg.deliveryLocation) {
        const dl = agg.deliveryLocation;
        deliveryLocation = {
          id: dl.id,
          formatted_address: dl.formattedAddress,
          street: dl.street,
          floor_unit_room: dl.floorUnitRoom,
          delivery_instructions: dl.deliveryInstructions,
          notes: dl.notes,
          contact_name: dl.contactName,
          contact_phone: dl.contactPhone,
          label: dl.label,
          merchant_formatted_address: dl.merchantFormattedAddress,
          merchant_street: dl.merchantStreet,
          merchant_floor_unit_room: dl.merchantFloorUnitRoom,
          merchant_delivery_instructions: dl.merchantDeliveryInstructions,
        };
      }

      // Pull LIVE status from Lalamove (keeps the real-time tracking working)
      if (deliveryBooking?.lalamove_order_id) {
        try {
          const trackRes = await fetch(
            `${apiConfig.baseUrl}/delivery/track?orderId=${encodeURIComponent(id)}`,
            { headers: CMS_HEADERS },
          );
          if (trackRes.ok) {
            const trackData = await trackRes.json();
            const ds = trackData?.data?.deliveryStatus;
            const raw = trackData?.data?.lalamoveRawStatus;
            if (ds && deliveryBooking) {
              deliveryBooking = {
                ...deliveryBooking,
                status: ds,
                lalamove_raw_status: raw || deliveryBooking.lalamove_raw_status,
              };
            }
          }
        } catch (err) {
          console.warn('[OrderDetail] live Lalamove status unavailable:', err);
        }
      }

      setOrder({
        id: agg.id,
        status: agg.status,
        fulfillment_type: agg.fulfillmentType,
        total: agg.total,
        subtotal: agg.subtotal,
        delivery_fee: agg.deliveryFee,
        platform_fee: agg.platformFee,
        placed_at: agg.placedAt,
        delivery_status: deliveryBooking?.status || null,
        lalamove_order_id: agg.delivery?.lalamoveOrderId || null,
        merchant: agg.merchant,
        customer: agg.customer,
        deliveryBooking,
        deliveryLocation,
        items: (agg.items || []).map((item: any) => ({
          id: item.id,
          product_name_snapshot: item.name,
          price_at_purchase: item.price,
          quantity: item.quantity,
          total_price: item.total,
        })),
        isPaid: agg.isPaid || false,
        paymentStatus: agg.paymentStatus || 'unpaid',
        paymentMethod: agg.paymentMethod || null,
        canResumePayment: agg.canResumePayment || false,
        priorityFeePaymentPending: agg.priorityFeePaymentPending || false,
        priorityFeePaymentFailed: agg.priorityFeePaymentFailed || false,
        priorityFeePaymentRefunded: agg.priorityFeePaymentRefunded || false,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  const fetchAppRating = useCallback(async (orderId: number) => {
    if (!user?.id) return;
    setAppRatingLoading(true);
    setAppRatingError(null);
    try {
      const params = new URLSearchParams({
        orderId: String(orderId),
        customerId: String(user.id),
      });
      const response = await fetch(
        `${apiConfig.baseUrl}/customer/app-rating?${params.toString()}`,
        { headers: CMS_HEADERS, cache: 'no-store', credentials: 'omit' },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not load your app rating.');

      setAppRating({
        eligible: data.eligible === true,
        submitted: data.submitted === true,
        rating: Number.isInteger(data.rating) ? data.rating : null,
        comment: typeof data.comment === 'string' ? data.comment : null,
      });
      setAppRatingEditing(false);
      if (data.submitted === true && Number.isInteger(data.rating)) {
        setAppRatingValue(data.rating);
        setAppRatingComment(typeof data.comment === 'string' ? data.comment : '');
      }
    } catch (error) {
      console.error('[OrderDetail] app rating fetch failed:', error);
      setAppRatingError(error instanceof Error ? error.message : 'Could not load your app rating.');
    } finally {
      setAppRatingLoading(false);
    }
  }, [user?.id]);

  const orderIsCompleted = isCompletedOrder(order);
  const completedOrderId = orderIsCompleted ? order?.id : undefined;
  useEffect(() => {
    setAppRating(null);
    setAppRatingValue(null);
    setAppRatingComment('');
    setAppRatingError(null);
    if (!completedOrderId || !user?.id) {
      setAppRatingLoading(false);
      return;
    }

    void fetchAppRating(completedOrderId);
  }, [completedOrderId, fetchAppRating, user?.id]);

  const handleSubmitAppRating = useCallback(async () => {
    if (!order || !user?.id || !orderIsCompleted || appRatingValue === null || appRatingSubmitting) {
      return;
    }

    setAppRatingSubmitting(true);
    setAppRatingError(null);
    try {
      const response = await fetch(`${apiConfig.baseUrl}/customer/app-rating`, {
        method: 'POST',
        headers: CMS_HEADERS,
        credentials: 'omit',
        body: JSON.stringify({
          orderId: order.id,
          customerId: Number(user.id),
          rating: appRatingValue,
          comment: appRatingComment.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not submit your app rating.');

      setAppRating({
        eligible: true,
        submitted: true,
        rating: Number(data.rating),
        comment: typeof data.comment === 'string' ? data.comment : null,
      });
      setAppRatingValue(Number(data.rating));
      setAppRatingComment(typeof data.comment === 'string' ? data.comment : '');
      setAppRatingEditing(false);
      Alert.alert(
        appRating?.submitted ? 'Rating updated' : 'Thanks for your feedback',
        'Your rating helps us improve the Tap2Go app.',
      );
    } catch (error) {
      console.error('[OrderDetail] app rating submission failed:', error);
      setAppRatingError(error instanceof Error ? error.message : 'Could not submit your app rating.');
    } finally {
      setAppRatingSubmitting(false);
    }
  }, [
    appRatingComment,
    appRatingSubmitting,
    appRatingValue,
    appRating,
    order,
    orderIsCompleted,
    user?.id,
  ]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrder(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrder]);

  // Poll for updates on active deliveries
  useEffect(() => {
    if (
      order?.status &&
      !['delivered', 'completed', 'canceled', 'cancelled', 'expired', 'rejected'].includes(order.status)
    ) {
      pollingRef.current = setInterval(() => {
        fetchOrder(true);
      }, 15000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [order?.status, fetchOrder]);

  const handleCancelOrder = useCallback(async () => {
    if (!id || canceling) return;
    setCanceling(true);
    try {
      const res = await fetch(`${apiConfig.baseUrl}/delivery/cancel`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({ orderId: Number(id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert(
          'Cannot cancel order',
          data?.error || 'The delivery could not be cancelled.',
        );
        return;
      }
      Alert.alert(
        'Order cancelled',
        'Your delivery has been cancelled. The delivery fee was not charged.',
      );
      fetchOrder();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to cancel the order.');
    } finally {
      setCanceling(false);
    }
  }, [id, canceling, fetchOrder]);

  const confirmCancel = useCallback(() => {
    Alert.alert(
      'Cancel order?',
      'The delivery has not been matched to a rider yet, so it can still be cancelled and the delivery fee will not be charged. Continue?',
      [
        { text: 'Keep order', style: 'cancel' },
        { text: 'Cancel order', style: 'destructive', onPress: () => handleCancelOrder() },
      ],
    );
  }, [handleCancelOrder]);

  const openPaymentAction = useCallback((payment: any) => {
    if (payment?.state === 'paid') {
      router.replace({
        pathname: '/checkout/return',
        params: {
          payment_intent_id: payment.paymentIntentId || '',
          merchantId: String(
            payment.merchantId ||
            (order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : ''),
          ),
          order_id: String(payment.orderId || order?.id || ''),
        },
      });
      return;
    }
    if (payment?.state === 'processing') {
      if (payment.paymentIntentId) {
        router.replace({
          pathname: '/checkout/return',
          params: {
            payment_intent_id: payment.paymentIntentId,
            merchantId: String(
              payment.merchantId ||
              (order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : ''),
            ),
            order_id: String(payment.orderId || order?.id || ''),
          },
        });
        return;
      }
      Alert.alert(
        'Payment confirmation in progress',
        payment.message || 'We are waiting for PayMongo to confirm your payment.',
      );
      return;
    }
    if (payment?.state === 'unavailable') {
      Alert.alert('Payment unavailable', payment.message || 'Please contact support to continue this order.');
      return;
    }
    if (payment?.state !== 'qr' && payment?.state !== 'redirect') return;

    router.push({
      pathname: '/checkout/qr',
      params: {
        qrImage: payment.state === 'qr' ? payment.qrImage : undefined,
        redirectUrl: payment.state === 'redirect' ? payment.redirectUrl : undefined,
        amount: String(payment.amount || order?.total || 0),
        merchantName:
          payment.merchantName ||
          (order?.merchant && typeof order.merchant === 'object'
            ? order.merchant.outletName || order.merchant.name || 'Merchant'
            : 'Merchant'),
        merchantId: String(
          payment.merchantId ||
          (order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : ''),
        ),
        orderId: String(payment.orderId || order?.id || ''),
        paymentIntentId: String(payment.paymentIntentId || ''),
      },
    });
  }, [order?.id, order?.merchant, order?.total, router]);

  const handleResumePayment = useCallback(async () => {
    if (!id || !user?.id || resumingPayment) return;
    setResumingPayment(true);
    try {
      const resumeResponse = await fetch(`${apiConfig.baseUrl}/checkout/payment-resume`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({ orderId: Number(id), customerId: Number(user.id) }),
      });
      const resumeData = await resumeResponse.json().catch(() => ({}));
      if (!resumeResponse.ok) {
        throw new Error(resumeData?.error || 'Unable to resume payment.');
      }

      if (resumeData.state !== 'retry') {
        openPaymentAction(resumeData);
        return;
      }

      const publicKey = apiConfig.paymongoPublicKey;
      if (!publicKey) throw new Error('Payment is temporarily unavailable.');
      const customerUser = order?.customer?.user && typeof order.customer.user === 'object'
        ? order.customer.user
        : null;
      const billing = {
        name: [customerUser?.firstName, customerUser?.lastName].filter(Boolean).join(' ') || 'Tap2Go Customer',
        email: customerUser?.email || order?.customer?.email || 'customer@example.com',
        phone: customerUser?.phone || '',
        address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'PH' },
      };
      const methodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${publicKey}:`)}`,
        },
        body: JSON.stringify({
          data: { attributes: { type: resumeData.paymentMethod, billing } },
        }),
      });
      const methodData = await methodResponse.json().catch(() => ({}));
      if (!methodResponse.ok || !methodData?.data?.id) {
        throw new Error(methodData?.errors?.[0]?.detail || 'Could not start a new payment attempt.');
      }

      const merchantId = String(
        resumeData.merchantId ||
        (order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : ''),
      );
      const appReturnUrl = ExpoLinking.createURL('checkout/return', {
        queryParams: {
          payment_intent_id: resumeData.paymentIntentId,
          merchantId,
          order_id: String(id),
        },
      });
      const returnUrl =
        `https://app.tap2goph.com/checkout/${merchantId}/return?` +
        `payment_intent_id=${encodeURIComponent(String(resumeData.paymentIntentId))}` +
        `&order_id=${encodeURIComponent(String(id))}` +
        `&app_redirect=${encodeURIComponent(appReturnUrl)}`;
      const attachResponse = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(String(resumeData.paymentIntentId))}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${publicKey}:`)}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                payment_method: methodData.data.id,
                client_key: resumeData.clientKey,
                return_url: returnUrl,
              },
            },
          }),
        },
      );
      const attachData = await attachResponse.json().catch(() => ({}));
      if (!attachResponse.ok) {
        throw new Error(attachData?.errors?.[0]?.detail || 'PayMongo could not resume this payment.');
      }

      const confirmationResponse = await fetch(`${apiConfig.baseUrl}/checkout/payment-resume`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
          orderId: Number(id),
          customerId: Number(user.id),
          transactionId: resumeData.transactionId,
          confirmAttached: true,
        }),
      });
      const confirmation = await confirmationResponse.json().catch(() => ({}));
      if (!confirmationResponse.ok) {
        throw new Error(confirmation?.error || 'Payment was sent, but confirmation is still processing.');
      }
      openPaymentAction(confirmation);
    } catch (err: any) {
      Alert.alert('Unable to resume payment', err?.message || 'Please try again shortly.');
    } finally {
      setResumingPayment(false);
    }
  }, [id, openPaymentAction, order?.customer, order?.merchant, resumingPayment, user?.id]);

  const showSkeleton = loading || refreshing;

  if (showSkeleton) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={{ width: 32 }} />
          </View>
        </SafeAreaView>
        <PullToRefreshLayout onRefresh={handleRefresh} isRefreshing={refreshing}>
          <OrderDetailSkeleton />
        </PullToRefreshLayout>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={{ width: 32 }} />
          </View>
        </SafeAreaView>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
          <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 16 }}>
            {error || 'Order not found'}
          </Text>
          <TouchableOpacity onPress={() => void fetchOrder(true)} style={{ marginTop: 16 }}>
            <Text style={{ color: '#f97316', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const merchant =
    order.merchant && typeof order.merchant === 'object'
      ? order.merchant
      : null;
  const merchantPhone =
    typeof merchant?.phone === 'string' ? merchant.phone.trim() || null : null;
  const merchantName =
    merchant?.name || merchant?.outletName || merchant?.vendor?.businessName || 'Restaurant';
  const merchantLogo =
    typeof merchant?.logo === 'string'
      ? merchant.logo
      : merchant?.logo && typeof merchant.logo === 'object'
        ? merchant.logo.cloudinaryURL || merchant.logo.url || null
        : merchant?.vendor?.logo && typeof merchant.vendor.logo === 'object'
          ? merchant.vendor.logo.cloudinaryURL || merchant.vendor.logo.url || null
          : null;

  const delivery = order.deliveryBooking;
  const CANCELLED_DELIVERY_STATUSES = ['canceled', 'expired', 'rejected'];
  const isDeliveryCancelled =
    CANCELLED_DELIVERY_STATUSES.includes(delivery?.status || '') ||
    order.delivery_status === 'canceled' ||
    order.delivery_status === 'expired' ||
    order.status === 'cancelled' ||
    order.status === 'canceled';
  const deliveryCancelledTitle =
    delivery?.status === 'expired' || order.delivery_status === 'expired'
      ? 'Delivery Expired — No Rider Found'
      : 'Delivery Cancelled';
  const deliveryCancelledNote =
    delivery?.status === 'rejected'
      ? 'A rider was matched but could not accept this delivery. We’ll stop trying and this delivery won’t be completed.'
      : delivery?.status === 'expired' || order.delivery_status === 'expired'
        ? 'No rider accepted this delivery in time. This delivery was not completed.'
        : 'This delivery could not be completed. Your order will not be delivered by a Tap2Go rider.';
  const activeIdx = getActiveStepIndex(
    delivery?.status || order.delivery_status || order.status || 'pending',
  );
  const deliveryFee = order.delivery_fee || delivery?.delivery_fee || 0;
  const priorityFee = delivery?.priority_fee || 0;
  const totalDeliveryFee = deliveryFee + priorityFee;
  const platformFee = order.platform_fee || 0;
  const canAddPriorityFee =
    order.isPaid === true &&
    order.fulfillment_type === 'delivery' &&
    delivery?.status === 'assigning_driver' &&
    Boolean(delivery?.lalamove_order_id) &&
    !order.priorityFeePaymentPending &&
    !order.priorityFeePaymentFailed &&
    !addingPriorityFee;

  const continuePriorityFeePayment = async (payment: any) => {
    if (payment?.state === 'failed') {
      throw new Error(payment.message || 'The payment was received, but the priority fee could not be applied. Please contact support.');
    }
    if (payment?.state === 'applied') {
      setShowPriorityFeeModal(false);
      setPriorityFeeAmount('');
      await fetchOrder(true);
      Alert.alert('Priority fee added', 'The additional fee was added to your Lalamove delivery.');
      return;
    }

    let paymentIntentId = String(payment?.paymentIntentId || '');
    let qrImage = typeof payment?.qrImage === 'string' ? payment.qrImage : '';
    if (payment?.state === 'attach') {
      const publicKey = apiConfig.paymongoPublicKey;
      if (!publicKey) throw new Error('Payment is temporarily unavailable.');
      const methodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${publicKey}:`)}`,
        },
        body: JSON.stringify({ data: { attributes: { type: 'qrph' } } }),
      });
      const methodData = await methodResponse.json().catch(() => ({}));
      if (!methodResponse.ok || !methodData?.data?.id) {
        throw new Error(methodData?.errors?.[0]?.detail || 'Could not prepare the QR Ph payment.');
      }

      const merchantId = String(
        order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : '',
      );
      const appReturnUrl = ExpoLinking.createURL('checkout/return', {
        queryParams: {
          payment_intent_id: paymentIntentId,
          merchantId,
          order_id: String(order?.id || ''),
        },
      });
      const returnUrl =
        `https://app.tap2goph.com/checkout/${merchantId}/return?` +
        `payment_intent_id=${encodeURIComponent(paymentIntentId)}` +
        `&order_id=${encodeURIComponent(String(order?.id || ''))}` +
        `&app_redirect=${encodeURIComponent(appReturnUrl)}`;
      const attachResponse = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${publicKey}:`)}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                payment_method: methodData.data.id,
                client_key: payment.clientKey,
                return_url: returnUrl,
              },
            },
          }),
        },
      );
      const attachData = await attachResponse.json().catch(() => ({}));
      if (!attachResponse.ok) {
        throw new Error(attachData?.errors?.[0]?.detail || 'Could not start the QR Ph payment.');
      }
      qrImage = String(attachData?.data?.attributes?.next_action?.code?.image_url || '');
      if (String(attachData?.data?.attributes?.status || '') === 'succeeded') {
        const statusResponse = await fetch(`${apiConfig.baseUrl}/delivery/priority-fee/status`, {
          method: 'POST',
          headers: CMS_HEADERS,
          body: JSON.stringify({
            orderId: order?.id,
            customerId: Number(user?.id),
            paymentIntentId,
          }),
        });
        const statusData = await statusResponse.json().catch(() => ({}));
        if (!statusResponse.ok) throw new Error(statusData?.error || 'Could not confirm the priority-fee payment.');
        if (statusData.status === 'applied') {
          setShowPriorityFeeModal(false);
          setPriorityFeeAmount('');
          await fetchOrder(true);
          Alert.alert('Priority fee added', 'The additional fee was added to your Lalamove delivery.');
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.message || 'Payment was received, but the priority fee could not be applied. Please contact support.');
        } else {
          setShowPriorityFeeModal(false);
          Alert.alert('Payment processing', 'We are confirming your payment and applying the priority fee. Check this order again shortly.');
        }
        return;
      }
    }

    if (!paymentIntentId || !qrImage) {
      throw new Error(payment?.message || 'The QR Ph payment code is not available.');
    }
    setShowPriorityFeeModal(false);
    router.push({
      pathname: '/checkout/qr',
      params: {
        qrImage,
        amount: String(payment.amount || 0),
        merchantName:
          order?.merchant && typeof order.merchant === 'object'
            ? order.merchant.outletName || order.merchant.name || 'Merchant'
            : 'Merchant',
        merchantId: String(order?.merchant && typeof order.merchant === 'object' ? order.merchant.id : ''),
        orderId: String(order?.id || ''),
        paymentIntentId,
        priorityFeePayment: 'true',
      },
    });
  };

  const handleAddPriorityFee = async () => {
    const additionalAmount = Number(priorityFeeAmount);
    if (!Number.isFinite(additionalAmount) || additionalAmount < 1 ||
      Math.round(additionalAmount * 100) !== additionalAmount * 100) {
      Alert.alert('Invalid amount', 'Enter an additional amount of at least ₱1.00, up to two decimal places.');
      return;
    }
    if (!order?.id || !user?.id || !canAddPriorityFee) return;
    setAddingPriorityFee(true);
    try {
      const response = await fetch(`${apiConfig.baseUrl}/delivery/priority-fee/prepare`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
          orderId: order.id,
          customerId: Number(user.id),
          additionalAmount,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not prepare the priority-fee payment.');
      await continuePriorityFeePayment(data);
    } catch (error) {
      Alert.alert(
        'Unable to add priority fee',
        error instanceof Error ? error.message : 'Please try again shortly.',
      );
    } finally {
      setAddingPriorityFee(false);
    }
  };

  // ── Rider-view info (mirrors what deliveryBook.ts sends to Lalamove) ────────
  const customerUser =
    order.customer?.user && typeof order.customer.user === 'object'
      ? order.customer.user
      : null;
  // Sender = merchant (pickup)
  const senderName = merchantName;
  const senderPhone = merchantPhone;
  const deliveryLocation = order.deliveryLocation;
  // Recipient = customer (dropoff)
  const recipientName = deliveryLocation?.contact_name ||
    [customerUser?.firstName, customerUser?.lastName].filter(Boolean).join(' ') ||
    (order.customer?.email ? order.customer.email : 'Tap2Go Customer');
  const recipientPhone =
    [deliveryLocation?.contact_phone, customerUser?.phone].find(
      (phone) => typeof phone === 'string' && phone.trim(),
    )?.trim() || null;
  const notesForRider = [
    deliveryLocation?.merchant_delivery_instructions,
    deliveryLocation?.delivery_instructions,
    deliveryLocation?.notes,
  ].filter(Boolean).join(' | ') || '';
  const pickupAddress = [
    deliveryLocation?.merchant_street,
    deliveryLocation?.merchant_floor_unit_room,
    deliveryLocation?.merchant_formatted_address ||
    delivery?.pickup_address ||
    'Merchant Location',
  ].filter(Boolean).join(', ');
  const isPlaceholder = (v?: string | null) =>
    !v || /unknown address|delivery location/i.test(String(v).trim());
  const dropoffAddress = [
    deliveryLocation?.street,
    deliveryLocation?.floor_unit_room,
    deliveryLocation?.formatted_address ||
    (delivery?.dropoff_address && !isPlaceholder(delivery.dropoff_address)
      ? delivery.dropoff_address
      : undefined),
  ].filter(Boolean).join(', ') || 'Delivery Location';

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {merchantLogo ? (
              <Image source={{ uri: merchantLogo }} style={styles.merchantLogo} />
            ) : (
              <View style={styles.merchantLogoPlaceholder}>
                <Ionicons name="storefront" size={14} color="#6B7280" />
              </View>
            )}
            <View>
              <Text style={styles.merchantNameText} numberOfLines={1}>
                {merchantName}
              </Text>
              <Text style={styles.subtitleText}>
                #{String(order.id).padStart(5, '0')}
              </Text>
            </View>
          </View>
          <View style={{ width: 32 }} />
        </View>
      </SafeAreaView>

      <PullToRefreshLayout
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { borderLeftColor: getStatusColor(isDeliveryCancelled
              ? 'canceled'
              : (order.status === 'pending' || order.status === 'accepted')
                ? (order.isPaid ? 'accepted' : 'pending')
                : (delivery?.status || order.delivery_status || order.status || 'pending')) },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(isDeliveryCancelled
                ? 'canceled'
                : (order.status === 'pending' || order.status === 'accepted')
                  ? (order.isPaid ? 'accepted' : 'pending')
                  : (delivery?.status || order.delivery_status || order.status || 'pending')) },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusText}>
              {isDeliveryCancelled
                ? deliveryCancelledTitle
                : !order.isPaid && order.paymentStatus === 'failed'
                  ? 'Payment failed'
                : (order.status === 'pending' || order.status === 'accepted')
                  ? (order.isPaid ? 'Accepted' : 'Pending')
                  : formatStatus(delivery?.status || order.delivery_status || order.status || 'pending')}
            </Text>
            {order.placed_at && (
              <Text style={styles.dateText}>{formatDate(order.placed_at)}</Text>
            )}
            {order.isPaid && (
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <View style={{
                  backgroundColor: '#10b9811A',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>
                    Paid
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {orderIsCompleted && (appRatingLoading || appRatingError !== null || appRating?.eligible) && (
          <View style={styles.section}>
            <View style={styles.appRatingCard}>
              <View style={styles.appRatingHeader}>
                <View style={styles.appRatingIcon}>
                  <Ionicons name="star" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appRatingTitle}>
                    {appRating?.submitted ? 'Your Tap2Go app rating' : 'Rate the Tap2Go app'}
                  </Text>
                  <Text style={styles.appRatingDescription}>
                    {appRating?.submitted
                      ? 'Your feedback helps us improve your experience. You can update it anytime.'
                      : 'How was your experience? Share a rating and optional comment.'}
                  </Text>
                </View>
              </View>

              {appRatingLoading ? (
                <ActivityIndicator color="#D97706" />
              ) : appRatingError && !appRating ? (
                <View>
                  <Text style={styles.appRatingError}>{appRatingError}</Text>
                  <TouchableOpacity
                    onPress={() => void fetchAppRating(order.id)}
                    disabled={appRatingLoading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.appRatingRetry}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : appRating?.eligible && appRating.submitted && !appRatingEditing ? (
                <View>
                  <View style={styles.appRatingStars} accessibilityLabel={`Your rating: ${appRating.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= (appRating.rating || 0) ? 'star' : 'star-outline'}
                        size={24}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  {appRating.comment ? (
                    <Text style={styles.appRatingSubmittedComment}>{appRating.comment}</Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => setAppRatingEditing(true)}
                    style={styles.appRatingEditButton}
                    accessibilityRole="button"
                    accessibilityLabel="Edit your app rating"
                  >
                    <Text style={styles.appRatingEditText}>Update rating</Text>
                  </TouchableOpacity>
                </View>
              ) : appRating?.eligible ? (
                <View>
                  <View style={styles.appRatingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setAppRatingValue(star)}
                        disabled={appRatingSubmitting}
                        accessibilityRole="button"
                        accessibilityLabel={`Rate ${star} out of 5 stars`}
                        accessibilityState={{ selected: appRatingValue === star, disabled: appRatingSubmitting }}
                        hitSlop={8}
                      >
                        <Ionicons
                          name={star <= (appRatingValue || 0) ? 'star' : 'star-outline'}
                          size={30}
                          color="#F59E0B"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    value={appRatingComment}
                    onChangeText={setAppRatingComment}
                    placeholder="Add a comment (optional)"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={4000}
                    editable={!appRatingSubmitting}
                    style={styles.appRatingCommentInput}
                    accessibilityLabel="Optional app rating comment"
                  />
                  {appRatingError ? (
                    <Text style={styles.appRatingError}>{appRatingError}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.appRatingSubmitButton,
                      (!appRatingValue || appRatingSubmitting) && styles.appRatingSubmitButtonDisabled,
                    ]}
                    onPress={() => void handleSubmitAppRating()}
                    disabled={!appRatingValue || appRatingSubmitting}
                    accessibilityRole="button"
                    accessibilityLabel="Submit app rating"
                  >
                    {appRatingSubmitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.appRatingSubmitText}>
                        {appRating?.submitted ? 'Save changes' : 'Submit rating'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {appRating?.submitted ? (
                    <TouchableOpacity
                      onPress={() => {
                        setAppRatingEditing(false);
                        setAppRatingValue(appRating.rating);
                        setAppRatingComment(appRating.comment || '');
                        setAppRatingError(null);
                      }}
                      disabled={appRatingSubmitting}
                      style={styles.appRatingCancelButton}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel app rating changes"
                    >
                      <Text style={styles.appRatingCancelText}>Cancel</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : appRatingError ? (
                <View>
                  <Text style={styles.appRatingError}>{appRatingError}</Text>
                  <TouchableOpacity
                    onPress={() => void fetchAppRating(order.id)}
                    disabled={appRatingLoading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.appRatingRetry}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {order.canResumePayment && !order.isPaid && (
          <View style={styles.section}>
            <View style={styles.paymentRecoveryCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentRecoveryTitle}>
                  {order.paymentStatus === 'failed' ? 'Payment not completed' : 'Payment pending'}
                </Text>
                <Text style={styles.paymentRecoveryText}>
                  Continue with the existing payment attempt. Your order will remain unpaid until PayMongo confirms it.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.paymentRecoveryButton}
                onPress={handleResumePayment}
                disabled={resumingPayment}
                accessibilityRole="button"
                accessibilityLabel="Resume payment"
              >
                {resumingPayment ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.paymentRecoveryButtonText}>Resume payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Status Timeline */}
        {isDeliveryCancelled ? (
          <View style={styles.cancelledCard}>
            <View style={styles.cancelledIcon}>
              <Ionicons name="close-circle" size={22} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cancelledTitle}>{deliveryCancelledTitle}</Text>
              <Text style={styles.cancelledNote}>{deliveryCancelledNote}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.timelineCard}>
          {STATUS_STEPS.map((step, idx) => {
            const isActive = idx <= activeIdx;
            const isCurrent = idx === activeIdx;
            return (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      isActive && { backgroundColor: '#f97316' },
                      isCurrent && styles.timelineDotCurrent,
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={12}
                      color={isActive ? '#fff' : '#d1d5db'}
                    />
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isActive && { backgroundColor: '#f97316' },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    isActive && { color: '#111827', fontWeight: isCurrent ? '700' : '500' },
                  ]}
                >
                  {idx === 0 ? (order.isPaid ? 'Accepted' : 'Pending') : step.label}
                </Text>
              </View>
            );
          })}
          </View>
        )}

        {/* Rider Details */}
        {delivery?.driver_name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rider</Text>
            <View style={styles.riderCard}>
              {delivery.driver_photo_url ? (
                <Image
                  source={{ uri: delivery.driver_photo_url }}
                  style={styles.riderAvatar}
                />
              ) : (
                <View style={styles.riderAvatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#9ca3af" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{delivery.driver_name}</Text>
                {delivery.driver_plate_number && (
                  <Text style={styles.riderPlate}>
                    {delivery.driver_plate_number}
                  </Text>
                )}
                {delivery.driver_phone && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${delivery.driver_phone}`)
                    }
                  >
                    <Text style={styles.riderCall}>Call rider</Text>
                  </TouchableOpacity>
                )}
              </View>
              {delivery.share_link && (
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() =>
                    router.push({ pathname: '/order/[id]/track', params: { id: String(id) } })
                  }
                >
                  <Ionicons name="navigate-outline" size={16} color="#fff" />
                  <Text style={styles.trackBtnText}>Track</Text>
                </TouchableOpacity>
              )}
            </View>
            {delivery.status && (
              <View style={styles.deliveryStatusRow}>
                <Text style={styles.deliveryStatusLabel}>Delivery status:</Text>
                <Text style={styles.deliveryStatusValue}>
                  {formatStatus(delivery.status)}
                </Text>
              </View>
            )}
            {delivery.distance_meters && (
              <Text style={styles.distanceText}>
                {(delivery.distance_meters / 1000).toFixed(1)} km
              </Text>
            )}
          </View>
        )}

        {/* Delivery tracking (in-app tracking screen) */}
        {!isDeliveryCancelled && !delivery?.driver_name && delivery?.share_link && delivery && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.trackLinkCard}
              onPress={() =>
                router.push({ pathname: '/order/[id]/track', params: { id: String(id) } })
              }
            >
              <Ionicons name="navigate-outline" size={18} color="#f97316" />
              <Text style={styles.trackLinkText}>Track delivery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Information Sent to Rider */}
        {order.fulfillment_type === 'delivery' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.riderInfoCard}
              onPress={() => setShowRiderInfo(true)}
              activeOpacity={0.7}
            >
              <View style={styles.riderInfoIcon}>
                <Ionicons name="walk" size={18} color="#f97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderInfoTitle}>Information Sent to Rider</Text>
                <Text style={styles.riderInfoSubtitle}>
                  What the rider sees when the delivery is booked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsCard}>
            {(order.items || []).map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product_name_snapshot || 'Item'}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.total_price || item.price_at_purchase || 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(order.subtotal || 0)}
              </Text>
            </View>
            {totalDeliveryFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Fee</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(totalDeliveryFee)}
                </Text>
              </View>
            )}
            {platformFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Platform Fee</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(platformFee)}
                </Text>
              </View>
            )}
            <View style={styles.priceRowTotal}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>
                {formatCurrency(order.total || 0)}
              </Text>
            </View>
          </View>
        </View>

        {order.priorityFeePaymentPending ? (
          <View style={styles.section}>
            <View style={styles.priorityFeePendingCard}>
              <ActivityIndicator size="small" color="#0F766E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.priorityFeeTitle}>Priority-fee payment in progress</Text>
                <Text style={styles.priorityFeeDescription}>
                  We’ll apply the extra fee after PayMongo confirms payment. Refresh this order for updates.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {order.priorityFeePaymentFailed ? (
          <View style={styles.section}>
            <View style={[styles.priorityFeePendingCard, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
              <View style={{ flex: 1 }}>
                <Text style={styles.priorityFeeTitle}>Priority fee needs assistance</Text>
                <Text style={styles.priorityFeeDescription}>
                  Your payment was received, but Lalamove did not confirm the fee update. Please contact Tap2Go support before making another payment.
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        {order.priorityFeePaymentRefunded ? (
          <View style={styles.section}>
            <View style={[styles.priorityFeePendingCard, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#047857" />
              <View style={{ flex: 1 }}>
                <Text style={styles.priorityFeeTitle}>Priority-fee payment refunded</Text>
                <Text style={styles.priorityFeeDescription}>
                  Lalamove could not apply the fee, so a refund has been initiated. It may take time to appear in your payment account.
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {canAddPriorityFee ? (
          <View style={styles.section}>
            <View style={styles.priorityFeeCard}>
              <View style={styles.priorityFeeCardHeader}>
                <View style={styles.priorityFeeIcon}>
                  <Ionicons name="bicycle-outline" size={18} color="#0F766E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.priorityFeeTitle}>Add a priority fee</Text>
                  <Text style={styles.priorityFeeDescription}>
                    Add an optional amount to the ₱{priorityFee.toFixed(2)} already included in your order while Lalamove is searching for a rider.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.priorityFeeButton}
                onPress={() => setShowPriorityFeeModal(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.priorityFeeButtonText}>Add extra fee</Text>
              </TouchableOpacity>
              <Text style={styles.priorityFeeHint}>
                The extra amount is charged separately by QR Ph and sent to Lalamove after payment confirmation.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Cancel delivery */}
        {order.fulfillment_type === 'delivery' &&
          order.status !== 'cancelled' &&
          order.status !== 'canceled' &&
          (order.delivery_status === 'assigning_driver' ||
            order.delivery_status === 'pending' ||
            order.delivery_status === 'none') && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={confirmCancel}
                disabled={canceling}
                activeOpacity={0.7}
              >
                {canceling ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.cancelHint}>
                Cancellation is available while we are still finding a rider. Once a rider is
                matched, it can no longer be cancelled.
              </Text>
            </View>
          )}

        <View style={{ height: 40 }} />
      </PullToRefreshLayout>

      {/* Rider View Modal */}
      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        visible={showRiderInfo}
        onRequestClose={() => setShowRiderInfo(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={['bottom']} style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Information Sent to Rider</Text>
                <TouchableOpacity
                  onPress={() => setShowRiderInfo(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>
                This is what is shared with the delivery rider when your delivery is
                booked.
              </Text>

              <ScrollView
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
              {/* Sender */}
              <View style={styles.infoGroup}>
                <Text style={styles.infoGroupTitle}>Sender (Pickup)</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{senderName}</Text>
                </View>
                {senderPhone ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{senderPhone}</Text>
                  </View>
                ) : null}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{pickupAddress}</Text>
                </View>
                {deliveryLocation?.merchant_street ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="navigate-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{deliveryLocation.merchant_street}</Text>
                  </View>
                ) : null}
                {deliveryLocation?.merchant_floor_unit_room ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{deliveryLocation.merchant_floor_unit_room}</Text>
                  </View>
                ) : null}
                {deliveryLocation?.merchant_delivery_instructions ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="clipboard-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{deliveryLocation.merchant_delivery_instructions}</Text>
                  </View>
                ) : null}
              </View>

              {/* Recipient */}
              <View style={styles.infoGroup}>
                <Text style={styles.infoGroupTitle}>Recipient (Dropoff)</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{recipientName}</Text>
                </View>
                {recipientPhone ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>{recipientPhone}</Text>
                  </View>
                ) : null}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>{dropoffAddress}</Text>
                </View>
              </View>

              {/* Delivery Info */}
              {(deliveryLocation?.street ||
                deliveryLocation?.floor_unit_room ||
                deliveryLocation?.delivery_instructions) ? (
                <View style={styles.infoGroup}>
                  <Text style={styles.infoGroupTitle}>Delivery Info</Text>
                  {deliveryLocation?.street ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="navigate-outline" size={16} color="#6b7280" />
                      <Text style={styles.infoValue}>{deliveryLocation.street}</Text>
                    </View>
                  ) : null}
                  {deliveryLocation?.floor_unit_room ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={16} color="#6b7280" />
                      <Text style={styles.infoValue}>{deliveryLocation.floor_unit_room}</Text>
                    </View>
                  ) : null}
                  {deliveryLocation?.delivery_instructions ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="clipboard-outline" size={16} color="#6b7280" />
                      <Text style={styles.infoValue}>{deliveryLocation.delivery_instructions}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Notes */}
              <View style={styles.infoGroup}>
                <Text style={styles.infoGroupTitle}>Delivery Notes</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>
                    {notesForRider || 'No notes provided'}
                  </Text>
                </View>
              </View>

              {delivery?.rider_remarks ? (
                <View style={styles.infoGroup}>
                  <Text style={styles.infoGroupTitle}>Order Details Sent to Rider</Text>
                  <Text style={styles.infoValue}>{delivery.rider_remarks}</Text>
                </View>
              ) : null}

              {/* Vehicle */}
              <View style={styles.infoGroup}>
                <Text style={styles.infoGroupTitle}>Vehicle</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoValue}>
                    {delivery?.service_type || ''}
                  </Text>
                </View>
              </View>

              {delivery?.distance_meters ? (
                <View style={styles.infoGroup}>
                  <Text style={styles.infoGroupTitle}>Distance</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="map-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoValue}>
                      {(delivery.distance_meters / 1000).toFixed(1)} km
                    </Text>
                  </View>
                </View>
              ) : null}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalDoneBtn}
                  onPress={() => setShowRiderInfo(false)}
                >
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={showPriorityFeeModal}
        onRequestClose={() => {
          if (!addingPriorityFee) setShowPriorityFeeModal(false);
        }}
      >
        <SafeAreaProvider>
          <SafeAreaView edges={['bottom']} style={styles.modalOverlay}>
            <View style={styles.priorityFeeModalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add a priority fee</Text>
                <TouchableOpacity
                  onPress={() => setShowPriorityFeeModal(false)}
                  style={styles.modalCloseBtn}
                  disabled={addingPriorityFee}
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
              <Text style={styles.priorityFeeModalDescription}>
                This is an extra amount on top of the ₱{priorityFee.toFixed(2)} already included in your order. You’ll pay it separately using QR Ph.
              </Text>
              <Text style={styles.priorityFeeInputLabel}>Additional amount (PHP)</Text>
              <TextInput
                value={priorityFeeAmount}
                onChangeText={setPriorityFeeAmount}
                placeholder="e.g. 25.00"
                keyboardType="decimal-pad"
                editable={!addingPriorityFee}
                style={styles.priorityFeeInput}
                accessibilityLabel="Additional priority fee amount"
              />
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.priorityFeeSubmitButton}
                  onPress={handleAddPriorityFee}
                  disabled={addingPriorityFee}
                  activeOpacity={0.75}
                >
                  {addingPriorityFee ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.priorityFeeSubmitText}>Continue to QR Ph payment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: { flex: 1, textAlign: 'center' as const, fontSize: 16, fontWeight: '600' as const, color: '#111827' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  merchantLogo: { width: 28, height: 28, borderRadius: 14 },
  merchantLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  merchantNameText: { fontSize: 13, fontWeight: '600' as const, color: '#111827' },
  subtitleText: { fontSize: 11, color: '#6B7280' },
  scrollContent: { padding: 16, gap: 16 },
  statusBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    gap: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 16, fontWeight: '700' as const, color: '#111827' },
  dateText: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  timelineRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const },
  timelineLeft: { width: 28, alignItems: 'center' as const },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  timelineDotCurrent: { width: 28, height: 28, borderRadius: 14 },
  timelineLine: { width: 2, height: 24, backgroundColor: '#e5e7eb', marginTop: 4 },
  timelineLabel: { fontSize: 14, color: '#9ca3af', marginLeft: 8, marginBottom: 8 },
  cancelledCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cancelledIcon: { width: 24, alignItems: 'center' as const, marginTop: 1 },
  cancelledTitle: { fontSize: 15, fontWeight: '700' as const, color: '#ef4444' },
  cancelledNote: { fontSize: 13, color: '#7f1d1d', marginTop: 4, lineHeight: 19 },
  section: { marginBottom: 0 },
  appRatingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    gap: 14,
  },
  appRatingHeader: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 10 },
  appRatingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  appRatingTitle: { fontSize: 15, fontWeight: '700' as const, color: '#111827' },
  appRatingDescription: { fontSize: 12, lineHeight: 18, color: '#6B7280', marginTop: 3 },
  appRatingStars: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  appRatingCommentInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top' as const,
  },
  appRatingError: { color: '#B91C1C', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  appRatingRetry: { color: '#B45309', fontWeight: '700' as const, fontSize: 13, paddingVertical: 4 },
  appRatingSubmittedComment: { color: '#4B5563', fontSize: 13, lineHeight: 19, marginTop: 8 },
  appRatingEditButton: { alignSelf: 'flex-start' as const, marginTop: 12, paddingVertical: 4 },
  appRatingEditText: { color: '#0F766E', fontSize: 13, fontWeight: '700' as const },
  appRatingSubmitButton: {
    minHeight: 44,
    borderRadius: 9,
    backgroundColor: '#0F766E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 12,
  },
  appRatingSubmitButtonDisabled: { opacity: 0.55 },
  appRatingSubmitText: { color: '#fff', fontSize: 14, fontWeight: '700' as const },
  appRatingCancelButton: { alignSelf: 'center' as const, marginTop: 8, paddingVertical: 6 },
  appRatingCancelText: { color: '#6B7280', fontSize: 13, fontWeight: '600' as const },
  paymentRecoveryCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  paymentRecoveryTitle: { fontSize: 15, fontWeight: '700' as const, color: '#92400E' },
  paymentRecoveryText: { fontSize: 13, lineHeight: 19, color: '#78350F', marginTop: 4 },
  paymentRecoveryButton: {
    minHeight: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#0F766E',
    borderRadius: 9,
    paddingHorizontal: 16,
  },
  paymentRecoveryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: '#111827', marginBottom: 12 },
  riderCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  riderAvatar: { width: 48, height: 48, borderRadius: 24 },
  riderAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  riderName: { fontSize: 16, fontWeight: '600' as const, color: '#111827' },
  riderPlate: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  riderCall: { fontSize: 13, color: '#f97316', fontWeight: '600' as const, marginTop: 2 },
  trackBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  trackBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },
  deliveryStatusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  deliveryStatusLabel: { fontSize: 13, color: '#6b7280' },
  deliveryStatusValue: { fontSize: 13, fontWeight: '600' as const, color: '#111827', marginLeft: 6 },
  distanceText: { fontSize: 12, color: '#9ca3af', marginTop: 4, paddingHorizontal: 4 },
  trackLinkCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  trackLinkText: { fontSize: 14, color: '#f97316', fontWeight: '600' as const },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  itemQty: { fontSize: 14, fontWeight: '500' as const, color: '#374151', width: 32 },
  itemName: { fontSize: 14, color: '#111827', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600' as const, color: '#111827', marginLeft: 8 },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  priceLabel: { fontSize: 14, color: '#6b7280' },
  priceValue: { fontSize: 14, color: '#111827' },
  priceRowTotal: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 4,
  },
  priceTotalLabel: { fontSize: 16, fontWeight: '700' as const, color: '#111827' },
  priceTotalValue: { fontSize: 16, fontWeight: '700' as const, color: '#111827' },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600' as const, color: '#ef4444' },
  cancelHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center' as const,
    lineHeight: 17,
  },
  riderInfoCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  riderInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  riderInfoTitle: { fontSize: 15, fontWeight: '600' as const, color: '#111827' },
  riderInfoSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  priorityFeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 12,
  },
  priorityFeeCardHeader: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 10 },
  priorityFeeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#CCFBF1',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  priorityFeeTitle: { fontSize: 14, fontWeight: '700' as const, color: '#111827' },
  priorityFeeDescription: { fontSize: 12, lineHeight: 18, color: '#6b7280', marginTop: 3 },
  priorityFeeButton: {
    minHeight: 42,
    borderRadius: 9,
    backgroundColor: '#0F766E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  priorityFeeButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' as const },
  priorityFeeHint: { fontSize: 11, lineHeight: 16, color: '#6b7280' },
  priorityFeePendingCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 10,
    padding: 14,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  priorityFeeModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  priorityFeeModalDescription: { fontSize: 13, lineHeight: 19, color: '#6b7280', marginBottom: 18 },
  priorityFeeInputLabel: { fontSize: 13, fontWeight: '600' as const, color: '#374151', marginBottom: 8 },
  priorityFeeInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  priorityFeeSubmitButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#0F766E',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  priorityFeeSubmitText: { color: '#fff', fontSize: 14, fontWeight: '700' as const },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '80%' as any,
  },
  modalHandle: {
    alignSelf: 'center' as const,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '700' as const, color: '#111827' },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  modalContent: { padding: 20, gap: 20 },
  infoGroup: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  infoGroupTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#f97316',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  infoValue: { fontSize: 15, color: '#111827', flex: 1, lineHeight: 21 },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalDoneBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  modalDoneText: { color: '#fff', fontSize: 15, fontWeight: '600' as const },
};
