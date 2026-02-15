import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { 
  LocationBasedMerchant,
  sortMerchantsByRecentlyUpdated,
  useLocationBasedMerchants,
  useMerchantAddresses
} from '@encreasl/client-services';
import LocationMerchantCard from './LocationMerchantCard';
import { useThemeColors } from '../contexts/ThemeContext';

interface LocationBasedMerchantsProps {
  customerId?: string;
  limit?: number;
  categoryId?: string | null;
  onMerchantPress?: (merchant: LocationBasedMerchant) => void;
}

export default function LocationBasedMerchants({
  customerId,
  limit = 20,
  categoryId,
  onMerchantPress
}: LocationBasedMerchantsProps) {
  const { 
    data: merchants = [], 
    isLoading, 
    isRefetching 
  } = useLocationBasedMerchants(
    customerId, 
    categoryId, 
    limit
  );
  
  // Fetch active addresses for merchants
  const { data: addressMap = {} } = useMerchantAddresses(merchants);
  
  const loading = isLoading || isRefetching;
  
  const colors = useThemeColors();
  const { width } = useWindowDimensions();

  // Compute newly updated merchants (Client-side sort using shared logic)
  // Only shown when no category filter is active, matching web logic
  const newlyUpdatedMerchants = useMemo(() => {
    if (categoryId) return [];
    return sortMerchantsByRecentlyUpdated(merchants).slice(0, 8); // Limit to top 8
  }, [merchants, categoryId]);

  if (!customerId) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {categoryId ? 'Filtered Merchants' : 'Nearby Merchants'}
        </Text>
      </View>

      {loading ? (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            decelerationRate="fast"
            snapToInterval={width * 0.75 + 16}
          >
            {[1, 2, 3].map(key => (
              <View
                key={key}
                style={{
                  width: width * 0.75,
                  marginRight: 16,
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: 140,
                    borderRadius: 12,
                    backgroundColor: '#E5E7EB',
                    marginBottom: 12,
                  }}
                />
                <View
                  style={{
                    width: '60%',
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#E5E7EB',
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    width: '40%',
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#E5E7EB',
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : merchants.length > 0 ? (
        <View>
          {/* Main List (Nearby) */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            decelerationRate="fast"
            snapToInterval={width * 0.75 + 16} // card width + margin
          >
            {merchants.map((merchant) => (
              <View 
                key={merchant.id} 
                style={{ width: width * 0.75, marginRight: 16 }}
              >
                <LocationMerchantCard
                  merchant={merchant}
                  onPress={onMerchantPress}
                  addressName={addressMap[merchant.id] || null}
                  // Add wishlist logic here if needed
                />
              </View>
            ))}
          </ScrollView>

          {/* Newly Updated Section - Shown only if no category selected & we have data */}
          {newlyUpdatedMerchants.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Newly Updated
                </Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                decelerationRate="fast"
                snapToInterval={width * 0.75 + 16} // card width + margin
              >
                {newlyUpdatedMerchants.map((merchant) => (
                  <View 
                    key={`newly-${merchant.id}`} 
                    style={{ width: width * 0.75, marginRight: 16 }}
                  >
                    <LocationMerchantCard
                      merchant={merchant}
                      onPress={onMerchantPress}
                      addressName={addressMap[merchant.id] || null}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No merchants found nearby.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginTop: 0,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    // Items handle their own spacing
  },
  horizontalList: {
    paddingRight: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  }
});
