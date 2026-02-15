import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  SectionList, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  Alert,
  useWindowDimensions,
  TextInput,
  ImageBackground
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { 
  getMerchantByIdClient, 
  getMerchantMenuClient, 
  MerchantProductDisplay,
  MerchantCategoryDisplay 
} from '@encreasl/client-services';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';

interface Section {
  title: string;
  data: MerchantProductDisplay[][]; // Array of rows (each row is array of 1 or 2 products)
  id: number | string;
}

export default function MerchantScreen({ route, navigation }: any) {
  const { merchantId } = route.params || {};
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const sectionListRef = useRef<SectionList>(null);
  const { addToCart } = useCart();

  // 1. Fetch Merchant Details
  const { data: merchant, isLoading: isLoadingMerchant } = useQuery({
    queryKey: ['merchant', merchantId],
    queryFn: () => getMerchantByIdClient(String(merchantId)),
    enabled: !!merchantId,
  });

  // 2. Fetch Merchant Menu with Infinite Scroll
  const { 
    data: menuData, 
    isLoading: isLoadingMenu,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['merchant-menu', merchantId],
    queryFn: ({ pageParam = 1 }) => getMerchantMenuClient(String(merchantId), pageParam, 20),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!merchantId,
  });

  const isLoading = isLoadingMerchant || isLoadingMenu;

  // 3. Group Products by Category and Chunk for Grid
  const { sections, categories } = useMemo(() => {
    if (!menuData) return { sections: [], categories: [] };
    
    // Flatten products and categories from all pages
    const products = menuData.pages.flatMap(page => page.products);
    
    // Merge categories (avoid duplicates)
    const categoryMap = new Map<number | string, MerchantCategoryDisplay>();
    menuData.pages.forEach(page => {
      page.categories.forEach(c => categoryMap.set(c.id, c));
    });
    const allCategories = Array.from(categoryMap.values());

    // Products without categories
    const others = products.filter(p => !p.categoryIds || p.categoryIds.length === 0);
    
    const result: Section[] = [];

    // Add sections for each category
    allCategories.forEach(cat => {
      // Filter products that belong to this category
      const items = products.filter(p => (p.categoryIds || []).includes(cat.id));
      
      if (items.length > 0) {
        // Chunk items into pairs for grid layout
        const chunkedItems: MerchantProductDisplay[][] = [];
        for (let i = 0; i < items.length; i += 2) {
          chunkedItems.push(items.slice(i, i + 2));
        }

        result.push({
          title: cat.name,
          data: chunkedItems,
          id: cat.id
        });
      }
    });

    // Add "Others" section if any
    if (others.length > 0) {
      const chunkedOthers: MerchantProductDisplay[][] = [];
      for (let i = 0; i < others.length; i += 2) {
        chunkedOthers.push(others.slice(i, i + 2));
      }
      
      const othersId = 'others';
      result.push({
        title: 'Others',
        data: chunkedOthers,
        id: othersId
      });
      // Add "Others" to categories list for navigation pill
      allCategories.push({ id: othersId, name: 'Others', slug: 'others' });
    }

    return { sections: result, categories: allCategories };
  }, [menuData]);

  // Handle Category Selection (Scroll to Section)
  const handleCategoryPress = (categoryId: number | string) => {
    setSelectedCategoryId(categoryId);
    const sectionIndex = sections.findIndex(s => s.id === categoryId);
    if (sectionIndex !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 160, // Adjust for header height + sticky header
        animated: true
      });
    }
  };

  const handleAddToCart = (product: MerchantProductDisplay) => {
    // Basic Add to Cart implementation
    // For now, we assume simple products or handle variations later
    // In real app, check productType (simple vs variable)
    if (product.productType === 'variable' || product.productType === 'grouped') {
      // Navigate to product details or show variations modal
      Alert.alert('Options', 'This product has options. Please select variations.');
      // navigation.navigate('ProductDetails', { productId: product.id });
    } else {
      // Adapt to MenuItem interface expected by CartContext
      const menuItem = {
        id: String(product.id),
        name: product.name,
        description: product.shortDescription || '',
        price: product.basePrice || 0,
        image: product.imageUrl || '',
        restaurantId: String(merchantId),
        category: '', // Can be filled if needed, but not critical for add
        available: true
      };
      
      addToCart(menuItem, 1);
      Alert.alert('Added to Cart', `${product.name} added to your cart.`);
    }
  };

  // Helper to get image URL with fallbacks (Cloudinary > URL > Thumbnail)
  // And handle relative URLs by prepending API base
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  const BASE_URL = API_URL.replace(/\/api\/?$/, ''); // Strip trailing /api or /api/

  const getImageUrl = (media: any): string | null => {
    if (!media) return null;
    let url = media.cloudinaryURL || media.url || media.thumbnailURL || null;
    
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      // It's a relative path, prepend BASE_URL
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
      url = `${cleanBase}${cleanUrl}`;
    }
    
    return url;
  };

  // Render Header (Cover, Info, Search, Categories)
  const renderHeader = () => {
    if (!merchant) return null;

    const coverImage = getImageUrl(merchant.media?.storeFrontImage) || getImageUrl(merchant.media?.thumbnail);
    const logoImage = getImageUrl(merchant.vendor?.logo) || getImageUrl(merchant.media?.thumbnail);
    
    // Construct address string
    const address = merchant.activeAddress?.formatted_address || 
                    [merchant.activeAddress?.street, merchant.activeAddress?.city].filter(Boolean).join(', ');

    return (
      <View style={{ backgroundColor: '#fff', paddingBottom: 10 }}>
        {/* Cover Image */}
        <ImageBackground 
          source={{ uri: coverImage || 'https://via.placeholder.com/800x400' }} 
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        >
          {/* Top Bar Overlay */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            paddingHorizontal: 16, 
            paddingTop: insets.top + 10 
          }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="information-circle-outline" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart-outline" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Merchant Logo (Overlapping) */}
        <View style={{ alignItems: 'center', marginTop: -30 }}>
           <View style={styles.logoContainer}>
              <Image 
                source={{ uri: logoImage || 'https://via.placeholder.com/100' }} 
                style={styles.logo} 
                resizeMode="cover"
              />
           </View>
        </View>

        {/* Merchant Info */}
        <View style={{ paddingHorizontal: 16, alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.merchantName}>{merchant.outletName}</Text>
          {address && (
            <Text style={styles.merchantAddress} numberOfLines={2}>
              {address}
            </Text>
          )}
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search menu" 
              style={styles.searchInput} 
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Categories Horizontal List */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, marginTop: 16, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleCategoryPress(item.id)}
              style={[
                styles.categoryPill,
                selectedCategoryId === item.id && styles.categoryPillActive
              ]}
            >
              <Text style={[
                styles.categoryPillText,
                selectedCategoryId === item.id && styles.categoryPillTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: MerchantProductDisplay[] }) => {
    // Calculate item width based on screen width and margins
    // Screen padding: 16px (left) + 16px (right)
    // Gap between items: 12px
    // (Screen - 32 - 12) / 2
    const itemWidth = (width - 32 - 12) / 2;

    return (
      <View style={styles.row}>
        {item.map((product) => (
          <TouchableOpacity 
            key={product.id} 
            style={[styles.productCard, { width: itemWidth }]}
            onPress={() => {
              // Navigate to details if needed
              if (product.productType === 'variable' || product.productType === 'grouped') {
                 Alert.alert('Product', product.name);
              } else {
                 handleAddToCart(product);
              }
            }}
          >
            {/* Image Container */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }} 
                style={styles.productImage} 
                resizeMode="cover"
              />
              {/* Add Button Overlay */}
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddToCart(product)}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.productContent}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              
              <View style={{ marginTop: 4 }}>
                {product.productType === 'simple' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {product.basePrice !== null && (
                      <Text style={styles.price}>{formatCurrency(product.basePrice)}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.variableText}>
                    {product.productType === 'grouped' ? 'Show Grouped Items' : 'Show Variations'}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading && !merchant) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#eba236" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" />
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled={false} // Disable sticky headers for now as per design
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={{ margin: 20 }} color="#eba236" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12, // Rounded square as per screenshot
    backgroundColor: '#fff',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  merchantAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#eee'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#fff', // Keep white bg
    borderColor: '#333',   // Dark border for active
  },
  categoryPillText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    // No shadow in screenshot, looks clean
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square image
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    position: 'relative',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  productContent: {
    // paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    lineHeight: 18,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  variableText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#eba236', // Brand color for "Show Variations"
  }
});
