import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { getUniqueBrands } from '../../services/api';
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

const PopularBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      
      // Use the direct API endpoint to get brand list with logos
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/brand/list', {
        params: {
          page: 1,
          limit: 100,
          sortBy: 'id',
          order: 'asc',
          lang: 'en'
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Process brand data to ensure we have logo information
        const processedBrands = response.data.data.map(brand => ({
          id: brand.id,
          name: brand.name || '',
          slug: brand.slug || '',
          // Normalize logo path to work with the CDN
          logo: brand.logo ? extractLogoPath(brand.logo) : null
        }));
        
        // Sort brands alphabetically
        const sortedBrands = [...processedBrands].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        
        console.log(`Fetched ${sortedBrands.length} brands with ${sortedBrands.filter(b => b.logo).length} logos`);
        
        // Take just the first 10 brands to display
        setBrands(sortedBrands.slice(0, 10));
      } else {
        // If API returns no data, use fallback data
        console.log('No brand data from API, using fallbacks');
        setBrands([
          { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
          { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
          { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
          { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      // Use fallback data on error
      setBrands([
        { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
        { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
        { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
        { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Extract logo path from different possible formats
  const extractLogoPath = (logoData) => {
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
  };

  // Helper function to format brand name (capitalize first letter, rest lowercase)
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

  const handleBrandPress = (brand) => {
    console.log(`Brand selected: ${brand.name}`);
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
  };

  const navigateToAllBrands = () => {
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: (filters) => {
        navigation.navigate('ExploreScreen', { filters });
      }
    });
  };

  const renderBrandItem = ({ item }) => {
    const placeholder = LOGO_PLACEHOLDERS[item.name] || null;
    
    return (
      <TouchableOpacity 
        style={styles.brandItem}
        onPress={() => handleBrandPress(item)}
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
  };

  const renderSeeAllItem = () => (
    <TouchableOpacity 
      style={styles.brandItem}
      onPress={navigateToAllBrands}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.ellipsis}>•••</Text>
      </View>
      <Text style={styles.brandName}>See All</Text>
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => {
    // Create an array of 3 items for the loading skeleton
    const skeletonItems = Array(3).fill(0).map((_, index) => ({ id: `skeleton-${index}` }));
    
    return (
      <FlatList
        data={skeletonItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.brandsList}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={() => (
          <View style={styles.brandItem}>
            <View style={[styles.logoContainer, styles.skeletonLogo]} />
            <View style={[styles.skeletonText, styles.skeletonLogo]} />
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search by Popular Brands</Text>
        <TouchableOpacity onPress={navigateToAllBrands}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? renderLoadingSkeleton() : (
        <FlatList
          data={brands}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderBrandItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.brandsList}
          ListFooterComponent={renderSeeAllItem}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          ListEmptyComponent={renderSeeAllItem}
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

export default PopularBrands; 