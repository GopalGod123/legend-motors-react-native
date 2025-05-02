import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { getUniqueBrands } from '../services/api';
import axios from 'axios';
import { API_KEY } from '../utils/apiConfig';
import { CarImage } from '../components/common';

const AllBrandsScreen = ({ navigation }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBrands();
  }, []);

  const fetchAllBrands = async () => {
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
        
        console.log(`Fetched ${sortedBrands.length} brands for AllBrandsScreen`);
        setBrands(sortedBrands);
      } else {
        // If API returns no data, use fallback data
        setBrands([
          { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
          { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
          { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
          { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
          { id: 5, name: 'HONDA', slug: 'honda', logo: 'HONDA.png' },
          { id: 6, name: 'MERCEDES', slug: 'mercedes', logo: 'MERCEDES.png' },
          { id: 7, name: 'BMW', slug: 'bmw', logo: 'BMW.png' },
          { id: 8, name: 'AUDI', slug: 'audi', logo: 'AUDI.png' },
          { id: 9, name: 'FORD', slug: 'ford', logo: 'FORD.png' },
          { id: 10, name: 'CHEVROLET', slug: 'chevrolet', logo: 'CHEVROLET.png' },
          { id: 11, name: 'NISSAN', slug: 'nissan', logo: 'NISSAN.png' },
          { id: 12, name: 'HYUNDAI', slug: 'hyundai', logo: 'HYUNDAI.png' },
          { id: 13, name: 'KIA', slug: 'kia', logo: 'KIA.png' },
          { id: 14, name: 'VOLKSWAGEN', slug: 'volkswagen', logo: 'VOLKSWAGEN.png' },
          { id: 15, name: 'VOLVO', slug: 'volvo', logo: 'VOLVO.png' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching all brands:', err);
      // Use fallback data on error
      setBrands([
        { id: 1, name: 'BYD', slug: 'byd', logo: 'BYD.png' },
        { id: 2, name: 'CHANGAN', slug: 'changan', logo: 'CHANGAN.png' },
        { id: 3, name: 'CHERY', slug: 'chery', logo: 'CHERY.png' },
        { id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'TOYOTA.png' },
        { id: 5, name: 'HONDA', slug: 'honda', logo: 'HONDA.png' },
        { id: 6, name: 'MERCEDES', slug: 'mercedes', logo: 'MERCEDES.png' },
        { id: 7, name: 'BMW', slug: 'bmw', logo: 'BMW.png' },
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
    
    // General case
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleBrandPress = (brand) => {
    console.log(`Selected brand: ${brand.name}`);
    // Navigate to the filter screen with the brand pre-selected
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

  const renderBrandItem = ({ item }) => (
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
          />
        ) : (
          <Text style={styles.brandInitial}>{formatBrandName(item.name).charAt(0)}</Text>
        )}
      </View>
      <Text style={styles.brandName} numberOfLines={1}>
        {formatBrandName(item.name)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>All Brands</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading brands...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={brands}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textDark,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  placeholder: {
    width: 30,
  },
  list: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  brandItem: {
    width: '30%',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    width: 50,
    height: 50,
  },
  brandInitial: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  brandName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textDark,
    fontSize: FONT_SIZES.md,
  },
});

export default AllBrandsScreen; 