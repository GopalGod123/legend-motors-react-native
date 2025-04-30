import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { getUniqueBrands } from '../../services/api';
import { MoreIcon } from '../icons/BrandLogos';
import { getImageUrl } from '../../utils/apiConfig';
import { useNavigation } from '@react-navigation/native';

// Placeholder logo text examples for brands shown in the image
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
      const response = await getUniqueBrands({ limit: 100 });
      if (response.success && response.data && response.data.length > 0) {
        // Sort brands alphabetically
        const sortedBrands = [...response.data].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        setBrands(sortedBrands);
      } else {
        // If API returns no data, use fallback data to match the image
        setBrands([
          { id: 1, name: 'BYD', slug: 'byd', logo: null },
          { id: 2, name: 'CHANGAN', slug: 'changan', logo: null },
          { id: 3, name: 'CHERY', slug: 'chery', logo: null },
        ]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      // Use fallback data on error to match the image
      setBrands([
        { id: 1, name: 'BYD', slug: 'byd', logo: null },
        { id: 2, name: 'CHANGAN', slug: 'changan', logo: null },
        { id: 3, name: 'CHERY', slug: 'chery', logo: null },
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
    // navigation.navigate('FilteredCars', { brand });
  };

  const navigateToAllBrands = () => {
    navigation.navigate('AllBrands');
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
            <Image 
              source={{ uri: getImageUrl(item.logo) }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : placeholder ? (
            <Text style={[styles.brandLogo, { color: placeholder.color }]}>
              {placeholder.text}
            </Text>
          ) : (
            <Text style={styles.brandInitial}>{formatBrandName(item.name)}</Text>
          )}
        </View>
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
  },
  logoContainer: {
    width: 100,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 10,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  brandInitial: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  brandLogo: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  skeletonLogo: {
    backgroundColor: '#f8f8f8',
  },
});

export default PopularBrands; 