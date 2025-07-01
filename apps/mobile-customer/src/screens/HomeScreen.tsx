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

// Import responsive components
import { ResponsiveText } from '../components';

// Import components with error handling
let RestaurantCard: any;
let CategoryFilter: any;
let SearchBar: any;
let MapSection: any;
let MobileHeader: any;
let FooterNavigation: any;
// ResponsiveText is now imported from components
let useResponsive: any;
let useCart: any;

try {
  // Safe component imports with fallback checks
  const restaurantCardModule = require('../components/RestaurantCard');
  RestaurantCard = restaurantCardModule?.default || restaurantCardModule;

  const categoryFilterModule = require('../components/CategoryFilter');
  CategoryFilter = categoryFilterModule?.default || categoryFilterModule;

  const searchBarModule = require('../components/SearchBar');
  SearchBar = searchBarModule?.default || searchBarModule;

  const mapSectionModule = require('../components/MapSection');
  MapSection = mapSectionModule?.default || mapSectionModule;

  const mobileHeaderModule = require('../components/MobileHeader');
  MobileHeader = mobileHeaderModule?.default || mobileHeaderModule;

  const footerNavModule = require('../components/FooterNavigation');
  FooterNavigation = footerNavModule?.default || footerNavModule;

  // ResponsiveContainer is already imported at the top - no need to reassign

  // Safe hook imports with null checks
  const responsiveModule = require('../utils/responsive');
  if (responsiveModule && typeof responsiveModule === 'object') {
    useResponsive = responsiveModule.useResponsive || responsiveModule.default;
  }

  const cartModule = require('../contexts/CartContext');
  if (cartModule && typeof cartModule === 'object') {
    useCart = cartModule.useCart || cartModule.default;
  }
} catch (error) {
  console.warn('Failed to import some components, using fallbacks:', error);

  // Fallback components
  RestaurantCard = ({ restaurant }: any) => (
    <View style={{ backgroundColor: 'white', padding: 16, margin: 8, borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{restaurant?.name || 'Restaurant'}</Text>
      <Text style={{ color: '#666' }}>{restaurant?.description || 'Description not available'}</Text>
    </View>
  );

  CategoryFilter = () => <View style={{ height: 50, backgroundColor: '#f5f5f5' }} />;
  SearchBar = () => <View style={{ height: 40, backgroundColor: '#f5f5f5', margin: 16 }} />;
  MapSection = () => <View style={{ height: 200, backgroundColor: '#e5e5e5', margin: 16 }} />;

  MobileHeader = ({ title }: { title: string }) => (
    <View style={{ padding: 16, backgroundColor: '#f3a823' }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
    </View>
  );

  FooterNavigation = () => <View style={{ height: 60, backgroundColor: '#f3a823' }} />;

  // ResponsiveText is now imported from components

  useResponsive = () => ({ isMobile: true, isTablet: false, isDesktop: false });
  useCart = () => ({ items: [], addItem: () => {}, removeItem: () => {}, clearCart: () => {} });
}

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
  console.log('🏠 HomeScreen: Component initializing...');

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

  // Get responsive screen information with error handling
  let responsiveData, cartData;

  try {
    responsiveData = useResponsive();
    cartData = useCart();
    console.log('🏠 HomeScreen: Hooks loaded successfully');
  } catch (hookError) {
    console.error('🏠 HomeScreen: Hook error:', hookError);
    responsiveData = { isTablet: false, deviceType: 'mobile' };
    cartData = { addToCart: () => {}, getCartItemCount: () => 0 };
  }

  const { isTablet = false, deviceType = 'mobile' } = responsiveData || {};
  const { addToCart = () => {}, getCartItemCount = () => 0 } = cartData || {};
  const cartItemCount = typeof getCartItemCount === 'function' ? getCartItemCount() : 0;

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
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Section */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 }}>
            <View style={{
              backgroundColor: '#f3a823',
              borderRadius: 16,
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <View style={{ zIndex: 2 }}>
                <ResponsiveText style={{
                  color: 'white',
                  fontSize: isTablet ? 28 : 24,
                  fontWeight: 'bold',
                  marginBottom: 8,
                }}>
                  Order food to your door
                </ResponsiveText>
                <ResponsiveText style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: isTablet ? 18 : 16,
                  marginBottom: 20,
                }}>
                  Get delivery from your favorite restaurants
                </ResponsiveText>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 25,
                    alignSelf: 'flex-start',
                  }}
                >
                  <ResponsiveText style={{
                    color: '#f3a823',
                    fontWeight: '600',
                    fontSize: 16,
                  }}>
                    Find Food
                  </ResponsiveText>
                </TouchableOpacity>
              </View>
              {/* Decorative circles */}
              <View style={{
                position: 'absolute',
                right: -30,
                top: -30,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }} />
              <View style={{
                position: 'absolute',
                right: 20,
                bottom: -20,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }} />
            </View>
          </View>

          {/* Categories Carousel */}
          <View style={{ paddingBottom: 24 }}>
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <ResponsiveText style={{
                fontSize: isTablet ? 24 : 20,
                fontWeight: 'bold',
                color: '#111827',
              }}>
                What are you craving?
              </ResponsiveText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {[
                { name: 'Pizza', icon: '🍕', color: '#FF6B6B' },
                { name: 'Burgers', icon: '🍔', color: '#4ECDC4' },
                { name: 'Sushi', icon: '🍣', color: '#45B7D1' },
                { name: 'Desserts', icon: '🍰', color: '#F7DC6F' },
                { name: 'Coffee', icon: '☕', color: '#8D6E63' },
                { name: 'Healthy', icon: '🥗', color: '#81C784' },
                { name: 'Asian', icon: '🍜', color: '#FFB74D' },
                { name: 'Mexican', icon: '🌮', color: '#FF8A65' },
              ].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    alignItems: 'center',
                    marginRight: 16,
                    width: 80,
                  }}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: category.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                    <ResponsiveText style={{ fontSize: 24 }}>
                      {category.icon}
                    </ResponsiveText>
                  </View>
                  <ResponsiveText style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: '#374151',
                    textAlign: 'center',
                  }}>
                    {category.name}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Restaurants Section */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <ResponsiveText style={{
                fontSize: isTablet ? 24 : 20,
                fontWeight: 'bold',
                color: '#111827',
              }}>
                Featured restaurants
              </ResponsiveText>
              <TouchableOpacity>
                <ResponsiveText style={{
                  color: '#f3a823',
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  See all
                </ResponsiveText>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ gap: 16 }}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      gap: 12,
                    }}>
                      <View style={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#f3f4f6',
                        borderRadius: 8,
                      }} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <View style={{
                          height: 16,
                          backgroundColor: '#f3f4f6',
                          borderRadius: 4,
                          width: '70%',
                        }} />
                        <View style={{
                          height: 12,
                          backgroundColor: '#f3f4f6',
                          borderRadius: 4,
                          width: '90%',
                        }} />
                        <View style={{
                          height: 12,
                          backgroundColor: '#f3f4f6',
                          borderRadius: 4,
                          width: '60%',
                        }} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {/* Demo Restaurant Cards */}
                {[
                  {
                    id: '1',
                    name: 'McDonald\'s',
                    cuisine: 'Fast Food • Burgers',
                    rating: 4.5,
                    deliveryTime: '15-25 min',
                    deliveryFee: 'Free delivery',
                    image: '🍔',
                    promo: '20% off',
                  },
                  {
                    id: '2',
                    name: 'Jollibee',
                    cuisine: 'Fast Food • Filipino',
                    rating: 4.7,
                    deliveryTime: '20-30 min',
                    deliveryFee: '₱29 delivery',
                    image: '🍗',
                    promo: null,
                  },
                  {
                    id: '3',
                    name: 'Starbucks',
                    cuisine: 'Coffee • Beverages',
                    rating: 4.6,
                    deliveryTime: '10-20 min',
                    deliveryFee: 'Free delivery',
                    image: '☕',
                    promo: 'Buy 1 Get 1',
                  },
                ].map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 12,
                      padding: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={() => {
                      // Navigate to restaurant details
                      console.log('Navigate to restaurant:', restaurant.name);
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      gap: 12,
                    }}>
                      {/* Restaurant Image */}
                      <View style={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#f3f4f6',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                        <ResponsiveText style={{ fontSize: 32 }}>
                          {restaurant.image}
                        </ResponsiveText>
                        {restaurant.promo && (
                          <View style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            backgroundColor: '#f3a823',
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}>
                            <ResponsiveText style={{
                              color: 'white',
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}>
                              {restaurant.promo}
                            </ResponsiveText>
                          </View>
                        )}
                      </View>

                      {/* Restaurant Info */}
                      <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View>
                          <ResponsiveText style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: 4,
                          }}>
                            {restaurant.name}
                          </ResponsiveText>
                          <ResponsiveText style={{
                            fontSize: 14,
                            color: '#6b7280',
                            marginBottom: 8,
                          }}>
                            {restaurant.cuisine}
                          </ResponsiveText>
                        </View>

                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <ResponsiveText style={{ fontSize: 12 }}>⭐</ResponsiveText>
                            <ResponsiveText style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: '#111827',
                            }}>
                              {restaurant.rating}
                            </ResponsiveText>
                            <ResponsiveText style={{
                              fontSize: 12,
                              color: '#6b7280',
                            }}>
                              • {restaurant.deliveryTime}
                            </ResponsiveText>
                          </View>
                          <ResponsiveText style={{
                            fontSize: 12,
                            color: restaurant.deliveryFee === 'Free delivery' ? '#10b981' : '#6b7280',
                            fontWeight: '500',
                          }}>
                            {restaurant.deliveryFee}
                          </ResponsiveText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            <ResponsiveText style={{
              fontSize: isTablet ? 24 : 20,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: 16,
            }}>
              More ways to save
            </ResponsiveText>
            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#fef3c7',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <ResponsiveText style={{ fontSize: 20 }}>🎯</ResponsiveText>
                </View>
                <ResponsiveText style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#111827',
                  textAlign: 'center',
                }}>
                  Deals
                </ResponsiveText>
              </TouchableOpacity>

              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#dbeafe',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <ResponsiveText style={{ fontSize: 20 }}>🚚</ResponsiveText>
                </View>
                <ResponsiveText style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#111827',
                  textAlign: 'center',
                }}>
                  Pickup
                </ResponsiveText>
              </TouchableOpacity>

              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#f3e8ff',
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <ResponsiveText style={{ fontSize: 20 }}>⚡</ResponsiveText>
                </View>
                <ResponsiveText style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#111827',
                  textAlign: 'center',
                }}>
                  Express
                </ResponsiveText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Cart Functionality */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <ResponsiveText style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: 8,
              }}>
                Test Cart Feature
              </ResponsiveText>
              <ResponsiveText style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 16,
              }}>
                Cart Items: {cartItemCount}
              </ResponsiveText>
              <TouchableOpacity
                onPress={addTestItem}
                style={{
                  backgroundColor: '#f3a823',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <ResponsiveText style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  Add Test Item to Cart
                </ResponsiveText>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>


    </View>
  );
}