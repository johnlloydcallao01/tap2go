import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../config/environment';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';

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
  price: number;
  image: string;
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
  priorityFee?: number;
  isPaid?: boolean;
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const showSkeleton = loading || refreshing;

  const filters = ['All', 'pending', 'accepted', 'assigning_driver', 'driver_assigned', 'picked_up', 'completed', 'canceled', 'rejected', 'expired'];

  const LALAMOVE_STATUSES = ['assigning_driver', 'driver_assigned', 'picked_up', 'completed', 'canceled', 'rejected', 'expired'];

  const getEffectiveStatus = (order: Order) =>
    order.fulfillmentType === 'delivery' &&
    order.deliveryStatus &&
    LALAMOVE_STATUSES.includes(order.deliveryStatus)
      ? order.deliveryStatus
      : order.status;

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Authorization': `users API-Key ${apiConfig.payloadApiKey}`,
        'Content-Type': 'application/json',
      };

      const ordersRes = await fetch(
        `${apiConfig.baseUrl}/orders?where[customer.user][equals]=${user.id}&depth=3&sort=-placed_at`,
        { headers }
      );
      const ordersData = await ordersRes.json();
      
      if (!ordersData.docs || ordersData.docs.length === 0) {
        setOrders([]);
        return;
      }

      const fetchedOrders = ordersData.docs;
      const orderIds = fetchedOrders.map((o: any) => o.id);

      const itemsRes = await fetch(
        `${apiConfig.baseUrl}/order-items?where[order][in]=${orderIds.join(',')}&depth=2&limit=300`,
         { headers }
      );
      const itemsData = await itemsRes.json();
      const allItems = itemsData.docs || [];

      // Fetch transactions for payment verification (paid = green badge)
      const paidOrderIds = new Set<number>();
      const txRes = await fetch(
        `${apiConfig.baseUrl}/transactions?where[order][in]=${orderIds.join(',')}&where[status][equals]=paid&limit=300`,
        { headers },
      );
      if (txRes.ok) {
        const txData = await txRes.json();
        for (const tx of txData.docs || []) {
          const oid = typeof tx.order === 'object' ? tx.order.id : tx.order;
          if (oid) paidOrderIds.add(Number(oid));
        }
      }

      const mappedOrders = fetchedOrders.map((order: any) => {
        const orderItems = allItems.filter((item: any) => 
          (typeof item.order === 'object' ? item.order.id : item.order) === order.id
        );

        let merchantLogo: string | null = null;
        let merchantName = 'Restaurant';

        const merchant = order.merchant;
        if (merchant && typeof merchant === 'object') {
          merchantName = merchant.outletName || merchant.name || (merchant.vendor?.businessName) || 'Restaurant';
          if (merchant.vendor && typeof merchant.vendor === 'object' && merchant.vendor.logo) {
            const logo = merchant.vendor.logo;
            if (typeof logo === 'object') {
              merchantLogo = logo.cloudinaryURL || logo.url || null;
            }
          }
        }

        const mappedItems: OrderItem[] = orderItems.map((item: any) => {
           const product = item.product;
           let finalImage = 'https://placehold.co/400';
           
           if (product && typeof product === 'object') {
              const primaryImage = product.media?.primaryImage;
              if (primaryImage && typeof primaryImage === 'object') {
                  finalImage = primaryImage.cloudinaryURL || primaryImage.url || primaryImage.thumbnailURL || finalImage;
              } else if (product.image) {
                  if (typeof product.image === 'object') {
                       finalImage = product.image.cloudinaryURL || product.image.url || finalImage;
                  } else if (typeof product.image === 'string') {
                       finalImage = product.image;
                  }
              }
           }

           let productName = item.product_name_snapshot;
           if (!productName && product && typeof product === 'object' && product.name) {
               productName = product.name;
           }

           return {
             id: item.id,
             name: productName || 'Item',
             quantity: item.quantity,
             price: item.price_at_purchase,
             image: finalImage,
           };
        });

        const placedAtDate = new Date(order.placed_at);
        const formattedDate = !isNaN(placedAtDate.getTime()) 
          ? placedAtDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
          : 'Unknown Date';

        return {
          id: `ORD-${order.id}`,
          orderId: String(order.id),
          orderNumber: `#${order.id.toString().padStart(5, '0')}`,
          date: formattedDate,
          status: order.status || 'pending',
          total: order.total || 0,
          items: mappedItems,
          restaurant: merchantName,
          merchantLogo: merchantLogo,
          fulfillmentType: order.fulfillment_type,
          deliveryStatus:
            (order.deliveryBooking &&
              typeof order.deliveryBooking === 'object' &&
              order.deliveryBooking.status)
            || order.delivery_status,
          priorityFee:
            order.deliveryBooking &&
            typeof order.deliveryBooking === 'object' &&
            Number(order.deliveryBooking.priority_fee) > 0
              ? Number(order.deliveryBooking.priority_fee)
              : 0,
          isPaid: paidOrderIds.has(order.id),
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

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
      fetchOrders();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to cancel the order.');
    } finally {
      setCancelingId(null);
    }
  }, [cancelingId, fetchOrders]);

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
    ['assigning_driver', 'pending', 'none'].includes(order.deliveryStatus || '');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || getEffectiveStatus(order) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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

  const formatStatusLabel = (key: string) => {
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
  };

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

        <PullToRefreshLayout onRefresh={handleRefresh} isRefreshing={refreshing}>
          {/* Search Bar */}
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

          {/* Filters */}
          {showFilters && (
            <View style={{ paddingLeft: 16, marginBottom: 16 }}>
              <PullToRefreshLayout horizontal showsHorizontalScrollIndicator={false}>
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
              </PullToRefreshLayout>
            </View>
          )}

          {/* Content */}
          {showSkeleton ? (
            <OrdersSkeleton />
          ) : !user ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Ionicons name="log-in-outline" size={48} color="#9ca3af" />
              <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                Please log in to view your orders.
              </Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
              <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                No orders found.
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {filteredOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
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
                  onPress={() => {
                    router.push(`/order/${order.orderId}`);
                  }}
                >
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
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
                      <View style={{
                        backgroundColor: getStatusColor(getEffectiveStatus(order)) + '1A',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginLeft: 8,
                      }}>
                        <Text style={{ color: getStatusColor(getEffectiveStatus(order)), fontSize: 12, fontWeight: '700' }}>
                          {formatStatusLabel(getEffectiveStatus(order))}
                        </Text>
                      </View>
                      {order.isPaid && (
                        <View style={{
                          backgroundColor: '#10b9811A',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginLeft: 6,
                        }}>
                          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>
                            Paid
                          </Text>
                        </View>
                      )}
                      {order.priorityFee > 0 && (
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#f97316',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginLeft: 6,
                          gap: 3,
                        }}>
                          <Ionicons name="flash" size={11} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                            Priority
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginBottom: 12 }}>
                      {order.items.slice(0, 2).map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500', marginRight: 8 }}>
                            {item.quantity}x
                          </Text>
                          <Text style={{ fontSize: 14, color: '#374151', flex: 1 }} numberOfLines={1}>
                            {item.name}
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
                        {canCancelOrder(order) && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#fff',
                              borderWidth: 1,
                              borderColor: '#ef4444',
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 8,
                              marginRight: 8,
                            }}
                            onPress={() => confirmCancel(order)}
                            disabled={cancelingId === order.orderId}
                          >
                            {cancelingId === order.orderId ? (
                              <ActivityIndicator color="#ef4444" size="small" />
                            ) : (
                              <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                                Cancel
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                        {(order.status === 'delivered' || order.status === 'cancelled' || order.deliveryStatus === 'completed') && (
                          <TouchableOpacity style={{
                            backgroundColor: '#f3f4f6',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}>
                            <Text style={{ color: '#374151', fontSize: 12, fontWeight: '600' }}>
                              Reorder
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </PullToRefreshLayout>
      </View>
    </View>
  );
}
