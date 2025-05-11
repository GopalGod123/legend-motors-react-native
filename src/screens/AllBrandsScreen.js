import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { getUniqueBrands } from '../services/api';
import { getImageUrl } from '../utils/apiConfig';
import Svg, { Path } from 'react-native-svg';

// Back Arrow Icon
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AllBrandsScreen = ({ navigation }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBrands();
  }, []);

  const fetchAllBrands = async () => {
    try {
      setLoading(true);
      // Get a larger limit to ensure we get all brands
      const response = await getUniqueBrands({ limit: 500 });
      if (response.success && response.data && response.data.length > 0) {
        // Sort brands alphabetically
        const sortedBrands = [...response.data].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        setBrands(sortedBrands);
      } else {
        // If API returns no data, use fallback data
        setBrands([
          { id: 1, name: 'BYD', slug: 'byd', logo: null },
          { id: 2, name: 'CHANGAN', slug: 'changan', logo: null },
          { id: 3, name: 'CHERY', slug: 'chery', logo: null },
          { id: 4, name: 'TOYOTA', slug: 'toyota', logo: null },
          { id: 5, name: 'HONDA', slug: 'honda', logo: null },
          { id: 6, name: 'MERCEDES', slug: 'mercedes', logo: null },
          { id: 7, name: 'BMW', slug: 'bmw', logo: null },
          { id: 8, name: 'AUDI', slug: 'audi', logo: null },
          { id: 9, name: 'FORD', slug: 'ford', logo: null },
          { id: 10, name: 'CHEVROLET', slug: 'chevrolet', logo: null },
          { id: 11, name: 'NISSAN', slug: 'nissan', logo: null },
          { id: 12, name: 'HYUNDAI', slug: 'hyundai', logo: null },
          { id: 13, name: 'KIA', slug: 'kia', logo: null },
          { id: 14, name: 'VOLKSWAGEN', slug: 'volkswagen', logo: null },
          { id: 15, name: 'VOLVO', slug: 'volvo', logo: null },
        ]);
      }
    } catch (err) {
      console.error('Error fetching all brands:', err);
      // Use fallback data on error
      setBrands([
        { id: 1, name: 'BYD', slug: 'byd', logo: null },
        { id: 2, name: 'CHANGAN', slug: 'changan', logo: null },
        { id: 3, name: 'CHERY', slug: 'chery', logo: null },
        { id: 4, name: 'TOYOTA', slug: 'toyota', logo: null },
        { id: 5, name: 'HONDA', slug: 'honda', logo: null },
        { id: 6, name: 'MERCEDES', slug: 'mercedes', logo: null },
        { id: 7, name: 'BMW', slug: 'bmw', logo: null },
      ]);
    } finally {
      setLoading(false);
    }
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
    // Navigate to ExploreScreen with filtered results by brand
    navigation.navigate('Explore', {
      filters: {
        brands: [brand.name],
        brandIds: [brand.id],
        specifications: {} // Add empty specifications object to match expected filter structure
      }
    });
  };

  const renderBrandItem = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <TouchableOpacity
        style={styles.brandItem}
        onPress={() => handleBrandPress(item)}>
        <View style={styles.logoContainer}>
          {item.logo && !imageError ? (
            <Image
              source={{ uri: getImageUrl(item.logo) }}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setImageError(true)}
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
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <BackIcon />
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
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
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