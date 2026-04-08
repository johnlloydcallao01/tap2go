import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../config/environment';
import { PullToRefreshLayout } from '../components/PullToRefreshLayout';

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
}

export default function OrdersScreen() {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered', 'cancelled'];

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready_for_pickup': return '#10b981';
      case 'on_delivery': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="filter-outline" size={24} color="#6b7280" />
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
                    {filter === 'All' ? 'All' : formatStatus(filter)}
                  </Text>
                </TouchableOpacity>
              ))}
            </PullToRefreshLayout>
          </View>

          {/* Content */}
          {loading && !refreshing ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#f97316" />
            </View>
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
                    // Navigate to order details if implemented
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
                        backgroundColor: getStatusColor(order.status) + '1A',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginLeft: 8,
                      }}>
                        <Text style={{ color: getStatusColor(order.status), fontSize: 12, fontWeight: '700' }}>
                          {formatStatus(order.status)}
                        </Text>
                      </View>
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
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
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
