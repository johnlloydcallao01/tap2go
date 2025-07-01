import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function OrdersScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Active', 'Completed', 'Cancelled'];

  const orders = [
    {
      id: '1',
      orderNumber: '#ORD-2024-001',
      restaurant: 'Burger Palace',
      items: ['2x Chicken Burger', '1x Fries', '1x Coke'],
      total: 28.97,
      status: 'Active',
      orderTime: '2024-01-15 14:30',
      estimatedDelivery: '15-25 min',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
    },
    {
      id: '2',
      orderNumber: '#ORD-2024-002',
      restaurant: 'Pizza Corner',
      items: ['1x Margherita Pizza', '1x Garlic Bread'],
      total: 22.98,
      status: 'Completed',
      orderTime: '2024-01-14 19:45',
      deliveredTime: '2024-01-14 20:15',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    },
    {
      id: '3',
      orderNumber: '#ORD-2024-003',
      restaurant: 'Sushi Express',
      items: ['1x Salmon Roll', '1x Tuna Sashimi', '1x Miso Soup'],
      total: 35.50,
      status: 'Completed',
      orderTime: '2024-01-13 18:20',
      deliveredTime: '2024-01-13 19:05',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    },
    {
      id: '4',
      orderNumber: '#ORD-2024-004',
      restaurant: 'Green Bowl',
      items: ['1x Caesar Salad', '1x Smoothie'],
      total: 15.99,
      status: 'Cancelled',
      orderTime: '2024-01-12 12:15',
      cancelledTime: '2024-01-12 12:45',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      {/* Content area with light background */}
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

      <ScrollView style={{ flex: 1 }}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 16, marginBottom: 16 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={{
                backgroundColor: selectedFilter === filter ? '#f97316' : '#fff',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 12,
                borderWidth: 1,
                borderColor: selectedFilter === filter ? '#f97316' : '#e5e7eb',
              }}
            >
              <Text style={{
                color: selectedFilter === filter ? '#fff' : '#6b7280',
                fontWeight: '600',
                fontSize: 14,
              }}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders List */}
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
            >
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                      {order.orderNumber}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
                      from {order.restaurant}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                      {order.orderTime}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor:
                      order.status === 'Active' ? '#f3a823' :
                      order.status === 'Completed' ? '#10b981' : '#ef4444',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image
                    source={{ uri: order.image }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 12,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    {order.items.map((item, index) => (
                      <Text key={index} style={{ fontSize: 14, color: '#374151', marginBottom: 2 }}>
                        {item}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                    ${order.total.toFixed(2)}
                  </Text>
                  {order.status === 'Active' && (
                    <Text style={{ fontSize: 12, color: '#f3a823', fontWeight: '600' }}>
                      Arriving in {order.estimatedDelivery}
                    </Text>
                  )}
                  {order.status === 'Completed' && (
                    <TouchableOpacity style={{
                      backgroundColor: '#f3f4f6',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
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

        <View style={{ height: 100 }} />
        </ScrollView>
      </View>


    </View>
  );
}
