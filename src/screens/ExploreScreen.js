import React, { useState, useEffect, useCallback, Component } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING } from '../utils/constants';
import { getCarList, searchCars, searchCarModels } from '../services/api';
import { extractColorsFromSlug } from '../utils/colorUtils';

// Import our optimized components
import {
  Header,
  SearchBar,
  FilterTabs,
  CarListItem,
  ResultsHeader,
  EmptyState,
} from '../components/explore';

// Create color statistics tracker
const colorStats = {
  totalCarsProcessed: 0,
  carsWithSlug: 0,
  carsWithoutSlug: 0,
  carsWithExtractedColors: 0,
  carsWithNoExtractedColors: 0,
  totalExteriorColors: 0,
  totalInteriorColors: 0,
  exteriorColorFrequency: {},
  interiorColorFrequency: {},
  
  // Reset stats
  reset() {
    this.totalCarsProcessed = 0;
    this.carsWithSlug = 0;
    this.carsWithoutSlug = 0;
    this.carsWithExtractedColors = 0;
    this.carsWithNoExtractedColors = 0;
    this.totalExteriorColors = 0;
    this.totalInteriorColors = 0;
    this.exteriorColorFrequency = {};
    this.interiorColorFrequency = {};
  },
  
  // Track colors for a car
  trackCar(car, exteriorColors, interiorColors) {
    this.totalCarsProcessed++;
    
    if (car.slug) {
      this.carsWithSlug++;
    } else {
      this.carsWithoutSlug++;
      return;
    }
    
    if (exteriorColors.length > 0 || interiorColors.length > 0) {
      this.carsWithExtractedColors++;
    } else {
      this.carsWithNoExtractedColors++;
    }
    
    // Track exterior colors
    this.totalExteriorColors += exteriorColors.length;
    exteriorColors.forEach(color => {
      this.exteriorColorFrequency[color] = (this.exteriorColorFrequency[color] || 0) + 1;
    });
    
    // Track interior colors
    this.totalInteriorColors += interiorColors.length;
    interiorColors.forEach(color => {
      this.interiorColorFrequency[color] = (this.interiorColorFrequency[color] || 0) + 1;
    });
  },
  
  // Print statistics summary
  printSummary() {
    const exteriorColorsSorted = Object.entries(this.exteriorColorFrequency)
      .sort((a, b) => b[1] - a[1]);
    
    const interiorColorsSorted = Object.entries(this.interiorColorFrequency)
      .sort((a, b) => b[1] - a[1]);
    
    console.log('\n🎨 =================== COLOR EXTRACTION SUMMARY ===================');
    console.log(`📊 Total cars processed: ${this.totalCarsProcessed}`);
    console.log(`📊 Cars with slug: ${this.carsWithSlug} (${(this.carsWithSlug / this.totalCarsProcessed * 100).toFixed(1)}%)`);
    console.log(`📊 Cars without slug: ${this.carsWithoutSlug} (${(this.carsWithoutSlug / this.totalCarsProcessed * 100).toFixed(1)}%)`);
    console.log(`📊 Cars with extracted colors: ${this.carsWithExtractedColors} (${(this.carsWithExtractedColors / this.carsWithSlug * 100).toFixed(1)}% of cars with slug)`);
    console.log(`📊 Cars with no extracted colors: ${this.carsWithNoExtractedColors} (${(this.carsWithNoExtractedColors / this.carsWithSlug * 100).toFixed(1)}% of cars with slug)`);
    console.log(`📊 Total exterior colors extracted: ${this.totalExteriorColors}`);
    console.log(`📊 Total interior colors extracted: ${this.totalInteriorColors}`);
    console.log(`📊 Average exterior colors per car: ${(this.totalExteriorColors / this.carsWithSlug).toFixed(2)}`);
    
    console.log('\n📊 EXTERIOR COLORS FREQUENCY:');
    exteriorColorsSorted.forEach(([color, count]) => {
      console.log(`   ${color}: ${count} cars (${(count / this.carsWithSlug * 100).toFixed(1)}%)`);
    });
    
    console.log('\n📊 INTERIOR COLORS FREQUENCY:');
    interiorColorsSorted.forEach(([color, count]) => {
      console.log(`   ${color}: ${count} cars (${(count / this.carsWithSlug * 100).toFixed(1)}%)`);
    });
    
    console.log('🎨 =================================================================\n');
  }
};

// Create an error boundary component to catch any rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CarList rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong displaying the cars.</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => {
              this.setState({ hasError: false });
              this.props.onRetry();
            }}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const ExploreScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [totalCars, setTotalCars] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [filteredBySearch, setFilteredBySearch] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false); // Set default to false to disable pagination
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 100; // Increased page size to show more cars at once
  
  // Add state for filters
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Add state for filtered cars
  const [filteredCars, setFilteredCars] = useState([]);
  const [allCars, setAllCars] = useState([]);

  // Filter categories
  const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'brands', label: 'Brands' },
    { id: 'trims', label: 'Trims' },
    { id: 'priceRange', label: 'Price Range' },
    { id: 'advanced', label: 'Advanced Filters' },
  ];

  // Add state to track when a specific car is being viewed
  const [isViewingSpecificCar, setIsViewingSpecificCar] = useState(false);

  // Add state to show car IDs
  const [showCarIds, setShowCarIds] = useState(false);
  const [carIds, setCarIds] = useState([]);
  const [searchedModels, setSearchedModels] = useState([]);

  // Process any route params with filters or specific car ID
  useEffect(() => {
    if (route.params?.carId) {
      // If a specific car ID is passed, fetch only that car
      console.log(`Fetching specific car with ID: ${route.params.carId}`);
      setIsViewingSpecificCar(true);
      fetchCarById(route.params.carId);
    } else {
      setIsViewingSpecificCar(false);
      if (route.params?.filters) {
        console.log('Received filters from navigation:', route.params.filters);
        
        // Special handling for color filters
        if (route.params?.colorSearch) {
          console.log('🎨 Color search detected with colors:', route.params.filters.colorNames);
          
          // Set any custom header or UI elements for color search
          if (route.params.title) {
            // You could set a custom title for the screen here if needed
            console.log('Setting color search title:', route.params.title);
          }
        }
        
        setAppliedFilters(route.params.filters);
        
        // Update the active filter tab based on the type of filter
        if (route.params.filters.brands && route.params.filters.brands.length > 0) {
          setActiveFilter('brands');
        } else if (route.params.filters.colorFilter) {
          // Set color as the active filter if we're filtering by color
          setActiveFilter('advanced');
        }

        // Preserve search query if it exists when filters are applied
        if (route.params.filters.searchQuery) {
          setSearchQuery(route.params.filters.searchQuery);
        }
      }
    }
  }, [route.params]);

  // Fetch cars from API
  useEffect(() => {
    fetchCars(1); // Always start from page 1 when filters change
  }, [appliedFilters]); // Re-fetch when filters change

  // Debounce search query to avoid too many re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Add search functionality effect - now using debounced query
  useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      // If search is cleared, reset to original filtered results
      if (filteredBySearch) {
        setFilteredBySearch(false);
        fetchCars();
      }
      return;
    }

    // Use API search instead of filtering locally
    performAPISearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Function to perform search via API
  const performAPISearch = async (query) => {
    if (!query || query.trim() === '') return;
    
    setLoading(true);
    setFilteredBySearch(true);
    setCarIds([]); // Reset car IDs
    setSearchedModels([]); // Reset searched models
    
    try {
      // Validate search query
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        console.log('Search query too short, minimum 2 characters required');
        setCars([]);
        setTotalCars(0);
        setHasMoreData(false);
        return;
      }
      
      // First search car models to get model IDs
      console.log(`Searching car models with term: "${trimmedQuery}" using carmodel/list API`);
      
      // Try with a more resilient approach - catch errors at each step
      let modelSearchResults;
      try {
        modelSearchResults = await searchCarModels(trimmedQuery);
      } catch (modelSearchError) {
        console.error('Error searching car models:', modelSearchError);
        modelSearchResults = { success: false, data: [], message: 'Error searching car models' };
      }
      
      if (modelSearchResults.success && modelSearchResults.data && modelSearchResults.data.length > 0) {
        // Log the car model information
        console.log(`Found ${modelSearchResults.data.length} car models matching "${trimmedQuery}"`);
        
        // Save the full model info for display
        setSearchedModels(modelSearchResults.data);
        
        // Extract model IDs from the search results
        const modelIds = modelSearchResults.data.map(model => model.id);
        
        // Store the car model IDs for display
        setCarIds(modelIds);
        
        // Fetch cars using these model IDs
        try {
          await fetchCarsByModelIds(modelIds);
        } catch (fetchCarError) {
          console.error('Error fetching cars by model IDs:', fetchCarError);
          // Show some results even if car fetching fails
          setCars([]);
          setTotalCars(0);
        }
      } 
      // If no car models match or error occurred, try direct car search as fallback
      else {
        console.log(`No car models match for "${trimmedQuery}", trying direct car search...`);
        
        let carSearchResults;
        try {
          carSearchResults = await searchCars(trimmedQuery);
        } catch (carSearchError) {
          console.error('Error searching cars directly:', carSearchError);
          carSearchResults = { success: false, data: [], carIds: [], message: 'Error searching cars' };
        }
        
        if (carSearchResults.success && carSearchResults.data && carSearchResults.data.length > 0) {
          console.log(`Found ${carSearchResults.data.length} cars directly matching "${trimmedQuery}"`);
          
          // Process car data to ensure consistent format
          const processedCars = carSearchResults.data.map(car => processCar(car));
          setCars(processedCars);
          setTotalCars(processedCars.length);
          setHasMoreData(false); // Disable pagination during search
          
          // Store the car IDs
          setCarIds(carSearchResults.carIds || []);
        } else {
          // If server search fails completely, try local filtering as last resort
          console.log(`No results from API search for "${trimmedQuery}", trying local filter`);
          if (cars.length > 0) {
            filterCarsByQuery(trimmedQuery);
          } else {
            // If no cars available locally for filtering, show empty results
            console.log(`No results found for search term "${trimmedQuery}"`);
            setCars([]);
            setTotalCars(0);
            setHasMoreData(false);
          }
        }
      }
    } catch (error) {
      console.error('Error during API search:', error);
      
      // Fall back to empty results but with error message
      setCars([]);
      setTotalCars(0);
      setHasMoreData(false);
      
      // You could also display an error message to the user here
      Alert.alert(
        'Search Error',
        'There was a problem with your search. Please try again later or with a different search term.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars by model IDs
  const fetchCarsByModelIds = async (modelIds) => {
    if (!modelIds || modelIds.length === 0) {
      setCars([]);
      setTotalCars(0);
      return;
    }
    
    try {
      // Create comma-separated list of model IDs
      const modelIdParam = modelIds.join(',');
      
      // Call the API with model IDs using the modelId parameter
      const params = {
        modelId: modelIdParam,
        page: 1,
        limit: 50, // Fetch more cars to ensure we get a good selection
        status: 'published'
      };
      
      console.log(`Fetching cars by model IDs: ${modelIdParam}`);
      const response = await getCarList(params);
      
      if (response && response.data) {
        let carData = [];
        
        // Extract car data from response - similar to fetchCars function
        if (response.data && Array.isArray(response.data)) {
          carData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          carData = response.data.data;
        } else if (response.data && Array.isArray(response.data.cars)) {
          carData = response.data.cars;
        }
        
        console.log(`Found ${carData.length} cars matching model IDs: ${modelIdParam}`);
        
        // Process car data to ensure consistent format
        const processedCars = carData
          .filter(car => car) // Filter out undefined or null items
          .map(car => processCar(car))
          .filter(car => car); // Filter out any null results from processCar
          
        setCars(processedCars);
        setTotalCars(processedCars.length);
        setHasMoreData(false); // Disable pagination during search
      } else {
        console.log(`No cars found for model IDs: ${modelIdParam}`);
        setCars([]);
        setTotalCars(0);
      }
    } catch (error) {
      console.error('Error fetching cars by model IDs:', error);
      setCars([]);
      setTotalCars(0);
    }
  };
  
  // Client-side filtering function as a fallback
  const filterCarsByQuery = (query) => {
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    
    // First filter out any undefined or null cars
    const validCars = cars.filter(car => car && car.id);
      
    const filtered = validCars.filter(car => {
      // Function to safely check if a field contains the search query
      const fieldContainsQuery = (field) => {
        if (!field) return false;
        const cleanField = field.toString().toLowerCase().replace(/[^\w\s]/gi, '');
        return cleanField.includes(cleanQuery);
      };
      
      // Search in slug (both original and cleaned version)
      if (car.slug) {
        // Direct match with original query
        if (car.slug.toLowerCase().includes(query)) return true;
        
        // Match with cleaned query
        const cleanSlug = car.slug.toLowerCase().replace(/[^\w\s]/gi, '');
        if (cleanSlug.includes(cleanQuery)) return true;
      }
      
      // Also search in brand, model, and trim for better UX
      if (fieldContainsQuery(car.brand)) return true;
      if (fieldContainsQuery(car.model)) return true;
      if (fieldContainsQuery(car.trim)) return true;
      if (fieldContainsQuery(car.stockId)) return true;
      if (fieldContainsQuery(car.year)) return true;
      
      // Check in colors and additional info if available
      if (car.extractedColors && car.extractedColors.some(color => fieldContainsQuery(color))) return true;
      if (fieldContainsQuery(car.color)) return true;
      
      return false;
    });
    
    setCars(filtered);
    setTotalCars(filtered.length);
    setHasMoreData(false); // Disable pagination during search
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredBySearch(false);
    fetchCars(1);
  };

  const fetchCars = async (newPage = 1) => {
    // Always set loading to true and clear existing cars when starting a new fetch
    setLoading(true);
    
    if (newPage === 1) {
      setCars([]);
      setFilteredCars([]);
      
      // Reset color statistics when starting a new fetch
      colorStats.reset();
      console.log('🎨 [Color Extraction] Started new fetch - color statistics reset');
    }
    
    setLoadingMore(false); // Ensure loading more indicator is off
    
    try {
      // Check if any filters are applied
      const hasFilters = Object.keys(appliedFilters).length > 0 && 
                        (appliedFilters.brands?.length > 0 || 
                         appliedFilters.models?.length > 0 || 
                         appliedFilters.trims?.length > 0 || 
                         appliedFilters.years?.length > 0 || 
                         (appliedFilters.specifications && Object.keys(appliedFilters.specifications).length > 0));
      
      // Base API parameters
      const params = {
        page: 1, // Always fetch page 1
        limit: 100, // Request a larger number of cars
        status: 'published' // Default to published cars
      };
      
      // Apply filters to API parameters
      if (hasFilters) {
        // Convert brand names to IDs if available
        if (appliedFilters.brands && appliedFilters.brands.length > 0) {
          // For brandId, we need to use comma-separated list of IDs
          if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0) {
            params.brandId = appliedFilters.brandIds.join(',');
          } 
        }
        
        // Convert model names to IDs if available
        if (appliedFilters.models && appliedFilters.models.length > 0) {
          // For modelId, we need to use comma-separated list of IDs
          if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0) {
            params.modelId = appliedFilters.modelIds.join(',');
          }
        }
        
        // Convert trim names to IDs if available
        if (appliedFilters.trims && appliedFilters.trims.length > 0) {
          // For trimId, we need to use comma-separated list of IDs
          if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0) {
            params.trimId = appliedFilters.trimIds.join(',');
          }
        }
        
        // Convert year values to IDs if available
        if (appliedFilters.years && appliedFilters.years.length > 0) {
          // For yearId, we need to use comma-separated list of IDs
          if (appliedFilters.yearIds && appliedFilters.yearIds.length > 0) {
            params.yearId = appliedFilters.yearIds.join(',');
          }
        }
        
        // Other filters like price range
        if (appliedFilters.minPrice) {
          params.minPriceAED = appliedFilters.minPrice;
        }
        if (appliedFilters.maxPrice) {
          params.maxPriceAED = appliedFilters.maxPrice;
        }
      }
      
      console.log(`Fetching cars with API params:`, JSON.stringify(params));
      
      // Get car data from API with filters applied
      const response = await getCarList(params);
      
      // Handle different API response structures
      let carData = [];
      let totalCount = 0;
      
      if (response) {
        // Check for pagination info in the response
        if (response.pagination) {
          totalCount = response.pagination.totalItems || 0;
        } else if (response.data && response.data.pagination) {
          totalCount = response.data.pagination.totalItems || 0;
        }

        // Extract car data from response
        if (response.data && Array.isArray(response.data)) {
          carData = response.data;
          if (!totalCount) totalCount = response.data.length;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          carData = response.data.data;
          if (!totalCount) totalCount = response.data.data.length;
        } else if (response.data && Array.isArray(response.data.cars)) {
          carData = response.data.cars;
          if (!totalCount) totalCount = response.data.cars.length;
          // Check if there's a "total" property
          if (response.data.total) totalCount = response.data.total;
        }
      }
      
      // Process car data to normalize it
      const processedCars = carData
        .filter(car => car) // Filter out undefined or null items
        .map(car => processCar(car))
        .filter(car => car); // Filter out any null results from processCar
      
      // Store all cars
      if (newPage === 1) {
        setAllCars(processedCars);
      } else {
        setAllCars(prev => [...prev, ...processedCars]);
      }
      
      // Apply manual filters for specifications if needed
      let filteredCarsResult = processedCars;
      
      // Apply specifications filtering
      if (hasFilters && appliedFilters.specifications && Object.keys(appliedFilters.specifications).length > 0) {
        // Check if we have the enhanced matchSpecifications function
        if (appliedFilters.matchSpecifications) {
          filteredCarsResult = processedCars.filter(car => appliedFilters.matchSpecifications(car));
                  } else {
          // Use standard filtering
          filteredCarsResult = filterCarsByApiCriteria(processedCars, appliedFilters);
        }
        
        // Log more details on why filtering may have failed
        if (filteredCarsResult.length === 0 && processedCars.length > 0) {
          console.log('No cars matched the filters. Sample car data:', JSON.stringify({
            brand: processedCars[0].brand,
            Brand: processedCars[0].Brand,
            model: processedCars[0].model,
            CarModel: processedCars[0].CarModel,
            trim: processedCars[0].trim,
            Trim: processedCars[0].Trim
          }));
        }
        
        console.log(`After filtering: ${filteredCarsResult.length} cars match the criteria`);
        
        // Set filtered cars state
        if (newPage === 1) {
          setFilteredCars(filteredCarsResult);
        } else {
          setFilteredCars(prev => [...prev, ...filteredCarsResult]);
        }
        
        // Update the display cars
        if (newPage === 1) {
          setCars(filteredCarsResult);
          setPage(1);
        } else {
          setCars(prev => [...prev, ...filteredCarsResult]);
          setPage(newPage);
        }
        
        // Update the total count to reflect filtered results
        setTotalCars(filteredCarsResult.length);
        console.log(`Setting total count for filtered results: ${filteredCarsResult.length}`);
        
        // Determine if there might be more data to load
        const hasMore = newPage * PAGE_SIZE < totalCount && filteredCarsResult.length >= PAGE_SIZE;
        setHasMoreData(hasMore);
      } else {
        // If no filters applied, use all processed cars
        filteredCarsResult = processedCars;
        
        // Set filtered cars state (same as all cars in this case)
        if (newPage === 1) {
          setFilteredCars(filteredCarsResult);
        } else {
          setFilteredCars(prev => [...prev, ...filteredCarsResult]);
        }
        
        // Set car state based on pagination
        if (newPage === 1) {
          setCars(filteredCarsResult);
          // Save the first page result count to help with pagination
          setPage(1);
        } else {
          setCars(prev => [...prev, ...filteredCarsResult]);
          // Update the page number
          setPage(newPage);
        }
        
        // Set the actual total count from API response
        setTotalCars(totalCount);
        console.log(`Setting total cars count from API: ${totalCount}`);
        
        // Determine if there might be more data to load
        // If we know the total from the API and we've loaded less than that, there's more data
        const hasMore = newPage * PAGE_SIZE < totalCount;
        setHasMoreData(hasMore);
      }
      
    } catch (error) {
      console.error('Error fetching cars:', error);
      // Use mock data in case of error
      
      // Set empty states to prevent crashes
      setCars([]);
      setFilteredCars([]);
      setTotalCars(0);
      setHasMoreData(false);
      
    } finally {
      setLoading(false);
      setLoadingMore(false);
      
      // Print color statistics summary
      if (newPage === 1) {
        console.log('🎨 [Color Extraction] Finished processing cars - generating color statistics summary');
        setTimeout(() => {
          colorStats.printSummary();
        }, 500); // Slight delay to ensure all console logs are in order
      }
    }
  };

  // Helper function to process car data into a consistent format
  const processCar = (car) => {
    // Return early if car is undefined or null
    if (!car) {
      console.warn('Attempted to process undefined or null car');
      return null;
    }
    
    // Ensure the car has a valid ID
    if (!car.id) {
      car.id = `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Extract colors from slug if available
    let extractedExteriorColors = [];
    let extractedInteriorColors = [];
    
    if (car.slug) {
      // Extract separate color lists for exterior and interior using our utilities
      extractedExteriorColors = extractColorsFromSlug(car.slug, 'exterior');
      extractedInteriorColors = extractColorsFromSlug(car.slug, 'interior');
      
      // Track colors extracted for each car
      console.log(`🎨 [Color Extraction] Car ID: ${car.id} | Brand/Model: ${car.brand || ''} ${car.model || ''}`);
      console.log(`🎨 [Color Extraction] Slug: "${car.slug}"`);
      console.log(`🎨 [Color Extraction] Exterior colors (${extractedExteriorColors.length}): ${extractedExteriorColors.join(', ') || 'None'}`);
      console.log(`🎨 [Color Extraction] Interior colors (${extractedInteriorColors.length}): ${extractedInteriorColors.join(', ') || 'None'}`);
      
      if (extractedExteriorColors.length > 0 || extractedInteriorColors.length > 0) {
        console.log(`🎨 [Color Extraction] Successfully extracted colors from slug`);
      } else {
        console.log(`🎨 [Color Extraction] No colors detected in slug`);
      }
    } else {
      console.log(`⚠️ Car ${car.id} - No slug available`);
    }
    
    // Track this car in our color statistics
    colorStats.trackCar(car, extractedExteriorColors, extractedInteriorColors);
    
    // Process car images
    let processedImages = [];
    if (car.CarImages && Array.isArray(car.CarImages) && car.CarImages.length > 0) {
      // Sort images by order if available
      const sortedImages = [...car.CarImages].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });
      
      // Process each image to the correct format
      processedImages = sortedImages.map(img => {
        if (img.FileSystem) {
          // Extract image paths
          const imagePath = img.FileSystem.path || img.FileSystem.webpPath || img.FileSystem.thumbnailPath;
          if (imagePath) {
            return {
              uri: `https://cdn.legendmotorsglobal.com${imagePath}`,
              filename: imagePath.split('/').pop(),
              fullPath: imagePath
            };
          }
        }
        return null;
      }).filter(img => img !== null);
    }
    
    // If no images found in CarImages array, use the traditional image property
    if (processedImages.length === 0) {
      const carImage = car.image ? car.image : require('../components/home/car_Image.png');
      processedImages = [carImage];
    }
    
    // Extract brand, model, trim consistently
    const brandName = 
      (car.Brand && car.Brand.name) ||
      (car.brand ? car.brand : 'Unknown Brand');
    
    const modelName = 
      (car.CarModel && car.CarModel.name) ||
      (car.model ? car.model : 'Unknown Model');
    
    const trimName = 
      (car.Trim && car.Trim.name) ||
      (car.trim ? car.trim : '');
    
    // Ensure we have a normalized slug for searching
    let normalizedSlug = car.slug || '';
    
    // If no slug exists but we have brand/model/trim, create a simple one
    if (!normalizedSlug && brandName && modelName) {
      normalizedSlug = `${car.Year?.year || car.year || ''}-${brandName}-${modelName}${trimName ? '-' + trimName : ''}`.toLowerCase().replace(/\s+/g, '-');
    }
    
    return {
      id: car.id,
      stockId: car.stockId || `STOCK-${car.id}`,
      brand: brandName,
      model: modelName,
      trim: trimName,
      year: car.year || (car.Year ? car.Year.year : new Date().getFullYear()),
      price: car.price || 0,
      color: car.color || 'Not specified',
      extractedExteriorColors: extractedExteriorColors, // Add exterior colors
      extractedInteriorColors: extractedInteriorColors, // Add interior colors
      extractedColors: extractedExteriorColors, // Keep for backward compatibility
      slug: normalizedSlug, // Use normalized slug for search
      engineSize: car.engineSize || '',
      fuelType: car.fuelType || 
                (car.SpecificationValues ? 
                  car.SpecificationValues.find(spec => 
                    (spec.specification && spec.specification.key === 'fuel_type') ||
                    (spec.Specification && spec.Specification.key === 'fuel_type')
                  )?.name : 'Unknown'),
      transmission: car.transmission || 
                   (car.SpecificationValues ? 
                     car.SpecificationValues.find(spec => 
                       (spec.specification && spec.specification.key === 'transmission') ||
                       (spec.Specification && spec.Specification.key === 'transmission')
                     )?.name : 'Unknown'),
      type: car.type || 
            (car.SpecificationValues ? 
              car.SpecificationValues.find(spec => 
                (spec.specification && spec.specification.key === 'body_type') ||
                (spec.Specification && spec.Specification.key === 'body_type')
              )?.name : 'Unknown'),
      driveType: car.driveType || 
                (car.SpecificationValues ? 
                  car.SpecificationValues.find(spec => 
                    (spec.specification && spec.specification.key === 'drive_type') ||
                    (spec.Specification && spec.Specification.key === 'drive_type')
                  )?.name : 'FWD'),
      image: processedImages[0], // Keep the original image property for backward compatibility
      images: processedImages, // Add the new images array for the carousel
      inWishlist: car.inWishlist || false,
      // Pass through the original data structure too, for completeness
      Brand: car.Brand,
      CarModel: car.CarModel,
      Trim: car.Trim,
      Year: car.Year,
      CarImages: car.CarImages, // Keep the original car images
      SpecificationValues: car.SpecificationValues
    };
  };

  // Update the loadMoreData function to handle pagination correctly
  const loadMoreData = () => {
    if (loadingMore || !hasMoreData) return;
    
    console.log(`Loading more data, page ${page + 1}`);
    setLoadingMore(true);
    
    // Load the next page
    fetchCars(page + 1);
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
    // Create a callback function that will be properly bound
    const applyFilterCallback = (filters) => {
    // Preserve search query if we're currently searching
    if (searchQuery) {
      filters.searchQuery = searchQuery;
    }
    
    console.log(`Applying filters: ${JSON.stringify(filters, null, 2)}`);
    
    // Additional validation for specifications
    if (filters.specifications) {
      // Check if any specification is not an array and convert it
      Object.keys(filters.specifications).forEach(key => {
        if (!Array.isArray(filters.specifications[key])) {
          filters.specifications[key] = [filters.specifications[key]];
        }
      });
    }
    
    // Save the applied filters to state - this will trigger the useEffect to refetch
    setAppliedFilters(filters);
    
    // For safety, check if we have the enhanced matchSpecifications function
    if (filters.matchSpecifications) {
      console.log('Using enhanced multi-directional filtering with accurate permutation combinations');
      
      // Log the number of cars in each hierarchy
      if (filters.hasBrandFilter) {
        console.log(`⭐ Filter includes ${filters.brands.length} brands: ${filters.brands.join(', ')}`);
      }
      
      if (filters.hasModelFilter) {
        console.log(`⭐ Filter includes ${filters.models.length} models: ${filters.models.join(', ')}`);
      }
      
      if (filters.hasTrimFilter) {
        console.log(`⭐ Filter includes ${filters.trims.length} trims: ${filters.trims.join(', ')}`);
      }
      
      // Log specifications info
      if (filters.specifications) {
        Object.keys(filters.specifications).forEach(key => {
          const values = filters.specifications[key];
          if (values && values.length > 0) {
            console.log(`⭐ Filter includes ${values.length} ${key} specifications: ${values.join(', ')}`);
          }
        });
      }
    }
    
    // Apply the filters immediately if we have cars loaded
      if (allCars && allCars.length > 0) {
      applyFiltersToExistingCars(allCars, filters);
    } else {
      // Otherwise, reset page to 1 and fetch new cars with filters
        setPage(1);
      fetchCars(1);
    }
  };

    // Navigate to FilterScreen with current filters
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: applyFilterCallback, // Use the locally defined function
      // Pass current filters so they can be pre-selected
      currentFilters: appliedFilters
    });
  };

  // Update the function to apply filters to existing cars
  const applyFiltersToExistingCars = (cars, filters) => {
    console.log(`Applying filters to ${cars.length} existing cars...`);
    
    if (!cars || cars.length === 0) {
      setFilteredCars([]);
      setCars([]);
      setTotalCars(0);
      return;
    }
    
    let filteredResults = [];
    
    // Use the enhanced matchSpecifications function if available, otherwise use standard filtering
    if (filters.matchSpecifications) {
      // Apply the multi-directional filtering logic
      filteredResults = cars.filter(car => filters.matchSpecifications(car));
    } else if (filters.colorFilter && filters.matchExtractedColors) {
      // Special handling for color filtering based on slug extraction
      console.log('🎨 Applying color filtering with slug extraction');
      
      filteredResults = cars.filter(car => {
        // Skip cars that don't have a slug
        if (!car.slug) {
          console.log(`⚠️ Car ${car.id} has no slug, skipping color filter`);
          return false;
        }
        
        // Use the matchExtractedColors function to match colors
        const colorMatch = filters.matchExtractedColors(car.slug);
        
        if (colorMatch) {
          console.log(`✅ Car ${car.id} matches color criteria: ${car.slug}`);
        } else {
          console.log(`❌ Car ${car.id} does not match color criteria: ${car.slug}`);
        }
        
        return colorMatch;
      });
      
      console.log(`Found ${filteredResults.length} cars matching color criteria out of ${cars.length} total cars`);
    } else {
      // Fallback to standard filtering
      filteredResults = filterCarsByApiCriteria(cars, filters);
    }
    
    console.log(`After filtering: ${filteredResults.length} cars match the criteria`);
    
    // Update both filtered and display cars
    setFilteredCars(filteredResults);
    setCars(filteredResults);
    setTotalCars(filteredResults.length);
  };
  
  // Add a standard filtering function for backward compatibility
  const filterCarsByApiCriteria = (cars, filters) => {
    // Standard filtering based on explicit criteria
    return cars.filter(car => {
      // Filter by brands
      if (filters.brands && filters.brands.length > 0) {
        if (!car.brand || !filters.brands.some(b => car.brand.toLowerCase().includes(b.toLowerCase()))) {
          return false;
        }
      }
      
      // Filter by models
      if (filters.models && filters.models.length > 0) {
        if (!car.model || !filters.models.some(m => car.model.toLowerCase().includes(m.toLowerCase()))) {
          return false;
        }
      }
      
      // Filter by trims
      if (filters.trims && filters.trims.length > 0) {
        if (!car.trim || !filters.trims.some(t => car.trim.toLowerCase().includes(t.toLowerCase()))) {
          return false;
        }
      }
      
      // Filter by years
      if (filters.years && filters.years.length > 0) {
        if (!car.year || !filters.years.includes(car.year.toString())) {
          return false;
        }
      }
      
      // Filter by specifications
      if (filters.specifications) {
        for (const specKey in filters.specifications) {
          const selectedValues = filters.specifications[specKey];
          if (!selectedValues || selectedValues.length === 0) continue;
          
          // Special handling for color specifications
          if (specKey === 'color') {
            console.log(`🎨 Filtering car ${car.id} by Exterior Color: ${selectedValues.join(', ')}`);
            if (car.slug) {
              console.log(`🔍 Checking slug: "${car.slug}"`);
            }
            
            // Check car specifications if available
            let specMatch = false;
            
            if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                if (spec.Specification && spec.Specification.key === specKey) {
                  return selectedValues.some(selectedValue => 
                    spec.name && selectedValue && 
                    spec.name.toLowerCase() === selectedValue.toLowerCase()
                  );
                }
                return false;
              });
            }
            
            // If no match from specifications, check direct color property
            if (!specMatch && car.color) {
              specMatch = selectedValues.some(selectedValue => 
                car.color.toLowerCase().includes(selectedValue.toLowerCase())
              );
            }
            
            // If still no match, check extracted colors from slug
            if (!specMatch && car.extractedExteriorColors && car.extractedExteriorColors.length > 0) {
              const slugColorMatch = selectedValues.some(selectedValue => 
                car.extractedExteriorColors.some(extractedColor => 
                  extractedColor.toLowerCase().includes(selectedValue.toLowerCase()) ||
                  selectedValue.toLowerCase().includes(extractedColor.toLowerCase())
                )
              );
              
              if (slugColorMatch) {
                console.log(`🎨 Car ${car.id} matches color through extracted colors from slug: ${car.extractedExteriorColors.join(', ')}`);
                specMatch = true;
              }
            }
            
            // If no color match found, exclude the car
            if (!specMatch) {
              console.log(`❌ Car ${car.id} EXCLUDED: does not match exterior color specification`);
              return false;
            }
            
            // Skip to the next specification type since we've handled color
            continue;
          }
          
          // Add special handling for interior color specifications
          if (specKey === 'interior_color') {
            console.log(`🎨 Filtering car ${car.id} by Interior Color: ${selectedValues.join(', ')}`);
            if (car.slug) {
              console.log(`🔍 Checking slug for interior colors: "${car.slug}"`);
            }
            
            // Check car specifications if available
            let specMatch = false;
            
            if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                if (spec.Specification && spec.Specification.key === specKey) {
                  return selectedValues.some(selectedValue => 
                    spec.name && selectedValue && 
                    spec.name.toLowerCase() === selectedValue.toLowerCase()
                  );
                }
                return false;
              });
            }
            
            // If no match from specifications, check direct interiorColor property
            if (!specMatch && car.interiorColor) {
              specMatch = selectedValues.some(selectedValue => 
                car.interiorColor.toLowerCase() === selectedValue.toLowerCase()
              );
            }
            
            // If still no match and we have extracted interior colors from the slug, check those
            if (!specMatch && car.extractedInteriorColors && car.extractedInteriorColors.length > 0) {
              // Check if any extracted interior color matches any selected color
              specMatch = car.extractedInteriorColors.some(extractedColor => {
                const matches = selectedValues.some(selectedValue => 
                  extractedColor.toLowerCase().includes(selectedValue.toLowerCase()) ||
                  selectedValue.toLowerCase().includes(extractedColor.toLowerCase())
                );
                
                if (matches) {
                  console.log(`✅ Match found! "${extractedColor}" matches selected interior color`);
                }
                return matches;
              });
              
              if (specMatch) {
                console.log(`✅ Car ${car.id} matches interior color through extracted colors from slug: ${car.extractedInteriorColors.join(', ')}`);
              }
            }
            
            // If no interior color match found, exclude the car
            if (!specMatch) {
              console.log(`❌ Car ${car.id} EXCLUDED: does not match interior color specification`);
              return false;
            }
            
            // Skip to the next specification type since we've handled interior color
            continue;
          }
          
          // Filter by body type
          if (specKey === 'body_type') {
            console.log(`🚗 Filtering car ${car.id} by Body Type: ${selectedValues.join(', ')}`);
            
            // Check car specifications if available
            let specMatch = false;
            
            if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                const matchesBodyType = 
                  (spec.Specification && spec.Specification.key === 'body_type') ||
                  (spec.specification && spec.specification.key === 'body_type');
                  
                if (!matchesBodyType) return false;
                
                return selectedValues.some(selectedValue => 
                  spec.name && selectedValue && 
                  spec.name.toLowerCase() === selectedValue.toLowerCase()
                );
              });
            }
            
            // If no match from specifications, check type property
            if (!specMatch && car.type) {
              specMatch = selectedValues.some(selectedValue => 
                car.type.toLowerCase().includes(selectedValue.toLowerCase())
              );
            }
            
            // If no body type match found, exclude the car
            if (!specMatch) {
              console.log(`❌ Car ${car.id} EXCLUDED: does not match body type specification`);
              return false;
            }
            
            // Skip to the next specification type since we've handled body type
            continue;
          }
          
          // Filter by fuel type
          if (specKey === 'fuel_type') {
            console.log(`⛽ Filtering car ${car.id} by Fuel Type: ${selectedValues.join(', ')}`);
            
            // Check car specifications if available
            let specMatch = false;
            
            if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                const matchesFuelType = 
                  (spec.Specification && spec.Specification.key === 'fuel_type') ||
                  (spec.specification && spec.specification.key === 'fuel_type');
                  
                if (!matchesFuelType) return false;
                
                return selectedValues.some(selectedValue => 
                  spec.name && selectedValue && 
                  spec.name.toLowerCase() === selectedValue.toLowerCase()
                );
              });
            }
            
            // If no match from specifications, check fuelType property
            if (!specMatch && car.fuelType) {
              specMatch = selectedValues.some(selectedValue => 
                car.fuelType.toLowerCase().includes(selectedValue.toLowerCase())
              );
            }
            
            // If no fuel type match found, exclude the car
            if (!specMatch) {
              console.log(`❌ Car ${car.id} EXCLUDED: does not match fuel type specification`);
              return false;
            }
            
            // Skip to the next specification type since we've handled fuel type
            continue;
          }
          
          // Filter by transmission
          if (specKey === 'transmission') {
            console.log(`🔄 Filtering car ${car.id} by Transmission: ${selectedValues.join(', ')}`);
            
            // Check car specifications if available
            let specMatch = false;
            
            if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                const matchesTransmission = 
                  (spec.Specification && spec.Specification.key === 'transmission') ||
                  (spec.specification && spec.specification.key === 'transmission');
                  
                if (!matchesTransmission) return false;
                
                return selectedValues.some(selectedValue => 
                  spec.name && selectedValue && 
                  spec.name.toLowerCase() === selectedValue.toLowerCase()
                );
              });
            }
            
            // If no match from specifications, check transmission property
            if (!specMatch && car.transmission) {
              specMatch = selectedValues.some(selectedValue => 
                car.transmission.toLowerCase().includes(selectedValue.toLowerCase())
              );
            }
            
            // If no transmission match found, exclude the car
            if (!specMatch) {
              console.log(`❌ Car ${car.id} EXCLUDED: does not match transmission specification`);
              return false;
            }
            
            // Skip to the next specification type since we've handled transmission
            continue;
          }
          
          // Check car specifications if available - using the general approach for other specs
          let specMatch = false;
          if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
            specMatch = car.SpecificationValues.some(spec => {
              // Check for specification key in either uppercase or lowercase property
              const hasUppercaseSpec = spec.Specification && spec.Specification.key === specKey;
              const hasLowercaseSpec = spec.specification && spec.specification.key === specKey;
              
              if (hasUppercaseSpec || hasLowercaseSpec) {
                // Check if the value matches any of our selected values
                return selectedValues.some(selectedValue => {
                  const nameMatches = spec.name && selectedValue && 
                    spec.name.toLowerCase() === selectedValue.toLowerCase();
                  
                  return nameMatches;
                });
              }
              
              return false;
            });
          }
          
          // If no match found for this specification, exclude the car
          if (!specMatch) {
            console.log(`❌ Car ${car.id} EXCLUDED: does not match ${specKey} specification`);
            return false;
          }
        }
      }
      
      // If we got here, the car matches all filters
      return true;
    });
  };

  // Function to fetch a specific car by ID
  const fetchCarById = async (carId) => {
    setLoading(true);
    setCars([]);
    
    try {
      // Call the API with the specific car ID
      const params = {
        id: carId,
        status: 'published'
      };
      
      console.log(`Fetching car by ID with params:`, JSON.stringify(params));
      
      const response = await getCarList(params);
      
      if (response && response.data) {
        let carData = [];
        
        // Extract car data from response - similar to fetchCars function
        if (response.data && Array.isArray(response.data)) {
          carData = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          carData = response.data.data;
        } else if (response.data && Array.isArray(response.data.cars)) {
          carData = response.data.cars;
        }
        
        // Check if we found the car
        if (carData.length > 0) {
          console.log(`Found car with ID ${carId}`);
          // Process the car data to ensure consistent format
          const processedCars = carData
            .filter(car => car) // Filter out undefined or null items
            .map(car => processCar(car))
            .filter(car => car); // Filter out any null results from processCar
            
          setCars(processedCars);
          setTotalCars(processedCars.length);
          setHasMoreData(false);
        } else {
          // If car not found in API, try to use mock data with matching ID
          console.log(`Car with ID ${carId} not found in API, checking mock data`);
          const mockData = generateMockCars(1);
          const mockCar = mockData.data.cars.find(car => String(car.id) === String(carId));
          
          if (mockCar) {
            console.log(`Found mock car with ID ${carId}`);
            const processedMockCar = processCar(mockCar);
            if (processedMockCar) {
            setCars([processedMockCar]);
            setTotalCars(1);
            } else {
              setCars([]);
              setTotalCars(0);
            }
          } else {
            console.log(`Car with ID ${carId} not found in mock data either`);
            setCars([]);
            setTotalCars(0);
          }
        }
      } else {
        console.log(`Failed to get car with ID ${carId}`);
        setCars([]);
        setTotalCars(0);
      }
    } catch (error) {
      console.error(`Error fetching car with ID ${carId}:`, error);
      setCars([]);
      setTotalCars(0);
    } finally {
      setLoading(false);
    }
  };

  // Toggle display of car IDs
  const toggleCarIds = () => {
    setShowCarIds(!showCarIds);
  };

  // Render car ID item
  const renderCarIdItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.carIdItem}
      onPress={() => fetchCarById(item)}
    >
      <Text style={styles.carIdText}>Car ID: {item}</Text>
    </TouchableOpacity>
  );

  // Render car model item
  const renderCarModelItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.carModelItem}
      onPress={() => {
        // Navigate to show only cars with this model ID
        navigation.setParams({ carId: undefined });
        setIsViewingSpecificCar(false);
        fetchCarsByModelIds([item.id]);
      }}
    >
      <Text style={styles.carModelName}>{item.name}</Text>
      <View style={styles.carModelDetails}>
        {item.brand && (
          <Text style={styles.carModelBrand}>
            Brand: {item.brand.name}
          </Text>
        )}
        <Text style={styles.carModelId}>Model ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  // Function to view all cars (back from viewing a specific car)
  const viewAllCars = () => {
    setIsViewingSpecificCar(false);
    navigation.setParams({ carId: undefined });
    // Reset to initial page
    fetchCars(1);
  };
  
  // Check if any filters are applied
  const hasFilters = () => {
    return Object.keys(appliedFilters).length > 0;
  };
  
  // Clear all applied filters
  const clearAllFilters = () => {
    setAppliedFilters({});
    setActiveFilter('all');
    fetchCars(1);
  };
  
  // Handle filter tab selection
  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId);
    
    if (filterId === 'advanced') {
      // Open the filter screen
      handleOpenFilter();
    }
  };
  
  // Render a car item in the list
  const renderCarItem = ({ item }) => {
    // Skip rendering if item is undefined or doesn't have an id
    if (!item || !item.id) {
      console.warn('Attempted to render a car without an id');
      return null;
    }
    
    return (
      <CarListItem 
        car={item} 
        onPress={() => navigation.navigate('CarDetailScreen', { carId: item.id })}
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onShare={() => handleShare(item)}
      />
    );
  };
  
  // Render footer with loading indicator when loading more data
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={{ marginLeft: 10 }}>Loading more cars...</Text>
      </View>
    );
  };

  const retryFetchCars = () => {
    setCars([]);
    fetchCars(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Component */}
      <Header 
        isViewingSpecificCar={isViewingSpecificCar} 
        onBackToAllCars={viewAllCars}
      />
      
      {/* Debug button for color extraction (hidden in production) */}
      {(typeof __DEV__ !== 'undefined' && __DEV__) && (
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            console.log('🎨 [Color Extraction] Manual trigger of color statistics summary');
            colorStats.printSummary();
          }}
        >
          <Text style={styles.debugButtonText}>📊 Show Color Stats</Text>
        </TouchableOpacity>
      )}
      
      {/* Search Bar Component */}
      <SearchBar 
        searchQuery={searchQuery}
        onChangeText={handleSearchChange}
        onClearSearch={clearSearch}
        disabled={isViewingSpecificCar}
      />
      
      {/* Show car models if found during search */}
      {filteredBySearch && searchedModels.length > 0 && (
        <View style={styles.carModelsContainer}>
          <TouchableOpacity 
            style={styles.toggleCarModelsButton}
            onPress={() => setShowCarIds(!showCarIds)}
          >
            <Text style={styles.toggleCarModelsText}>
              {showCarIds ? 'Hide Matching Models' : `Show ${searchedModels.length} Matching Models`}
            </Text>
          </TouchableOpacity>
          
          {showCarIds && (
            <FlatList
              data={searchedModels}
              renderItem={renderCarModelItem}
              keyExtractor={item => `car-model-${item.id}`}
              style={styles.carModelsList}
              horizontal={false}
              ListHeaderComponent={
                <View style={styles.carModelsHeaderContainer}>
                  <Text style={styles.carModelsHeader}>
                    Tap on a car model to see all its cars:
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
      
      {/* Filter Tabs Component - Only show when not viewing a specific car */}
      {!isViewingSpecificCar && (
        <FilterTabs 
          categories={filterCategories}
          activeFilter={activeFilter}
          onSelect={handleFilterSelect}
        />
      )}
      
      {/* Results Header Component */}
      <ResultsHeader 
        totalCars={totalCars}
        searchQuery={debouncedSearchQuery}
        isViewingSpecificCar={isViewingSpecificCar}
        carId={route.params?.carId}
        filteredBySearch={filteredBySearch}
        hasFilters={hasFilters()}
        onClearFilters={clearAllFilters}
      />
      
      {/* Main Car List */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.mainLoader} />
      ) : (
        <ErrorBoundary onRetry={retryFetchCars}>
        <FlatList
            data={(cars || []).filter(car => car && car.id)}
          renderItem={renderCarItem}
            keyExtractor={item => String(item?.id || `empty-${Math.random()}`)}
          contentContainerStyle={styles.carsList}
          showsVerticalScrollIndicator={false}
            onEndReached={hasMoreData ? loadMoreData : null}
            initialNumToRender={50}
            maxToRenderPerBatch={20}
            windowSize={21}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={<EmptyState onClearFilters={clearAllFilters} />}
        />
        </ErrorBoundary>
      )}
    </SafeAreaView>
  );
};

// Retain only the styles that aren't moved to components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
    minHeight: 300,
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
  carModelsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleCarModelsButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  toggleCarModelsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  carModelsList: {
    maxHeight: 300,
  },
  carModelsHeaderContainer: {
    padding: SPACING.sm,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  carModelsHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  carModelItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  carModelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  carModelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  carModelBrand: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  carModelId: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignSelf: 'flex-start',
    margin: SPACING.sm,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ExploreScreen; 