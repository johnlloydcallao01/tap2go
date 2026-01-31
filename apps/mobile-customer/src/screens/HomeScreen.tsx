import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, useWindowDimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from '../config/environment';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import LocationBasedProductCategoriesCarousel from '../components/LocationBasedProductCategoriesCarousel';
import LocationBasedMerchants from '../components/LocationBasedMerchants';

export default function HomeScreen({ navigation }: any) {
  console.log('🏠 HomeScreen: Component initializing...');

  const colors = useThemeColors();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();

  // State for location-based features
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch Customer ID logic
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        // 1. Try to get cached customer ID first
        const cachedCid = await AsyncStorage.getItem('current-customer-id');
        if (cachedCid) {
          setCustomerId(cachedCid);
          // Don't return here, verify with current user if possible, but for now stick to cache if exists
        }

        // 2. Use user from context if available, otherwise check storage
        let userId = user?.id;
        if (!userId) {
            const userStr = await AsyncStorage.getItem('grandline_auth_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                userId = u.id;
            }
        }

        if (!userId) {
          console.log('No user found in context or storage');
          return;
        }

        // 3. Fetch customer ID from API
        const { baseUrl: API_URL, payloadApiKey: API_KEY } = apiConfig;
        
        console.log(`[HomeScreen] Fetching customer. URL: ${API_URL}`);
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (API_KEY) {
          headers['Authorization'] = `users API-Key ${API_KEY}`;
        }

        console.log(`Fetching customer for user: ${userId}`);
        const res = await fetch(`${API_URL}/customers?where[user][equals]=${userId}&limit=1`, {
          headers
        });

        if (res.ok) {
          const data = await res.json();
          const customer = data.docs?.[0];
          if (customer?.id) {
            console.log(`Found customer ID: ${customer.id}`);
            setCustomerId(customer.id);
            await AsyncStorage.setItem('current-customer-id', String(customer.id));
          } else {
             console.log('No customer profile found for this user. Response docs:', JSON.stringify(data.docs));
          }
        } else {
            const errText = await res.text();
            console.error('Failed to fetch customer:', res.status, errText);
        }
      } catch (error) {
        console.error('Error fetching customer ID:', error);
      }
    };

    fetchCustomerId();
  }, [user]);

  const handleCategorySelect = (categoryId: string | null, categorySlug: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategorySlug(categorySlug);
  };

  const handleMerchantPress = (merchant: any) => {
    // Navigate to Merchant Details
    // Assuming route name 'MerchantDetails' or similar exists, or 'RestaurantDetails'
    // For now logging, as I don't want to break navigation if route missing
    console.log('Merchant pressed:', merchant.id);
    // navigation.navigate('MerchantDetails', { merchantId: merchant.id, slug: merchant.slug });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Brand color status bar area only - now white to match new header */}
      <SafeAreaView style={{ backgroundColor: 'white' }} edges={['top']} />

      {/* Mobile Header - Now responsive for tablets */}
      <MobileHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchPress={() => {
          // TODO: Implement search modal or toggle search bar
          console.log('Search pressed');
        }}
        onNotificationPress={() => {
          navigation.navigate('Notifications');
        }}
        onWishlistPress={() => {
          navigation.navigate('Wishlist');
        }}
      />

      {/* Content area with theme background - Clean white screen as requested */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, padding: 0, margin: 0 }}
        >
          {/* Banner Image */}
          <Image
            source={require('../../assets/tap2go-campaign-banner(1).png')}
            style={{
              width: width - 20, // Full width minus 10px padding on each side (margin: 10 * 2)
              height: (width - 20) * (300 / 1400), // Maintain aspect ratio based on new width
              margin: 10,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />

          {/* Categories Carousel */}
          {customerId ? (
            <LocationBasedProductCategoriesCarousel
              customerId={customerId}
              selectedCategorySlug={selectedCategorySlug}
              onCategorySelect={handleCategorySelect}
            />
          ) : (
             // Placeholder or empty while loading customer
             <View style={{ height: 20 }} />
          )}

          {/* Merchants List */}
          {customerId && (
            <LocationBasedMerchants
              customerId={customerId}
              categoryId={selectedCategoryId}
              onMerchantPress={handleMerchantPress}
            />
          )}
          
          {!customerId && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Please log in to see nearby merchants.</Text>
            </View>
          )}

          {/* Authentication Debug Info */}
          {isAuthenticated && user && (
            <View style={{ 
              margin: 16, 
              padding: 16, 
              backgroundColor: '#EFF6FF', 
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#BFDBFE'
            }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E40AF', marginBottom: 8 }}>
                Authentication Status
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: '#374151', width: 80 }}>Name:</Text>
                <Text style={{ color: '#4B5563', flex: 1 }}>{`${user.firstName} ${user.lastName}`}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: '#374151', width: 80 }}>Email:</Text>
                <Text style={{ color: '#4B5563', flex: 1 }}>{user.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: '#374151', width: 80 }}>User ID:</Text>
                <Text style={{ color: '#4B5563', flex: 1, fontSize: 12 }}>{user.id}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontWeight: '600', color: '#374151', width: 80 }}>Cust ID:</Text>
                <Text style={{ color: customerId ? '#059669' : '#DC2626', flex: 1, fontWeight: customerId ? 'bold' : 'normal' }}>
                  {customerId || 'Not Found'}
                </Text>
              </View>
            </View>
          )}

          {/* Bottom Padding for scroll */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
}
