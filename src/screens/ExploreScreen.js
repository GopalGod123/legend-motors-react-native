import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { getCarList } from '../services/api';
import { AuthenticatedImage } from '../components/common';
import FilterScreen from './FilterScreen'; // Import FilterScreen

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [totalCars, setTotalCars] = useState(0);
  const [favorites, setFavorites] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  
  // Add state for filters
  const [appliedFilters, setAppliedFilters] = useState({});

  // Filter categories
  const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'brands', label: 'Brands' },
    { id: 'trims', label: 'Trims' },
    { id: 'priceRange', label: 'Price Range' },
    { id: 'advanced', label: 'Advanced Filters' }, // Add advanced filters option
  ];

  // Fetch cars from API
  useEffect(() => {
    fetchCars();
  }, [appliedFilters]); // Re-fetch when filters change

  const fetchCars = async (newPage = 1) => {
    if (newPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Prepare API parameters with filters
      const params = {
        page: newPage,
        limit: PAGE_SIZE
      };
      
      // Check if any filters are applied before fetching data
      const hasFilters = Object.keys(appliedFilters).length > 0 && 
                        (appliedFilters.brands?.length > 0 || 
                         appliedFilters.models?.length > 0 || 
                         appliedFilters.trims?.length > 0 || 
                         appliedFilters.years?.length > 0 || 
                         (appliedFilters.specifications && Object.keys(appliedFilters.specifications).length > 0));
      
      console.log('Building API params from filters:', JSON.stringify(appliedFilters));
      console.log('Has filters applied:', hasFilters);
      
      // Get car data from API - fetch all cars
      const response = await getCarList(params);
      console.log('API response received, status:', response ? 'success' : 'failed');
      
      // Handle different API response structures
      let carData = [];
      let totalCount = 0;
      
      if (response) {
        // For debugging, log the actual response structure
        console.log('Response structure:', JSON.stringify(response).substring(0, 200));
        
        if (response.data && Array.isArray(response.data)) {
          // Direct array of cars
          carData = response.data;
        } else if (response.data && Array.isArray(response.data.cars)) {
          // { data: { cars: [...] } }
          carData = response.data.cars;
        } else if (response.cars && Array.isArray(response.cars)) {
          // { cars: [...] }
          carData = response.cars;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // { data: { data: [...] } }
          carData = response.data.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data.cars)) {
          // { data: { data: { cars: [...] } } }
          carData = response.data.data.cars;
        } else {
          // Try to find the data in the structure
          console.log('Searching for car data in response...');
          // Look for any array property that might contain cars
          for (const key in response) {
            if (Array.isArray(response[key])) {
              console.log(`Found possible car array in response.${key}`);
              carData = response[key];
              break;
            } else if (response[key] && typeof response[key] === 'object') {
              for (const nestedKey in response[key]) {
                if (Array.isArray(response[key][nestedKey])) {
                  console.log(`Found possible car array in response.${key}.${nestedKey}`);
                  carData = response[key][nestedKey];
                  break;
                }
              }
            }
          }
        }
      }
      
      // Apply filters manually on the client side
      if (hasFilters) {
        console.log(`Applying manual string filters to ${carData.length} cars`);
        
        // Log the first 2 cars to see their structure
        if (carData.length > 0) {
          console.log(`Sample car data - First car Brand: ${JSON.stringify(carData[0].Brand)}`);
        }
        
        const filteredCars = carData.filter(car => {
          // Additional check to ensure critical data exists
          if (!car.Brand || !car.CarModel || !car.Trim || !car.Year) {
            console.log(`Car ${car.id} is missing critical data - skipping`);
            return false;
          }
          
          // Brand filter
          if (appliedFilters.brands && appliedFilters.brands.length > 0) {
            console.log(`Looking for brands: ${JSON.stringify(appliedFilters.brands)}`);
            
            // Check if any of the selected brand matches this car's brand
            const brandMatches = appliedFilters.brands.some(brandValue => {
              // Skip undefined brandValue values
              if (!brandValue) return false;
              
              // Get the brand name - we'll directly use the name that's passed from FilterScreen
              // Instead of relying on an ID-to-name mapping
              const brandNameToMatch = typeof brandValue === 'string' ? 
                                      brandValue : 
                                      brandValue.toString();
              
              if (car.id <= 125) {
                console.log(`Car ${car.id} brand check - Brand ID: ${car.Brand?.id}, Name: "${car.Brand?.name}", Looking for: "${brandNameToMatch}"`);
              }
              
              // Simple name match (case insensitive)
              if (car.Brand && car.Brand.name) {
                if (car.Brand.name.toLowerCase() === brandNameToMatch.toLowerCase()) {
                  console.log(`Found exact brand match for car ${car.id}: ${car.Brand.name}`);
                  return true;
                }
                
                // Also check for partial matches 
                if (car.Brand.name.toLowerCase().includes(brandNameToMatch.toLowerCase()) || 
                    brandNameToMatch.toLowerCase().includes(car.Brand.name.toLowerCase())) {
                  console.log(`Found partial brand match for car ${car.id}: ${car.Brand.name} contains ${brandNameToMatch}`);
                  return true;
                }
              }
              
              // Fallback to direct ID match if brandValue is a number and matches the car's brand ID
              if (typeof brandValue === 'number' && car.Brand && car.Brand.id === brandValue) {
                console.log(`Found brand match by ID for car ${car.id}`);
                return true;
              }
              
              return false;
            });
            
            if (!brandMatches) return false;
          }
          
          // Model filter
          if (appliedFilters.models && appliedFilters.models.length > 0) {
            console.log(`Looking for models: ${JSON.stringify(appliedFilters.models)}`);
            
            // Check if any of the selected models matches this car's model
            const modelMatches = appliedFilters.models.some(modelValue => {
              // Skip undefined values
              if (!modelValue) return false;
              
              // Get the model name to match
              const modelNameToMatch = typeof modelValue === 'string' ? 
                                      modelValue : 
                                      modelValue.toString();
              
              // Simple name match (case insensitive)
              if (car.CarModel && car.CarModel.name) {
                if (car.CarModel.name.toLowerCase() === modelNameToMatch.toLowerCase()) {
                  console.log(`Found exact model match for car ${car.id}: ${car.CarModel.name}`);
                  return true;
                }
                
                // Also check for partial matches 
                if (car.CarModel.name.toLowerCase().includes(modelNameToMatch.toLowerCase()) || 
                    modelNameToMatch.toLowerCase().includes(car.CarModel.name.toLowerCase())) {
                  console.log(`Found partial model match for car ${car.id}: ${car.CarModel.name} contains ${modelNameToMatch}`);
                  return true;
                }
              }
              
              // Fallback to direct ID match if modelValue is a number
              if (typeof modelValue === 'number' && car.CarModel && car.CarModel.id === modelValue) {
                console.log(`Found model match by ID for car ${car.id}`);
                return true;
              }
              
              return false;
            });
            
            if (!modelMatches) return false;
          }
          
          // Trim filter
          if (appliedFilters.trims && appliedFilters.trims.length > 0) {
            console.log(`Looking for trims: ${JSON.stringify(appliedFilters.trims)}`);
            
            // Check if any of the selected trims matches this car's trim
            const trimMatches = appliedFilters.trims.some(trimValue => {
              // Skip undefined values
              if (!trimValue) return false;
              
              // Get the trim name to match
              const trimNameToMatch = typeof trimValue === 'string' ? 
                                      trimValue : 
                                      trimValue.toString();
              
              // Simple name match (case insensitive)
              if (car.Trim && car.Trim.name) {
                if (car.Trim.name.toLowerCase() === trimNameToMatch.toLowerCase()) {
                  console.log(`Found exact trim match for car ${car.id}: ${car.Trim.name}`);
                  return true;
                }
                
                // Also check for partial matches 
                if (car.Trim.name.toLowerCase().includes(trimNameToMatch.toLowerCase()) || 
                    trimNameToMatch.toLowerCase().includes(car.Trim.name.toLowerCase())) {
                  console.log(`Found partial trim match for car ${car.id}: ${car.Trim.name} contains ${trimNameToMatch}`);
                  return true;
                }
              }
              
              // Fallback to direct ID match if trimValue is a number
              if (typeof trimValue === 'number' && car.Trim && car.Trim.id === trimValue) {
                console.log(`Found trim match by ID for car ${car.id}`);
                return true;
              }
              
              return false;
            });
            
            if (!trimMatches) return false;
          }
          
          // Year filter
          if (appliedFilters.years && appliedFilters.years.length > 0) {
            console.log(`Looking for years: ${JSON.stringify(appliedFilters.years)}`);
            
            // Check if any of the selected years matches this car's year
            const yearMatches = appliedFilters.years.some(yearValue => {
              // Skip undefined values
              if (!yearValue) return false;
              
              // For years, we'll match by the actual year value (which could be a number or string)
              if (car.Year && car.Year.year) {
                const carYearStr = car.Year.year.toString();
                const yearValueStr = yearValue.toString();
                
                if (carYearStr === yearValueStr) {
                  console.log(`Found year match for car ${car.id}: ${carYearStr}`);
                  return true;
                }
              }
              
              // Fallback to direct ID match if yearValue is a number
              if (typeof yearValue === 'number' && car.Year && car.Year.id === yearValue) {
                console.log(`Found year match by ID for car ${car.id}`);
                return true;
              }
              
              return false;
            });
            
            if (!yearMatches) return false;
          }
          
          // Filter by specifications
          if (appliedFilters.specifications) {
            for (const [specKey, specValues] of Object.entries(appliedFilters.specifications)) {
              if (specValues && specValues.length > 0) {
                console.log(`Looking for specification ${specKey}: ${JSON.stringify(specValues)}`);
                
                // Find if the car has any matching spec values
                if (!car.SpecificationValues || !Array.isArray(car.SpecificationValues)) {
                  return false;
                }
                
                // Find the spec key in the car's specifications
                const specMatches = car.SpecificationValues.some(specValue => {
                  // Skip null or undefined spec values
                  if (!specValue || !specValue.Specification) return false;
                  
                  // First check if the specification key matches
                  if (specValue.Specification.key !== specKey) return false;
                  
                  // Then check if any of the selected values match by name
                  return specValues.some(selectedValue => {
                    // Skip undefined selected values
                    if (!selectedValue) return false;
                    
                    // Case insensitive name matching
                    if (typeof selectedValue === 'string' && specValue.name) {
                      // Try exact match
                      if (specValue.name.toLowerCase() === selectedValue.toLowerCase()) {
                        console.log(`Found exact spec match for car ${car.id}: ${specKey}=${specValue.name}`);
                        return true;
                      }
                      
                      // Try partial match
                      if (specValue.name.toLowerCase().includes(selectedValue.toLowerCase()) ||
                          selectedValue.toLowerCase().includes(specValue.name.toLowerCase())) {
                        console.log(`Found partial spec match for car ${car.id}: ${specKey}=${specValue.name}`);
                        return true;
                      }
                    }
                    
                    // If selectedValue is a number (ID) and it matches spec ID
                    if (typeof selectedValue === 'number' && specValue.id === selectedValue) {
                      console.log(`Found spec match by ID for car ${car.id}: ${specKey}=${specValue.id}`);
                      return true;
                    }
                    
                    return false;
                  });
                });
                
                if (!specMatches) return false;
              }
            }
          }
          
          // If all filters pass, include this car
          return true;
        });
        
        carData = filteredCars;
        console.log(`Filtered down to ${carData.length} cars after applying filters`);
        
        // Check for issue with brand filter
        if (carData.length === 0 && appliedFilters.brands && appliedFilters.brands.length > 0) {
          console.log(`WARNING: Filter resulted in 0 cars. Brand filter issue?`);
          console.log(`Available brands in data: ${carData.map(car => car.Brand?.id).filter(Boolean).join(', ')}`);
        }
      }
      
      totalCount = carData.length;
      
      if (carData.length > 0) {
        // Transform API data to match our app structure
        const transformedCars = carData.map(car => {
          // Find specifications
          let bodyType = 'SUV';
          let transmission = 'Automatic';
          let fuelType = 'Petrol';
          let steeringSide = 'Left-hand drive';
          let regionalSpec = '';
          
          // Check if SpecificationValues exists and is an array
          if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
            try {
              bodyType = car.SpecificationValues.find(spec => 
                spec.Specification?.key === 'body_type'
              )?.name || bodyType;
              
              transmission = car.SpecificationValues.find(spec => 
                spec.Specification?.key === 'transmission'
              )?.name || transmission;
              
              fuelType = car.SpecificationValues.find(spec => 
                spec.Specification?.key === 'fuel_type'
              )?.name || fuelType;
              
              steeringSide = car.SpecificationValues.find(spec => 
                spec.Specification?.key === 'steering_side'
              )?.name || steeringSide;
              
              regionalSpec = car.SpecificationValues.find(spec => 
                spec.Specification?.key === 'regional_specification'
              )?.name || regionalSpec;
            } catch (err) {
              // Silent error handling to avoid console flooding
            }
          }

          // TEMPORARILY DISABLED: Image extraction from API
          // Always use the default fallback image
          let imageUrl = require('../components/home/car_Image.png');
          
          // Process car color from additionalInfo
          let carColor = 'Not specified';
          try {
            if (car.additionalInfo && car.additionalInfo.includes('inside')) {
              carColor = car.additionalInfo.split("inside")[1]?.trim() || carColor;
            }
          } catch (err) {
            // Silent error handling
          }
          
          return {
            id: car.id?.toString() || Math.random().toString(),
            brand: car.Brand?.name || 'Unknown',
            model: car.CarModel?.name || 'Unknown Model',
            trim: car.Trim?.name || 'Standard',
            color: carColor,
            year: car.Year?.year?.toString() || '2024',
            price: car.price || 0,
            transmission: transmission,
            electric: fuelType === 'Electric',
            fuelType: fuelType,
            driveType: steeringSide,
            origin: regionalSpec,
            image: imageUrl,
            type: bodyType,
            stockId: car.stockId || '',
            slug: car.slug || '',
            engineSize: car.engineSize || null,
            additionalInfo: car.additionalInfo || '',
            inWishlist: car.inWishlist || false
          };
        });
        
        if (newPage === 1) {
          setCars(transformedCars);
        } else {
          setCars(prev => [...prev, ...transformedCars]);
        }
        
        setTotalCars(totalCount);
        setPage(newPage);
        
        // Check if we have more data
        setHasMoreData(transformedCars.length === PAGE_SIZE);
      } else {
        // If no cars found for the current filters, show empty state
        if (newPage === 1) {
          setCars([]);
          setTotalCars(0);
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.error('Error fetching cars with filters:', error);
      // Set empty state for errors with filters
      setCars([]);
      setTotalCars(0);
        setHasMoreData(false);
    } finally {
      if (newPage === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      fetchCars(page + 1);
    }
  };

  const toggleFavorite = (carId) => {
    setFavorites(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else {
        return [...prev, carId];
      }
    });
  };

  const handleShare = async (car) => {
    try {
      await Share.share({
        message: `Check out this ${car.year} ${car.brand} ${car.model} - ${car.trim}!`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Add function to handle opening the filter modal
  const handleOpenFilter = () => {
    // Navigate to FilterScreen instead of showing modal
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: handleFilterApply
    });
  };

  // Update the function to properly apply filters from FilterScreen
  const handleFilterApply = (filters) => {
    console.log('Applying filters to explore screen:', JSON.stringify(filters));
    
    if (filters) {
      // Debug the filter values to make sure we're getting the right IDs
      if (filters.brands) {
        console.log('Selected Brand IDs:', filters.brands);
      }
      if (filters.models) {
        console.log('Selected Model IDs:', filters.models);
      }
      if (filters.trims) {
        console.log('Selected Trim IDs:', filters.trims);
      }
      
      // Save the applied filters to state
      setAppliedFilters(filters);
      
      // Reset to page 1 when applying new filters
      setPage(1);
      
      // Show loading state
      setLoading(true);
      
      // Clear current cars list before fetching filtered results
      setCars([]);
      
      console.log('Filters applied, will refetch car data with filters');
    }
  };

  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId);
    
    // If "All" is selected, clear all filters
    if (filterId === 'all') {
      setAppliedFilters({});
      setPage(1);
      fetchCars(1);
      return;
    }
    
    // If advanced filters is selected, open the filter screen
    if (filterId === 'advanced') {
      handleOpenFilter();
    } else {
      // For other filters, don't clear filters, just keep existing
      // Reset pagination and reload with current filters
    setPage(1);
    fetchCars(1);
    }
  };

  // Render individual car item
  const renderCarItem = ({ item }) => {
    return (
      <View style={[styles.carCard, item.inWishlist && styles.favoriteHighlight]}>
        <AuthenticatedImage 
          source={item.image}
          style={styles.carImage}
          resizeMode="cover"
        />
        
        <View style={styles.carTypeContainer}>
          <Text style={styles.carTypeText}>{item.type}</Text>
        </View>
        
        {item.stockId && (
          <View style={styles.stockIdContainer}>
            <Text style={styles.stockIdText}>ID: {item.stockId}</Text>
          </View>
        )}
        
        <View style={styles.carDetails}>
          <Text style={styles.carTitle}>
            {item.year} {item.brand} {item.model}
          </Text>
          <Text style={styles.carSubtitle}>
            {item.trim} - {item.color}
          </Text>
          
          <View style={styles.specRow}>
            {item.engineSize && (
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>🔧</Text>
                <Text style={styles.specText}>{item.engineSize}L</Text>
              </View>
            )}
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>⚡</Text>
              <Text style={styles.specText}>{item.fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>🔄</Text>
              <Text style={styles.specText}>{item.transmission}</Text>
            </View>
          </View>
          
          <View style={styles.specRow}>
            {item.origin && (
              <View style={styles.originBadge}>
                <Text style={styles.originText}>{item.origin}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.specRow}>
            <Text style={styles.specIcon}>⊙</Text>
            <Text style={styles.driveTypeText}>{item.driveType}</Text>
          </View>
          
          <View style={styles.priceRow}>
            {item.price > 0 ? (
              <Text style={styles.priceText}>$ {(item.price).toLocaleString()}</Text>
            ) : (
              <Text style={styles.priceText}>Price on request</Text>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleFavorite(item.id)}
              >
                <Text style={styles.actionIcon}>
                  {favorites.includes(item.id) || item.inWishlist ? '❤️' : '♡'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShare(item)}
              >
                <Text style={styles.actionIcon}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )};

  // Render footer for FlatList (loading indicator for pagination)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingMoreText}>Loading more cars...</Text>
      </View>
    );
  };

  // Filter tabs at top
  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton
      ]}
      onPress={() => handleFilterSelect(item.id)}
    >
      <Text 
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.activeFilterText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by brand, model..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Advanced Filters</Text>
        
        <FlatList
          horizontal
          data={filterCategories}
          renderItem={renderFilterItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>Total: {totalCars} cars</Text>
        {Object.keys(appliedFilters).length > 0 && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => {
              setAppliedFilters({});
              setPage(1);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.mainLoader} />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.carsList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F8F8F8',
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filtersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  filtersList: {
    paddingVertical: SPACING.xs,
  },
  filterButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: SPACING.sm,
  },
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  carsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  carCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  favoriteHighlight: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  carImage: {
    width: '100%',
    height: 180,
  },
  carTypeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 140, 0, 0.8)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  carTypeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  stockIdContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stockIdText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  carDetails: {
    padding: SPACING.md,
  },
  carTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  carSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  specIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: 4,
  },
  specText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  originBadge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  originText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDark,
  },
  driveTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  priceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
  },
  actionIcon: {
    fontSize: FONT_SIZES.lg,
  },
  mainLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  loadingMoreText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  clearFiltersButton: {
    padding: SPACING.sm,
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.md,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  }
});

export default ExploreScreen; 