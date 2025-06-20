import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import components
import RestaurantCard from '../components/RestaurantCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import MapSection from '../components/MapSection';
import MobileHeader from '../components/MobileHeader';
import FooterNavigation from '../components/FooterNavigation';
import { ResponsiveContainer, ResponsiveCard, ResponsiveText, ResponsiveGrid } from '../components/ResponsiveContainer';
import { useResponsive } from '../utils/responsive';
import { useCart } from '../contexts/CartContext';

// Temporary types until shared-types is working
interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  cuisine: string[];
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  distance?: number;
  isOpen: boolean;
}

interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  featured?: boolean;
}

export default function HomeScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Get responsive screen information
  const { isTablet, deviceType } = useResponsive();

  // Cart functionality
  const { addToCart, getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  // Load data function (same logic as web app)
  const loadData = async () => {
    try {
      // TODO: Implement Firebase data loading
      // This will use the same business logic as your web app
      console.log('Loading restaurants and categories...');
      
      // Placeholder data for now
      setRestaurants([]);
      setCategories([]);
    } catch (error) {
      console.error('Error loading data:', error);
      setRestaurants([]);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter restaurants (same logic as web app)
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = !searchQuery ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory ||
      restaurant.cuisine.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Handle location select
  const handleLocationSelect = (location: {lat: number; lng: number; address: string}) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  // Demo function to add a test item
  const addTestItem = () => {
    const testItem = {
      id: `test-${Date.now()}`,
      name: 'Delicious Pizza',
      description: 'A mouth-watering pizza to test the cart',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      restaurantId: 'test-restaurant',
      category: 'Pizza',
      available: true,
    };
    addToCart(testItem, 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Brand color status bar area only */}
      <SafeAreaView style={{ backgroundColor: '#f3a823' }} edges={['top']} />

      {/* Mobile Header - Now responsive for tablets */}
      <MobileHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNotificationPress={() => {
          navigation.navigate('Notifications');
        }}
        onWishlistPress={() => {
          navigation.navigate('Wishlist');
        }}
      />

      {/* Content area with white/light background */}
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

        {/* Map Section */}
        <MapSection
          showMap={showMap}
          onToggleMap={() => setShowMap(!showMap)}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
        />

        {/* Test Footer Navigation */}
        <ResponsiveContainer>
          <ResponsiveCard style={{ backgroundColor: '#f3f4f6', marginBottom: 16 }}>
            <ResponsiveText variant="subtitle" style={{ marginBottom: 12, color: '#374151' }}>
              Test Footer Navigation
            </ResponsiveText>
            <ResponsiveText style={{ color: '#6b7280', marginBottom: 16 }}>
              Cart Items: {cartItemCount}
            </ResponsiveText>
            <TouchableOpacity
              onPress={addTestItem}
              style={{
                backgroundColor: '#f97316',
                paddingHorizontal: isTablet ? 32 : 24,
                paddingVertical: isTablet ? 16 : 12,
                borderRadius: isTablet ? 12 : 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <ResponsiveText style={{ color: 'white', fontWeight: '600' }}>
                Add Item to Cart
              </ResponsiveText>
            </TouchableOpacity>
            <ResponsiveText style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
              Add items to see the cart badge update in the footer navigation!
            </ResponsiveText>
          </ResponsiveCard>
        </ResponsiveContainer>

        {/* Categories */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* Restaurants Section */}
        <ResponsiveContainer>
          <ResponsiveCard>
            <ResponsiveText variant="title" style={{ marginBottom: 24 }}>
              {searchQuery || selectedCategory ? 'Search Results' : 'Restaurants'}
            </ResponsiveText>

            {loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                <ActivityIndicator size="large" color="#f97316" />
                <ResponsiveText style={{ color: '#6b7280', marginTop: 16 }}>
                  Loading restaurants...
                </ResponsiveText>
              </View>
            ) : filteredRestaurants.length > 0 ? (
              isTablet ? (
                <ResponsiveGrid spacing={16} minItemWidth={300}>
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </ResponsiveGrid>
              ) : (
                <View style={{ gap: 16 }}>
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </View>
              )
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 64 }}>
                <View style={{
                  width: isTablet ? 96 : 80,
                  height: isTablet ? 96 : 80,
                  backgroundColor: '#e5e7eb',
                  borderRadius: isTablet ? 48 : 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <Ionicons
                    name="restaurant-outline"
                    size={isTablet ? 56 : 48}
                    color="#9CA3AF"
                  />
                </View>
                <ResponsiveText variant="subtitle" style={{ marginBottom: 8, textAlign: 'center' }}>
                  No restaurants available yet
                </ResponsiveText>
                <ResponsiveText style={{
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: 24,
                  paddingHorizontal: 16,
                }}>
                  {searchQuery || selectedCategory
                    ? 'No restaurants found matching your criteria. Try adjusting your search or filters.'
                    : "We're working on adding amazing restaurants to your area. Check back soon!"
                  }
                </ResponsiveText>
                {(searchQuery || selectedCategory) && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                    style={{
                      backgroundColor: '#f97316',
                      paddingHorizontal: isTablet ? 32 : 24,
                      paddingVertical: isTablet ? 16 : 12,
                      borderRadius: isTablet ? 12 : 8,
                    }}
                  >
                    <ResponsiveText style={{ color: 'white', fontWeight: '600' }}>
                      Clear Filters
                    </ResponsiveText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ResponsiveCard>
        </ResponsiveContainer>

        {/* Footer */}
        <ResponsiveContainer>
          <ResponsiveCard style={{ backgroundColor: '#111827' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: isTablet ? 40 : 32,
                height: isTablet ? 40 : 32,
                backgroundColor: '#f3a823',
                borderRadius: isTablet ? 12 : 8,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <ResponsiveText style={{ color: 'white', fontWeight: 'bold' }}>T</ResponsiveText>
              </View>
              <ResponsiveText variant="title" style={{ color: 'white' }}>Tap2Go</ResponsiveText>
            </View>
            <ResponsiveText style={{ color: '#9ca3af' }}>
              Your favorite food delivery platform. Fast, reliable, and delicious.
            </ResponsiveText>
          </ResponsiveCard>
        </ResponsiveContainer>
        </ScrollView>
      </View>

      {/* Footer Navigation - positioned above bottom safe area */}
      <FooterNavigation navigation={navigation} activeScreen="Home" />

      {/* Bottom safe area with light background */}
      <SafeAreaView style={{ backgroundColor: '#f9fafb' }} edges={['bottom']} />
    </View>
  );
}


