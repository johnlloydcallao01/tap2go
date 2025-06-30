import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


export default function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Restaurants', 'Food', 'Cuisines'];

  const searchResults = [
    {
      id: '1',
      type: 'restaurant',
      name: 'Burger Palace',
      description: 'Best burgers in town',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      rating: 4.8,
      deliveryTime: '15-25 min',
    },
    {
      id: '2',
      type: 'food',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella, basil',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      restaurant: 'Pizza Corner',
      price: 18.99,
    },
  ];

  const filteredResults = searchResults.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Restaurants' && item.type === 'restaurant') ||
      (activeFilter === 'Food' && item.type === 'food');

    return matchesSearch && matchesFilter;
  });

  const popularSearches = ['Pizza', 'Burger', 'Sushi', 'Salad'];

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      {/* Content area with light background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
          Search
        </Text>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' }}
            placeholder="Search for food, restaurants..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {searchQuery.length === 0 ? (
          // Popular Searches
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Popular Searches
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {popularSearches.map((search) => (
                <TouchableOpacity
                  key={search}
                  onPress={() => setSearchQuery(search)}
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                  }}
                >
                  <Text style={{ color: '#6b7280', fontWeight: '500' }}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          // Search Results
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              {filteredResults.length} results for "{searchQuery}"
            </Text>

            {filteredResults.map((item) => (
              <TouchableOpacity
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
                <View style={{ flexDirection: 'row', padding: 16 }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      marginRight: 16,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                      {item.description}
                    </Text>
                    {item.type === 'restaurant' && (
                      <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                        {item.deliveryTime}
                      </Text>
                    )}
                    {item.type === 'food' && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                          from {item.restaurant}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#f97316' }}>
                          ${item.price?.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}


