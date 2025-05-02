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
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { getCarList } from '../services/api';
import { CarImage } from '../components/common';
import FilterScreen from './FilterScreen'; // Import FilterScreen

const ExploreScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
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

  // Process any route params with filters
  useEffect(() => {
    if (route.params?.filters) {
      console.log('Received filters from navigation:', route.params.filters);
      setAppliedFilters(route.params.filters);
      
      // Update the active filter tab based on the type of filter
      if (route.params.filters.brands && route.params.filters.brands.length > 0) {
        setActiveFilter('brands');
      }
    }
  }, [route.params]);

  // Fetch cars from API
  useEffect(() => {
    fetchCars(1); // Always start from page 1 when filters change
  }, [appliedFilters]); // Re-fetch when filters change

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
              
              // Check car specifications if available
              if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                specMatch = car.SpecificationValues.some(spec => {
                  // Check different possible structures of specification data
                  // Option 1: spec.specification.key structure
                  if (spec.specification && spec.specification.key === specKey) {
                    return selectedValues.some(selectedValue => 
                      spec.name && selectedValue && 
                      (spec.name.toLowerCase() === selectedValue.toLowerCase() ||
                       spec.name.toLowerCase().includes(selectedValue.toLowerCase()) ||
                       selectedValue.toLowerCase().includes(spec.name.toLowerCase()))
                    );
                  }
                  
                  // Option 2: spec.Specification.key structure (legacy)
                  if (spec.Specification && spec.Specification.key === specKey) {
                  return selectedValues.some(selectedValue => 
                    spec.name && selectedValue && 
                    (spec.name.toLowerCase() === selectedValue.toLowerCase() ||
                     spec.name.toLowerCase().includes(selectedValue.toLowerCase()) ||
                     selectedValue.toLowerCase().includes(spec.name.toLowerCase()))
                  );
                  }
                  
                  return false;
                });
              }
              
              // Also check direct properties on the car for common specs
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
                  specMatch = selectedValues.some(selectedValue => 
                    car[propertyMap[specKey]].toLowerCase() === selectedValue.toLowerCase() ||
                    car[propertyMap[specKey]].toLowerCase().includes(selectedValue.toLowerCase()) ||
                    selectedValue.toLowerCase().includes(car[propertyMap[specKey]].toLowerCase())
                  );
                }
              }
              
              // If this specification doesn't match, exclude the car
              if (!specMatch) return false;
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
          
          // Add other specification filters as needed
          
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

  // Helper function to process car data into a consistent format
  const processCar = (car) => {
    // Ensure the car has a valid ID
    if (!car.id) {
      car.id = `generated-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
            
            console.log(`Image path extracted for car ${car.id}: ${imagePath}`);
          }
        }
      } catch (error) {
        console.log('Error processing car image, using fallback:', error.message);
      }
    }
    
    // Extract brand information
    let brandName = 'Unknown Brand';
    if (car.Brand && car.Brand.name) {
      // Prioritize the Brand object from the API response
      brandName = car.Brand.name;
    } else if (car.brand) {
      // Fallback to direct brand property
      brandName = car.brand;
    }
    
    // Extract model information
    let modelName = 'Unknown Model';
    if (car.CarModel && car.CarModel.name) {
      // Prioritize the CarModel object from the API response
      modelName = car.CarModel.name;
    } else if (car.model) {
      // Fallback to direct model property
      modelName = car.model;
    }
    
    // Extract trim information
    let trimName = '';
    if (car.Trim && car.Trim.name) {
      // Prioritize the Trim object from the API response
      trimName = car.Trim.name;
    } else if (car.trim) {
      // Fallback to direct trim property
      trimName = car.trim;
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
    console.log('Applying filters from FilterScreen:', JSON.stringify(filters));
    
    if (filters) {
      // Debug logging to see what we're working with
      if (filters.brands && filters.brands.length > 0) {
        console.log('Selected Brand names:', filters.brands.join(', '));
      }
      if (filters.brandIds && filters.brandIds.length > 0) {
        console.log('Selected Brand IDs:', filters.brandIds.join(', '));
      }
      if (filters.models && filters.models.length > 0) {
        console.log('Selected Model names:', filters.models.join(', '));
      }
      if (filters.modelIds && filters.modelIds.length > 0) {
        console.log('Selected Model IDs:', filters.modelIds.join(', '));
      }
      if (filters.trims && filters.trims.length > 0) {
        console.log('Selected Trim names:', filters.trims.join(', '));
      }
      if (filters.trimIds && filters.trimIds.length > 0) {
        console.log('Selected Trim IDs:', filters.trimIds.join(', '));
      }
      if (filters.specifications) {
        Object.keys(filters.specifications).forEach(specKey => {
          console.log(`Selected ${specKey} values:`, filters.specifications[specKey].join(', '));
        });
      }
      
      // Save the applied filters to state - this will trigger the useEffect to refetch
      setAppliedFilters(filters);
      
      // Update the active filter tab if appropriate
      if (filters.brands && filters.brands.length > 0) {
        setActiveFilter('brands');
      } else if (filters.models && filters.models.length > 0) {
        setActiveFilter('models');
      } else if (filters.trims && filters.trims.length > 0) {
        setActiveFilter('trims');
      } else {
        setActiveFilter('advanced');
      }
      
      // Show loading state while we wait for the useEffect to trigger
      setLoading(true);
      
      // No need to call fetchCars here - the useEffect will handle that
      console.log('Filters applied, waiting for useEffect to trigger refetch');
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
    // Check if this is a mock car
    const isMockCar = String(item.id).includes('mock-');
    
    return (
      <View style={[styles.carCard, item.inWishlist && styles.favoriteHighlight]}>
        <CarImage 
          source={item.image}
          style={styles.carImage}
          resizeMode="cover"
        />
        
        <View style={styles.carTypeContainer}>
          <Text style={styles.carTypeText}>{item.type || 'Unknown'}</Text>
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
          <Text style={styles.carTitle}>
            {item.year} {item.brand} {item.model}
          </Text>
          <Text style={styles.carSubtitle}>
            {item.trim ? `${item.trim} - ` : ''}{item.color || 'N/A'}
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
              <Text style={styles.specText}>{item.fuelType || 'N/A'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>🔄</Text>
              <Text style={styles.specText}>{item.transmission || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.specRow}>
            {item.origin && (
              <View style={styles.originBadge}>
                <Text style={styles.originText}>{item.origin}</Text>
              </View>
            )}
            <Text style={styles.specIcon}>⊙</Text>
            <Text style={styles.driveTypeText}>{item.driveType || 'N/A'}</Text>
          </View>
          
          <Text style={styles.carPrice}>
            AED {item.price.toLocaleString()}
                </Text>
            </View>
          </View>
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
        transmission: "Automatic"
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
        transmission: "Automatic"
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
        transmission: "Automatic"
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
        <Text style={styles.resultsText}>
          {Object.keys(appliedFilters).length > 0 
            ? `Showing ${cars.length} of ${totalCars} cars` 
            : `Total: ${totalCars} cars available`}
        </Text>
        {Object.keys(appliedFilters).length > 0 && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => {
              // Reset filters and revert to "All" tab
              setAppliedFilters({});
              setActiveFilter('all');
              // Loading state will be managed by the useEffect hook
              setLoading(true);
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
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.carsList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
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
});

export default ExploreScreen; 