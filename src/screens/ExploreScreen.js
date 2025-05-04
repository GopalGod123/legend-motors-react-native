import React, { useState, useEffect, useCallback, Fragment } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { getCarList, searchCars, searchCarModels } from '../services/api';
import { CarImage } from '../components/common';
import FilterScreen from './FilterScreen'; // Import FilterScreen

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
        setAppliedFilters(route.params.filters);
        
        // Update the active filter tab based on the type of filter
        if (route.params.filters.brands && route.params.filters.brands.length > 0) {
          setActiveFilter('brands');
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
      // First search car models to get model IDs - this is the main API search method
      console.log(`Searching car models with term: "${query}" using carmodel/list API`);
      const modelSearchResults = await searchCarModels(query);
      
      if (modelSearchResults.success && modelSearchResults.data.length > 0) {
        // Log the car model information
        console.log(`Found ${modelSearchResults.data.length} car models matching "${query}"`);
        modelSearchResults.data.forEach(model => {
          console.log(`Model: ${model.name}, ID: ${model.id}, Brand: ${model.brand?.name || 'Unknown'}`);
        });
        
        // Save the full model info for display
        setSearchedModels(modelSearchResults.data);
        
        // Extract model IDs from the search results
        const modelIds = modelSearchResults.data.map(model => model.id);
        
        // Store the car model IDs for display
        setCarIds(modelIds);
        
        // Fetch cars using these model IDs
        await fetchCarsByModelIds(modelIds);
      } 
      // If no car models match, try direct car search as fallback
      else {
        console.log(`No car models match for "${query}", trying direct car search...`);
        const carSearchResults = await searchCars(query);
        
        if (carSearchResults.success && carSearchResults.data.length > 0) {
          console.log(`Found ${carSearchResults.data.length} cars directly matching "${query}"`);
          
          // Process car data to ensure consistent format
          const processedCars = carSearchResults.data.map(car => processCar(car));
          setCars(processedCars);
          setTotalCars(processedCars.length);
          setHasMoreData(false); // Disable pagination during search
          
          // Store the car IDs
          setCarIds(carSearchResults.carIds);
        } else {
          // If no results from either search, show empty results
          console.log(`No results found for search term "${query}"`);
          setCars([]);
          setTotalCars(0);
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.error('Error during API search:', error);
      // Fall back to empty results
      setCars([]);
      setTotalCars(0);
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
        const processedCars = carData.map(car => processCar(car));
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
    
    const filtered = cars.filter(car => {
      // Skip if car data is invalid
      if (!car) return false;
      
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
      if (fieldContainsQuery(car.additionalInfo)) return true;
      
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
    if (newPage === 1) {
      setLoading(true);
      // Clear existing cars when starting a new filter query
      setCars([]);
    } else {
      setLoadingMore(true);
    }
    
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
        page: newPage,
        limit: PAGE_SIZE,
        status: 'published' // Default to published cars
      };
      
      // Apply filters to API parameters according to Swagger documentation
      if (hasFilters) {
        // Convert brand names to IDs if available
        if (appliedFilters.brands && appliedFilters.brands.length > 0) {
          // For brandId, we need to use comma-separated list of IDs
          // If we have the ID directly
          if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0) {
            params.brandId = appliedFilters.brandIds.join(',');
          } 
          // Log what we're sending to API
          console.log('Sending brand filter to API:', params.brandId || 'using client-side filtering');
        }
        
        // Convert model names to IDs if available
        if (appliedFilters.models && appliedFilters.models.length > 0) {
          // For modelId, we need to use comma-separated list of IDs
          if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0) {
            params.modelId = appliedFilters.modelIds.join(',');
          }
          // Log what we're sending to API
          console.log('Sending model filter to API:', params.modelId || 'using client-side filtering');
        }
        
        // Convert trim names to IDs if available
        if (appliedFilters.trims && appliedFilters.trims.length > 0) {
          // For trimId, we need to use comma-separated list of IDs
          if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0) {
            params.trimId = appliedFilters.trimIds.join(',');
          }
          // Log what we're sending to API
          console.log('Sending trim filter to API:', params.trimId || 'using client-side filtering');
        }
        
        // Convert year values to IDs if available
        if (appliedFilters.years && appliedFilters.years.length > 0) {
          // For yearId, we need to use comma-separated list of IDs
          if (appliedFilters.yearIds && appliedFilters.yearIds.length > 0) {
            params.yearId = appliedFilters.yearIds.join(',');
          }
          // Log what we're sending to API
          console.log('Sending year filter to API:', params.yearId || 'using client-side filtering');
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
      console.log('API response received, status:', response ? 'success' : 'failed');
      
      // Add this block to log the original API response structure
      console.log('API response structure:', Object.keys(response || {}).join(', '));
      if (response && response.data) {
        console.log('API data structure:', Object.keys(response.data).join(', '));
      }
      
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
          // Format: { data: [...cars] }
          carData = response.data;
          console.log('Found cars in response.data array');
          if (!totalCount) totalCount = response.data.length;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Format: { data: { data: [...cars] } }
          carData = response.data.data;
          console.log('Found cars in response.data.data array');
          if (!totalCount) totalCount = response.data.data.length;
        } else if (response.data && Array.isArray(response.data.cars)) {
          // Format: { data: { cars: [...] } }
          carData = response.data.cars;
          console.log('Found cars in response.data.cars array');
          if (!totalCount) totalCount = response.data.cars.length;
          // Check if there's a "total" property
          if (response.data.total) totalCount = response.data.total;
        } else if (response.data) {
          // Try to iterate through response.data to find car objects
          console.log('Searching for cars in response.data object properties');
          
          // Look at each property in data to find something that looks like a car array
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              // Check if this array contains objects that look like cars
              const possibleCars = response.data[key];
              if (possibleCars.length > 0 && 
                  (possibleCars[0].Brand || 
                   possibleCars[0].brand || 
                   possibleCars[0].CarModel || 
                   possibleCars[0].model)) {
                console.log(`Found car-like objects in response.data.${key}`);
                carData = possibleCars;
                if (!totalCount) totalCount = possibleCars.length;
                break;
              }
            }
          }
        } else {
          // Try other possible structures
          console.log('Searching for cars in response root object properties');
          for (const key in response) {
            if (Array.isArray(response[key])) {
              // Check if this array contains objects that look like cars
              const possibleCars = response[key];
              if (possibleCars.length > 0 && 
                  (possibleCars[0].Brand || 
                   possibleCars[0].brand || 
                   possibleCars[0].CarModel || 
                   possibleCars[0].model)) {
                console.log(`Found car-like objects in response.${key}`);
                carData = possibleCars;
                if (!totalCount) totalCount = possibleCars.length;
                break;
              }
            } else if (response[key] && typeof response[key] === 'object') {
              for (const innerKey in response[key]) {
                if (Array.isArray(response[key][innerKey])) {
                  // Check if this array contains objects that look like cars
                  const possibleCars = response[key][innerKey];
                  if (possibleCars.length > 0 && 
                      (possibleCars[0].Brand || 
                       possibleCars[0].brand || 
                       possibleCars[0].CarModel || 
                       possibleCars[0].model)) {
                    console.log(`Found car-like objects in response.${key}.${innerKey}`);
                    carData = possibleCars;
                    if (!totalCount) totalCount = possibleCars.length;
                    break;
                  }
                }
              }
            }
          }
        }
      }
      
      console.log(`Found ${carData.length} cars in response, total count: ${totalCount}`);
      
      // Log the first car object to see its structure
      if (carData.length > 0) {
        console.log('First car structure keys:', Object.keys(carData[0]).join(', '));
        // Log Brand info specifically
        if (carData[0].Brand) {
          console.log('First car Brand:', JSON.stringify(carData[0].Brand));
        }
      }
      
      // If no car data was found in the API response, use mock data
      if (!carData || carData.length === 0) {
        console.log('No car data found in API response, using mock data...');
        const mockResponse = generateMockCars(newPage);
        carData = mockResponse.data.cars || [];
        if (!totalCount) totalCount = mockResponse.data.total || 0;
      } else {
        // Only add mock BYD cars if specifically filtering for BYD and none found in API data
        const isBYDFilterActive = appliedFilters.brands && 
                                 appliedFilters.brands.length > 0 && 
                                 appliedFilters.brands.some(brand => 
                                   String(brand).toUpperCase() === 'BYD');
        
        if (isBYDFilterActive) {
          // Check if there are any BYD cars in the API response
          const hasBYD = carData.some(car => 
            (car.Brand && car.Brand.name && car.Brand.name.toUpperCase() === 'BYD') || 
            (car.brand && car.brand.toUpperCase() === 'BYD')
          );
          
          if (!hasBYD) {
            console.log('BYD filter applied but no BYD cars found in API, adding BYD mock cars...');
            const bydMockCars = generateMockCars(1).data.cars.filter(car => 
              car.Brand && car.Brand.name === 'BYD'
            );
            
            // Generate unique timestamps for each mock car's ID to prevent conflicts
            bydMockCars.forEach(car => {
              // Ensure uniqueness by using a timestamp and random number in the ID
              const timestamp = Date.now();
              const random = Math.floor(Math.random() * 10000);
              car.id = `mock-byd-${timestamp}-${random}`;
            });
            
            // Add BYD cars to the response
            carData = [...carData, ...bydMockCars];
            
            // Update the total count
            totalCount += bydMockCars.length;
            console.log(`Added ${bydMockCars.length} mock BYD cars, new total: ${totalCount}`);
          }
        }
      }
      
      // Process car data to normalize it
      const processedCars = carData.map(car => processCar(car));
      
      // Log all brand names to debug
      const availableBrands = processedCars.map(car => {
        if (car.Brand && car.Brand.name) {
          return car.Brand.name;
        } else {
          return car.brand;
        }
      });
      console.log('Available brands in data:', [...new Set(availableBrands)].join(', '));
      
      // Log BYD cars specifically
      const bydCars = processedCars.filter(car => 
        (car.Brand && car.Brand.name && car.Brand.name.toUpperCase() === 'BYD') ||
        (car.brand && car.brand.toUpperCase() === 'BYD')
      );
      console.log(`Found ${bydCars.length} BYD cars in data`);
      if (bydCars.length > 0) {
        bydCars.forEach(car => {
          console.log(`BYD car in data: ID=${car.id}, Stock=${car.stockId}, Brand=${car.Brand?.name || car.brand}`);
        });
      }
      
      // Add debug logging to see what brand structure we have in the data
      if (processedCars.length > 0) {
        console.log('Sample car brand data:', JSON.stringify({
          brand: processedCars[0].brand,
          Brand: processedCars[0].Brand
        }));
      }
      
      // Apply filters manually on the client side if needed
      let filteredCars = [];
      
      if (hasFilters) {
        console.log(`Applying filters to ${processedCars.length} cars`);
        
        // Log the filter values we're applying
        if (appliedFilters.brands && appliedFilters.brands.length > 0) {
          console.log('Filtering by brands:', appliedFilters.brands.join(', '));
        }
        if (appliedFilters.models && appliedFilters.models.length > 0) {
          console.log('Filtering by models:', appliedFilters.models.join(', '));
        }
        if (appliedFilters.trims && appliedFilters.trims.length > 0) {
          console.log('Filtering by trims:', appliedFilters.trims.join(', '));
        }
        
        filteredCars = processedCars.filter(car => {
          // Skip any mock cars unless specifically filtering for something that requires mock data
          const isMockCar = String(car.id).includes('mock-');
          const isBYDFilter = appliedFilters.brands && 
                             appliedFilters.brands.length > 0 && 
                             appliedFilters.brands.some(brand => 
                               String(brand).toUpperCase() === 'BYD');
          
          // Only include mock cars if specifically filtering for BYD and there are no real BYD cars
          if (isMockCar && !isBYDFilter) {
            return false;
          }
          
          // For debugging, store our match results
          const matchResults = {
            brandMatch: true,
            modelMatch: true,
            trimMatch: true
          };
          
          // Brand filter - match by ID or name (string)
          if (appliedFilters.brands && appliedFilters.brands.length > 0) {
            // First try to match by ID if we have brandIds
            if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0 && car.Brand && car.Brand.id) {
              const brandIdMatches = appliedFilters.brandIds.some(id => 
                String(car.Brand.id) === String(id)
              );
              
              if (brandIdMatches) {
                console.log(`Brand ID match found: Car Brand ID ${car.Brand.id} matches filter`);
                matchResults.brandMatch = true;
                return true; // If we match by ID, no need to check other filters
              }
            }
            
            // Fall back to name matching if ID matching didn't work
            const brandMatches = appliedFilters.brands.some(brandName => {
              // Skip undefined/empty values
              if (!brandName) return false;
              
              // Get car's brand name from the Brand object or fallback to the brand property
              let carBrandName = '';
              if (car.Brand && car.Brand.name) {
                // First try to get it from the Brand object structure
                carBrandName = String(car.Brand.name).toUpperCase();
              } else {
                // Fallback to direct brand property
                carBrandName = String(car.brand || '').toUpperCase();
              }
              
              // Convert filter brand name to string and uppercase for case-insensitive comparison
              const filterBrandName = String(brandName).toUpperCase();
              
              // Special case handling for BYD
              if (filterBrandName === 'BYD') {
                const isBYD = carBrandName === 'BYD';
                if (isBYD) {
                  console.log(`BYD match found for car ID ${car.id}, stock ${car.stockId}, is mock: ${isMockCar}`);
                }
                return isBYD;
              }
              
              // Return true if brand names match (case insensitive) or contain each other
              const isMatch = carBrandName === filterBrandName || 
                     carBrandName.includes(filterBrandName) ||
                     filterBrandName.includes(carBrandName);
                     
              if (isMatch) {
                console.log(`Brand match found: Car ${carBrandName} matches filter ${filterBrandName}, is mock: ${isMockCar}`);
              }
              
              return isMatch;
            });
            
            // If no brand match, exclude this car
            matchResults.brandMatch = brandMatches;
            if (!brandMatches) return false;
          }
          
          // Model filter - match by ID or name (string)
          if (appliedFilters.models && appliedFilters.models.length > 0) {
            // First try to match by ID if we have modelIds
            if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0 && car.CarModel && car.CarModel.id) {
              const modelIdMatches = appliedFilters.modelIds.some(id => 
                String(car.CarModel.id) === String(id)
              );
              
              if (modelIdMatches) {
                console.log(`Model ID match found: Car Model ID ${car.CarModel.id} matches filter`);
                matchResults.modelMatch = true;
                return true; // If we match by ID, no need to check other filters
              }
            }
            
            // Fall back to name matching if ID matching didn't work
            const modelMatches = appliedFilters.models.some(modelName => {
              // Skip undefined/empty values
              if (!modelName) return false;
              
              // Get car's model name from the CarModel object or fallback to the model property
              let carModelName = '';
              if (car.CarModel && car.CarModel.name) {
                // First try to get it from the CarModel object structure
                carModelName = String(car.CarModel.name).toUpperCase();
              } else {
                // Fallback to direct model property
                carModelName = String(car.model || '').toUpperCase();
              }
              
              // Convert filter model name to string and uppercase for case-insensitive comparison
              const filterModelName = String(modelName).toUpperCase();
              
              // Return true if model names match (case insensitive) or contain each other
              const modelMatch = carModelName === filterModelName || 
                       carModelName.includes(filterModelName) ||
                       filterModelName.includes(carModelName);
                      
              if (modelMatch) {
                console.log(`Model match found: Car ${carModelName} matches filter ${filterModelName}, is mock: ${isMockCar}`);
              }
              
              return modelMatch;
            });
            
            // If no model match, exclude this car
            matchResults.modelMatch = modelMatches;
            if (!modelMatches) return false;
          }
          
          // Trim filter logic - similar to brand and model filtering above
          if (appliedFilters.trims && appliedFilters.trims.length > 0) {
            // First try to match by ID if we have trimIds
            if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0 && car.Trim && car.Trim.id) {
              const trimIdMatches = appliedFilters.trimIds.some(id => 
                String(car.Trim.id) === String(id)
              );
              
              if (trimIdMatches) {
                console.log(`Trim ID match found: Car Trim ID ${car.Trim.id} matches filter`);
                matchResults.trimMatch = true;
                return true; // If we match by ID, no need to check other filters
              }
            }
            
            // Fall back to name matching if ID matching didn't work
            const trimMatches = appliedFilters.trims.some(trimName => {
              // Skip undefined/empty values
              if (!trimName) return false;
              
              // Get car's trim name from the Trim object or fallback to the trim property
              let carTrimName = '';
              if (car.Trim && car.Trim.name) {
                // First try to get it from the Trim object structure
                carTrimName = String(car.Trim.name).toUpperCase();
              } else {
                // Fallback to direct trim property
                carTrimName = String(car.trim || '').toUpperCase();
              }
              
              // Convert filter trim name to string and uppercase for case-insensitive comparison
              const filterTrimName = String(trimName).toUpperCase();
              
              // Return true if trim names match (case insensitive) or contain each other
              const trimMatch = carTrimName === filterTrimName || 
                       carTrimName.includes(filterTrimName) ||
                       filterTrimName.includes(carTrimName);
                      
              if (trimMatch) {
                console.log(`Trim match found: Car ${carTrimName} matches filter ${filterTrimName}, is mock: ${isMockCar}`);
              }
              
              return trimMatch;
            });
            
            // If no trim match, exclude this car
            matchResults.trimMatch = trimMatches;
            if (!trimMatches) return false;
          }
          
          // Year filter
          if (appliedFilters.years && appliedFilters.years.length > 0) {
            const yearMatches = appliedFilters.years.some(yearStr => {
              // Skip undefined/empty values
              if (!yearStr) return false;
              
              // Convert car's year to string for comparison
              const carYear = String(car.year || 
                             (car.Year && car.Year.year ? car.Year.year : ''));
              
              // Convert filter year to string for comparison
              const filterYear = String(yearStr);
              
              // Return true if years match exactly
              const yearMatch = carYear === filterYear;
              
              if (yearMatch) {
                console.log(`Year match found: Car ${carYear} matches filter ${filterYear}`);
              }
              
              return yearMatch;
            });
            
            // If no year match, exclude this car
            if (!yearMatches) return false;
          }
          
          // Specification filters
          if (appliedFilters.specifications && Object.keys(appliedFilters.specifications).length > 0) {
            // Go through each specification type
            for (const specKey in appliedFilters.specifications) {
              // Get the selected values for this specification
              const selectedValues = appliedFilters.specifications[specKey];
              
              // If no values selected for this spec, skip it
              if (!selectedValues || selectedValues.length === 0) continue;
              
              // Find if the car has this specification
              let specMatch = false;
              
              // Special logging for regional_specification
              if (specKey === 'regional_specification') {
                console.log(`🌎 Filtering mock car ${car.id} by Regional Specification: ${selectedValues.join(', ')}`);
                // Log the car's regional specification if available 
                if (car.regionalSpec) {
                  console.log(`🌎 Mock car ${car.id} has direct regionalSpec: ${car.regionalSpec}`);
                }
                if (car.SpecificationValues) {
                  const regSpecs = car.SpecificationValues.filter(sv => 
                    sv.Specification?.key === 'regional_specification'
                  );
                  if (regSpecs.length > 0) {
                    console.log(`🌎 Mock car ${car.id} has SpecificationValues for regional spec: ${regSpecs.map(s => s.name).join(', ')}`);
                  }
                }
              }
              
              // Special logging and handling for color specifications
              if (specKey === 'color') {
                console.log(`🎨 Filtering car ${car.id} by Color: ${selectedValues.join(', ')}`);
                
              // Check car specifications if available
              if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                specMatch = car.SpecificationValues.some(spec => {
                    // Check if this spec matches our key using Specification object
                    if (spec.Specification && spec.Specification.key === 'color') {
                      return selectedValues.some(selectedValue => {
                        return spec.name && selectedValue && 
                          spec.name.toLowerCase() === selectedValue.toLowerCase();
                      });
                    }
                    return false;
                  });
                  
                  if (specMatch) {
                    console.log(`🎨 Car ${car.id} matches color specification through SpecificationValues`);
                  }
                }
                
                // If no match from specifications, check direct color property
                if (!specMatch && car.color) {
                  const colorMatch = selectedValues.some(selectedValue => 
                    car.color.toLowerCase() === selectedValue.toLowerCase()
                  );
                  
                  if (colorMatch) {
                    console.log(`🎨 Car ${car.id} matches color through direct color property: ${car.color}`);
                    specMatch = true;
                  }
                }
                
                // If still no match, check extracted colors from slug
                if (!specMatch && car.extractedColors && car.extractedColors.length > 0) {
                  const slugColorMatch = selectedValues.some(selectedValue => 
                    car.extractedColors.some(extractedColor => 
                      extractedColor.toLowerCase().includes(selectedValue.toLowerCase()) ||
                      selectedValue.toLowerCase().includes(extractedColor.toLowerCase())
                    )
                  );
                  
                  if (slugColorMatch) {
                    console.log(`🎨 Car ${car.id} matches color through extracted colors from slug: ${car.extractedColors.join(', ')}`);
                    specMatch = true;
                  }
                }
                
                // If no color match found, exclude the car
                if (!specMatch) {
                  console.log(`❌ Car ${car.id} EXCLUDED: does not match color specification`);
                  return false;
                }
                
                // Skip the rest of the specifications loop since we've handled color
                continue;
              }
              
              // Check car specifications if available - using the test2.json structure
              if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                specMatch = car.SpecificationValues.some(spec => {
                  // Check if this spec matches our key using Specification object
                  if (spec.Specification && spec.Specification.key === specKey) {
                    // For regional specifications, use partial matching
                    if (specKey === 'regional_specification') {
                      return selectedValues.some(selectedValue => {
                        if (!spec.name || !selectedValue) return false;
                        
                        // Try both exact match and partial match
                        const exactMatch = spec.name.toLowerCase() === selectedValue.toLowerCase();
                        const containsMatch = spec.name.toLowerCase().includes(selectedValue.toLowerCase()) || 
                                           selectedValue.toLowerCase().includes(spec.name.toLowerCase());
                        
                        if (exactMatch || containsMatch) {
                          console.log(`🌎 Mock car regional spec match: "${spec.name}" matches "${selectedValue}"`);
                          return true;
                        }
                        return false;
                      });
                    } else {
                      // Standard matching for other specifications
                      const nameMatches = selectedValues.some(selectedValue => 
                    spec.name && selectedValue && 
                        spec.name.toLowerCase() === selectedValue.toLowerCase()
                      );
                      
                      if (nameMatches) {
                        console.log(`✅ Mock car ID ${car.id} matches ${specKey} with value "${spec.name}"`);
                        return true;
                      }
                      return false;
                    }
                  }
                  return false;
                });
              }
              
              // Also check direct properties on the car for common specs as fallback
              if (!specMatch) {
                // Map specification keys to possible car properties
                const propertyMap = {
                  'transmission': 'transmission',
                  'fuel_type': 'fuelType',
                  'body_type': 'type',
                  'drive_type': 'driveType',
                  'color': 'color',
                  'interior_color': 'interiorColor',
                  'regional_specification': 'regionalSpec',
                  'steering_side': 'steeringSide', 
                  'wheel_size': 'wheelSize',
                  'seats': 'seats',
                  'doors': 'doors',
                  'cylinders': 'cylinders'
                };
                
                // If we have a mapping for this spec key, check the property
                if (propertyMap[specKey] && car[propertyMap[specKey]]) {
                  const propValue = car[propertyMap[specKey]].toLowerCase();
                  
                  specMatch = selectedValues.some(selectedValue => {
                    // For regional specifications, try partial matching
                    if (specKey === 'regional_specification') {
                      const exactMatch = propValue === selectedValue.toLowerCase();
                      const containsMatch = propValue.includes(selectedValue.toLowerCase()) || 
                                         selectedValue.toLowerCase().includes(propValue);
                      
                      if (exactMatch || containsMatch) {
                        console.log(`🌎 Mock car regional spec match via property: "${propValue}" matches "${selectedValue}"`);
                        return true;
                      }
                      return false;
                    } else {
                      // Standard exact matching for other specs
                      const isMatch = propValue === selectedValue.toLowerCase();
                      if (isMatch) {
                        console.log(`✅ Mock car ${car.id} matches ${specKey} via property ${propertyMap[specKey]}="${propValue}"`);
                      }
                      return isMatch;
                    }
                  });
                }
              }
              
              // If this specification doesn't match, exclude the car and log the reason
              if (!specMatch) {
                console.log(`❌ Mock car ${car.id} EXCLUDED: does not match ${specKey} specification`);
                return false;
              }
            }
          }
          
          // If we made it here, the car matches all filters
          return true;
        });
        
        // Log more details on why filtering may have failed
        if (filteredCars.length === 0 && processedCars.length > 0) {
          console.log('No cars matched the filters. Sample car data:', JSON.stringify({
            brand: processedCars[0].brand,
            Brand: processedCars[0].Brand,
            model: processedCars[0].model,
            CarModel: processedCars[0].CarModel,
            trim: processedCars[0].trim,
            Trim: processedCars[0].Trim
          }));
        }
        
        // IMPORTANT: When filters are applied, ONLY use the filtered cars
        console.log(`After filtering: ${filteredCars.length} cars match the criteria`);
        
        // Set car state based on pagination
        if (newPage === 1) {
          // When filters are applied, ONLY show filtered cars
          setCars(filteredCars);
          setPage(1);
        } else {
          // When loading more with filters, add to existing filtered cars
          setCars(prevCars => [...prevCars, ...filteredCars]);
          setPage(newPage);
        }
        
        // Update the total count to reflect filtered results
        setTotalCars(filteredCars.length);
        console.log(`Setting total count for filtered results: ${filteredCars.length}`);
        
        // Determine if there might be more data to load
        // For filtered results, we need to fetch everything and filter locally,
        // so there is no more data if we've loaded less than a full page
        setHasMoreData(filteredCars.length >= PAGE_SIZE);
      } else {
        // If no filters applied, use all processed cars
        filteredCars = processedCars;
        
        // Set car state based on pagination
        if (newPage === 1) {
          setCars(filteredCars);
          // Save the first page result count to help with pagination
          setPage(1);
        } else {
          setCars(prevCars => [...prevCars, ...filteredCars]);
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
      const mockData = generateMockCars(newPage);
      
      // If we have filters, apply them to the mock data
      let mockCars = mockData.data.cars;
      const hasFilters = Object.keys(appliedFilters).length > 0;
      
      if (hasFilters) {
        // Apply filters to mock data
        mockCars = mockCars.filter(car => {
          // Brand filter
          if (appliedFilters.brands && appliedFilters.brands.length > 0) {
            // First try to match by ID if we have brandIds
            if (appliedFilters.brandIds && appliedFilters.brandIds.length > 0 && car.Brand && car.Brand.id) {
              const brandIdMatches = appliedFilters.brandIds.some(id => 
                String(car.Brand.id) === String(id)
              );
              
              if (!brandIdMatches) return false;
            } else {
              // Fallback to name matching
              const brandName = car.Brand?.name || car.brand;
              if (!brandName) return false;
              
              const matchesBrand = appliedFilters.brands.some(filterBrand => 
                String(brandName).toUpperCase() === String(filterBrand).toUpperCase()
              );
              
              if (!matchesBrand) return false;
            }
          }
          
          // Model filter
          if (appliedFilters.models && appliedFilters.models.length > 0) {
            // First try to match by ID if we have modelIds
            if (appliedFilters.modelIds && appliedFilters.modelIds.length > 0 && car.CarModel && car.CarModel.id) {
              const modelIdMatches = appliedFilters.modelIds.some(id => 
                String(car.CarModel.id) === String(id)
              );
              
              if (!modelIdMatches) return false;
            } else {
              // Fallback to name matching
              const modelName = car.CarModel?.name || car.model;
              if (!modelName) return false;
              
              const matchesModel = appliedFilters.models.some(filterModel => 
                String(modelName).toUpperCase() === String(filterModel).toUpperCase()
              );
              
              if (!matchesModel) return false;
            }
          }
          
          // Trim filter
          if (appliedFilters.trims && appliedFilters.trims.length > 0) {
            // First try to match by ID if we have trimIds
            if (appliedFilters.trimIds && appliedFilters.trimIds.length > 0 && car.Trim && car.Trim.id) {
              const trimIdMatches = appliedFilters.trimIds.some(id => 
                String(car.Trim.id) === String(id)
              );
              
              if (!trimIdMatches) return false;
            } else {
              // Fallback to name matching
              const trimName = car.Trim?.name || car.trim;
              if (!trimName) return false;
              
              const matchesTrim = appliedFilters.trims.some(filterTrim => 
                String(trimName).toUpperCase() === String(filterTrim).toUpperCase()
              );
              
              if (!matchesTrim) return false;
            }
          }
          
          // Year filter
          if (appliedFilters.years && appliedFilters.years.length > 0) {
            // First try to match by ID if we have yearIds
            if (appliedFilters.yearIds && appliedFilters.yearIds.length > 0 && car.Year && car.Year.id) {
              const yearIdMatches = appliedFilters.yearIds.some(id => 
                String(car.Year.id) === String(id)
              );
              
              if (!yearIdMatches) return false;
            } else {
              // Fallback to value matching
              const yearValue = car.Year?.year || car.year;
              if (!yearValue) return false;
              
              const matchesYear = appliedFilters.years.some(filterYear => 
                String(yearValue) === String(filterYear)
              );
              
              if (!matchesYear) return false;
            }
          }
          
          // Handle specification filters (body type, transmission, etc.)
          if (appliedFilters.specifications && Object.keys(appliedFilters.specifications).length > 0) {
            // Go through each specification type
            for (const specKey in appliedFilters.specifications) {
              // Get the selected values for this specification
              const selectedValues = appliedFilters.specifications[specKey];
              
              // If no values selected for this spec, skip it
              if (!selectedValues || selectedValues.length === 0) continue;
              
              // Find if the car has this specification
              let specMatch = false;
              
              // Special logging for regional_specification
              if (specKey === 'regional_specification') {
                console.log(`🌎 Filtering mock car ${car.id} by Regional Specification: ${selectedValues.join(', ')}`);
                // Log the car's regional specification if available 
                if (car.regionalSpec) {
                  console.log(`🌎 Mock car ${car.id} has direct regionalSpec: ${car.regionalSpec}`);
                }
                if (car.SpecificationValues) {
                  const regSpecs = car.SpecificationValues.filter(sv => 
                    sv.Specification?.key === 'regional_specification'
                  );
                  if (regSpecs.length > 0) {
                    console.log(`🌎 Mock car ${car.id} has SpecificationValues for regional spec: ${regSpecs.map(s => s.name).join(', ')}`);
                  }
                }
              }
              
              // Special logging and handling for color specifications
              if (specKey === 'color') {
                console.log(`🎨 Filtering car ${car.id} by Color: ${selectedValues.join(', ')}`);
                
                // Check car specifications if available
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  specMatch = car.SpecificationValues.some(spec => {
                    // Check if this spec matches our key using Specification object
                    if (spec.Specification && spec.Specification.key === 'color') {
                      return selectedValues.some(selectedValue => {
                        return spec.name && selectedValue && 
                          spec.name.toLowerCase() === selectedValue.toLowerCase();
                      });
                    }
                    return false;
                  });
                  
                  if (specMatch) {
                    console.log(`🎨 Car ${car.id} matches color specification through SpecificationValues`);
                  }
                }
                
                // If no match from specifications, check direct color property
                if (!specMatch && car.color) {
                  const colorMatch = selectedValues.some(selectedValue => 
                    car.color.toLowerCase() === selectedValue.toLowerCase()
                  );
                  
                  if (colorMatch) {
                    console.log(`🎨 Car ${car.id} matches color through direct color property: ${car.color}`);
                    specMatch = true;
                  }
                }
                
                // If still no match, check extracted colors from slug
                if (!specMatch && car.extractedColors && car.extractedColors.length > 0) {
                  const slugColorMatch = selectedValues.some(selectedValue => 
                    car.extractedColors.some(extractedColor => 
                      extractedColor.toLowerCase().includes(selectedValue.toLowerCase()) ||
                      selectedValue.toLowerCase().includes(extractedColor.toLowerCase())
                    )
                  );
                  
                  if (slugColorMatch) {
                    console.log(`🎨 Car ${car.id} matches color through extracted colors from slug: ${car.extractedColors.join(', ')}`);
                    specMatch = true;
                  }
                }
                
                // If no color match found, exclude the car
                if (!specMatch) {
                  console.log(`❌ Car ${car.id} EXCLUDED: does not match color specification`);
                  return false;
                }
                
                // Skip the rest of the specifications loop since we've handled color
                continue;
              }
              
              // Check car specifications if available - using the test2.json structure
              if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                specMatch = car.SpecificationValues.some(spec => {
                  // Check if this spec matches our key using Specification object
                  if (spec.Specification && spec.Specification.key === specKey) {
                    // For regional specifications, use partial matching
                    if (specKey === 'regional_specification') {
                      return selectedValues.some(selectedValue => {
                        if (!spec.name || !selectedValue) return false;
                        
                        // Try both exact match and partial match
                        const exactMatch = spec.name.toLowerCase() === selectedValue.toLowerCase();
                        const containsMatch = spec.name.toLowerCase().includes(selectedValue.toLowerCase()) || 
                                           selectedValue.toLowerCase().includes(spec.name.toLowerCase());
                        
                        if (exactMatch || containsMatch) {
                          console.log(`🌎 Mock car regional spec match: "${spec.name}" matches "${selectedValue}"`);
                          return true;
                        }
                        return false;
                      });
                    } else {
                      // Standard matching for other specifications
                      const nameMatches = selectedValues.some(selectedValue => 
                        spec.name && selectedValue && 
                        spec.name.toLowerCase() === selectedValue.toLowerCase()
                      );
                      
                      if (nameMatches) {
                        console.log(`✅ Mock car ID ${car.id} matches ${specKey} with value "${spec.name}"`);
                        return true;
                      }
                      return false;
                    }
                  }
                  return false;
                });
              }
              
              // Also check direct properties on the car for common specs as fallback
              if (!specMatch) {
                // Map specification keys to possible car properties
                const propertyMap = {
                  'transmission': 'transmission',
                  'fuel_type': 'fuelType',
                  'body_type': 'type',
                  'drive_type': 'driveType',
                  'color': 'color',
                  'interior_color': 'interiorColor',
                  'regional_specification': 'regionalSpec',
                  'steering_side': 'steeringSide', 
                  'wheel_size': 'wheelSize',
                  'seats': 'seats',
                  'doors': 'doors',
                  'cylinders': 'cylinders'
                };
                
                // If we have a mapping for this spec key, check the property
                if (propertyMap[specKey] && car[propertyMap[specKey]]) {
                  const propValue = car[propertyMap[specKey]].toLowerCase();
                  
                  specMatch = selectedValues.some(selectedValue => {
                    // For regional specifications, try partial matching
                    if (specKey === 'regional_specification') {
                      const exactMatch = propValue === selectedValue.toLowerCase();
                      const containsMatch = propValue.includes(selectedValue.toLowerCase()) || 
                                         selectedValue.toLowerCase().includes(propValue);
                      
                      if (exactMatch || containsMatch) {
                        console.log(`🌎 Mock car regional spec match via property: "${propValue}" matches "${selectedValue}"`);
                        return true;
                      }
                      return false;
                    } else {
                      // Standard exact matching for other specs
                      const isMatch = propValue === selectedValue.toLowerCase();
                      if (isMatch) {
                        console.log(`✅ Mock car ${car.id} matches ${specKey} via property ${propertyMap[specKey]}="${propValue}"`);
                      }
                      return isMatch;
                    }
                  });
                }
              }
              
              // If this specification doesn't match, exclude the car and log the reason
              if (!specMatch) {
                console.log(`❌ Mock car ${car.id} EXCLUDED: does not match ${specKey} specification`);
                return false;
              }
            }
          }
          
          return true;
        });
        
        // Update total count for filtered mock data
        if (newPage === 1) {
        setCars(mockCars);
          setPage(1);
        } else {
          setCars(prevCars => [...prevCars, ...mockCars]);
          setPage(newPage);
        }
        
        setTotalCars(mockCars.length);
        setHasMoreData(mockCars.length >= PAGE_SIZE);
      } else {
        // No filters, use all mock cars
        if (newPage === 1) {
          setCars(mockCars);
          setPage(1);
        } else {
          setCars(prevCars => [...prevCars, ...mockCars]);
          setPage(newPage);
        }
        
        setTotalCars(mockData.data.total);
        setHasMoreData(mockCars.length >= PAGE_SIZE);
      }
    } finally {
        setLoading(false);
        setLoadingMore(false);
      }
  };

  // Add utility function to extract color information from slugs
  const extractColorsFromSlug = (slug) => {
    if (!slug || typeof slug !== 'string') return [];
    
    // Common color terms to look for in slugs
    const colorTerms = [
      'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple',
      'pink', 'brown', 'grey', 'gray', 'silver', 'gold', 'beige', 'tan',
      'maroon', 'navy', 'teal', 'olive', 'cyan', 'magenta'
    ];
    
    // Convert slug to lowercase and replace hyphens and underscores with spaces
    const slugText = slug.toLowerCase().replace(/[-_]/g, ' ');
    
    // Find all color terms in the slug
    const foundColors = colorTerms.filter(color => 
      slugText.includes(color) ||
      // Also check for variations like "white-body" or "roof-black"
      slugText.includes(`${color} body`) ||
      slugText.includes(`body ${color}`) ||
      slugText.includes(`${color} roof`) ||
      slugText.includes(`roof ${color}`)
    );
    
    return [...new Set(foundColors)]; // Return unique colors
  };

  // Helper function to process car data into a consistent format
  const processCar = (car) => {
    // Ensure the car has a valid ID
    if (!car.id) {
      car.id = `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    
    // Extract colors from slug if available
    let extractedColors = [];
    if (car.slug) {
      extractedColors = extractColorsFromSlug(car.slug);
      if (extractedColors.length > 0) {
        console.log(`🎨 Extracted colors from slug for car ${car.id}: ${extractedColors.join(', ')}`);
      }
    }
    
    // Normalize car data format - extract key fields and ensure consistent structure
    
    // Handle car images with better fallbacks
    let carImage = require('../components/home/car_Image.png');
    
    // Try multiple image sources based on the correct FileSystem structure
    if (car.image) {
      carImage = car.image;
    } else if (car.CarImages && car.CarImages.length > 0) {
      // Extract image paths from the FileSystem structure
      try {
        // Get the FileSystem object from the first CarImage
        const fileSystem = car.CarImages[0].FileSystem;
        
        if (fileSystem) {
          // Use the main path, webpPath or thumbnailPath based on availability
          const imagePath = fileSystem.path || fileSystem.webpPath || fileSystem.thumbnailPath;
          
          if (imagePath) {
            // For CarImage component, just pass the filename or path
            // CarImage will handle trying multiple base URLs internally
            carImage = { 
              uri: `https://cdn.legendmotorsglobal.com${imagePath}`,
              filename: imagePath.split('/').pop(),
              fullPath: imagePath // Pass the full path for fallbacks
            };
            
            // console.log(`Image path extracted for car ${car.id}: ${imagePath}`);
          }
        }
      } catch (error) {
        console.log('Error processing car image, using fallback:', error.message);
      }
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
      extractedColors: extractedColors, // Add extracted colors from slug
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
      image: carImage,
      inWishlist: car.inWishlist || false,
      // Pass through the original data structure too, for completeness
      Brand: car.Brand,
      CarModel: car.CarModel,
      Trim: car.Trim,
      Year: car.Year,
      SpecificationValues: car.SpecificationValues
    };
  };

  const loadMoreData = () => {
    // Only load more if we're not already loading and there's more data
    if (!loadingMore && hasMoreData) {
      console.log(`Loading more cars: page ${page + 1}`);
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
    // Navigate to FilterScreen with current filters
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: handleFilterApply,
      // Pass current filters so they can be pre-selected
      currentFilters: appliedFilters
    });
  };

  // Update the function to properly apply filters from FilterScreen
  const handleFilterApply = (filters) => {
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
    
    // Log specification filters in more detail for debugging
    if (filters.specifications) {
      console.log('Applying specification filters:');
      Object.keys(filters.specifications).forEach(specKey => {
        if (filters.specifications[specKey] && filters.specifications[specKey].length > 0) {
          const specValues = filters.specifications[specKey];
          console.log(`📋 Selected ${specKey} values (${specValues.length}):`, specValues.join(', '));
          
          // Log some specific details for key specifications
          if (specKey === 'transmission') {
            console.log('🔄 Transmission filter will match cars with specification ID 12');
          } else if (specKey === 'regional_specification') {
            console.log('🌎 Regional Specification filter will match cars with specification ID 1');
            // Add special handling for regional specifications validation
            console.log('🌎 IMPORTANT: Using case-insensitive and partial matching for regional specifications');
          } else if (specKey === 'steering_side') {
            console.log('🚘 Steering Side filter will match cars with specification ID 2');
          } else if (specKey === 'body_type') {
            console.log('🚗 Body Type filter will match cars with specification ID 6');
          } else if (specKey === 'color') {
            console.log('🎨 Color filter will match cars with specification ID 3');
            // Note if we should also check for color in slugs
            if (filters.extractColorsFromSlug) {
              console.log('🎨 Will also check for color matches in car slugs');
            }
          }
        }
      });
    }
    
    // Save the applied filters to state - this will trigger the useEffect to refetch
    setAppliedFilters(filters);
    
    // Set loading state to true until the useEffect fetches new data
    setLoading(true);
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

  // Function to navigate to car detail
  const navigateToCarDetail = (car) => {
    console.log(`Navigating to car detail for car ID: ${car.id}`);
    // Navigate to the CarDetailScreen with the car ID
    navigation.navigate('CarDetailScreen', { carId: car.id });
  };

  // Function to go back to all cars
  const viewAllCars = () => {
    setIsViewingSpecificCar(false);
    navigation.setParams({ carId: undefined });
    fetchCars(1);
  };

  // Render individual car item
  const renderCarItem = ({ item }) => {
    // Check if this is a mock car
    const isMockCar = String(item.id).includes('mock-');
    
    // Get specification values for display
    const getSpecValue = (specKey) => {
      if (item.SpecificationValues && Array.isArray(item.SpecificationValues)) {
        const specValue = item.SpecificationValues.find(spec => 
          (spec.Specification && spec.Specification.key === specKey) ||
          (spec.specification && spec.specification.key === specKey)
        );
        return specValue ? specValue.name : null;
      }
      return null;
    };
    
    // Extract values from the car object
    const transmission = getSpecValue('transmission') || item.transmission || 'N/A';
    const fuelType = getSpecValue('fuel_type') || item.fuelType || 'N/A';
    const bodyType = getSpecValue('body_type') || item.type || 'N/A';
    const regionalSpec = getSpecValue('regional_specification') || item.regionalSpec || '';
    const steeringSide = getSpecValue('steering_side') || item.steeringSide || '';
    
    // Extract basic information
    const brand = item.Brand?.name || item.brand || '';
    const model = item.CarModel?.name || item.model || '';
    const trim = item.Trim?.name || item.trim || '';
    const year = item.Year?.year || item.year || '';
    
    // Check if we need to highlight parts of text due to search
    const highlightText = (text, type) => {
      if (!filteredBySearch || !text || !debouncedSearchQuery) {
        return <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>{text}</Text>;
      }
      
      const query = debouncedSearchQuery.toLowerCase();
      
      // No highlighting if query not in text
      if (!text.toLowerCase().includes(query)) {
        // Try with special characters removed for more flexible matching
        const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
        const cleanText = text.toLowerCase().replace(/[^\w\s]/gi, '');
        
        // If no match even with clean versions, return the original text
        if (!cleanText.includes(cleanQuery)) {
          return <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>{text}</Text>;
        }
        
        // If we match with clean version but not original, we'll highlight based on positions in cleaned text
        try {
          // This is an approximation - it won't be perfect for all cases with special chars
          const startIndex = cleanText.indexOf(cleanQuery);
          const endIndex = startIndex + cleanQuery.length;
          
          // Very basic highlighting based on approximate position
          return (
            <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>
              {text.substring(0, startIndex)}
              <Text style={styles.highlightedText}>{text.substring(startIndex, endIndex)}</Text>
              {text.substring(endIndex)}
            </Text>
          );
        } catch (e) {
          // Fallback to regular text if there's any error
          return <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>{text}</Text>;
        }
      }
      
      // Standard highlighting for direct matches
      try {
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        
        return (
          <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>
            {parts.map((part, index) => 
              part.toLowerCase() === query.toLowerCase() ? 
                <Text key={index} style={styles.highlightedText}>{part}</Text> : 
                <Fragment key={index}>{part}</Fragment>
            )}
          </Text>
        );
      } catch (e) {
        // Fallback to regular text if there's any error with regex
        return <Text style={type === 'title' ? styles.carTitle : type === 'subtitle' ? styles.carSubtitle : styles.specText}>{text}</Text>;
      }
    };
    
    return (
      <TouchableOpacity 
        style={[styles.carCard, item.inWishlist && styles.favoriteHighlight]}
        onPress={() => navigateToCarDetail(item)}
        activeOpacity={0.8}
      >
        <CarImage 
          source={item.image}
          style={styles.carImage}
          resizeMode="cover"
        />
        
        <View style={styles.carTypeContainer}>
          <Text style={styles.carTypeText}>{bodyType}</Text>
        </View>
        
        {item.stockId && (
          <View style={styles.stockIdContainer}>
            <Text style={styles.stockIdText}>{item.stockId}</Text>
          </View>
        )}
        
        {isMockCar && (
          <View style={[styles.stockIdContainer, { backgroundColor: 'rgba(255, 0, 0, 0.6)' }]}>
            <Text style={styles.stockIdText}>MOCK DATA</Text>
          </View>
        )}
        
        <View style={styles.carDetails}>
          {filteredBySearch ? 
            highlightText(`${year} ${brand} ${model}`, 'title') : 
            <Text style={styles.carTitle}>
              {year} {brand} {model}
            </Text>
          }
          
          {filteredBySearch ?
            highlightText(`${trim ? `${trim} - ` : ''}${item.color || 'N/A'}`, 'subtitle') :
            <Text style={styles.carSubtitle}>
              {trim ? `${trim} - ` : ''}{item.color || 'N/A'}
            </Text>
          }
          
          <View style={styles.specRow}>
            {item.engineSize && (
              <View style={styles.specItem}>
                <Text style={styles.specIcon}>🔧</Text>
                <Text style={styles.specText}>{item.engineSize}L</Text>
              </View>
            )}
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>⚡</Text>
              <Text style={styles.specText}>{fuelType}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>🔄</Text>
              <Text style={styles.specText}>{transmission}</Text>
            </View>
          </View>
          
          <View style={styles.specRow}>
            {regionalSpec && (
              <View style={styles.originBadge}>
                <Text style={styles.originText}>{regionalSpec}</Text>
              </View>
            )}
            {steeringSide && (
              <View style={styles.steeringBadge}>
                <Text style={styles.steeringText}>{steeringSide}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.carPrice}>
            {item.price ? `AED ${item.price.toLocaleString()}` : 'Price on Request'}
          </Text>
          
          {item.slug && (
            <Text style={styles.slugText} numberOfLines={1} ellipsizeMode="tail">
              ID: {item.id} | Slug: {item.slug}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

  // Render empty state when no cars match filters
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Cars Found</Text>
        <Text style={styles.emptyDescription}>
          No cars match your current filter criteria. 
          Try adjusting your filters or clear them to see all available cars.
        </Text>
        <TouchableOpacity 
          style={styles.clearFiltersButtonLarge}
          onPress={() => {
            // Reset filters and revert to "All" tab
            setAppliedFilters({});
            setActiveFilter('all');
            // Loading state will be managed by the useEffect hook
            setLoading(true);
          }}
        >
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Add this function to generate mock cars
  const generateMockCars = (page) => {
    const mockCars = [
      // Toyota mock car
      {
        id: "mock-1001", // Use string IDs to avoid conflicts with API data
        stockId: "TOY-TEST-001",
        Brand: {
          id: 2,
          name: "TOYOTA",
          slug: "toyota"
        },
        CarModel: {
          id: 41,
          name: "COROLLA CROSS",
          slug: "corolla-cross"
        },
        Trim: {
          id: 54,
          name: "MID",
          slug: "mid"
        },
        Year: {
          id: 1,
          year: 2024
        },
        price: 29500,
        color: "White",
        engineSize: 1.8,
        type: "SUV",
        fuelType: "Gasoline",
        transmission: "Automatic",
        regionalSpec: "GCC",
        steeringSide: "Left-hand drive",
        // Add SpecificationValues array with proper specification structures
        SpecificationValues: [
          {
            id: 101,
            name: "Automatic",
            Specification: { id: 12, key: "transmission", name: "Transmission" }
          },
          {
            id: 102,
            name: "Gasoline",
            Specification: { id: 9, key: "fuel_type", name: "Fuel Type" }
          },
          {
            id: 103,
            name: "SUV",
            Specification: { id: 6, key: "body_type", name: "Body Type" }
          },
          {
            id: 104,
            name: "GCC",
            Specification: { id: 1, key: "regional_specification", name: "Regional Specification" }
          },
          {
            id: 105,
            name: "Left-hand drive",
            Specification: { id: 2, key: "steering_side", name: "Steering Side" }
          }
        ]
      },
      // BYD mock car 1 - to ensure we have BYD data
      {
        id: "mock-1002", // Use string IDs to avoid conflicts with API data
        stockId: "BYD-TEST-001",
        Brand: {
          id: 3,
          name: "BYD",
          slug: "byd"
        },
        CarModel: {
          id: 4,
          name: "SONG PLUS",
          slug: "song-plus"
        },
        Trim: {
          id: 4,
          name: "FLAGSHIP",
          slug: "flagship"
        },
        Year: {
          id: 1,
          year: 2024
        },
        price: 37500,
        color: "Grey",
        engineSize: null,
        type: "SUV",
        fuelType: "Electric",
        transmission: "Automatic",
        regionalSpec: "China",
        steeringSide: "Left-hand drive",
        // Add SpecificationValues array with proper specification structures
        SpecificationValues: [
          {
            id: 201,
            name: "Automatic",
            Specification: { id: 12, key: "transmission", name: "Transmission" }
          },
          {
            id: 202,
            name: "Electric",
            Specification: { id: 9, key: "fuel_type", name: "Fuel Type" }
          },
          {
            id: 203,
            name: "SUV",
            Specification: { id: 6, key: "body_type", name: "Body Type" }
          },
          {
            id: 204,
            name: "China",
            Specification: { id: 1, key: "regional_specification", name: "Regional Specification" }
          },
          {
            id: 205,
            name: "Left-hand drive",
            Specification: { id: 2, key: "steering_side", name: "Steering Side" }
          }
        ]
      },
      // BYD mock car 2
      {
        id: "mock-1003", // Use string IDs to avoid conflicts with API data
        stockId: "BYD-TEST-002",
        Brand: {
          id: 3,
          name: "BYD",
          slug: "byd"
        },
        CarModel: {
          id: 5,
          name: "ATTO 3",
          slug: "atto-3"
        },
        Trim: {
          id: 5,
          name: "COMFORT",
          slug: "comfort"
        },
        Year: {
          id: 1,
          year: 2024
        },
        price: 33000,
        color: "Blue",
        engineSize: null,
        type: "SUV",
        fuelType: "Electric",
        transmission: "Automatic",
        regionalSpec: "EU",
        steeringSide: "Right-hand drive",
        // Add SpecificationValues array with proper specification structures
        SpecificationValues: [
          {
            id: 301,
            name: "Automatic",
            Specification: { id: 12, key: "transmission", name: "Transmission" }
          },
          {
            id: 302,
            name: "Electric",
            Specification: { id: 9, key: "fuel_type", name: "Fuel Type" }
          },
          {
            id: 303,
            name: "SUV",
            Specification: { id: 6, key: "body_type", name: "Body Type" }
          },
          {
            id: 304,
            name: "EU",
            Specification: { id: 1, key: "regional_specification", name: "Regional Specification" }
          },
          {
            id: 305,
            name: "Right-hand drive",
            Specification: { id: 2, key: "steering_side", name: "Steering Side" }
          }
        ]
      },
      // Add a US specification car
      {
        id: "mock-1004",
        stockId: "LEX-TEST-001",
        Brand: {
          id: 4,
          name: "LEXUS",
          slug: "lexus"
        },
        CarModel: {
          id: 6,
          name: "RX",
          slug: "rx"
        },
        Trim: {
          id: 6,
          name: "PREMIUM",
          slug: "premium"
        },
        Year: {
          id: 1,
          year: 2023
        },
        price: 55000,
        color: "Black",
        engineSize: 3.5,
        type: "SUV",
        fuelType: "Hybrid",
        transmission: "Automatic",
        regionalSpec: "US",
        steeringSide: "Left-hand drive",
        // Add SpecificationValues array with proper specification structures
        SpecificationValues: [
          {
            id: 401,
            name: "Automatic",
            Specification: { id: 12, key: "transmission", name: "Transmission" }
          },
          {
            id: 402,
            name: "Hybrid",
            Specification: { id: 9, key: "fuel_type", name: "Fuel Type" }
          },
          {
            id: 403,
            name: "SUV",
            Specification: { id: 6, key: "body_type", name: "Body Type" }
          },
          {
            id: 404,
            name: "US",
            Specification: { id: 1, key: "regional_specification", name: "Regional Specification" }
          },
          {
            id: 405,
            name: "Left-hand drive",
            Specification: { id: 2, key: "steering_side", name: "Steering Side" }
          }
        ]
      }
    ];
    
    // Calculate start and end index based on pagination
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    
    // Return a subset of mock cars based on pagination
    const paginatedCars = mockCars.slice(startIndex, endIndex);
    
    return {
      data: {
        cars: paginatedCars,
        total: mockCars.length
      }
    };
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
          const processedCars = carData.map(car => processCar(car));
          setCars(processedCars);
          setTotalCars(1);
          setHasMoreData(false);
        } else {
          // If car not found in API, try to use mock data with matching ID
          console.log(`Car with ID ${carId} not found in API, checking mock data`);
          const mockData = generateMockCars(1);
          const mockCar = mockData.data.cars.find(car => String(car.id) === String(carId));
          
          if (mockCar) {
            console.log(`Found mock car with ID ${carId}`);
            const processedMockCar = processCar(mockCar);
            setCars([processedMockCar]);
            setTotalCars(1);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        {isViewingSpecificCar && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={viewAllCars}
          >
            <Text style={styles.backButtonText}>← Back to All Cars</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for cars..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            editable={!isViewingSpecificCar}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchIcon}>❌</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
        </View>
      </View>
      
      {filteredBySearch && searchedModels.length > 0 && (
        <View style={styles.carModelsContainer}>
          <TouchableOpacity 
            style={styles.toggleCarModelsButton}
            onPress={toggleCarIds}
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
      
      {!isViewingSpecificCar && (
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
      )}
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {isViewingSpecificCar
            ? `Viewing car details (ID: ${route.params?.carId || 'unknown'})`
            : filteredBySearch 
              ? `Found ${cars.length} cars matching "${debouncedSearchQuery}"`
              : Object.keys(appliedFilters).length > 0 
                ? `Showing ${cars.length} of ${totalCars} cars` 
                : `Total: ${totalCars} cars available`}
        </Text>
        {!isViewingSpecificCar && (Object.keys(appliedFilters).length > 0 || filteredBySearch) && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => {
              // Reset filters and revert to "All" tab
              setAppliedFilters({});
              setActiveFilter('all');
              setSearchQuery('');
              setFilteredBySearch(false);
              // Loading state will be managed by the useEffect hook
              setLoading(true);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.mainLoader} />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.carsList}
          showsVerticalScrollIndicator={false}
          onEndReached={!isViewingSpecificCar ? loadMoreData : null}
          onEndReachedThreshold={0.3}
          ListFooterComponent={!isViewingSpecificCar ? renderFooter : null}
          ListEmptyComponent={renderEmptyState}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
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
  clearSearchButton: {
    padding: 5,
  },
  clearSearchIcon: {
    fontSize: FONT_SIZES.md,
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
    flexGrow: 1,
    minHeight: 300,
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
    marginBottom: SPACING.sm,
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
  driveTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  carPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  originBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginRight: SPACING.sm,
  },
  originText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  clearFiltersButtonLarge: {
    padding: SPACING.md,
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.md,
  },
  steeringBadge: {
    backgroundColor: 'rgba(120, 180, 220, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  steeringText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  highlightedText: {
    backgroundColor: 'rgba(237, 135, 33, 0.2)',
    fontWeight: '700',
    color: COLORS.primary,
  },
  slugText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  carIdItem: {
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  carIdText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  carIdsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
  },
  toggleCarIdsButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  toggleCarIdsText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  carIdsList: {
    maxHeight: 200,
  },
  carIdsHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS.sm,
  },
  carModelItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  carModelName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  carModelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  carModelBrand: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  carModelId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  carModelsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: BORDER_RADIUS.md,
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
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  toggleCarModelsText: {
    fontSize: FONT_SIZES.sm,
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
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  carModelsHeader: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textDark,
  },
});

export default ExploreScreen; 