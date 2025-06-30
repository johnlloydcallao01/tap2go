import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function WishlistScreen({ navigation }: any) {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      name: 'Margherita Pizza',
      restaurant: 'Pizza Corner',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      rating: 4.6,
      deliveryTime: '20-30 min',
      description: 'Fresh tomatoes, mozzarella, basil',
    },
    {
      id: '2',
      name: 'Chicken Burger',
      restaurant: 'Burger Palace',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      rating: 4.8,
      deliveryTime: '15-25 min',
      description: 'Grilled chicken, lettuce, tomato, mayo',
    },
    {
      id: '3',
      name: 'Salmon Sushi Roll',
      restaurant: 'Sushi Express',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
      rating: 4.9,
      deliveryTime: '25-35 min',
      description: 'Fresh salmon, avocado, cucumber',
    },
    {
      id: '4',
      name: 'Caesar Salad',
      restaurant: 'Green Bowl',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      rating: 4.7,
      deliveryTime: '18-28 min',
      description: 'Romaine lettuce, parmesan, croutons',
    },
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

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
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', flex: 1 }}>
          Wishlist
        </Text>
        <View style={{
          backgroundColor: '#f97316',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            {wishlistItems.length} items
          </Text>
        </View>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 120,
            height: 120,
            backgroundColor: '#f3f4f6',
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <Ionicons name="heart-outline" size={60} color="#9ca3af" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
            Your wishlist is empty
          </Text>
          <Text style={{ color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
            Save your favorite dishes and restaurants to order them later!
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            style={{
              backgroundColor: '#f97316',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              Explore Restaurants
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            {wishlistItems.map((item) => (
              <View
                key={item.id}
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
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: '100%',
                    height: 160,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                />
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>
                        from {item.restaurant}
                      </Text>
                      <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                        {item.description}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={{ marginLeft: 4, color: '#6b7280', fontSize: 14 }}>
                          {item.rating} • {item.deliveryTime}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFromWishlist(item.id)}
                      style={{
                        padding: 8,
                        backgroundColor: '#fef2f2',
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="heart" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f97316' }}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity style={{
                      backgroundColor: '#f97316',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 8,
                    }}>
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                        Add to Cart
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}
