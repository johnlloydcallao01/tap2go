import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../config/environment';
import { useQuery } from '@tanstack/react-query';

const OrdersSkeleton = () => {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {[1, 2, 3].map((key) => (
        <View
          key={key}
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB' }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ width: '60%', height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 4 }} />
                  <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
                </View>
              </View>
              <View style={{ width: 64, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB' }} />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6', marginRight: 8 }} />
                <View style={{ width: '70%', height: 14, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 20, height: 14, borderRadius: 4, backgroundColor: '#F3F4F6', marginRight: 8 }} />
                <View style={{ width: '55%', height: 14, borderRadius: 4, backgroundColor: '#F3F4F6' }} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
              <View style={{ width: 80, height: 16, borderRadius: 4, backgroundColor: '#E5E7EB' }} />
              <View style={{ width: 64, height: 32, borderRadius: 8, backgroundColor: '#F3F4F6' }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  orderId: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  restaurant: string;
  merchantLogo: string | null;
  fulfillmentType?: string;
  deliveryStatus?: string;
  isPaid?: boolean;
  paymentStatus?: string;
  canResumePayment?: boolean;
}

const EMPTY_ORDERS: Order[] = [];
const LALAMOVE_STATUSES = ['assigning_driver', 'driver_assigned', 'picked_up', 'completed', 'canceled', 'rejected', 'expired'];

function getEffectiveStatus(order: Order) {
  return order.fulfillmentType === 'delivery' &&
    order.deliveryStatus &&
    LALAMOVE_STATUSES.includes(order.deliveryStatus)
      ? order.deliveryStatus
      : order.status;
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id;
  const forceOrdersRefresh = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ['customer-orders', userId],
    enabled: !!userId,
    staleTime: 15_000,
    queryFn: async ({ signal }): Promise<Order[]> => {
      if (!userId) throw new Error('A signed-in user is required to load orders');
      const params = new URLSearchParams({
        userId: String(userId),
        view: 'list',
      });
      if (forceOrdersRefresh.current) params.set('refresh', 'true');
      const res = await fetch(
        `${apiConfig.baseUrl}/orders/aggregate?${params.toString()}`,
        {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'omit',
          signal,
        },
      );
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      if (!Array.isArray(data?.docs)) {
        throw new Error('Invalid orders response');
      }

      return data.docs.map((o: any) => {
        const placedAtDate = new Date(o.placedAt);
        const formattedDate = !isNaN(placedAtDate.getTime())
          ? placedAtDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : 'Unknown Date';

        return {
          id: `ORD-${o.id}`,
          orderId: String(o.id),
          orderNumber: o.orderNumber,
          date: formattedDate,
          status: o.status || 'pending',
          total: o.total || 0,
          items: (o.items || []).map((item: any) => ({
            id: item.id,
            name: item.name || 'Item',
            quantity: item.quantity,
          })),
          restaurant: o.merchant?.name || 'Restaurant',
          merchantLogo: o.merchant?.logo || null,
          fulfillmentType: o.fulfillmentType,
          deliveryStatus: o.delivery?.status || null,
          isPaid: o.isPaid || false,
          paymentStatus: o.paymentStatus || 'unpaid',
          canResumePayment: o.canResumePayment || false,
        };
      });
    },
  });
  const orders = ordersQuery.data ?? EMPTY_ORDERS;
  const refetchOrders = ordersQuery.refetch;
  const refreshOrders = useCallback(async (forceRefresh = false) => {
    forceOrdersRefresh.current = forceRefresh;
    try {
      await refetchOrders();
    } finally {
      forceOrdersRefresh.current = false;
    }
  }, [refetchOrders]);
  const showSkeleton = ordersQuery.isLoading && ordersQuery.data === undefined;

  const filters = ['All', 'pending', 'accepted', 'assigning_driver', 'driver_assigned', 'picked_up', 'completed', 'canceled', 'rejected', 'expired'];

  const handleRefresh = useCallback(async () => {
    await refreshOrders(true);
  }, [refreshOrders]);

  const handleCancelOrder = useCallback(async (order: Order) => {
    if (cancelingId) return;
    setCancelingId(order.orderId);
    try {
      const headers = {
        'Authorization': `users API-Key ${apiConfig.payloadApiKey}`,
        'Content-Type': 'application/json',
      };
      const res = await fetch(`${apiConfig.baseUrl}/delivery/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId: Number(order.orderId) }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Cannot cancel order', data?.error || 'The delivery could not be cancelled.');
        return;
      }
      Alert.alert('Order cancelled', 'Your delivery has been cancelled. The delivery fee was not charged.');
      await refreshOrders(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to cancel the order.');
    } finally {
      setCancelingId(null);
    }
  }, [cancelingId, refreshOrders]);

  const confirmCancel = useCallback((order: Order) => {
    Alert.alert(
      'Cancel order?',
      'The delivery has not been matched to a rider yet, so it can still be cancelled and the delivery fee will not be charged. Continue?',
      [
        { text: 'Keep order', style: 'cancel' },
        { text: 'Cancel order', style: 'destructive', onPress: () => handleCancelOrder(order) },
      ],
    );
  }, [handleCancelOrder]);

  const canCancelOrder = (order: Order) =>
    order.fulfillmentType === 'delivery' &&
    order.status !== 'cancelled' &&
    order.status !== 'canceled' &&
    ['assigning_driver', 'pending', 'none'].includes(order.deliveryStatus || '');

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return orders.filter(order => {
      const matchesSearch = order.restaurant.toLowerCase().includes(normalizedSearch) ||
                           order.orderNumber.toLowerCase().includes(normalizedSearch);
      const matchesFilter = selectedFilter === 'All' || getEffectiveStatus(order) === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, selectedFilter]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'assigning_driver': return '#8b5cf6';
      case 'driver_assigned': return '#10b981';
      case 'picked_up': return '#06b6d4';
      case 'completed': return '#10b981';
      case 'canceled': case 'cancelled': return '#ef4444';
      case 'rejected': return '#dc2626';
      case 'expired': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const formatStatusLabel = useCallback((key: string) => {
    switch (key) {
      case 'assigning_driver': return 'Assigning Driver';
      case 'driver_assigned': return 'On Going';
      case 'picked_up': return 'Picked Up';
      case 'completed': return 'Completed';
      case 'canceled': return 'Canceled';
      case 'rejected': return 'Rejected';
      case 'expired': return 'Expired';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  }, []);

  const renderOrder = useCallback(({ item: order }: { item: Order }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => router.push(`/order/${order.orderId}`)}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
          {order.merchantLogo ? (
            <Image
              source={{ uri: order.merchantLogo }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6' }}
            />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="restaurant-outline" size={20} color="#9ca3af" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }} numberOfLines={1}>
              {order.restaurant}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {order.date} • {order.orderNumber}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <View style={{
            backgroundColor: getStatusColor(getEffectiveStatus(order)) + '1A',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ color: getStatusColor(getEffectiveStatus(order)), fontSize: 12, fontWeight: '700' }}>
              {formatStatusLabel(getEffectiveStatus(order))}
            </Text>
          </View>
          {order.isPaid && (
            <View style={{ backgroundColor: '#10b9811A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>Paid</Text>
            </View>
          )}
          {!order.isPaid && order.paymentStatus === 'failed' && (
            <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#b91c1c', fontSize: 12, fontWeight: '700' }}>Payment failed</Text>
            </View>
          )}
          {!order.isPaid && order.paymentStatus === 'pending' && (
            <View style={{ backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#b45309', fontSize: 12, fontWeight: '700' }}>Payment pending</Text>
            </View>
          )}
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginBottom: 12, marginTop: 8 }}>
          {order.items.slice(0, 2).map((orderItem) => (
            <View key={orderItem.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', marginRight: 8 }}>
                {orderItem.quantity}x
              </Text>
              <Text style={{ fontSize: 14, color: '#374151', flex: 1 }} numberOfLines={1}>
                {orderItem.name}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
              +{order.items.length - 2} more items...
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>
            ₱{order.total.toFixed(2)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {order.canResumePayment && !order.isPaid && (
              <TouchableOpacity
                style={{ backgroundColor: '#0f766e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 }}
                onPress={() => router.push(`/order/${order.orderId}`)}
                accessibilityRole="button"
                accessibilityLabel="Resume payment"
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Pay now</Text>
              </TouchableOpacity>
            )}
            {canCancelOrder(order) && (
              <TouchableOpacity
                style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ef4444', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 }}
                onPress={() => confirmCancel(order)}
                disabled={cancelingId === order.orderId}
              >
                {cancelingId === order.orderId ? (
                  <ActivityIndicator color="#ef4444" size="small" />
                ) : (
                  <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>Cancel</Text>
                )}
              </TouchableOpacity>
            )}
            {(order.status === 'delivered' || order.status === 'cancelled' || order.deliveryStatus === 'completed') && (
              <TouchableOpacity style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: '#374151', fontSize: 12, fontWeight: '600' }}>Reorder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [cancelingId, confirmCancel, formatStatusLabel, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', flex: 1 }}>
            Orders
          </Text>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => setShowFilters(prev => !prev)}
          >
            <Ionicons
              name={showFilters ? 'filter' : 'filter-outline'}
              size={24}
              color={selectedFilter !== 'All' ? '#f97316' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={(order) => order.id}
          renderItem={renderOrder}
          extraData={cancelingId}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={7}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor="#f97316"
              colors={['#f97316']}
            />
          }
          ListHeaderComponent={
            <View>
              <View style={{ padding: 16 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}>
                  <Ionicons name="search-outline" size={20} color="#9ca3af" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' }}
                    placeholder="Search orders..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>
              {showFilters && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 16, paddingBottom: 16 }}
                >
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
                      style={{
                        backgroundColor: selectedFilter === filter ? '#f97316' : '#fff',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: selectedFilter === filter ? '#f97316' : '#e5e7eb',
                      }}
                    >
                      <Text style={{
                        color: selectedFilter === filter ? '#fff' : '#6b7280',
                        fontWeight: '600',
                        fontSize: 14,
                      }}>
                        {filter === 'All' ? 'All' : formatStatusLabel(filter)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {ordersQuery.isError && ordersQuery.data !== undefined && (
                <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: '#fef2f2' }}>
                  <Text style={{ color: '#991b1b' }}>Couldn&apos;t refresh your orders. Showing saved results.</Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            showSkeleton ? (
              <OrdersSkeleton />
            ) : !user ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Ionicons name="log-in-outline" size={48} color="#9ca3af" />
                <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                  Please log in to view your orders.
                </Text>
              </View>
            ) : ordersQuery.isError && ordersQuery.data === undefined ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
                <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                  We couldn&apos;t load your orders.
                </Text>
                <TouchableOpacity
                  onPress={() => void refreshOrders(true)}
                  style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f97316' }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                  No orders found.
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}
