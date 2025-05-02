import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import { getBrandList, getCarModelList, getUniqueBrands } from '../services/api';
import { fetchSpecificationValues } from '../services/filtersService';
import axios from 'axios';
import { API_KEY } from '../utils/apiConfig';
import { CarImage } from '../components/common';

const FilterScreen = ({ route, navigation }) => {
  const { filterType = 'brands', onApplyCallback, currentFilters = {} } = route?.params || {};
  const [activeFilter, setActiveFilter] = useState(filterType);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [years, setYears] = useState([]);
  const [specValues, setSpecValues] = useState([]);
  const [allSpecifications, setAllSpecifications] = useState({});
  const [selectedBrands, setSelectedBrands] = useState(currentFilters.brands || []);
  const [selectedModels, setSelectedModels] = useState(currentFilters.models || []);
  const [selectedTrims, setSelectedTrims] = useState(currentFilters.trims || []);
  const [selectedYears, setSelectedYears] = useState(currentFilters.years || []);
  const [selectedSpecValues, setSelectedSpecValues] = useState(currentFilters.specifications || {});
  const [loading, setLoading] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState(currentFilters.brandIds || []);
  const [selectedModelIds, setSelectedModelIds] = useState(currentFilters.modelIds || []);
  const [selectedTrimIds, setSelectedTrimIds] = useState(currentFilters.trimIds || []);
  const [selectedYearIds, setSelectedYearIds] = useState(currentFilters.yearIds || []);

  // Extract logo path from different possible formats - add this before it's used
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

  // Static brands list from the UI
  const staticBrandsList = [
    { id: 1, name: 'BYD' },
    { id: 2, name: 'CHANGAN' },
    { id: 3, name: 'CHERY' },
    { id: 4, name: 'GAC' },
    { id: 5, name: 'GEELY' },
    { id: 6, name: 'GMC' },
    { id: 7, name: 'GREATWALL' },
    { id: 8, name: 'HIPHI' },
    { id: 9, name: 'HONDA' },
    { id: 10, name: 'JIDU' },
    { id: 11, name: 'JMC' },
    { id: 12, name: 'KAIYI' },
    { id: 13, name: 'KIA' },
    { id: 14, name: 'LYNK & CO' },
    { id: 15, name: 'MERCEDES BENZ' },
    { id: 16, name: 'MG' },
    { id: 17, name: 'NISSAN' },
    { id: 18, name: 'RAM' },
    { id: 19, name: 'SUZUKI' },
    { id: 20, name: 'TOYOTA' },
    { id: 21, name: 'VOLKSWAGEN' },
  ];

  // Map filter IDs to specification keys
  const specFilterKeyMap = {
    'bodyType': 'body_type',
    'fuelType': 'fuel_type',
    'transmission': 'transmission',
    'driveType': 'drive_type',
    'steeringSide': 'steering_side',
    'regionalSpec': 'regional_specification',
    'doors': 'doors',
    'seats': 'seats',
    'wheelSize': 'wheel_size',
    'interiorColor': 'interior_color',
    'color': 'exterior_color',
    'cylinders': 'cylinders'
  };

  useEffect(() => {
    // Fetch all specifications when component mounts
    fetchAllSpecifications();
    
    // Initialize brands immediately with static list
    if (filterType === 'brands') {
      setBrands(staticBrandsList);
    }
  }, []);

  useEffect(() => {
      if (activeFilter === 'brands') {
        // Initialize with static brands first, then try API
        fetchBrands();
      } else if (activeFilter === 'models') {
        fetchModels();
      } else if (activeFilter === 'trims') {
        fetchTrims();
      } else if (activeFilter === 'years') {
        fetchYears();
      } else if (specFilterKeyMap[activeFilter]) {
        // If it's a specification filter, fetch the relevant spec values
        fetchSpecValues(specFilterKeyMap[activeFilter]);
    } else if (activeFilter === 'allSpecifications') {
      fetchAllSpecifications();
    }
  }, [activeFilter]);

  useEffect(() => {
    console.log('FilterScreen: Current filters received:', JSON.stringify(currentFilters));
    if (currentFilters.brands && currentFilters.brands.length > 0) {
      console.log('Pre-selected brands:', currentFilters.brands.join(', '));
    }
  }, []);

  const extractBrandsFromModels = (modelsData) => {
    if (!Array.isArray(modelsData) || modelsData.length === 0) {
      return [];
    }
    
    // Create a map to hold unique brands by id
    const brandsMap = {};
    
    // Process models to extract unique brands
    modelsData.forEach(model => {
      if (model.brand && model.brand.id) {
        const brandId = model.brand.id;
        brandsMap[brandId] = {
          id: brandId,
          name: model.brand.name || '',
          slug: model.brand.slug || '',
        };
      }
    });
    
    // Convert map values to array and sort alphabetically
    const uniqueBrands = Object.values(brandsMap).sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
    
    console.log(`Extracted ${uniqueBrands.length} unique brands from models`);
    return uniqueBrands;
  };

  const extractTrimsFromCars = (carsData) => {
    if (!Array.isArray(carsData) || carsData.length === 0) {
      return [];
    }
    
    // Create a map to hold unique trims by id
    const trimsMap = {};
    
    // Process cars to extract unique trims
    carsData.forEach(car => {
      if (car.Trim && car.Trim.id) {
        const trimId = car.Trim.id;
        trimsMap[trimId] = {
          id: trimId,
          name: car.Trim.name || '',
          slug: car.Trim.slug || '',
        };
      }
    });
    
    // Convert map values to array and sort alphabetically
    const uniqueTrims = Object.values(trimsMap).sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
    
    console.log(`Extracted ${uniqueTrims.length} unique trims from cars`);
    return uniqueTrims;
  };

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
        
        console.log(`Fetched ${sortedBrands.length} brands for filter screen`);
        setBrands(sortedBrands);
        return; // Success - exit early
      }
      
      // If previous methods fail, fallback to original method
      const params = {
        page: 1,
        limit: 50,
        featured: true,
      };
      
      const fallbackResponse = await getBrandList(params);
      
      if (fallbackResponse && Array.isArray(fallbackResponse.data)) {
        setBrands(fallbackResponse.data);
        return; // Success - exit early
      }
      
      // If all API methods fail, use static brands list from the UI
      setBrands(staticBrandsList);
      
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Set fallback data with all brands from the UI
      setBrands(staticBrandsList);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchModels = async () => {
    try {
      setLoading(true);
      // Call the carmodel/list API with pagination, limit, etc.
      const params = {
        page: 1,
        limit: 20,
        sortBy: 'id',
        order: 'desc',
        lang: 'en'
      };
      
      const response = await getCarModelList(params);
      
      if (response && response.data) {
        // Check different possible structures
        const modelsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
          
        console.log('Models data:', modelsData);
        setModels(modelsData);
      }
    } catch (error) {
      console.error('Error fetching car models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrims = async () => {
    try {
      setLoading(true);
      
      // Use the direct car list API to get cars with trim data
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
        params: {
          limit: 100 // Request more cars to get more trim variety
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      console.log('Trim API response status:', response.status);
      
      // Extract trim data from the API response
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Found cars:', response.data.data.length);
        
        // Extract unique trims from car data
        const extractedTrims = [];
        const trimIds = new Set();
        const trimNames = new Set(); // Track trim names to prevent duplicates
        
        // Process each car to extract its trim information
        response.data.data.forEach(car => {
          if (car && car.Trim && car.Trim.id && car.Trim.name) {
            const trimName = car.Trim.name.trim().toUpperCase(); // Normalize trim name
            
            // Check if we already have this trim ID or name
            if (!trimIds.has(car.Trim.id) && !trimNames.has(trimName)) {
              trimIds.add(car.Trim.id);
              trimNames.add(trimName);
              
              extractedTrims.push({
                id: car.Trim.id,
                name: car.Trim.name,
                slug: car.Trim.slug || ''
              });
            }
          }
        });
        
        // Sort trims alphabetically
        const sortedTrims = extractedTrims.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        
        console.log(`Found ${sortedTrims.length} unique trims from API`);
        
        if (sortedTrims.length > 0) {
          setTrims(sortedTrims);
        } else {
          // Fallback mock data if no trims found
          setTrims([
            { id: 24, name: 'AIR', slug: 'air' },
            { id: 32, name: 'COMMUTER', slug: 'commuter' },
            { id: 33, name: 'GLX', slug: 'glx' },
            { id: 34, name: 'GXR', slug: 'gxr' },
            { id: 35, name: 'LOW', slug: 'low' },
            { id: 36, name: 'MID', slug: 'mid' },
            { id: 37, name: 'STANDARD ROOF', slug: 'standard-roof' },
            { id: 38, name: 'VXR', slug: 'vxr' },
            { id: 46, name: '615 MAX', slug: '615-max' },
          ]);
        }
      } else {
        // Fallback mock data
        setTrims([
          { id: 24, name: 'AIR', slug: 'air' },
          { id: 32, name: 'COMMUTER', slug: 'commuter' },
          { id: 33, name: 'GLX', slug: 'glx' },
          { id: 34, name: 'GXR', slug: 'gxr' },
          { id: 35, name: 'LOW', slug: 'low' },
          { id: 36, name: 'MID', slug: 'mid' },
          { id: 37, name: 'STANDARD ROOF', slug: 'standard-roof' },
          { id: 38, name: 'VXR', slug: 'vxr' },
          { id: 46, name: '615 MAX', slug: '615-max' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching trims:', error);
      // Set fallback data on error
      setTrims([
        { id: 24, name: 'AIR', slug: 'air' },
        { id: 32, name: 'COMMUTER', slug: 'commuter' },
        { id: 33, name: 'GLX', slug: 'glx' },
        { id: 34, name: 'GXR', slug: 'gxr' },
        { id: 35, name: 'LOW', slug: 'low' },
        { id: 36, name: 'MID', slug: 'mid' },
        { id: 46, name: '615 MAX', slug: '615-max' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      setLoading(true);
      
      // Use the car list API to get cars with year data
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
        params: {
          limit: 100 // Request more cars to get more year variety
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      console.log('Year API response status:', response.status);
      
      // Extract year data from the API response
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Found cars for years:', response.data.data.length);
        
        // Extract unique years from car data
        const extractedYears = [];
        const yearIds = new Set();
        const yearValues = new Set(); // Track year values to prevent duplicates
        
        // Process each car to extract its year information
        response.data.data.forEach(car => {
          if (car && car.Year && car.Year.id && car.Year.year) {
            const yearValue = car.Year.year;
            
            // Check if we already have this year ID or value
            if (!yearIds.has(car.Year.id) && !yearValues.has(yearValue)) {
              yearIds.add(car.Year.id);
              yearValues.add(yearValue);
              
              extractedYears.push({
                id: car.Year.id,
                year: yearValue
              });
            }
          }
        });
        
        // Sort years in descending order (newest first)
        const sortedYears = extractedYears.sort((a, b) => b.year - a.year);
        
        console.log(`Found ${sortedYears.length} unique years from API`);
        
        if (sortedYears.length > 0) {
          setYears(sortedYears);
        } else {
          // Fallback mock data if no years found
          setYears([
            { id: 1, year: 2025 },
            { id: 2, year: 2024 },
            { id: 3, year: 2023 },
            { id: 4, year: 2022 },
            { id: 5, year: 2021 },
            { id: 6, year: 2020 }
          ]);
        }
      } else {
        // Fallback mock data
        setYears([
          { id: 1, year: 2025 },
          { id: 2, year: 2024 },
          { id: 3, year: 2023 },
          { id: 4, year: 2022 },
          { id: 5, year: 2021 },
          { id: 6, year: 2020 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      // Set fallback data on error
      setYears([
        { id: 1, year: 2025 },
        { id: 2, year: 2024 },
        { id: 3, year: 2023 },
        { id: 4, year: 2022 },
        { id: 5, year: 2021 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch all specifications at once
  const fetchAllSpecifications = async () => {
    try {
      setLoading(true);
      
      // Use the car list API to get cars with all specifications
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
        params: {
          limit: 100
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Extract and organize all specification values
        const specs = {};
        
        response.data.data.forEach(car => {
          if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
            car.SpecificationValues.forEach(specValue => {
              if (specValue.Specification && specValue.Specification.key) {
                const specKey = specValue.Specification.key;
                
                if (!specs[specKey]) {
                  specs[specKey] = {
                    name: specValue.Specification.name,
                    values: {}
                  };
                }
                
                // Add the spec value if it doesn't exist yet
                if (!specs[specKey].values[specValue.id]) {
                  specs[specKey].values[specValue.id] = {
                    id: specValue.id,
                    name: specValue.name,
                    slug: specValue.slug
                  };
                }
              }
            });
          }
        });
        
        console.log('Loaded all specifications:', Object.keys(specs).length);
        setAllSpecifications(specs);
      }
    } catch (error) {
      console.error('Error fetching all specifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modified to store spec values by type
  const fetchSpecValues = async (specKey) => {
    try {
      setLoading(true);
      
      const response = await fetchSpecificationValues(specKey);
      
      console.log(`Fetched ${specKey} values:`, response.data.length);
      
      if (response && response.success && Array.isArray(response.data)) {
        setSpecValues(response.data);
      } else {
        // Fallback to empty array
        setSpecValues([]);
      }
    } catch (error) {
      console.error(`Error fetching ${specKey} values:`, error);
      setSpecValues([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format brand name for display
  const formatBrandName = (name) => {
    if (!name) return '';
    
    // Handle special cases like BMW
    if (name.length <= 3) return name.toUpperCase();
    
    // For other cases, keep as is (since they come from API capitalized as needed)
    return name;
  };

  const handleBrandSelect = (brandId, brandName) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(prev => prev.filter(name => name !== brandName));
    } else {
      setSelectedBrands(prev => [...prev, brandName]);
    }
    
    // Store the ID alongside the name
    if (selectedBrandIds && selectedBrandIds.includes(brandId)) {
      setSelectedBrandIds(prev => prev.filter(id => id !== brandId));
    } else {
      setSelectedBrandIds(prev => [...prev, brandId]);
    }
  };
  
  const handleModelSelect = (modelId, modelName) => {
    if (selectedModels.includes(modelName)) {
      setSelectedModels(prev => prev.filter(name => name !== modelName));
    } else {
      setSelectedModels(prev => [...prev, modelName]);
    }
    
    // Store the ID alongside the name
    if (selectedModelIds && selectedModelIds.includes(modelId)) {
      setSelectedModelIds(prev => prev.filter(id => id !== modelId));
    } else {
      setSelectedModelIds(prev => [...prev, modelId]);
    }
  };

  const handleTrimSelect = (trimId, trimName) => {
    if (selectedTrims.includes(trimName)) {
      setSelectedTrims(prev => prev.filter(name => name !== trimName));
    } else {
      setSelectedTrims(prev => [...prev, trimName]);
    }
    
    // Store the ID alongside the name
    if (selectedTrimIds && selectedTrimIds.includes(trimId)) {
      setSelectedTrimIds(prev => prev.filter(id => id !== trimId));
    } else {
      setSelectedTrimIds(prev => [...prev, trimId]);
    }
  };

  const handleYearSelect = (yearId, yearValue) => {
    if (selectedYears.includes(yearValue)) {
      setSelectedYears(prev => prev.filter(year => year !== yearValue));
    } else {
      setSelectedYears(prev => [...prev, yearValue]);
    }
    
    // Store the ID alongside the year value
    if (selectedYearIds && selectedYearIds.includes(yearId)) {
      setSelectedYearIds(prev => prev.filter(id => id !== yearId));
    } else {
      setSelectedYearIds(prev => [...prev, yearId]);
    }
  };

  // Modified to handle specification selections by type and use names
  const handleSpecValueSelect = (specKey, specValueId, specValueName) => {
    setSelectedSpecValues(prev => {
      const updatedValues = { ...prev };
      
      if (!updatedValues[specKey]) {
        updatedValues[specKey] = [];
      }
      
      if (updatedValues[specKey].includes(specValueName)) {
        updatedValues[specKey] = updatedValues[specKey].filter(name => name !== specValueName);
      } else {
        updatedValues[specKey] = [...updatedValues[specKey], specValueName];
      }
      
      return updatedValues;
    });
  };

  const handleFilterSelect = (filterType) => {
    // Only update the active filter tab, don't reset any selections
    setActiveFilter(filterType);
  };

  const handleApply = () => {
    console.log('Applying filters...');
    
    // Construct a filters object with all selected values
    const filters = {
      // Brand filter state
      brands: selectedBrands,
      brandIds: selectedBrandIds, // Add brand IDs for API filtering
      
      // Model filter state
      models: selectedModels,
      modelIds: selectedModelIds, // Add model IDs for API filtering
      
      // Trim filter state
      trims: selectedTrims,
      trimIds: selectedTrimIds, // Add trim IDs for API filtering
      
      // Year filter state
      years: selectedYears,
      yearIds: selectedYearIds, // Add year IDs for API filtering
      
      // Specifications filter state (body type, fuel type, etc.)
      specifications: { ...selectedSpecValues },
      
      // Other filter states would be added here
    };
    
    console.log('Applied filters:', JSON.stringify(filters));
    
    // Call the callback with the filters
    if (onApplyCallback) {
      onApplyCallback(filters);
    }
    
    // Navigate back
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedYears([]);
    setSelectedSpecValues({});
  };

  const getSpecificationsFromCars = async () => {
    try {
      const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
        params: { limit: 100 },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        const specs = {};
        
        // Extract all specification values from cars
        response.data.data.forEach(car => {
          if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
            car.SpecificationValues.forEach(specValue => {
              if (specValue.Specification) {
                const specKey = specValue.Specification.key;
                const specName = specValue.Specification.name;
                
                if (!specs[specKey]) {
                  specs[specKey] = {
                    name: specName,
                    values: {}
                  };
                }
                
                // Add specification value if not already added
                if (!specs[specKey].values[specValue.id]) {
                  specs[specKey].values[specValue.id] = {
                    id: specValue.id,
                    name: specValue.name,
                    slug: specValue.slug
                  };
                }
              }
            });
          }
        });
        
        console.log('Extracted specifications:', Object.keys(specs));
        setAllSpecifications(specs);
        return specs;
      }
    } catch (error) {
      console.error('Error extracting specifications:', error);
    }
    return {};
  };
  
  // Modified filter items - updated to match the order in the UI
  const filterItems = [
    { id: 'brands', label: 'Brand(s)' },
    { id: 'models', label: 'Model(s)' },
    { id: 'trims', label: 'Trim(s)' },
    { id: 'years', label: 'Year(s)' },
    { id: 'priceRange', label: 'Price Range' },
    { id: 'transmission', label: 'Transmission' },
    { id: 'driveType', label: 'Drive Type' },
    { id: 'cylinders', label: 'Cylinders' },
    { id: 'fuelType', label: 'Fuel Type' },
    { id: 'doors', label: 'Doors' },
    { id: 'seats', label: 'Seats' },
    { id: 'bodyType', label: 'Body Type' },
    { id: 'wheelSize', label: 'Wheel Size' },
    { id: 'interiorColor', label: 'Interior Color' },
    { id: 'color', label: 'Color' },
    { id: 'steeringSide', label: 'Steering Side' },
    { id: 'regionalSpec', label: 'Regional Specification' }
  ];

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item.id && styles.activeFilterItem,
      ]}
      onPress={() => handleFilterSelect(item.id)}
    >
      <Text style={styles.filterItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => handleBrandSelect(item.id, item.name)}
    >
      <View style={styles.checkbox}>
        {selectedBrands.includes(item.name) && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      
      <View style={styles.brandContent}>
        {item.logo && (
          <View style={styles.brandLogoContainer}>
            <CarImage 
              source={{
                uri: `https://cdn.legendmotorsglobal.com/${item.logo}`, 
                filename: item.logo,
                fullPath: item.logo
              }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
        )}
        <Text style={styles.brandName}>{formatBrandName(item.name)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderModelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => handleModelSelect(item.id, item.name)}
    >
      <View style={styles.checkbox}>
        {selectedModels.includes(item.name) && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      <Text style={styles.brandName}>
        {item.name} {item.brand && `(${item.brand.name})`}
      </Text>
    </TouchableOpacity>
  );

  const renderTrimItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => handleTrimSelect(item.id, item.name)}
    >
      <View style={styles.checkbox}>
        {selectedTrims.includes(item.name) && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderYearItem = ({ item }) => (
    <TouchableOpacity
      style={styles.brandItem}
      onPress={() => handleYearSelect(item.id, item.year)}
    >
      <View style={styles.checkbox}>
        {selectedYears.includes(item.year.toString()) && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      <Text style={styles.brandName}>{item.year}</Text>
    </TouchableOpacity>
  );

  const renderSpecValueItem = ({ item }) => {
    const specKey = item.Specification?.key || specFilterKeyMap[activeFilter];
    
    return (
    <TouchableOpacity
      style={styles.brandItem}
        onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
    >
      <View style={styles.checkbox}>
          {selectedSpecValues[specKey]?.includes(item.name) && (
          <View style={styles.checkboxInner} />
        )}
      </View>
      <Text style={styles.brandName}>{item.name}</Text>
    </TouchableOpacity>
  );
  };

  // Add specific transmission values with fallback if API doesn't return these
  const initializeTransmissionValues = () => {
    // Check if we already have transmission values from the API
    if (allSpecifications['transmission'] && 
        Object.keys(allSpecifications['transmission'].values).length > 0) {
      return;
    }
    
    // Set default transmission values if not available from API
    const transmissionValues = {
      'transmission': {
        name: 'Transmission',
        values: {
          1: { id: 1, name: 'Manual', slug: 'manual' },
          2: { id: 2, name: 'Automatic', slug: 'automatic' },
          3: { id: 3, name: 'Semi-Automatic', slug: 'semi-automatic' },
          4: { id: 4, name: 'Cvt', slug: 'cvt' }
        }
      }
    };
    
    // Update the state with these values
    setAllSpecifications(prev => ({
      ...prev,
      ...transmissionValues
    }));
  };
  
  // Add this to useEffect to initialize transmission values
  useEffect(() => {
    initializeTransmissionValues();
  }, [allSpecifications]);

  // Improve the rendering of checkbox items
  const renderCheckboxItem = (item, specKey, onSelect) => {
    const isSelected = specKey ? 
      (selectedSpecValues[specKey]?.includes(item.name)) : 
      false;
    
    return (
      <TouchableOpacity
        style={styles.checkboxItemContainer}
        onPress={() => onSelect(item.id, item.name)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <View style={styles.checkboxInner} />
          )}
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  
  // Update the renderSpecificationByType function to use the new renderCheckboxItem
  const renderSpecificationByType = (specKey) => {
    if (!allSpecifications[specKey]) {
      // Try to initialize transmission values if they're missing
      if (specKey === 'transmission') {
        initializeTransmissionValues();
      }
      
      return (
        <Text style={styles.emptyText}>No data available</Text>
      );
    }
    
    const specName = allSpecifications[specKey].name;
    const specValues = Object.values(allSpecifications[specKey].values);
    
    return (
      <View style={styles.rightContent}>
        <Text style={styles.sectionTitle}>{specName}</Text>
        {specValues.length > 0 ? (
          <FlatList
            data={specValues}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderCheckboxItem(
              item, 
              specKey, 
              (itemId, itemName) => handleSpecValueSelect(specKey, itemId, itemName)
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No options available</Text>
        )}
      </View>
    );
  };

  // Add specific transmission values when transmission filter is selected
  const getTransmissionValues = () => {
    // Define the common transmission types
    return [
      { id: 1, name: 'Manual', slug: 'manual' },
      { id: 2, name: 'Automatic', slug: 'automatic' },
      { id: 3, name: 'Semi-Automatic', slug: 'semi-automatic' },
      { id: 4, name: 'Cvt', slug: 'cvt' }
    ];
  };
  
  // Add specific values for all filter types
  const getFuelTypeValues = () => {
    return [
      { id: 1, name: 'Petrol', slug: 'petrol' },
      { id: 2, name: 'Diesel', slug: 'diesel' },
      { id: 3, name: 'Electric', slug: 'electric' },
      { id: 4, name: 'Hybrid', slug: 'hybrid' },
      { id: 5, name: 'Lpg', slug: 'lpg' },
      { id: 6, name: 'Hydrogen', slug: 'hydrogen' },
      { id: 7, name: 'Plug-In Hybrid', slug: 'plug-in-hybrid' }
    ];
  };
  
  const getDoorsValues = () => {
    return [
      { id: 1, name: '2 Doors', slug: '2-doors' },
      { id: 2, name: '3 Doors', slug: '3-doors' },
      { id: 3, name: '4 Doors', slug: '4-doors' },
      { id: 4, name: '5 Doors', slug: '5-doors' },
      { id: 5, name: '6+ Doors', slug: '6plus-doors' }
    ];
  };
  
  const getSeatsValues = () => {
    return [
      { id: 1, name: '2-Seater', slug: '2-seater' },
      { id: 2, name: '3-Seater', slug: '3-seater' },
      { id: 3, name: '4-Seater', slug: '4-seater' },
      { id: 4, name: '5-Seater', slug: '5-seater' },
      { id: 5, name: '6-Seater', slug: '6-seater' },
      { id: 6, name: '7-Seater', slug: '7-seater' },
      { id: 7, name: '8-Seater', slug: '8-seater' },
      { id: 8, name: '9-Seater', slug: '9-seater' },
      { id: 9, name: '10-Seater', slug: '10-seater' },
      { id: 10, name: '12-Seater', slug: '12-seater' },
      { id: 11, name: '13-Seater', slug: '13-seater' }
    ];
  };
  
  const getBodyTypeValues = () => {
    return [
      { id: 1, name: 'Sedan', slug: 'sedan' },
      { id: 2, name: 'Hatchback', slug: 'hatchback' },
      { id: 3, name: 'Suv', slug: 'suv' },
      { id: 4, name: 'Crossover', slug: 'crossover' },
      { id: 5, name: 'Coupe', slug: 'coupe' },
      { id: 6, name: 'Convertible', slug: 'convertible' },
      { id: 7, name: 'Pickup Truck', slug: 'pickup-truck' },
      { id: 8, name: 'Van', slug: 'van' },
      { id: 9, name: 'Wagon', slug: 'wagon' }
    ];
  };
  
  const getWheelSizeValues = () => {
    return [
      { id: 1, name: '14 Inches', slug: '14-inches' },
      { id: 2, name: '15 Inches', slug: '15-inches' },
      { id: 3, name: '16 Inches', slug: '16-inches' },
      { id: 4, name: '17 Inches', slug: '17-inches' },
      { id: 5, name: '18 Inches', slug: '18-inches' },
      { id: 6, name: '19 Inches', slug: '19-inches' },
      { id: 7, name: '20 Inches', slug: '20-inches' },
      { id: 8, name: '21 Inches', slug: '21-inches' },
      { id: 9, name: '22 Inches', slug: '22-inches' },
      { id: 10, name: '23 Inches', slug: '23-inches' }
    ];
  };
  
  const getInteriorColorValues = () => {
    return [
      { id: 1, name: 'Blue', slug: 'blue' },
      { id: 2, name: 'Maroon', slug: 'maroon' },
      { id: 3, name: 'Grey', slug: 'grey' },
      { id: 4, name: 'Brown', slug: 'brown' },
      { id: 5, name: 'White', slug: 'white' },
      { id: 6, name: 'Red', slug: 'red' },
      { id: 7, name: 'Beige', slug: 'beige' },
      { id: 8, name: 'Ivory', slug: 'ivory' },
      { id: 9, name: 'Cream', slug: 'cream' },
      { id: 10, name: 'Green', slug: 'green' },
      { id: 11, name: 'Tan', slug: 'tan' },
      { id: 12, name: 'Black', slug: 'black' }
    ];
  };
  
  const getColorValues = () => {
    return [
      { id: 1, name: 'White', slug: 'white' },
      { id: 2, name: 'Black', slug: 'black' },
      { id: 3, name: 'Silver', slug: 'silver' },
      { id: 4, name: 'Gray', slug: 'gray' },
      { id: 5, name: 'Blue', slug: 'blue' },
      { id: 6, name: 'Red', slug: 'red' },
      { id: 7, name: 'Brown', slug: 'brown' },
      { id: 8, name: 'Green', slug: 'green' },
      { id: 9, name: 'Yellow', slug: 'yellow' },
      { id: 10, name: 'Orange', slug: 'orange' },
      { id: 11, name: 'Purple', slug: 'purple' },
      { id: 12, name: 'Gold', slug: 'gold' }
    ];
  };
  
  // Add regional specification values
  const getRegionalSpecValues = () => {
    return [
      { id: 1, name: 'Yemen', slug: 'yemen' },
      { id: 2, name: 'China', slug: 'china' },
      { id: 3, name: 'Eu', slug: 'eu' },
      { id: 4, name: 'Asia', slug: 'asia' },
      { id: 5, name: 'Africa', slug: 'africa' },
      { id: 6, name: 'Latin America', slug: 'latin-america' },
      { id: 7, name: 'Australia', slug: 'australia' },
      { id: 8, name: 'Japan', slug: 'japan' },
      { id: 9, name: 'Gcc', slug: 'gcc' },
      { id: 10, name: 'India', slug: 'india' }
    ];
  };
  
  // Add steering side values
  const getSteeringSideValues = () => {
    return [
      { id: 1, name: 'Left-Hand Drive', slug: 'left-hand-drive' },
      { id: 2, name: 'Right-Hand Drive', slug: 'right-hand-drive' }
    ];
  };
  
  // Add drive type values
  const getDriveTypeValues = () => {
    return [
      { id: 1, name: 'Front-Wheel Drive', slug: 'front-wheel-drive' },
      { id: 2, name: 'Rear-Wheel Drive', slug: 'rear-wheel-drive' },
      { id: 3, name: 'All-Wheel Drive', slug: 'all-wheel-drive' },
      { id: 4, name: 'Four-Wheel Drive', slug: 'four-wheel-drive' }
    ];
  };
  
  // Add cylinder values
  const getCylinderValues = () => {
    return [
      { id: 1, name: '2 Cylinders', slug: '2-cylinders' },
      { id: 2, name: '3 Cylinders', slug: '3-cylinders' },
      { id: 3, name: '4 Cylinders', slug: '4-cylinders' },
      { id: 4, name: '5 Cylinders', slug: '5-cylinders' },
      { id: 5, name: '6 Cylinders', slug: '6-cylinders' },
      { id: 6, name: '8 Cylinders', slug: '8-cylinders' },
      { id: 7, name: '10 Cylinders', slug: '10-cylinders' },
      { id: 8, name: '12 Cylinders', slug: '12-cylinders' },
      { id: 9, name: 'None - Electric', slug: 'none-electric' }
    ];
  };
  
  // Now update the renderContent function to handle these specific filter types
  const renderContent = () => {
    if (activeFilter === 'brands') {
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Brand(s)</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading brands...</Text>
            </View>
          ) : (
            <FlatList
              data={brands}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBrandItem}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'models') {
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Model(s)</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading models...</Text>
            </View>
          ) : (
            <>
              {models.length > 0 ? (
                <FlatList
                  data={models}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderModelItem}
                />
              ) : (
                <Text style={styles.emptyText}>No models available</Text>
              )}
            </>
          )}
        </View>
      );
    } else if (activeFilter === 'trims') {
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Trim(s)</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading trims...</Text>
            </View>
          ) : (
            <>
              {trims.length > 0 ? (
                <FlatList
                  data={trims}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderTrimItem}
                />
              ) : (
                <Text style={styles.emptyText}>No trims available</Text>
              )}
            </>
          )}
        </View>
      );
    } else if (activeFilter === 'years') {
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Year(s)</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading years...</Text>
            </View>
          ) : (
            <>
              {years.length > 0 ? (
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderYearItem}
                />
              ) : (
                <Text style={styles.emptyText}>No years available</Text>
              )}
            </>
          )}
        </View>
      );
    } else if (activeFilter === 'transmission') {
      // Special handling for transmission
      const transmissionValues = getTransmissionValues();
      const specKey = 'transmission';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Transmission</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading transmission options...</Text>
            </View>
          ) : (
                <FlatList
              data={transmissionValues}
                  keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'fuelType') {
      const fuelTypeValues = getFuelTypeValues();
      const specKey = 'fuel_type';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Fuel Type</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading fuel types...</Text>
            </View>
          ) : (
            <FlatList
              data={fuelTypeValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'doors') {
      const doorsValues = getDoorsValues();
      const specKey = 'doors';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Doors</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading door options...</Text>
            </View>
          ) : (
            <FlatList
              data={doorsValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'seats') {
      const seatsValues = getSeatsValues();
      const specKey = 'seats';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Seats</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading seat options...</Text>
            </View>
          ) : (
            <FlatList
              data={seatsValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'bodyType') {
      const bodyTypeValues = getBodyTypeValues();
      const specKey = 'body_type';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Body Type</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading body types...</Text>
            </View>
          ) : (
            <FlatList
              data={bodyTypeValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'wheelSize') {
      const wheelSizeValues = getWheelSizeValues();
      const specKey = 'wheel_size';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Wheel Size</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading wheel sizes...</Text>
            </View>
          ) : (
            <FlatList
              data={wheelSizeValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'interiorColor') {
      const interiorColorValues = getInteriorColorValues();
      const specKey = 'interior_color';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Interior Color</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading interior colors...</Text>
            </View>
          ) : (
            <FlatList
              data={interiorColorValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'color') {
      const colorValues = getColorValues();
      const specKey = 'exterior_color';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Color</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading colors...</Text>
            </View>
          ) : (
            <FlatList
              data={colorValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'priceRange') {
      // Sample price range filter
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceInputs}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Minimum Price</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.priceValue}>0</Text>
              </View>
            </View>
            
            <Text style={styles.priceSeparator}>-</Text>
            
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Maximum Price</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.priceValue}>700K</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sliderContainer}>
            {/* This is a mock slider - in a real app, use a slider component */}
            <View style={styles.sliderTrack}>
              <View style={styles.sliderFill} />
              <View style={styles.sliderThumb} />
              <View style={[styles.sliderThumb, { right: 0 }]} />
            </View>
          </View>
        </View>
      );
    } else if (activeFilter === 'allSpecifications') {
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>All Specifications</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading specifications...</Text>
            </View>
          ) : (
            <>
              {Object.keys(allSpecifications).length > 0 ? (
                <FlatList
                  data={Object.values(allSpecifications).map(spec => ({
                    ...spec,
                    id: spec.name,
                  }))}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSpecValueItem}
                />
              ) : (
                <Text style={styles.emptyText}>No specifications available</Text>
              )}
            </>
          )}
        </View>
      );
    } else if (activeFilter === 'regionalSpec') {
      const regionalSpecValues = getRegionalSpecValues();
      const specKey = 'regional_specification';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Regional Specification</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading regional specifications...</Text>
            </View>
          ) : (
            <FlatList
              data={regionalSpecValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'steeringSide') {
      const steeringSideValues = getSteeringSideValues();
      const specKey = 'steering_side';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Steering Side</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading steering side options...</Text>
            </View>
          ) : (
            <FlatList
              data={steeringSideValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'driveType') {
      const driveTypeValues = getDriveTypeValues();
      const specKey = 'drive_type';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Drive Type</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading drive type options...</Text>
            </View>
          ) : (
            <FlatList
              data={driveTypeValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (activeFilter === 'cylinders') {
      const cylinderValues = getCylinderValues();
      const specKey = 'cylinders';
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>Cylinders</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>Loading cylinder options...</Text>
            </View>
          ) : (
            <FlatList
              data={cylinderValues}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.checkboxItemContainer}
                  onPress={() => handleSpecValueSelect(specKey, item.id, item.name)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedSpecValues[specKey]?.includes(item.name) && styles.checkboxSelected
                  ]}>
                    {selectedSpecValues[specKey]?.includes(item.name) && (
                      <View style={styles.checkboxInner} />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      );
    } else if (specFilterKeyMap[activeFilter]) {
      // Get the spec key for the current filter
      const specKey = specFilterKeyMap[activeFilter];
      
      // Check if we have the data in allSpecifications
      if (allSpecifications[specKey]) {
        return renderSpecificationByType(specKey);
      }
      
      // Fallback to the old method
      const specTitle = filterItems.find(item => item.id === activeFilter)?.label || activeFilter;
      
      return (
        <View style={styles.rightContent}>
          <Text style={styles.sectionTitle}>{specTitle}</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4821F" />
              <Text style={styles.loadingText}>{`Loading ${specTitle.toLowerCase()}...`}</Text>
            </View>
          ) : (
            <>
              {specValues.length > 0 ? (
                <FlatList
                  data={specValues}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem}
                />
              ) : (
                <Text style={styles.emptyText}>{`No ${specTitle.toLowerCase()} available`}</Text>
              )}
            </>
          )}
        </View>
      );
    }
    
    // Other filter types would be handled here
    return (
      <View style={styles.rightContent}>
        <Text style={styles.sectionTitle}>{activeFilter}</Text>
        <Text style={styles.emptyText}>Coming soon...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <BackArrow />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.filterListContainer}>
          <FlatList
            data={filterItems}
            keyExtractor={(item) => item.id}
            renderItem={renderFilterItem}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {renderContent()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  filterListContainer: {
    width: '40%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
  },
  filterItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  activeFilterItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#F4821F',
  },
  filterItemText: {
    fontSize: 16,
    color: '#333333',
  },
  rightContent: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#F4821F',
  },
  brandContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: '80%',
    height: '80%',
  },
  brandName: {
    fontSize: 16,
    color: '#333333',
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#888888',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F4821F',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 5,
  },
  priceInput: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333333',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#333333',
    marginHorizontal: 10,
  },
  sliderContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    height: '100%',
    backgroundColor: '#F4821F',
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F4821F',
    borderRadius: 12,
    position: 'absolute',
    top: -9,
    left: '10%',
    marginLeft: -12,
  },
  checkboxItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxSelected: {
    borderColor: '#F4821F',
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
});

export default FilterScreen; 