import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, useWindowDimensions, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { apiConfig } from '../config/environment';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from '../components/MobileHeader';
import { 
  MERCHANT_KEYS,
  CATEGORY_KEYS,
  ADDRESS_KEYS,
  MERCHANT_ADDRESS_KEYS,
  dataCache
} from '@encreasl/client-services';
import LocationBasedProductCategoriesCarousel from '../components/LocationBasedProductCategoriesCarousel';
import LocationBasedMerchants from '../components/LocationBasedMerchants';

export default function HomeScreen({ navigation }: any) {
  console.log('🏠 HomeScreen: Component initializing...');

  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();

  // State for location-based features
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch Customer ID logic
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
        headers,
        credentials: 'omit',
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

  useEffect(() => {
    const init = async () => {
      try {
        await fetchCustomerId();
      } catch (error) {
        console.error('HomeScreen init error:', error);
      }
    };

    init();
    // fetchCustomerId is stable enough for our usage here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Pull-to-refresh triggered (TanStack Query)');
      
      // Clear internal service memory cache to ensure fresh data fetch
      dataCache.clear();
      
      // Reset queries to clear cache and force fresh fetch
      await Promise.all([
              queryClient.resetQueries({ queryKey: MERCHANT_KEYS.all }),
              queryClient.resetQueries({ queryKey: CATEGORY_KEYS.all }),
              queryClient.resetQueries({ queryKey: ADDRESS_KEYS.all }),
              queryClient.resetQueries({ queryKey: MERCHANT_ADDRESS_KEYS.all }),
              fetchCustomerId() // Keep local fetch logic
            ]);

    } catch (error) {
      console.error('Pull-to-refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null, categorySlug: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategorySlug(categorySlug);
  };

  const handleMerchantPress = (merchant: any) => {
    // Navigate to Merchant Details
    console.log('Merchant pressed:', merchant.id);
    navigation.navigate('Merchant', { merchantId: merchant.id });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top safe area above header - brand color */}
      <SafeAreaView style={{ backgroundColor: '#eba236' }} edges={['top']} />

      {/* Mobile Header - Now responsive for tablets */}
      <MobileHeader
        navigation={navigation}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
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
          {customerId ? (
            <LocationBasedMerchants
              customerId={customerId}
              categoryId={selectedCategoryId}
              onMerchantPress={handleMerchantPress}
            />
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Please log in to see nearby merchants.</Text>
            </View>
          )}

          {/* Bottom Padding for scroll */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </View>
  );
}
