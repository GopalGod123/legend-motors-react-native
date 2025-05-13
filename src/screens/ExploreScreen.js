import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Component,
} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import {COLORS, SPACING} from '../utils/constants';
import {getCarList, searchCars, searchCarModels} from '../services/api';
import {extractColorsFromSlug} from '../utils/colorUtils';
import {useAuth} from '../context/AuthContext';
import {useWishlist} from '../context/WishlistContext';
import CarCard from '../components/explore/CarCard';
// Import our optimized components
import {
  Header,
  FilterTabs,
  CarListItem,
  ResultsHeader,
  EmptyState,
} from '../components/explore';

// Import the SearchBar from components/home
import SearchBar from '../components/home/SearchBar';
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import LoginPromptModal from '../components/LoginPromptModal';
import {useLoginPrompt} from '../hooks/useLoginPrompt';

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
      this.exteriorColorFrequency[color] =
        (this.exteriorColorFrequency[color] || 0) + 1;
    });

    // Track interior colors
    this.totalInteriorColors += interiorColors.length;
    interiorColors.forEach(color => {
      this.interiorColorFrequency[color] =
        (this.interiorColorFrequency[color] || 0) + 1;
    });
  },

  // Print statistics summary
  printSummary() {
    const exteriorColorsSorted = Object.entries(
      this.exteriorColorFrequency,
    ).sort((a, b) => b[1] - a[1]);

    const interiorColorsSorted = Object.entries(
      this.interiorColorFrequency,
    ).sort((a, b) => b[1] - a[1]);

    // console.log('\n🎨 =================== COLOR EXTRACTION SUMMARY ===================');
    // console.log(`📊 Total cars processed: ${this.totalCarsProcessed}`);
    // console.log(`📊 Cars with slug: ${this.carsWithSlug} (${(this.carsWithSlug / this.totalCarsProcessed * 100).toFixed(1)}%)`);
    // console.log(`📊 Cars without slug: ${this.carsWithoutSlug} (${(this.carsWithoutSlug / this.totalCarsProcessed * 100).toFixed(1)}%)`);
    // console.log(`📊 Cars with extracted colors: ${this.carsWithExtractedColors} (${(this.carsWithExtractedColors / this.carsWithSlug * 100).toFixed(1)}% of cars with slug)`);
    // console.log(`📊 Cars with no extracted colors: ${this.carsWithNoExtractedColors} (${(this.carsWithNoExtractedColors / this.carsWithSlug * 100).toFixed(1)}% of cars with slug)`);
    // console.log(`📊 Total exterior colors extracted: ${this.totalExteriorColors}`);
    // console.log(`📊 Total interior colors extracted: ${this.totalInteriorColors}`);
    // console.log(`📊 Average exterior colors per car: ${(this.totalExteriorColors / this.carsWithSlug).toFixed(2)}`);

    // console.log('\n📊 EXTERIOR COLORS FREQUENCY:');
    exteriorColorsSorted.forEach(([color, count]) => {
      // console.log(`   ${color}: ${count} cars (${(count / this.carsWithSlug * 100).toFixed(1)}%)`);
    });

    // console.log('\n📊 INTERIOR COLORS FREQUENCY:');
    interiorColorsSorted.forEach(([color, count]) => {
      console.log(
        `   ${color}: ${count} cars (${(
          (count / this.carsWithSlug) *
          100
        ).toFixed(1)}%)`,
      );
    });

    console.log(
      '🎨 =================================================================\n',
    );
  },
};

// Create an error boundary component to catch any rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.error('CarList rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong displaying the cars.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              this.setState({hasError: false});
              this.props.onRetry();
            }}>
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Define the processCar function to normalize car data
const processCar = car => {
  // Handle undefined or null car
  if (!car) return null;

  try {
    // Process CarImages array if available
    let processedImages = [];

    // Check if car has the CarImages array (from API)
    if (
      car.CarImages &&
      Array.isArray(car.CarImages) &&
      car.CarImages.length > 0
    ) {
      processedImages = car.CarImages.map(image => {
        if (image.FileSystem && image.FileSystem.path) {
          return {
            uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.path}`,
            id: image.id,
            type: image.type,
            order: image.order,
            filename: image.FileSystem.path.split('/').pop(),
            fullPath: image.FileSystem.path,
          };
        }
        return null;
      }).filter(img => img !== null);
    }
    // Fallback to other image properties if available
    else if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      processedImages = car.images.map(image => {
        return typeof image === 'string' ? {uri: image} : image;
      });
    } else if (
      car.Images &&
      Array.isArray(car.Images) &&
      car.Images.length > 0
    ) {
      processedImages = car.Images.map(image => {
        return typeof image === 'string' ? {uri: image} : image;
      });
    } else if (car.image) {
      processedImages = [
        typeof car.image === 'string' ? {uri: car.image} : car.image,
      ];
    }

    car.bodyType =
      car?.SpecificationValues?.find(a => a.Specification?.key == 'body_type')
        ?.name ?? 'SUV';
    car.fuelType = car?.SpecificationValues?.find(
      a => a.Specification?.key == 'fuel_type',
    )?.name;
    car.transmissionType = car?.SpecificationValues?.find(
      a => a.Specification?.key == 'transmission',
    )?.name;
    car.steeringType = car?.SpecificationValues?.find(
      a => a.Specification?.key == 'steering',
    )?.name;
    car.region = car?.SpecificationValues?.find(
      a => a.Specification?.key == 'regional_specification',
    )?.name;

    // Create a normalized car object with consistent property names
    const processedCar = {
      ...car,
      id: car.id || car.carId || car.car_id || null,
      brand: car.brand || (car.Brand ? car.Brand.name : null) || null,
      model: car.model || (car.CarModel ? car.CarModel.name : null) || null,
      trim: car.trim || (car.Trim ? car.Trim.name : null) || null,
      year: car.year || car.Year || null,
      price: car.price || car.priceAED || null,
      images: processedImages, // Use our processed images
      color: car.color || car.exteriorColor || null,
      stockId: car.stockId || car.stock_id || null,
      slug: car.slug || null,
    };

    // Extract colors from slug if available
    if (car.slug) {
      try {
        const {exteriorColors, interiorColors} = extractColorsFromSlug(
          car.slug,
        );

        // Track color statistics
        colorStats.trackCar(car, exteriorColors, interiorColors);

        // Add extracted colors to the processed car
        processedCar.extractedExteriorColors = exteriorColors;
        processedCar.extractedInteriorColors = interiorColors;
        processedCar.extractedColors = [...exteriorColors, ...interiorColors];
      } catch (colorError) {
        console.warn(
          `Error extracting colors from slug: ${car.slug}`,
          colorError,
        );
      }
    }

    return processedCar;
  } catch (error) {
    console.error('Error processing car:', error, car);
    return null;
  }
};

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
  const [endMoment, setEndMoment] = useState(false);

  // Add isFirstRender ref at the component level
  const isFirstRender = useRef(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(false); // Set default to false to disable pagination
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10; // Changed to 10 cars per batch to match the API parameter

  // Add state for filters
  const [appliedFilters, setAppliedFilters] = useState({});

  // Add state for filtered cars
  const [filteredCars, setFilteredCars] = useState([]);
  const [allCars, setAllCars] = useState([]);

  // Filter categories
  const filterCategories = [
    {id: 'all', label: 'All'},
    {id: 'brands', label: 'Brands'},
    {id: 'models', label: 'Models'},
    {id: 'trims', label: 'Trims'},
    {id: 'years', label: 'Years'},
  ];

  // Add state to track when a specific car is being viewed
  const [isViewingSpecificCar, setIsViewingSpecificCar] = useState(false);

  // Add state to show car IDs
  const [showCarIds, setShowCarIds] = useState(false);
  const [carIds, setCarIds] = useState([]);
  const [searchedModels, setSearchedModels] = useState([]);

  const {user} = useAuth();
  const {isInWishlist, addItemToWishlist, removeItemFromWishlist} =
    useWishlist();

  // Store references to functions to break circular dependencies
  const functionRef = useRef({
    fetchCars: null,
    performSearch: null,
    resetSearch: null,
  });

  const {isDark, theme} = useTheme();

  // Add the login prompt hook
  const {
    loginModalVisible,
    hideLoginPrompt,
    navigateToLogin,
    checkAuthAndShowPrompt,
  } = useLoginPrompt();

  useEffect(() => {
    if (route.params?.filters) {
      // Completely reset previous filters when new ones are applied
      setAppliedFilters(route.params.filters);

      // Reset other states that might be affected by previous filters
      setActiveFilter(
        route.params.filters.brands && route.params.filters.brands.length > 0
          ? 'brands'
          : 'all',
      );

      // If we have a tag filter, update the active filter tab accordingly
      if (
        route.params.filters.specifications &&
        route.params.filters.specifications.tags
      ) {
        const tagId = route.params.filters.specifications.tags[0];
        if (tagId === 1) setActiveFilter('popular');
        else if (tagId === 2) setActiveFilter('new');
        else if (tagId === 3) setActiveFilter('hot');
      }
    }
    if (route.params?.search) {
      setSearchQuery(route.params.search);
    }
  }, [route.params?.filters, route.params?.search]);

  // Define the fetchCars function first without dependencies
  const fetchCars = useCallback(
    async (newPage = 1, search = '') => {
      // Always set loading to true and clear existing cars when starting a new fetch
      if (newPage === 1) setLoading(true);
      else setLoadingMore(true);

      if (newPage === 1) {
        // Batch these state updates
        setCars([]);
        setFilteredCars([]);

        // Reset color statistics when starting a new fetch
        colorStats.reset();
        console.log(
          '🎨 [Color Extraction] Started new fetch - color statistics reset',
        );
      }

      try {
        // Check if any filters are applied

        // Base API parameters
        let params = {
          page: newPage,
          limit: PAGE_SIZE,
          status: 'published',
        };
        if (search) {
          params.search = search?.toLowerCase();
        }

        if (appliedFilters?.brands && appliedFilters?.brands?.length > 0) {
          if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0) {
            params.brandId = appliedFilters.brandIds.join(',');
          }
        }

        // Convert model names to IDs if available
        if (appliedFilters?.models && appliedFilters?.models?.length > 0) {
          if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0) {
            params.modelId = appliedFilters.modelIds.join(',');
          }
        }

        // Convert trim names to IDs if available
        if (appliedFilters?.trims && appliedFilters?.trims?.length > 0) {
          if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0) {
            params.trimId = appliedFilters.trimIds.join(',');
          }
        }

        // Convert year values to IDs if available
        if (appliedFilters?.years && appliedFilters?.years?.length > 0) {
          if (appliedFilters.yearIds && appliedFilters.yearIds.length > 0) {
            params.yearId = appliedFilters.yearIds.join(',');
          }
        }

        // Other filters like price range
        if (appliedFilters?.minPrice) {
          params.minPriceAED = appliedFilters.minPrice;
        }
        if (appliedFilters?.maxPrice) {
          params.maxPriceAED = appliedFilters.maxPrice;
        }

        // Handle specifications including tags
        if (appliedFilters?.specifications) {
          Object.keys(appliedFilters.specifications).forEach(key => {
            if (appliedFilters.specifications[key].length > 0) {
              // Special handling for tags
              if (key === 'tags') {
                params.tags = appliedFilters.specifications[key].join(',');
              } else {
                params[key] = appliedFilters.specifications[key].join(',');
              }
            }
          });
        }
        if (appliedFilters?.priceRange) {
          params = {
            ...appliedFilters,
            ...appliedFilters.priceRange,
          };
        }
        console.log(`Fetching cars with API params:`, JSON.stringify(params));

        // Get car data from API with filters applied
        const response = await getCarList(params);

        // Handle different API response structures
        let carData = [];
        let totalCount = 0;
        let totalPages = 0;
        let currentPage = newPage;

        if (response) {
          // Extract pagination information
          let pagination = null;

          // Check different response structures for pagination
          if (response.pagination) {
            pagination = response.pagination;
          } else if (response.data && response.data.pagination) {
            pagination = response.data.pagination;
          }

          // Extract pagination details if available
          if (pagination) {
            totalCount = pagination.totalItems || 0;
            totalPages = pagination.totalPages || 0;
            currentPage = pagination.currentPage || newPage;
            console.log(
              `Pagination info: Page ${currentPage} of ${totalPages}, Total items: ${totalCount}`,
            );
          }

          // Extract car data from response
          if (response.data && Array.isArray(response.data)) {
            carData = response.data;
            if (!totalCount) totalCount = response.data.length;
          } else if (
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
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
        const newAllCars =
          newPage === 1 ? processedCars : [...allCars, ...processedCars];

        const hasMore = currentPage < totalPages;
        // Batch all the state updates to avoid multiple re-renders
        setCars([...newAllCars]);
        setAllCars([...newAllCars]);
        setFilteredCars([...newAllCars]);
        setTotalCars(totalCount);
        setHasMoreData(hasMore);
        setPage(newPage);
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
          console.log(
            '🎨 [Color Extraction] Finished processing cars - generating color statistics summary',
          );
          setTimeout(() => {
            colorStats.printSummary();
          }, 500); // Slight delay to ensure all console logs are in order
        }
      }
    },
    [allCars, appliedFilters, filterCarsByApiCriteria, processCar, searchQuery],
  );

  // Store the function in ref for stable reference
  functionRef.current.fetchCars = fetchCars;

  // Update resetSearch to use the ref instead of direct dependency
  const resetSearch = useCallback(() => {
    setPage(1);
    if (functionRef.current.fetchCars) {
      functionRef.current.fetchCars(1);
    }
  }, []);

  // Store resetSearch in ref for stable reference
  functionRef.current.resetSearch = resetSearch;

  // Update clearSearch to use the ref
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredBySearch(false);

    // Directly reset to original data
    const resetToOriginal = async () => {
      setLoading(true);
      try {
        // Reset to first page with original filters
        const params = {
          page: 1,
          limit: 10,
          status: 'published',
        };

        // Apply any existing filters
        if (Object.keys(appliedFilters).length > 0) {
          // Add filter parameters to params (simplified)
        }

        const response = await getCarList(params);

        // Process cars (simplified)
        let carData = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            carData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            carData = response.data.data;
          } else if (Array.isArray(response.data.cars)) {
            carData = response.data.cars;
          }
        }

        const processedCars = carData
          .filter(car => car)
          .map(processCar)
          .filter(car => car);

        // Update state
        setCars(processedCars);
        setFilteredCars(processedCars);
        setAllCars(processedCars);
        setTotalCars(processedCars.length);
        setPage(1);
        setHasMoreData(false);
      } catch (error) {
        console.error('Error clearing search:', error);
      } finally {
        setLoading(false);
      }
    };

    // resetToOriginal();
    functionRef.current.fetchCars(1);
  }, [appliedFilters]);
  const {selectedLanguage} = useCurrencyLanguage();

  // Store the fetchCars function reference to avoid dependency cycles
  useEffect(() => {
    // Reference the processCar function
    const processCarData = processCar;

    // Skip the first render to avoid initial double-fetch
    // if (isFirstRender.current) {
    //   isFirstRender.current = false;
    //   return;
    // }

    // Use a debounce to prevent rapid re-fetching
    // const timeoutId = setTimeout(() => {
    const fetchCarsWithFilters = async () => {
      console.log(
        'Fetching cars with applied filters:',
        JSON.stringify(appliedFilters),
      );

      setLoading(true);

      try {
        // Base API parameters
        let params = {
          page: 1,
          limit: 10,
          status: 'published',
        };
        if (searchQuery) {
          params.search = searchQuery?.toLowerCase();
        }
        // Apply filters if any
        if (Object.keys(appliedFilters).length > 0) {
          // Only apply supported filter parameters to the API call
          if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0) {
            params.brandId = appliedFilters.brandIds.join(',');
          }

          if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0) {
            params.modelId = appliedFilters.modelIds.join(',');
          }

          if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0) {
            params.trimId = appliedFilters.trimIds.join(',');
          }

          if (appliedFilters.yearIds && appliedFilters.yearIds.length > 0) {
            params.yearId = appliedFilters.yearIds.join(',');
          }

          // Handle specifications including tags
          if (appliedFilters.specifications) {
            Object.keys(appliedFilters.specifications).forEach(key => {
              if (appliedFilters.specifications[key].length > 0) {
                // Special handling for tags
                if (key === 'tags') {
                  params.tags = appliedFilters.specifications[key].join(',');
                } else {
                  params[key] = appliedFilters.specifications[key].join(',');
                }
              }
            });
          }
          if (appliedFilters?.priceRange) {
            params = {
              ...params,
              ...appliedFilters.priceRange,
            };
          }
          // Add other API parameters as needed
        }

        console.log('Fetching cars with params:', JSON.stringify(params));
        const response = await getCarList(params);

        // Process response data
        let carData = [];
        let totalCount = 0;

        // Extract car data from response
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            carData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            carData = response.data.data;
          } else if (Array.isArray(response.data.cars)) {
            carData = response.data.cars;
          }

          // Get total count
          if (response.pagination) {
            totalCount = response.pagination.totalItems || carData.length;
          } else if (response.data && response.data.pagination) {
            totalCount = response.data.pagination.totalItems || carData.length;
          } else if (response.data && response.data.total) {
            totalCount = response.data.total;
          } else {
            totalCount = carData.length;
          }
        }
        console.log('carData', carData);
        // Process cars using the referenced function
        const processedCars = carData
          .filter(car => car)
          .map(processCarData)
          .filter(car => car);

        console.log(`Processed ${processedCars.length} cars from API response`);

        // Batch state updates to prevent multiple renders
        setCars(processedCars);
        setFilteredCars(processedCars);
        setAllCars(processedCars);
        setTotalCars(totalCount);
        setPage(1);
        setHasMoreData(processedCars.length < totalCount);
      } catch (error) {
        console.error('Error fetching cars:', error);
        setCars([]);
        setFilteredCars([]);
        setAllCars([]);
        setTotalCars(0);
        setHasMoreData(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    // Call the function
    fetchCarsWithFilters();
    // }, 300); // 300ms debounce

    // return () => clearTimeout(timeoutId);
  }, [appliedFilters, processCar, selectedLanguage]); // Add processCar to dependencies

  // Fetch cars by model IDs
  const fetchCarsByModelIds = async modelIds => {
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
        limit: PAGE_SIZE, // Use PAGE_SIZE constant for consistency
        status: 'published',
      };

      console.log(`Fetching cars by model IDs: ${modelIdParam}`);
      const response = await getCarList(params);

      if (response && response.data) {
        let carData = [];

        // Extract car data from response - similar to fetchCars function
        if (response.data && Array.isArray(response.data)) {
          carData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          carData = response.data.data;
        } else if (response.data && Array.isArray(response.data.cars)) {
          carData = response.data.cars;
        }

        console.log(
          `Found ${carData.length} cars matching model IDs: ${modelIdParam}`,
        );

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

  const handleSearchChange = useCallback(text => {
    if (text) {
      setSearchQuery(text);
      functionRef.current.fetchCars(1, text);
    } else {
      setSearchQuery('');
      clearSearch();
    }
  }, []);

  const toggleFavorite = async carId => {
    // Check if user is authenticated first
    const isAuthorized = await checkAuthAndShowPrompt();
    if (!isAuthorized) {
      return; // Stop here if user is not authenticated
    }

    try {
      let result;
      if (isInWishlist(carId)) {
        result = await removeItemFromWishlist(carId);
        if (result.success) {
          console.log(`Removed car ${carId} from wishlist`);
        }
      } else {
        result = await addItemToWishlist(carId);
        if (result.success) {
          console.log(`Added car ${carId} to wishlist`);
        }
      }

      // If operation failed but not because of auth (since we already checked auth)
      if (!result.success && !result.requiresAuth) {
        console.error('Wishlist operation failed');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async car => {
    try {
      await Share.share({
        message: `Check out this ${car.year} ${car.brand} ${car.model} - ${car.trim}!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Add a standard filtering function for backward compatibility
  const filterCarsByApiCriteria = useCallback((cars, filters) => {
    // Standard filtering based on explicit criteria
    return cars.filter(car => {
      // Filter by brands
      if (filters.brands && filters.brands.length > 0) {
        if (
          !car.brand ||
          !filters.brands.some(b =>
            car.brand.toLowerCase().includes(b.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      // Filter by models
      if (filters.models && filters.models.length > 0) {
        if (
          !car.model ||
          !filters.models.some(m =>
            car.model.toLowerCase().includes(m.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      // Filter by trims
      if (filters.trims && filters.trims.length > 0) {
        if (
          !car.trim ||
          !filters.trims.some(t =>
            car.trim.toLowerCase().includes(t.toLowerCase()),
          )
        ) {
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
            console.log(
              `🎨 Filtering car ${
                car.id
              } by Exterior Color: ${selectedValues.join(', ')}`,
            );
            if (car.slug) {
              console.log(`🔍 Checking slug: "${car.slug}"`);
            }

            // Check car specifications if available
            let specMatch = false;

            if (
              car.SpecificationValues &&
              Array.isArray(car.SpecificationValues)
            ) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if this spec matches our key
                if (spec.Specification && spec.Specification.key === specKey) {
                  return selectedValues.some(
                    selectedValue =>
                      spec.name &&
                      selectedValue &&
                      spec.name.toLowerCase() === selectedValue.toLowerCase(),
                  );
                }
                return false;
              });
            }

            // If no match from specifications, check direct color property
            if (!specMatch && car.color) {
              specMatch = selectedValues.some(selectedValue =>
                car.color.toLowerCase().includes(selectedValue.toLowerCase()),
              );
            }

            // If still no match, check extracted colors from slug
            if (
              !specMatch &&
              car.extractedExteriorColors &&
              car.extractedExteriorColors.length > 0
            ) {
              const slugColorMatch = selectedValues.some(selectedValue =>
                car.extractedExteriorColors.some(
                  extractedColor =>
                    extractedColor
                      .toLowerCase()
                      .includes(selectedValue.toLowerCase()) ||
                    selectedValue
                      .toLowerCase()
                      .includes(extractedColor.toLowerCase()),
                ),
              );

              if (slugColorMatch) {
                console.log(
                  `🎨 Car ${
                    car.id
                  } matches color through extracted colors from slug: ${car.extractedExteriorColors.join(
                    ', ',
                  )}`,
                );
                specMatch = true;
              }
            }

            // If no color match found, exclude the car
            if (!specMatch) {
              console.log(
                `❌ Car ${car.id} EXCLUDED: does not match exterior color specification`,
              );
              return false;
            }

            // Skip to the next specification type since we've handled color
            continue;
          }

          // Rest of the function...
          // ... (keeping all the other filter logic)
        }
      }

      // If we got here, the car matches all filters
      return true;
    });
  }, []);

  // Add a function to handle filter apply from the SearchBar
  const handleSearchBarFilterApply = useCallback(filters => {
    console.log(
      `Applying filters from SearchBar: ${JSON.stringify(filters, null, 2)}`,
    );

    // Preserve search query if we're currently searching
    if (searchQuery) {
      filters.search = searchQuery;
    }

    // Additional validation for specifications
    if (filters.specifications) {
      // Check if any specification is not an array and convert it
      Object.keys(filters.specifications).forEach(key => {
        if (!Array.isArray(filters.specifications[key])) {
          filters.specifications[key] = [filters.specifications[key]];
        }
      });
    }

    setAppliedFilters(filters);
  }, []);

  // Add function to handle opening the filter modal
  const handleOpenFilter = useCallback(
    filterId => {
      // Navigate to FilterScreen with current filters
      navigation.navigate('FilterScreen', {
        filterType: ['all', 'advanced'].includes(filterId)
          ? 'brands'
          : filterId,
        // Use a callback that sets applied filters directly
        onApplyCallback: newFilters => {
          // Update filters state
          setAppliedFilters(newFilters);

          // The useEffect hook will automatically trigger a fetch with new filters
        },
        currentFilters: appliedFilters,
      });
    },
    [navigation, appliedFilters],
  );

  // Function to fetch a specific car by ID
  const fetchCarById = async carId => {
    // Reference the processCar function to avoid scope issues
    const processCarData = processCar;

    setLoading(true);
    setCars([]);

    try {
      // Call the API with the specific car ID
      const params = {
        id: carId,
        status: 'published',
      };

      console.log(`Fetching car by ID with params:`, JSON.stringify(params));

      const response = await getCarList(params);

      if (response && response.data) {
        let carData = [];

        // Extract car data from response - similar to fetchCars function
        if (response.data && Array.isArray(response.data)) {
          carData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
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
            .map(processCarData) // Use the referenced function
            .filter(car => car); // Filter out any null results from processCar

          setCars(processedCars);
          setTotalCars(processedCars.length);
          setHasMoreData(false);
        } else {
          // If car not found in API, handle gracefully
          console.log(`Car with ID ${carId} not found in API`);
          setCars([]);
          setTotalCars(0);
          setHasMoreData(false);
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

  // Render car model item
  const renderCarModelItem = ({item}) => (
    <TouchableOpacity
      style={styles.carModelItem}
      onPress={() => {
        // Navigate to show only cars with this model ID
        navigation.setParams({carId: undefined});
        setIsViewingSpecificCar(false);
        fetchCarsByModelIds([item.id]);
      }}>
      <Text style={styles.carModelName}>{item.name}</Text>
      <View style={styles.carModelDetails}>
        {item.brand && (
          <Text style={styles.carModelBrand}>Brand: {item.brand.name}</Text>
        )}
        <Text style={styles.carModelId}>Model ID: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  // Function to view all cars (back from viewing a specific car)
  const viewAllCars = () => {
    setIsViewingSpecificCar(false);
    navigation.setParams({carId: undefined});
    // Reset to initial page
    functionRef.current.fetchCars(1);
  };

  // Check if any filters are applied
  const hasFilters = () => {
    return Object.keys(appliedFilters).length > 0;
  };

  // Clear all applied filters
  const clearAllFilters = () => {
    setAppliedFilters({});
    setActiveFilter('all');
    setSearchQuery('');
    functionRef.current.fetchCars(1);
    navigation.setParams({filters: undefined});
  };

  // Handle filter tab selection
  const handleFilterSelect = filterId => {
    setActiveFilter(filterId);

    // Handle "All" filter specially
    if (filterId === 'all') {
      // Clear all filters and fetch all cars
      clearAllFilters();
      return;
    }

    // Open the filter screen for other filter types
    setTimeout(() => {
      handleOpenFilter(filterId);
    }, 100);
  };

  // Render a car item in the list
  const renderCarItem = ({item}) => {
    // Skip rendering if item is undefined or doesn't have an id
    if (!item || !item.id) {
      console.warn('Attempted to render a car without an id');
      return null;
    }
    return (
      <CarCard
        item={item}
        onPress={() => navigation.navigate('CarDetailScreen', {carId: item.id})}
        toggleFavorite={toggleFavorite}
        shareCar={() => handleShare(item)}
        isFavorite={isInWishlist(item.id)}
      />
    );
    // return (
    //   <CarListItem
    //     car={item}
    //     onPress={() => navigation.navigate('CarDetailScreen', {carId: item.id})}
    //     onToggleFavorite={toggleFavorite}
    //     onShare={() => handleShare(item)}
    //   />
    // );
  };

  // Render footer with loading indicator when loading more data
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.footerLoaderText}>Loading more cars...</Text>
      </View>
    );
  };

  const retryFetchCars = () => {
    setCars([]);
    functionRef.current.fetchCars(1);
  };

  // Add search functionality effect with debounced query
  useEffect(() => {
    // Reference the processCar function
    const processCarData = processCar;

    // Skip if no search query or if this is the first render
    if (isFirstRender.current || debouncedSearchQuery.trim() === '') {
      // If clearing search but we were previously filtered, reset data
      if (
        isFirstRender.current === false &&
        filteredBySearch &&
        debouncedSearchQuery.trim() === ''
      ) {
        setFilteredBySearch(false);

        // Use the debounce to avoid immediate re-fetch
        const resetTimeoutId = setTimeout(() => {
          setLoading(true);
          // Fetch cars with current filters
          const resetParams = {
            page: 1,
            limit: 100,
            status: 'published',
          };

          // Apply existing filters
          if (Object.keys(appliedFilters).length > 0) {
            if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0) {
              resetParams.brandId = appliedFilters.brandIds.join(',');
            }
            // Add other filter parameters...
          }

          getCarList(resetParams)
            .then(response => {
              // Process response
              let carData = [];
              if (response && response.data) {
                if (Array.isArray(response.data)) {
                  carData = response.data;
                } else if (
                  response.data.data &&
                  Array.isArray(response.data.data)
                ) {
                  carData = response.data.data;
                } else if (Array.isArray(response.data.cars)) {
                  carData = response.data.cars;
                }
              }

              // Process cars using the referenced function
              const processedCars = carData
                .filter(car => car)
                .map(processCarData)
                .filter(car => car);

              // Update state in one batch
              setCars(processedCars);
              setFilteredCars(processedCars);
              setAllCars(processedCars);
              setTotalCars(processedCars.length);
              setPage(1);
              setHasMoreData(false);
              setLoading(false);
            })
            .catch(err => {
              console.error('Error resetting search:', err);
              setLoading(false);
            });
        }, 300);

        return () => clearTimeout(resetTimeoutId);
      }
      return;
    }

    // If we have a search query, use debouncing for better UX
    const searchTimeoutId = setTimeout(() => {
      // Perform search
      setLoading(true);
      setFilteredBySearch(true);
      setCarIds([]);
      setSearchedModels([]);

      try {
        // Validate query
        const trimmedQuery = debouncedSearchQuery.trim();
        if (trimmedQuery.length < 2) {
          console.log('Search query too short, minimum 2 characters required');
          setCars([]);
          setTotalCars(0);
          setHasMoreData(false);
          setLoading(false);
          return;
        }

        // Search API can continue as before...
        console.log(`Performing search with query: "${trimmedQuery}"`);

        // Rest of the search implementation...
        searchCarModels(trimmedQuery)
          .then(modelSearchResults => {
            // Process search results as before
            if (
              modelSearchResults.success &&
              modelSearchResults.data &&
              modelSearchResults.data.length > 0
            ) {
              // Process model results
              setSearchedModels(modelSearchResults.data);

              // Extract IDs
              const modelIds = modelSearchResults.data.map(model => model.id);
              setCarIds(modelIds);

              // Continue with existing search logic - use the modelIds to fetch cars
              const params = {
                modelId: modelIds.join(','),
                page: 1,
                limit: 50,
                status: 'published',
              };

              // Fetch cars using the model IDs
              getCarList(params)
                .then(response => {
                  let carData = [];
                  if (response && response.data) {
                    if (Array.isArray(response.data)) {
                      carData = response.data;
                    } else if (
                      response.data.data &&
                      Array.isArray(response.data.data)
                    ) {
                      carData = response.data.data;
                    } else if (Array.isArray(response.data.cars)) {
                      carData = response.data.cars;
                    }
                  }

                  // Process cars using the referenced function
                  const processedCars = carData
                    .filter(car => car)
                    .map(processCarData)
                    .filter(car => car);

                  // Update state
                  setCars(processedCars);
                  setTotalCars(processedCars.length);
                  setHasMoreData(false);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error fetching cars for models:', err);
                  setCars([]);
                  setTotalCars(0);
                  setHasMoreData(false);
                  setLoading(false);
                });
            } else {
              console.log('Falling back to direct car search');
              // Fall back to direct search
              searchCars(trimmedQuery)
                .then(carSearchResults => {
                  if (
                    carSearchResults.success &&
                    carSearchResults.data &&
                    carSearchResults.data.length > 0
                  ) {
                    const processedCars = carSearchResults.data
                      .filter(car => car)
                      .map(processCarData)
                      .filter(car => car);

                    setCars(processedCars);
                    setTotalCars(processedCars.length);
                    setHasMoreData(false);
                    setLoading(false);
                  } else {
                    setCars([]);
                    setTotalCars(0);
                    setHasMoreData(false);
                    setLoading(false);
                  }
                })
                .catch(err => {
                  console.error('Error searching cars directly:', err);
                  setCars([]);
                  setTotalCars(0);
                  setHasMoreData(false);
                  setLoading(false);
                });
            }
          })
          .catch(err => {
            console.error('Search error:', err);
            setCars([]);
            setTotalCars(0);
            setHasMoreData(false);
            setLoading(false);
          });
      } catch (error) {
        console.error('Error in search:', error);
        setLoading(false);
      }
    }, 500); // Longer debounce for search

    return () => clearTimeout(searchTimeoutId);
  }, [debouncedSearchQuery, filteredBySearch, appliedFilters, processCar]); // Add processCar to dependencies

  // Replace the loadMoreData function to use direct approach
  const loadMoreData = useCallback(() => {
    if (loadingMore || !hasMoreData) return;

    // Calculate the next page
    const nextPage = page + 1;
    console.log(`Loading more data, page ${nextPage}`, searchQuery);

    // Use the fetchCars function to load the next page
    setLoadingMore(true);
    functionRef.current.fetchCars(nextPage, searchQuery);
  }, [page, loadingMore, hasMoreData, functionRef]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#2D2D2D' : themeColors[theme].background}
      />

      {/* Header Component */}
      <Header
        isViewingSpecificCar={isViewingSpecificCar}
        onBackToAllCars={viewAllCars}
      />

      {/* Replace the old SearchBar component with the imported one */}
      <SearchBar
        searchQuery={searchQuery}
        onSearch={handleSearchChange}
        onClearSearch={clearSearch}
        disabled={isViewingSpecificCar}
        onApplyFilters={handleSearchBarFilterApply}
        currentFilters={appliedFilters}
      />

      {/* Show car models if found during search */}
      {filteredBySearch && searchedModels.length > 0 && (
        <View style={styles.carModelsContainer}>
          <TouchableOpacity
            style={styles.toggleCarModelsButton}
            onPress={() => setShowCarIds(!showCarIds)}>
            <Text style={styles.toggleCarModelsText}>
              {showCarIds
                ? 'Hide Matching Models'
                : `Show ${searchedModels.length} Matching Models`}
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

      {/* Results Header Component */}
      <ResultsHeader
        totalCars={totalCars}
        searchQuery={searchQuery}
        isViewingSpecificCar={isViewingSpecificCar}
        carId={route.params?.carId}
        filteredBySearch={searchQuery}
        hasFilters={hasFilters()}
        onClearFilters={clearAllFilters}
      />

      {/* Filter Tabs Component - Only show when not viewing a specific car */}
      {!isViewingSpecificCar && (
        <FilterTabs
          categories={filterCategories}
          activeFilter={activeFilter}
          onSelect={handleFilterSelect}
        />
      )}

      {/* Main Car List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.mainLoader}
        />
      ) : (
        <ErrorBoundary onRetry={retryFetchCars}>
          <FlatList
            data={(cars || []).filter(car => car && car.id)}
            renderItem={renderCarItem}
            keyExtractor={item => String(item?.id || `empty-${Math.random()}`)}
            contentContainerStyle={styles.carsList}
            showsVerticalScrollIndicator={false}
            onMomentumScrollBegin={() => setEndMoment(false)}
            onEndReached={() => {
              if (!endMoment) {
                setEndMoment(true);
                if (hasMoreData) loadMoreData();
              }
            }}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={21}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <EmptyState
                onClearFilters={clearAllFilters}
                brandName={
                  appliedFilters?.brands && appliedFilters.brands.length > 0
                    ? appliedFilters.brands[0]
                    : null
                }
              />
            }
          />
        </ErrorBoundary>
      )}

      {/* Add the LoginPromptModal */}
      <LoginPromptModal
        visible={loginModalVisible}
        onClose={hideLoginPrompt}
        onLoginPress={navigateToLogin}
      />
    </SafeAreaView>
  );
};

// Retain only the styles that aren't moved to components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18, // Default color, will be overridden
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
    marginVertical: SPACING.lg,
  },
  footerLoaderText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
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
    shadowOffset: {width: 0, height: 1},
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
});

export default ExploreScreen;
