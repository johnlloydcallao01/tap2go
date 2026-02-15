import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  useMerchantsByProductSearch, 
  useLocationBasedMerchants, 
  LocationBasedMerchant,
  LocationBasedMerchantService 
} from '@encreasl/client-services';
import { useAuth } from '../contexts/AuthContext';
import LocationMerchantCard from '../components/LocationMerchantCard';
import SearchModal from '../components/SearchModal';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors } from '../contexts/ThemeContext';

export default function SearchScreen({ route, navigation }: any) {
  const { query } = route.params || {};
  const { user } = useAuth();
  const colors = useThemeColors();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState('');

  // 0. Normalize Query
  const normalizeQuery = (input: string): string => {
    let q = (input || "").toLowerCase().trim();
    if (!q) return "";
    if (q.includes(" near me")) {
      q = q.replace(" near me", "").trim();
    }
    const idx = q.indexOf(" in ");
    if (idx > -1) {
      q = q.slice(0, idx).trim();
    }
    q = q.replace(/\s+/g, " ").trim();
    return q;
  };

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  // 0. Get Customer ID
  const { data: customerId } = useQuery({
    queryKey: ['customerId', user?.id],
    queryFn: () => user?.id ? LocationBasedMerchantService.getCustomerIdFromUserId(user.id) : Promise.resolve(null),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // 1. Get all merchants (client-side filtering base)
  // useLocationBasedMerchants requires customerId
  const { data: allMerchants = [], isLoading: isLoadingMerchants } = useLocationBasedMerchants(customerId || undefined, null, 9999);
  
  // 2. Get merchants by product search
  const { data: productMerchantIds = [], isLoading: isLoadingProducts } = useMerchantsByProductSearch(normalizedQuery);

  const isLoading = (isLoadingMerchants && !!customerId) || isLoadingProducts;

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    const q = normalizedQuery;
    if (!q) return [];
    if (!allMerchants.length) return [];

    // Filter by text (name, vendor, description, tags)
    const textMatches = allMerchants.filter(m => {
      const name = (m.outletName || "").toLowerCase();
      const vendor = (m.vendor?.businessName || "").toLowerCase();
      const desc = (m.description || "").toLowerCase();
      const tags = Array.isArray(m.tags) ? m.tags.join(" ").toLowerCase() : "";
      return name.includes(q) || vendor.includes(q) || desc.includes(q) || tags.includes(q);
    });

    // Filter by product matches (using IDs from server)
    const productMatches = allMerchants.filter(m => productMerchantIds.includes(String(m.id)));

    // Combine and Deduplicate
    const combined = new Map<string, LocationBasedMerchant>();
    textMatches.forEach(m => combined.set(String(m.id), m));
    productMatches.forEach(m => combined.set(String(m.id), m));

    return Array.from(combined.values());
  }, [allMerchants, productMerchantIds, normalizedQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header with Search Bar Trigger */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TouchableOpacity 
            style={{ flex: 1, justifyContent: 'center' }}
            onPress={() => {
              setModalQuery(query || '');
              setIsSearchModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.searchText} numberOfLines={1}>{query || "Search..."}</Text>
          </TouchableOpacity>
          {query ? (
            <TouchableOpacity 
              onPress={() => {
                setModalQuery('');
                setIsSearchModalOpen(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <LocationMerchantCard 
              merchant={item} 
              onPress={(m) => {
                navigation.navigate('Merchant', { merchantId: m.id });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No results found for &quot;{query}&quot;</Text>
            </View>
          }
        />
      )}

      <SearchModal 
        visible={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialQuery={modalQuery}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 44,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
