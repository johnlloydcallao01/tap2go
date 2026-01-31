import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { 
  LocationBasedMerchantService, 
  MerchantCategoryDisplay,
  Media 
} from '@encreasl/client-services';
import { useThemeColors } from '../contexts/ThemeContext';

interface LocationBasedProductCategoriesCarouselProps {
  customerId?: string;
  limit?: number;
  sortBy?: 'name' | 'popularity' | 'productCount';
  includeInactive?: boolean;
  selectedCategorySlug?: string | null;
  onCategorySelect?: (categoryId: string | null, categorySlug: string | null, categoryName?: string) => void;
}

export default function LocationBasedProductCategoriesCarousel({
  customerId,
  limit = 20,
  sortBy = 'popularity',
  includeInactive = false,
  selectedCategorySlug,
  onCategorySelect,
}: LocationBasedProductCategoriesCarouselProps) {
  const [categories, setCategories] = useState<MerchantCategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  const fetchCategories = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      console.log(`[Categories] Fetching for customer: ${customerId}, limit: ${limit}`);
      
      // Use the service from shared package - ALIGNED WITH WEB LOGIC (Client-side aggregation)
      const cats = await LocationBasedMerchantService.getLocationBasedMerchantCategories({ 
        customerId, 
        includeInactive, 
        limit 
      });
      
      console.log(`[Categories] Fetched ${cats?.length || 0} categories`);
      
      let mapped = cats || [];
      if (sortBy === 'name') {
        mapped = mapped.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sortBy === 'productCount') {
        mapped = mapped.slice().sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
      
      setCategories(mapped);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  }, [customerId, includeInactive, limit, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
  if (loading && categories.length === 0) {
    // Skeleton loading could go here, for now just empty
    return <View style={{ height: 100 }} />;
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
                  backgroundColor: isSelected ? colors.primary : '#F3F4F6',
                  borderColor: isSelected ? colors.primary : 'transparent',
                }
              ]}>
                {iconUrl ? (
                  <Image 
                    source={{ uri: iconUrl }} 
                    style={[
                      styles.icon,
                      { tintColor: isSelected ? 'white' : undefined }
                    ]} 
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
    marginVertical: 16,
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
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  icon: {
    width: 32,
    height: 32,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
