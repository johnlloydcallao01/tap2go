import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { 
  LocationBasedMerchantService, 
  LocationBasedMerchant 
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
  const [merchants, setMerchants] = useState<LocationBasedMerchant[]>([]);
  const [loading, setLoading] = useState(false);
  const colors = useThemeColors();

  const fetchMerchants = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const data = await LocationBasedMerchantService.getLocationBasedMerchants({
        customerId,
        limit,
        categoryId: categoryId || undefined
      });
      setMerchants(data || []);
    } catch (err) {
      console.error('Failed to fetch merchants', err);
    } finally {
      setLoading(false);
    }
  }, [customerId, limit, categoryId]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  if (!customerId) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {categoryId ? 'Filtered Merchants' : 'Nearby Merchants'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : merchants.length > 0 ? (
        <View style={styles.list}>
          {merchants.map((merchant) => (
            <LocationMerchantCard
              key={merchant.id}
              merchant={merchant}
              onPress={onMerchantPress}
              // Add wishlist logic here if needed
            />
          ))}
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
