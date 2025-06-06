import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { API_KEY } from '../../utils/apiConfig';
import axios from 'axios';
import { CarImage } from '../common';

// Placeholder logo text examples for brands without logos
const LOGO_PLACEHOLDERS = {
  'BYD': { text: 'BYD', color: '#333333' },
  'CHANGAN': { text: 'CHANGAN', color: '#0055A5' },
  'CHERY': { text: 'CHERY', color: '#E60012' },
};

// Cache for brand data
let cachedBrands = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (brands change less frequently)

// Memoized brand item component
const BrandItem = memo(({ item, onPress, placeholder }) => {
  // Format brand name (capitalize first letter, rest lowercase)
  const formatBrandName = (name) => {
    if (!name) return '';
    
    // Handle special cases like BMW, BYD
    if (name.length <= 3) return name.toUpperCase();
    
    // Special case for brands in the image
    if (LOGO_PLACEHOLDERS[name]) {
      return LOGO_PLACEHOLDERS[name].text;
    }
    
    // General case
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  return (
    <TouchableOpacity 
      style={styles.brandItem}
      onPress={() => onPress(item)}
    >
      <View style={styles.logoContainer}>
        {item.logo ? (
          <CarImage 
            source={{
              uri: `https://cdn.legendmotorsglobal.com/${item.logo}`, 
              filename: item.logo,
              fullPath: item.logo
            }}
            style={styles.logo}
            resizeMode="contain"
            loadingIndicatorSource={null}
            defaultSource={require('./HotDealsCar.png')}
          />
        ) : placeholder ? (
          <Text style={[styles.brandLogo, { color: placeholder.color }]}>
            {placeholder.text}
          </Text>
        ) : (
          <Text style={styles.brandInitial}>{item.name[0]}</Text>
        )}
      </View>
      <Text style={styles.brandName} numberOfLines={1}>
        {formatBrandName(item.name)}
      </Text>
    </TouchableOpacity>
  );
});

// Memoized see all item component
const SeeAllItem = memo(({ onPress }) => (
  <TouchableOpacity 
    style={styles.brandItem}
    onPress={onPress}
  >
    <View style={styles.logoContainer}>
      <Text style={styles.ellipsis}>•••</Text>
    </View>
    <Text style={styles.brandName}>See All</Text>
  </TouchableOpacity>
));

const PopularBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  // Track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    fetchBrands();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Extract logo path helper
  const extractLogoPath = useCallback((logoData) => {
    // If it's already a string, use it directly
    if (typeof logoData === 'string') {
      return logoData;
    }
    
    // If it's an object with FileSystem structure
    if (logoData && logoData.FileSystem) {
      const fileSystem = logoData.FileSystem;
      return fileSystem.path || fileSystem.webpPath || fileSystem.thumbnailPath;
    }
    
    // If it's an object with a path property
    if (logoData && logoData.path) {
      return logoData.path;
    }
    
    // Last resort, try to get the name and create a standard path
    if (logoData && logoData.name) {
      return `${logoData.name}.png`;
    }
    
    return null;
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      
      const now = Date.now();
      // Use cached data if available and not expired
      if (cachedBrands && now - lastFetchTime < CACHE_DURATION) {
        setBrands(cachedBrands);
        setLoading(false);
        return;
      }
      
      // Use the direct API endpoint to get brand list with logos
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/brand/list', {
        params: {
          page: 1,
          limit: 10,  // Reduced from 100 to just 10 for faster loading
          sortBy: 'id',
          order: 'asc',
          lang: 'en'
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (!isMounted.current) return;

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Process brand data to ensure we have logo information
        const processedBrands = response.data.data.map(brand => ({
          id: brand.id,
          name: brand.name || '',
          slug: brand.slug || '',
          // Normalize logo path to work with the CDN
          logo: brand.logo ? extractLogoPath(brand.logo) : null
        }));
        
        // Sort brands alphabetically and take just the first 10
        const sortedBrands = [...processedBrands]
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          .slice(0, 10);

        // Update cache
        cachedBrands = sortedBrands;
        lastFetchTime = now;
        
        setBrands(sortedBrands);
      } else {
        // If API returns no data, use fallback data
        const fallbackBrands = [
          { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
          { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
          { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
          { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
        ];
        setBrands(fallbackBrands);
        
        // Cache the fallbacks too
        cachedBrands = fallbackBrands;
        lastFetchTime = now;
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      
      // Use fallback data on error
      const fallbackBrands = [
        { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
        { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
        { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
        { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
      ];
      setBrands(fallbackBrands);
      
      // Cache the fallbacks too
      cachedBrands = fallbackBrands;
      lastFetchTime = now;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const handleBrandPress = useCallback((brand) => {
    // Navigate to filtered cars by brand
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: (filters) => {
        // This callback will be called when filters are applied in FilterScreen
        navigation.navigate('ExploreScreen', { filters });
      },
      // Pre-select this brand
      currentFilters: {
        brands: [brand.name],
        brandIds: [brand.id]
      }
    });
  }, [navigation]);

  const navigateToAllBrands = useCallback(() => {
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: (filters) => {
        navigation.navigate('ExploreScreen', { filters });
      }
    });
  }, [navigation]);

  const renderBrandItem = useCallback(({ item }) => {
    const placeholder = LOGO_PLACEHOLDERS[item.name] || null;
    return (
      <BrandItem
        item={item}
        onPress={handleBrandPress}
        placeholder={placeholder}
      />
    );
  }, [handleBrandPress]);

  const renderSeeAllItem = useCallback(() => (
    <SeeAllItem onPress={navigateToAllBrands} />
  ), [navigateToAllBrands]);

  const renderLoadingItem = useCallback(({ item }) => (
    <View style={styles.brandItem}>
      <View style={[styles.logoContainer, styles.skeletonLogo]} />
      <View style={[styles.skeletonText, styles.skeletonLogo]} />
    </View>
  ), []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);
  const ItemSeparatorComponent = useCallback(() => <View style={{ width: 12 }} />, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search by Popular Brands</Text>
        <TouchableOpacity onPress={navigateToAllBrands}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <FlatList
          data={[{id: 'skeleton-1'}, {id: 'skeleton-2'}, {id: 'skeleton-3'}]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderLoadingItem}
          contentContainerStyle={styles.brandsList}
          ItemSeparatorComponent={ItemSeparatorComponent}
        />
      ) : (
        <FlatList
          data={brands}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.brandsList}
          ListFooterComponent={renderSeeAllItem}
          ItemSeparatorComponent={ItemSeparatorComponent}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 100, // Width of the item + spacing
            offset: 100 * index, // Width of the item + spacing * index
            index,
          })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  brandsList: {
    paddingVertical: SPACING.sm,
  },
  brandItem: {
    alignItems: 'center',
    width: 100,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logo: {
    width: '80%',
    height: '80%',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  brandInitial: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  brandLogo: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginTop: 4,
    textAlign: 'center',
  },
  ellipsis: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  skeletonLogo: {
    backgroundColor: '#f0f0f0',
  },
  skeletonText: {
    width: 60,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
});

export default React.memo(PopularBrands); 