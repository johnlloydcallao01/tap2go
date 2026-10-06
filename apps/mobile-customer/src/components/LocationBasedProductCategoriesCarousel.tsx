import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { 
  MerchantCategoryDisplay,
  useLocationBasedCategories
} from '@encreasl/client-services';
import { useThemeColors } from '../contexts/ThemeContext';

interface LocationBasedProductCategoriesCarouselProps {
  customerId?: string;
  limit?: number;
  sortBy?: 'name' | 'popularity' | 'productCount';
  includeInactive?: boolean;
  selectedCategorySlug?: string | null;
  onCategorySelect?: (categoryId: string | null, categorySlug: string | null, categoryName?: string) => void;
  /**
   * BFF-provided categories (docs/BFF-pattern.md): when defined, the
   * carousel renders them instead of firing its own raw query.
   */
  overviewCategories?: MerchantCategoryDisplay[] | null;
  overviewLoading?: boolean;
}

export default function LocationBasedProductCategoriesCarousel({
  customerId,
  limit = 20,
  sortBy = 'popularity',
  includeInactive = false,
  selectedCategorySlug,
  onCategorySelect,
  overviewCategories,
  overviewLoading = false,
}: LocationBasedProductCategoriesCarouselProps) {
  const useBff = overviewCategories !== undefined;
  const {
    data: rawCategories = [],
    isLoading,
  } = useLocationBasedCategories(
    customerId,
    includeInactive,
    limit,
    // Match the service memory-cache TTL (5 min): background revalidations
    // resolve from memory instead of churning every global staleTime.
    // Skipped entirely when the BFF overview already provides categories.
    { staleTime: 1000 * 60 * 5, enabled: !useBff }
  );
  const categoriesSource = React.useMemo(
    () => (useBff ? (overviewCategories ?? []) : rawCategories),
    [useBff, overviewCategories, rawCategories],
  );
  const loadingSource = useBff ? overviewLoading : isLoading;
  
  // Skeleton only on first load with no rows: background refetches resolve
  // from cache and must not flash skeletons over rendered cells.
  const loading = loadingSource && categoriesSource.length === 0;
  
  const colors = useThemeColors();

  const categories = useMemo(() => {
    let mapped = categoriesSource || [];
    if (sortBy === 'name') {
      mapped = mapped.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'productCount') {
      mapped = mapped.slice().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return mapped;
  }, [categoriesSource, sortBy]);

  const handleCategoryPress = (category: MerchantCategoryDisplay) => {
    const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    const isSelected = selectedCategorySlug === slug;
    
    if (isSelected) {
      // Deselect
      onCategorySelect && onCategorySelect(null, null, undefined);
    } else {
      onCategorySelect && onCategorySelect(String(category.id), slug, category.name);
    }
  };

  if (!customerId) return null;
  
  // Show skeleton if loading or refetching, regardless of existing data
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3, 4].map(key => (
            <View key={key} style={styles.categoryItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#E5E7EB', borderColor: 'transparent' }]} />
              <View
                style={{
                  width: 56,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#E5E7EB',
                  marginTop: 8,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
  
  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
          const isSelected = selectedCategorySlug === slug;
          const iconUrl = category.media?.icon?.cloudinaryURL || category.media?.icon?.url;

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(category)}
              style={styles.categoryItem}
            >
              <View style={[
                styles.iconContainer, 
                { 
                  backgroundColor: isSelected ? '#FFFFFF' : '#F3F4F6',
                  borderColor: 'transparent',
                  transform: [{ scale: isSelected ? 1.15 : 1 }],
                  ...(isSelected ? {
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 3.84,
                    elevation: 5,
                  } : {})
                }
              ]}>
                {iconUrl ? (
                  <Image 
                    source={{ uri: iconUrl }} 
                    style={styles.icon} 
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.icon, { backgroundColor: '#e5e7eb', borderRadius: 20 }]} />
                )}
              </View>
              <Text 
                style={[
                  styles.categoryName, 
                  { 
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '700' : '500'
                  }
                ]}
                numberOfLines={2}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 12, // +4 margin on items = 16
    paddingVertical: 12, // Added to prevent clipping of scaled items with shadow
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    // overflow: 'hidden', // Removed to allow shadow
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 32, // Added to clip image if needed
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
