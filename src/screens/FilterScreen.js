import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as filterService from '../services/filtersService';

const FilterScreen = ({ route, navigation }) => {
  // Get parameters from navigation or use defaults
  const { filterType = 'brands', onApplyCallback, currentFilters = {} } = route?.params || {};
  
  // State for active filter tab
  const [activeFilter, setActiveFilter] = useState(filterType);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Filter data states
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [years, setYears] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});
  
  // Selected filter states
  const [selectedBrands, setSelectedBrands] = useState(currentFilters.brands || []);
  const [selectedModels, setSelectedModels] = useState(currentFilters.models || []);
  const [selectedTrims, setSelectedTrims] = useState(currentFilters.trims || []);
  const [selectedYears, setSelectedYears] = useState(currentFilters.years || []);
  const [selectedSpecValues, setSelectedSpecValues] = useState(currentFilters.specifications || {});
  
  // Selected IDs for API filtering
  const [selectedBrandIds, setSelectedBrandIds] = useState(currentFilters.brandIds || []);
  const [selectedModelIds, setSelectedModelIds] = useState(currentFilters.modelIds || []);
  const [selectedTrimIds, setSelectedTrimIds] = useState(currentFilters.trimIds || []);
  const [selectedYearIds, setSelectedYearIds] = useState(currentFilters.yearIds || []);

  // Filter list items
  const filterItems = [
    { id: 'brands', label: 'Brand' },
    { id: 'models', label: 'Model' },
    { id: 'trims', label: 'Trim' },
    { id: 'years', label: 'Year' },
    { id: 'bodyType', label: 'Body Type' },
    { id: 'fuelType', label: 'Fuel Type' },
    { id: 'transmission', label: 'Transmission' },
    { id: 'driveType', label: 'Drive Type' },
    { id: 'color', label: 'Color' },
    { id: 'interiorColor', label: 'Interior Color' },
    { id: 'wheelSize', label: 'Wheel Size' },
    { id: 'regionalSpec', label: 'Regional Specification' },
    { id: 'steeringSide', label: 'Steering Side' },
    { id: 'seats', label: 'Seats' },
    { id: 'doors', label: 'Doors' },
    { id: 'cylinders', label: 'Cylinders' },
  ];
  
  // Specification key mapping
  const specFilterKeyMap = {
    'bodyType': 'body_type',
    'fuelType': 'fuel_type',
    'transmission': 'transmission',
    'driveType': 'drive_type',
    'color': 'color',
    'interiorColor': 'interior_color',
    'regionalSpec': 'regional_specification',
    'steeringSide': 'steering_side',
    'wheelSize': 'wheel_size',
    'seats': 'seats',
    'doors': 'doors',
    'cylinders': 'cylinders'
  };

  // Fetch all specification values once
  const fetchAllSpecValues = async () => {
    try {
      // Only fetch if we don't already have the data
      if (Object.keys(specValues).length === 0) {
        setLoading(true);
        
        console.log('Attempting to fetch all specification values from car data...');
        const response = await filterService.fetchAllSpecificationValues({ limit: 100 });
        
        if (response.success && response.data.length > 0) {
          console.log(`Success! Received ${response.data.length} total specification values from cars`);
          
          // Group specification values by specification key
          const groupedValues = {};
          
          response.data.forEach(value => {
            // Handle both uppercase "Specification" and lowercase "specification"
            const specObj = value.Specification || value.specification;
            
            if (specObj && specObj.key) {
              const key = specObj.key;
              
              if (!groupedValues[key]) {
                groupedValues[key] = [];
              }
              
              // Only add if not already in the array (avoid duplicates)
              const isDuplicate = groupedValues[key].some(item => item.name === value.name);
              if (!isDuplicate) {
                groupedValues[key].push(value);
              }
            }
          });
          
          console.log('Grouped specification values by keys:', Object.keys(groupedValues).join(', '));
          
          // Log values for specific specification types
          if (groupedValues['regional_specification']) {
            console.log('Regional Specification values:', 
              groupedValues['regional_specification'].map(item => item.name).join(', '));
          }
          
          if (groupedValues['interior_color']) {
            console.log('Interior Color values:', 
              groupedValues['interior_color'].map(item => item.name).join(', '));
          }
          
          if (groupedValues['steering_side']) {
            console.log('Steering Side values:', 
              groupedValues['steering_side'].map(item => item.name).join(', '));
          }
          
          if (groupedValues['body_type']) {
            console.log('Body Type values:', 
              groupedValues['body_type'].map(item => item.name).join(', '));
          }
          
          setSpecValues(groupedValues);
        } else {
          console.error('Error fetching specification values from cars:', response.error);
          console.log('Attempting to fetch individual specification types directly...');
          
          // Fetch individual specification types directly
          const fetchPromises = [
            fetchRegionalSpecifications(),
            fetchInteriorColorSpecifications(),
            fetchSteeringSideSpecifications(),
            fetchColorSpecifications(),
            fetchWheelSizeSpecifications(),
            fetchBodyTypeSpecifications(),
            fetchSeatsSpecifications(),
            fetchDoorsSpecifications(),
            fetchCylindersSpecifications()
          ];
          
          await Promise.all(fetchPromises);
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchAllSpecValues:', error);
      console.log('Attempting to fetch individual specification types as fallback...');
      
      // Fetch individual specification types directly
      const fetchPromises = [
        fetchRegionalSpecifications(),
        fetchInteriorColorSpecifications(),
        fetchSteeringSideSpecifications(),
        fetchColorSpecifications(),
        fetchWheelSizeSpecifications(),
        fetchBodyTypeSpecifications(),
        fetchSeatsSpecifications(),
        fetchDoorsSpecifications(),
        fetchCylindersSpecifications()
      ];
      
      await Promise.all(fetchPromises);
      
      setLoading(false);
    }
  };
  
  // Function to fetch regional specifications directly
  const fetchRegionalSpecifications = async () => {
    try {
      console.log('Fetching regional specifications directly from car data...');
      
      const response = await filterService.fetchSpecificationValues('regional_specification', { limit: 100 });
      
      if (response.success && response.data.length > 0) {
        console.log(`Success! Received ${response.data.length} regional specification values`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'regional_specification': response.data
        }));
      } else {
        console.error('Failed to fetch regional specifications from API:', response.error || 'No data returned');
      }
    } catch (error) {
      console.error('Error fetching regional specifications:', error);
    }
  };
  
  // Function to fetch interior color specifications directly
  const fetchInteriorColorSpecifications = async () => {
    try {
      console.log('Fetching interior color specifications directly from car data...');
      
      const response = await filterService.fetchSpecificationValues('interior_color', { limit: 100 });
      
      if (response.success && response.data.length > 0) {
        console.log(`Success! Received ${response.data.length} interior color specification values`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'interior_color': response.data
        }));
      } else {
        console.error('Failed to fetch interior color specifications from API:', response.error || 'No data returned');
      }
    } catch (error) {
      console.error('Error fetching interior color specifications:', error);
    }
  };
  
  // Function to fetch steering side specifications directly
  const fetchSteeringSideSpecifications = async () => {
    try {
      console.log('Fetching steering side specifications directly from car data...');
      
      const response = await filterService.fetchSpecificationValues('steering_side', { limit: 100 });
      
      if (response.success && response.data.length > 0) {
        console.log(`Success! Received ${response.data.length} steering side specification values`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'steering_side': response.data
        }));
      } else {
        console.error('Failed to fetch steering side specifications from API:', response.error || 'No data returned');
      }
    } catch (error) {
      console.error('Error fetching steering side specifications:', error);
    }
  };

  // Function to fetch color specifications directly
  const fetchColorSpecifications = async () => {
    try {
      console.log('Fetching color specifications directly from car data...');
      
      const response = await filterService.fetchSpecificationValues('color', { limit: 100 });
      
      if (response.success && response.data.length > 0) {
        console.log(`Success! Received ${response.data.length} color specification values`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'color': response.data
        }));
      } else {
        console.error('Failed to fetch color specifications from API:', response.error || 'No data returned');
      }
    } catch (error) {
      console.error('Error fetching color specifications:', error);
    }
  };
  
  // Function to fetch wheel size specifications directly
  const fetchWheelSizeSpecifications = async () => {
    try {
      console.log('Fetching wheel size specifications directly from car data...');
      
      const response = await filterService.fetchSpecificationValues('wheel_size', { limit: 100 });
      
      if (response.success && response.data.length > 0) {
        console.log(`Success! Received ${response.data.length} wheel size specification values`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'wheel_size': response.data
        }));
        } else {
        console.error('Failed to fetch wheel size specifications from API:', response.error || 'No data returned');
      }
    } catch (error) {
      console.error('Error fetching wheel size specifications:', error);
    }
  };
  
  // Function to fetch body type specifications directly
  const fetchBodyTypeSpecifications = async () => {
    try {
      console.log('🚗 Fetching body type specifications using dedicated function...');
      
      // Use the dedicated body type fetch function - most reliable approach
      const response = await filterService.default.fetchBodyTypes();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} body type values from dedicated function`);
        console.log('📊 Body types from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'body_type': response.data
        }));
        
        return;
      }
      
      // If dedicated function fails, fall back to other methods
      console.log('⚠️ Dedicated function failed, trying alternative approaches...');
      
      // Try direct API call for body types
      try {
        console.log('📞 Attempting direct API call to /specificationvalue/by-specification/body_type');
        
        // First try with pagination to get all results
        let allBodyTypes = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const directResponse = await filterService.default.api.get('/specificationvalue/by-specification/body_type', {
        params: {
              limit: 20, // Smaller limit to test pagination
              page: page
            }
          });
          
          if (directResponse.data && Array.isArray(directResponse.data.data) && directResponse.data.data.length > 0) {
            console.log(`📄 Page ${page}: Received ${directResponse.data.data.length} body types`);
            allBodyTypes = [...allBodyTypes, ...directResponse.data.data];
            
            // Check if there are more pages
            const pagination = directResponse.data.pagination;
            if (pagination && pagination.currentPage < pagination.totalPages) {
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
        
        if (allBodyTypes.length > 0) {
          console.log(`✅ Success! Received ${allBodyTypes.length} total body type values from paging`);
          console.log('📊 Body types from paging:', JSON.stringify(allBodyTypes.map(item => item.name)));
          
          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            'body_type': allBodyTypes
          }));
          
          return;
        }
      } catch (directError) {
        console.error('❌ Error with direct API call:', directError);
      }
      
      // If direct API call fails, use the standard method through filterService
      console.log('📞 Attempting to fetch body types through filterService');
      const standardResponse = await filterService.fetchSpecificationValues('body_type', { limit: 1000 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} body type values from filterService`);
        console.log('📊 Body types from filterService:', JSON.stringify(standardResponse.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'body_type': standardResponse.data
        }));
        } else {
        console.error('❌ Failed to fetch body type specifications through all methods');
        
        // If we still haven't found data, manually request each known ID 
        console.log('🔍 Attempting to fetch individual body types by ID...');
        
        // Try one more approach - direct call to a specific body type ID
        try {
          console.log('🧪 Testing with a specific body type ID request');
          const testResponse = await filterService.default.api.get('/specificationvalue/51');
          console.log('🧪 Test response for body type ID 51:', JSON.stringify(testResponse.data));
        } catch (testError) {
          console.error('❌ Test request for body type ID failed:', testError);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching body type specifications:', error);
    }
  };
  
  // Function to fetch seats specifications directly
  const fetchSeatsSpecifications = async () => {
    try {
      console.log('🪑 Fetching seats specifications using dedicated function...');
      
      // Use the dedicated seats fetch function - most reliable approach
      const response = await filterService.default.fetchSeatsData();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} seat specifications from dedicated function`);
        console.log('📊 Seats from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'seats': response.data
        }));
        
        return;
      }
      
      // If dedicated function fails, fall back to other methods
      console.log('⚠️ Dedicated function failed for seats, trying alternative approach...');
      
      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch seats through filterService');
      const standardResponse = await filterService.fetchSpecificationValues('seats', { limit: 1000 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} seat specifications from filterService`);
        console.log('📊 Seats from filterService:', JSON.stringify(standardResponse.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'seats': standardResponse.data
        }));
      } else {
        console.error('❌ Failed to fetch seat specifications through all methods');
      }
    } catch (error) {
      console.error('❌ Error fetching seat specifications:', error);
    }
  };

  // Function to fetch doors specifications directly
  const fetchDoorsSpecifications = async () => {
    try {
      console.log('🚪 Fetching doors specifications using dedicated function...');
      
      // Use the dedicated doors fetch function - most reliable approach
      const response = await filterService.default.fetchDoorsData();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} door options from dedicated function`);
        console.log('📊 Doors from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'doors': response.data
        }));
        
        return;
      }
      
      // If dedicated function fails, fall back to other methods
      console.log('⚠️ Dedicated function failed for doors, trying alternative approach...');
      
      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch doors through filterService');
      const standardResponse = await filterService.fetchSpecificationValues('doors', { limit: 1000 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} door options from filterService`);
        console.log('📊 Doors from filterService:', JSON.stringify(standardResponse.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'doors': standardResponse.data
        }));
      } else {
        console.error('❌ Failed to fetch door options through all methods');
      }
    } catch (error) {
      console.error('❌ Error fetching door specifications:', error);
    }
  };

  // Function to fetch fuel type specifications directly
  const fetchFuelTypeSpecifications = async () => {
    try {
      console.log('⛽ Fetching fuel type specifications using dedicated function...');
      
      // Use the dedicated fuel type fetch function - most reliable approach
      const response = await filterService.default.fetchFuelTypeData();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} fuel types from dedicated function`);
        console.log('📊 Fuel types from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'fuel_type': response.data
        }));
        
        return;
      }
      
      // If dedicated function fails, fall back to other methods
      console.log('⚠️ Dedicated function failed for fuel types, trying alternative approach...');
      
      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch fuel types through filterService');
      const standardResponse = await filterService.fetchSpecificationValues('fuel_type', { limit: 1000 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} fuel types from filterService`);
        console.log('📊 Fuel types from filterService:', JSON.stringify(standardResponse.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'fuel_type': standardResponse.data
        }));
      } else {
        console.error('❌ Failed to fetch fuel types through all methods');
      }
    } catch (error) {
      console.error('❌ Error fetching fuel type specifications:', error);
    }
  };

  // Function to fetch cylinders specifications directly
  const fetchCylindersSpecifications = async () => {
    try {
      console.log('🔧 Fetching cylinder specifications using dedicated function...');
      
      // Use the dedicated cylinders fetch function - most reliable approach
      const response = await filterService.default.fetchCylindersData();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} cylinder options from dedicated function`);
        console.log('📊 Cylinders from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'cylinders': response.data
        }));
        
        return;
      }
      
      // If dedicated function fails, fall back to other methods
      console.log('⚠️ Dedicated function failed for cylinders, trying alternative approach...');
      
      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch cylinders through filterService');
      const standardResponse = await filterService.fetchSpecificationValues('cylinders', { limit: 1000 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} cylinder options from filterService`);
        console.log('📊 Cylinders from filterService:', JSON.stringify(standardResponse.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'cylinders': standardResponse.data
        }));
      } else {
        console.error('❌ Failed to fetch cylinder options through all methods');
      }
    } catch (error) {
      console.error('❌ Error fetching cylinder specifications:', error);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    // Fetch all specification values at once
    fetchAllSpecValues();
    
    // Specifically fetch body types directly since this is critical
    fetchBodyTypeSpecifications();
    
    // Also fetch seats data directly
    fetchSeatsSpecifications();
    
    // Also fetch doors data directly
    fetchDoorsSpecifications();
    
    // Also fetch fuel type data directly
    fetchFuelTypeSpecifications();
    
    // Also fetch cylinders data directly
    fetchCylindersSpecifications();
  }, []);

  // Load filter data when active filter changes
  useEffect(() => {
    loadFilterData();
  }, [activeFilter]);

  // Load filter data based on active filter
  const loadFilterData = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      switch (activeFilter) {
        case 'brands':
          await fetchBrands();
          break;
        case 'models':
          await fetchModels();
          break;
        case 'trims':
          await fetchTrims();
          break;
        case 'years':
          await fetchYears();
          break;
        case 'bodyType':
          // When the body type filter is activated, log extra information for debugging
          console.log('🔍 Body Type filter activated - fetching values');
          await fetchBodyTypeSpecifications();
          break;
        case 'seats':
          if (!specValues['seats'] || specValues['seats'].length === 0) {
            await fetchSeatsSpecifications();
          }
          break;
        case 'doors':
          if (!specValues['doors'] || specValues['doors'].length === 0) {
            await fetchDoorsSpecifications();
          }
          break;
        case 'fuelType':
          if (!specValues['fuel_type'] || specValues['fuel_type'].length === 0) {
            console.log('⛽ Fuel Type filter activated - fetching values');
            await fetchFuelTypeSpecifications();
          }
          break;
        case 'cylinders':
          if (!specValues['cylinders'] || specValues['cylinders'].length === 0) {
            console.log('🔧 Cylinders filter activated - fetching values');
            await fetchCylindersSpecifications();
          }
          break;
        case 'regionalSpec':
          if (!specValues['regional_specification'] || specValues['regional_specification'].length === 0) {
            await fetchRegionalSpecifications();
          }
          break;
        case 'interiorColor':
          if (!specValues['interior_color'] || specValues['interior_color'].length === 0) {
            await fetchInteriorColorSpecifications();
          }
          break;
        case 'steeringSide':
          if (!specValues['steering_side'] || specValues['steering_side'].length === 0) {
            await fetchSteeringSideSpecifications();
          }
          break;
        case 'color':
          if (!specValues['color'] || specValues['color'].length === 0) {
            await fetchColorSpecifications();
          }
          break;
        case 'wheelSize':
          if (!specValues['wheel_size'] || specValues['wheel_size'].length === 0) {
            await fetchWheelSizeSpecifications();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands data
  const fetchBrands = async () => {
    const response = await filterService.fetchBrands({ limit: 100 });
    if (response.success) {
      // Filter out duplicate brands by name
      const uniqueBrands = [];
      const brandNames = new Set();
      
      response.data.forEach(brand => {
        if (!brandNames.has(brand.name)) {
          brandNames.add(brand.name);
          uniqueBrands.push(brand);
        }
      });
      
      setBrands(uniqueBrands);
    }
  };

  // Fetch models data
  const fetchModels = async () => {
    // Include brand filter if brands are selected
    const params = { limit: 100 };
    
    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }
    
    const response = await filterService.fetchCarModels(params);
    if (response.success) {
      // Filter out duplicate models by name
      const uniqueModels = [];
      const modelNames = new Set();
      
      response.data.forEach(model => {
        if (!modelNames.has(model.name)) {
          modelNames.add(model.name);
          uniqueModels.push(model);
        }
      });
      
      setModels(uniqueModels);
    }
  };

  // Fetch trims data
  const fetchTrims = async () => {
    // Include brand and model filters if selected
    const params = { limit: 100 };
    
    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }
    
    if (selectedModelIds.length > 0) {
      params.modelId = selectedModelIds.join(',');
    }
    
    const response = await filterService.fetchTrims(params);
    if (response.success) {
      // Filter out duplicate trims by name to avoid showing duplicates in the UI
      const uniqueTrims = [];
      const trimNames = new Set();
      
      // Filter to keep only unique trim names
      response.data.forEach(trim => {
        if (!trimNames.has(trim.name)) {
          trimNames.add(trim.name);
          uniqueTrims.push(trim);
        }
      });
      
      setTrims(uniqueTrims);
    }
  };

  // Fetch years data
  const fetchYears = async () => {
    // Include brand, model, and trim filters if selected
    const params = { limit: 100 };
    
    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }
    
    if (selectedModelIds.length > 0) {
      params.modelId = selectedModelIds.join(',');
    }
    
    if (selectedTrimIds.length > 0) {
      params.trimId = selectedTrimIds.join(',');
    }
    
    const response = await filterService.fetchYears(params);
    if (response.success) {
      // Filter out duplicate years
      const uniqueYears = [];
      const yearValues = new Set();
      
      response.data.forEach(year => {
        if (!yearValues.has(year.year)) {
          yearValues.add(year.year);
          uniqueYears.push(year);
        }
      });
      
      setYears(uniqueYears);
    }
  };

  // Handle brand selection
  const handleBrandSelect = (brandId, brandName) => {
    // Toggle brand selection
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(prev => prev.filter(name => name !== brandName));
      setSelectedBrandIds(prev => prev.filter(id => id !== brandId));
    } else {
      setSelectedBrands(prev => [...prev, brandName]);
      setSelectedBrandIds(prev => [...prev, brandId]);
    }
  };
  
  // Handle model selection
  const handleModelSelect = (modelId, modelName) => {
    // Toggle model selection
    if (selectedModels.includes(modelName)) {
      setSelectedModels(prev => prev.filter(name => name !== modelName));
      setSelectedModelIds(prev => prev.filter(id => id !== modelId));
    } else {
      setSelectedModels(prev => [...prev, modelName]);
      setSelectedModelIds(prev => [...prev, modelId]);
    }
  };

  // Handle trim selection
  const handleTrimSelect = (trimId, trimName) => {
    // Toggle trim selection
    if (selectedTrims.includes(trimName)) {
      setSelectedTrims(prev => prev.filter(name => name !== trimName));
      setSelectedTrimIds(prev => prev.filter(id => id !== trimId));
    } else {
      setSelectedTrims(prev => [...prev, trimName]);
      setSelectedTrimIds(prev => [...prev, trimId]);
    }
  };

  // Handle year selection
  const handleYearSelect = (yearId, yearValue) => {
    // Toggle year selection
    if (selectedYears.includes(yearValue)) {
      setSelectedYears(prev => prev.filter(year => year !== yearValue));
      setSelectedYearIds(prev => prev.filter(id => id !== yearId));
    } else {
      setSelectedYears(prev => [...prev, yearValue]);
      setSelectedYearIds(prev => [...prev, yearId]);
    }
  };

  // Handle specification value selection
  const handleSpecValueSelect = (specKey, valueId, valueName) => {
    // Log selection for debugging
    if (specKey === 'body_type') {
      console.log(`${selectedSpecValues[specKey]?.includes(valueName) ? 'Deselecting' : 'Selecting'} Body Type: ${valueName} (ID: ${valueId})`);
    } else if (specKey === 'regional_specification') {
      console.log(`${selectedSpecValues[specKey]?.includes(valueName) ? 'Deselecting' : 'Selecting'} Regional Specification: ${valueName} (ID: ${valueId})`);
    }
    
    setSelectedSpecValues(prev => {
      const updatedValues = { ...prev };
      
      if (!updatedValues[specKey]) {
        updatedValues[specKey] = [];
      }
      
      if (updatedValues[specKey].includes(valueName)) {
        updatedValues[specKey] = updatedValues[specKey].filter(name => name !== valueName);
      } else {
        updatedValues[specKey] = [...updatedValues[specKey], valueName];
      }
      
      return updatedValues;
    });
  };

  // Handle filter tab selection
  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId);
  };

  // Handle apply button press
  const handleApply = () => {
    // Construct filters object
    const filters = {
      brands: selectedBrands,
      brandIds: selectedBrandIds,
      models: selectedModels,
      modelIds: selectedModelIds,
      trims: selectedTrims,
      trimIds: selectedTrimIds,
      years: selectedYears,
      yearIds: selectedYearIds,
      specifications: selectedSpecValues
    };
    
    // Log selected regional specifications
    if (selectedSpecValues.regional_specification && selectedSpecValues.regional_specification.length > 0) {
      console.log('Selected Regional Specifications:', selectedSpecValues.regional_specification.join(', '));
    }
    
    // Log selected interior colors
    if (selectedSpecValues.interior_color && selectedSpecValues.interior_color.length > 0) {
      console.log('Selected Interior Colors:', selectedSpecValues.interior_color.join(', '));
    }
    
    // Log selected steering side values
    if (selectedSpecValues.steering_side && selectedSpecValues.steering_side.length > 0) {
      console.log('Selected Steering Side:', selectedSpecValues.steering_side.join(', '));
    }
    
    // Log selected exterior colors
    if (selectedSpecValues.color && selectedSpecValues.color.length > 0) {
      console.log('Selected Exterior Colors:', selectedSpecValues.color.join(', '));
    }
    
    // Log selected wheel sizes
    if (selectedSpecValues.wheel_size && selectedSpecValues.wheel_size.length > 0) {
      console.log('Selected Wheel Sizes:', selectedSpecValues.wheel_size.join(', '));
    }
    
    // Log selected body types
    if (selectedSpecValues.body_type && selectedSpecValues.body_type.length > 0) {
      console.log('Selected Body Types:', selectedSpecValues.body_type.join(', '));
    }
    
    // Log selected seats
    if (selectedSpecValues.seats && selectedSpecValues.seats.length > 0) {
      console.log('Selected Seats:', selectedSpecValues.seats.join(', '));
    }
    
    // Log selected doors
    if (selectedSpecValues.doors && selectedSpecValues.doors.length > 0) {
      console.log('Selected Doors:', selectedSpecValues.doors.join(', '));
    }
    
    // Log selected fuel types
    if (selectedSpecValues.fuel_type && selectedSpecValues.fuel_type.length > 0) {
      console.log('Selected Fuel Types:', selectedSpecValues.fuel_type.join(', '));
    }
    
    // Log selected cylinders
    if (selectedSpecValues.cylinders && selectedSpecValues.cylinders.length > 0) {
      console.log('Selected Cylinders:', selectedSpecValues.cylinders.join(', '));
    }
    
    // Call the callback with filters
    if (onApplyCallback) {
      onApplyCallback(filters);
    }
    
    // Navigate back
    navigation.goBack();
  };

  // Handle reset button press
  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedBrandIds([]);
    setSelectedModels([]);
    setSelectedModelIds([]);
    setSelectedTrims([]);
    setSelectedTrimIds([]);
    setSelectedYears([]);
    setSelectedYearIds([]);
    setSelectedSpecValues({});
  };

  // Render filter item in the left sidebar
  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item.id && styles.activeFilterItem,
      ]}
      onPress={() => handleFilterSelect(item.id)}
    >
      <Text style={[
        styles.filterItemText,
        activeFilter === item.id && styles.activeFilterItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Render brand item
  const renderBrandItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => handleBrandSelect(item.id, item.name)}
    >
      <View style={[
        styles.checkbox,
        selectedBrands.includes(item.name) && styles.checkboxSelected
      ]}>
        {selectedBrands.includes(item.name) && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  // Render model item
  const renderModelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => handleModelSelect(item.id, item.name)}
    >
      <View style={[
        styles.checkbox,
        selectedModels.includes(item.name) && styles.checkboxSelected
      ]}>
        {selectedModels.includes(item.name) && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render trim item
  const renderTrimItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => handleTrimSelect(item.id, item.name)}
    >
      <View style={[
        styles.checkbox,
        selectedTrims.includes(item.name) && styles.checkboxSelected
      ]}>
        {selectedTrims.includes(item.name) && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render year item
  const renderYearItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => handleYearSelect(item.id, item.year)}
    >
      <View style={[
        styles.checkbox,
        selectedYears.includes(item.year) && styles.checkboxSelected
      ]}>
        {selectedYears.includes(item.year) && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{item.year}</Text>
    </TouchableOpacity>
  );

  // Render specification value item
  const renderSpecValueItem = (specKey) => ({ item }) => {
    // Add specific classes for special specification items
    const isRegionalSpec = specKey === 'regional_specification';
    const isInteriorColor = specKey === 'interior_color';
    const isExteriorColor = specKey === 'color';
    const isSteeringSide = specKey === 'steering_side';
    const isWheelSize = specKey === 'wheel_size';
    const isBodyType = specKey === 'body_type';
    const isSeats = specKey === 'seats';
    const isDoors = specKey === 'doors';
    const isFuelType = specKey === 'fuel_type';
    const isCylinders = specKey === 'cylinders';
    const isSelected = selectedSpecValues[specKey]?.includes(item.name);
    
    // Debug log for body type items
    if (isBodyType) {
      console.log(`🔍 Rendering body type item: ${item.name} (ID: ${item.id})`);
    }
    
    // For interior colors, determine the actual color to display
    let colorPreview = null;
    if (isInteriorColor || isExteriorColor) {
      const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Grey': '#808080',
        'Red': '#FF0000',
        'Blue': '#0000FF',
        'Green': '#008000',
        'Yellow': '#FFFF00',
        'Brown': '#A52A2A',
        'Beige': '#F5F5DC',
        'Maroon': '#800000',
        'Tan': '#D2B48C',
        'Ivory': '#FFFFF0',
        'Cream': '#FFFDD0',
        'Silver': '#C0C0C0',
        'Gold': '#FFD700',
        'Orange': '#FFA500',
        'Purple': '#800080'
      };
      
      const colorCode = colorMap[item.name] || '#CCCCCC';
      colorPreview = (
        <View 
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colorCode,
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#DDDDDD'
          }}
        />
      );
    }
    
    // For steering side, add an icon
    let steeringIcon = null;
    if (isSteeringSide) {
      steeringIcon = (
        <Ionicons 
          name={item.name.toLowerCase().includes('right') ? 'car' : 'car-sport'} 
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For wheel size, add an icon
    let wheelSizeIcon = null;
    if (isWheelSize) {
      wheelSizeIcon = (
        <Ionicons 
          name="disc-outline" 
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For body type, add an icon
    let bodyTypeIcon = null;
    if (isBodyType) {
      let iconName = 'car-outline';
      
      // Determine appropriate icon based on body type
      if (item.name.toLowerCase().includes('suv')) {
        iconName = 'car-sport';
      } else if (item.name.toLowerCase().includes('van') || item.name.toLowerCase().includes('wagon')) {
        iconName = 'car-sport-outline';
      } else if (item.name.toLowerCase().includes('sedan')) {
        iconName = 'car-outline';
      } else if (item.name.toLowerCase().includes('pickup') || item.name.toLowerCase().includes('truck')) {
        iconName = 'cube-outline';
      } else if (item.name.toLowerCase().includes('crossover')) {
        iconName = 'car-sport';
      } else if (item.name.toLowerCase().includes('hatchback')) {
        iconName = 'car';
      } else if (item.name.toLowerCase().includes('coupe')) {
        iconName = 'speedometer-outline';
      } else if (item.name.toLowerCase().includes('convertible')) {
        iconName = 'sunny-outline';
      }
      
      bodyTypeIcon = (
        <Ionicons 
          name={iconName}
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For seats, add an icon
    let seatsIcon = null;
    if (isSeats) {
      seatsIcon = (
        <Ionicons 
          name="people-outline" 
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For doors, add an icon
    let doorsIcon = null;
    if (isDoors) {
      doorsIcon = (
        <Ionicons 
          name="exit-outline" 
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For fuel type, add an icon
    let fuelTypeIcon = null;
    if (isFuelType) {
      let iconName = 'flame-outline';
      
      // Determine appropriate icon based on fuel type
      if (item.name.toLowerCase().includes('electric')) {
        iconName = 'flash-outline';
      } else if (item.name.toLowerCase().includes('hybrid')) {
        iconName = 'battery-charging-outline';
      }
      
      fuelTypeIcon = (
        <Ionicons 
          name={iconName}
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // For cylinders, add an icon
    let cylindersIcon = null;
    if (isCylinders) {
      let iconName = 'hardware-chip-outline';
      
      // Special icon for electric vehicles (no cylinders)
      if (item.name.toLowerCase().includes('electric') || item.name.toLowerCase().includes('none')) {
        iconName = 'flash-outline';
      }
      
      cylindersIcon = (
        <Ionicons 
          name={iconName}
          size={20} 
          color="#666666" 
          style={{ marginRight: 10 }}
        />
      );
    }
    
    // Get status from either structure (uppercase or lowercase)
    // If none exists, default to 'published'
    const status = item.status || 'published';
    
    // Make sure we have a valid item name
    const itemName = item.name || 'Unknown';
    
    return (
      <TouchableOpacity
        style={[
          styles.checkboxItem,
          isRegionalSpec && styles.regionalSpecItem,
          isSteeringSide && styles.steeringSideItem,
          isExteriorColor && styles.colorItem,
          isWheelSize && styles.wheelSizeItem,
          isBodyType && styles.bodyTypeItem,
          isSeats && styles.seatsItem,
          isDoors && styles.doorsItem,
          isFuelType && styles.fuelTypeItem,
          isCylinders && styles.cylindersItem
        ]}
        onPress={() => handleSpecValueSelect(specKey, item.id, itemName)}
      >
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        
        {colorPreview}
        {steeringIcon}
        {wheelSizeIcon}
        {bodyTypeIcon}
        {seatsIcon}
        {doorsIcon}
        {fuelTypeIcon}
        {cylindersIcon}
        
        <Text style={[
          styles.checkboxLabel,
          (isRegionalSpec || isSteeringSide || isBodyType || isFuelType || isCylinders) && isSelected && styles.selectedSpecText
        ]}>
          {itemName}
        </Text>
        
        {(isRegionalSpec || isSteeringSide || isBodyType || isFuelType || isCylinders) && (
          <Text style={styles.itemStatus}>
            {status}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render content based on active filter
  const renderContent = () => {
    if (loading) {
      return (
            <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={styles.loadingText}>Loading...</Text>
            </View>
      );
    }

    switch (activeFilter) {
      case 'brands':
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Brand</Text>
            <FlatList
              data={brands}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBrandItem}
              showsVerticalScrollIndicator={false}
            />
        </View>
      );
      
      case 'models':
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Model</Text>
              {models.length > 0 ? (
                <FlatList
                  data={models}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderModelItem}
                showsVerticalScrollIndicator={false}
                />
              ) : (
              <Text style={styles.emptyText}>
                {selectedBrands.length > 0 
                  ? 'No models available for selected brands'
                  : 'Please select a brand first'}
              </Text>
          )}
        </View>
      );
      
      case 'trims':
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Trim</Text>
              {trims.length > 0 ? (
                <FlatList
                  data={trims}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderTrimItem}
                showsVerticalScrollIndicator={false}
                />
              ) : (
              <Text style={styles.emptyText}>
                {selectedModels.length > 0 
                  ? 'No trims available for selected models'
                  : 'Please select a model first'}
              </Text>
          )}
        </View>
      );
      
      case 'years':
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Year</Text>
              {years.length > 0 ? (
                <FlatList
                  data={years}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderYearItem}
                showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.emptyText}>No years available</Text>
          )}
        </View>
      );
      
      case 'bodyType':
        // Special handling for body type
        const bodyTypeValues = specValues['body_type'] || [];
        console.log(`🚗 Rendering Body Type filter with ${bodyTypeValues.length} values:`, 
          JSON.stringify(bodyTypeValues.map(v => ({id: v.id, name: v.name}))));
        
        // Expected body types based on API data
        const expectedBodyTypes = ["Sedan", "Hatchback", "SUV", "Crossover", "Coupe", "Convertible", "Pickup Truck", "Van", "Wagon"];
        const currentBodyTypes = bodyTypeValues.map(item => item.name);
        const missingBodyTypes = expectedBodyTypes.filter(type => !currentBodyTypes.includes(type));
      
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Body Type</Text>
            {bodyTypeValues.length > 0 ? (
              <>
                <FlatList
                  data={bodyTypeValues}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem('body_type')}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    missingBodyTypes.length > 0 ? (
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                          Note: Some body types may not be available from the API at this time.
                        </Text>
                      </View>
                    ) : null
                  }
                />
                
                {missingBodyTypes.length > 0 && (
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => {
                      console.log('🔄 Manually triggering body type fetch...');
                      fetchBodyTypeSpecifications();
                    }}
                  >
                    <Text style={styles.reloadButtonText}>Refresh Body Types</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No body types available from API</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => {
                    console.log('🔄 Manually triggering body type fetch...');
                    fetchBodyTypeSpecifications();
                  }}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Body Types</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      );
      
      case 'seats':
        // Special handling for seats, similar to body type
        const seatsValues = specValues['seats'] || [];
        console.log(`🪑 Rendering Seats filter with ${seatsValues.length} values:`, 
          JSON.stringify(seatsValues.map(v => ({id: v.id, name: v.name}))));
        
        // Expected seat specifications based on API data
        const expectedSeats = ["2-Seater", "3-Seater", "4-Seater", "5-Seater", "6-Seater", "7-Seater", "8-Seater", "9-Seater", "12-Seater"];
        const currentSeats = seatsValues.map(item => item.name);
        const missingSeats = expectedSeats.filter(type => !currentSeats.includes(type));
      
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Seats</Text>
            {seatsValues.length > 0 ? (
              <>
            <FlatList
                  data={seatsValues}
              keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem('seats')}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    missingSeats.length > 0 ? (
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                          Note: Some seat configurations may not be available from the API at this time.
                        </Text>
                      </View>
                    ) : null
                  }
                />
                
                {missingSeats.length > 0 && (
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => {
                      console.log('🔄 Manually triggering seats fetch...');
                      fetchSeatsSpecifications();
                    }}
                  >
                    <Text style={styles.reloadButtonText}>Refresh Seat Options</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No seat options available from API</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => {
                    console.log('🔄 Manually triggering seats fetch...');
                    fetchSeatsSpecifications();
                  }}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Seat Options</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      );
      
      case 'doors':
        // Special handling for doors, similar to seats and body types
        const doorsValues = specValues['doors'] || [];
        console.log(`🚪 Rendering Doors filter with ${doorsValues.length} values:`, 
          JSON.stringify(doorsValues.map(v => ({id: v.id, name: v.name}))));
        
        // Expected door options based on API data
        const expectedDoors = ["2 Doors", "3 Doors", "4 Doors", "5 Doors"];
        const currentDoors = doorsValues.map(item => item.name);
        const missingDoors = expectedDoors.filter(type => !currentDoors.includes(type));
      
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Number of Doors</Text>
            {doorsValues.length > 0 ? (
              <>
            <FlatList
              data={doorsValues}
              keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem('doors')}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    missingDoors.length > 0 ? (
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                          Note: Some door options may not be available from the API at this time.
                        </Text>
                      </View>
                    ) : null
                  }
                />
                
                {missingDoors.length > 0 && (
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => {
                      console.log('🔄 Manually triggering doors fetch...');
                      fetchDoorsSpecifications();
                    }}
                  >
                    <Text style={styles.reloadButtonText}>Refresh Door Options</Text>
                </TouchableOpacity>
              )}
              </>
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No door options available from API</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => {
                    console.log('🔄 Manually triggering doors fetch...');
                    fetchDoorsSpecifications();
                  }}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Door Options</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      );
      
      case 'fuelType':
        // Special handling for fuel types, similar to seats, doors, and body types
        const fuelTypeValues = specValues['fuel_type'] || [];
        console.log(`⛽ Rendering Fuel Type filter with ${fuelTypeValues.length} values:`, 
          JSON.stringify(fuelTypeValues.map(v => ({id: v.id, name: v.name}))));
        
        // Expected fuel types based on API data
        const expectedFuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
        const currentFuelTypes = fuelTypeValues.map(item => item.name);
        const missingFuelTypes = expectedFuelTypes.filter(type => !currentFuelTypes.includes(type));
      
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Fuel Type</Text>
            {fuelTypeValues.length > 0 ? (
              <>
            <FlatList
                  data={fuelTypeValues}
              keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem('fuel_type')}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    missingFuelTypes.length > 0 ? (
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                          Note: Some fuel types may not be available from the API at this time.
                        </Text>
                      </View>
                    ) : null
                  }
                />
                
                {missingFuelTypes.length > 0 && (
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => {
                      console.log('🔄 Manually triggering fuel type fetch...');
                      fetchFuelTypeSpecifications();
                    }}
                  >
                    <Text style={styles.reloadButtonText}>Refresh Fuel Types</Text>
                </TouchableOpacity>
              )}
              </>
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No fuel types available from API</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => {
                    console.log('🔄 Manually triggering fuel type fetch...');
                    fetchFuelTypeSpecifications();
                  }}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Fuel Types</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      );
      
      case 'cylinders':
        // Special handling for cylinders, similar to other filters
        const cylindersValues = specValues['cylinders'] || [];
        console.log(`🔧 Rendering Cylinders filter with ${cylindersValues.length} values:`, 
          JSON.stringify(cylindersValues.map(v => ({id: v.id, name: v.name}))));
        
        // Expected cylinder options based on API data
        const expectedCylinders = ["3 Cylinders", "4 Cylinders", "6 Cylinders", "8 Cylinders", "12 Cylinders", "None - Electric"];
        const currentCylinders = cylindersValues.map(item => item.name);
        const missingCylinders = expectedCylinders.filter(type => !currentCylinders.includes(type));
      
      return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Cylinders</Text>
            {cylindersValues.length > 0 ? (
              <>
            <FlatList
                  data={cylindersValues}
              keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem('cylinders')}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    missingCylinders.length > 0 ? (
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                          Note: Some cylinder options may not be available from the API at this time.
                        </Text>
                      </View>
                    ) : null
                  }
                />
                
                {missingCylinders.length > 0 && (
                <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => {
                      console.log('🔄 Manually triggering cylinders fetch...');
                      fetchCylindersSpecifications();
                    }}
                  >
                    <Text style={styles.reloadButtonText}>Refresh Cylinder Options</Text>
                </TouchableOpacity>
              )}
              </>
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No cylinder options available from API</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => {
                    console.log('🔄 Manually triggering cylinders fetch...');
                    fetchCylindersSpecifications();
                  }}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Cylinder Options</Text>
                </TouchableOpacity>
              </View>
          )}
        </View>
      );
      
      default:
        if (specFilterKeyMap[activeFilter]) {
          const specKey = specFilterKeyMap[activeFilter];
          const values = specValues[specKey] || [];
          const title = filterItems.find(item => item.id === activeFilter)?.label || '';
          
          // Log when displaying regional specification filter
          if (specKey === 'regional_specification') {
            console.log(`Showing ${values.length} Regional Specification values:`, 
              values.slice(0, 5).map(v => v.name).join(', ') + (values.length > 5 ? '...' : ''));
          }
          
          // Log when displaying interior color filter
          if (specKey === 'interior_color') {
            console.log(`Showing ${values.length} Interior Color values:`, 
              values.slice(0, 5).map(v => v.name).join(', ') + (values.length > 5 ? '...' : ''));
          }
      
      return (
            <View style={styles.filterContent}>
              <Text style={styles.filterTitle}>{`Select ${title}`}</Text>
              {values.length > 0 ? (
                <FlatList
                  data={values}
              keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSpecValueItem(specKey)}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContentContainer}>
                  <Text style={styles.emptyText}>No options available from API</Text>
                  
                  {specKey === 'regional_specification' && (
                <TouchableOpacity
                      style={styles.reloadButton}
                      onPress={fetchRegionalSpecifications}
                    >
                      <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                </TouchableOpacity>
              )}
                  
                  {specKey === 'interior_color' && (
                <TouchableOpacity
                      style={styles.reloadButton}
                      onPress={fetchInteriorColorSpecifications}
                    >
                      <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                  </TouchableOpacity>
                )}
                    
                    {specKey === 'steering_side' && (
                  <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchSteeringSideSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                </TouchableOpacity>
              )}
                    
                    {specKey === 'color' && (
                <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchColorSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                  </TouchableOpacity>
                )}
                    
                    {specKey === 'wheel_size' && (
                  <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchWheelSizeSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                </TouchableOpacity>
              )}
                    
                    {specKey === 'body_type' && (
                <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchBodyTypeSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                  </TouchableOpacity>
                )}
                    
                    {specKey === 'seats' && (
                  <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchSeatsSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                </TouchableOpacity>
              )}
                    
                    {specKey === 'doors' && (
                <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchDoorsSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                  </TouchableOpacity>
                )}
                    
                    {specKey === 'cylinders' && (
                  <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={fetchCylindersSpecifications}
                      >
                        <Text style={styles.reloadButtonText}>Retry Loading Data</Text>
                </TouchableOpacity>
              )}
                    
                  <TouchableOpacity
                      style={[styles.reloadButton, {marginTop: 8, backgroundColor: '#4a90e2'}]}
                      onPress={fetchAllSpecValues}
                    >
                      <Text style={styles.reloadButtonText}>Try Loading All Data</Text>
                  </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    
    return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Coming Soon</Text>
            <Text style={styles.emptyText}>This filter is not yet available</Text>
      </View>
    );
    }
  };

  // Selected filter count
  const getSelectedCount = () => {
    let count = 0;
    count += selectedBrands.length;
    count += selectedModels.length;
    count += selectedTrims.length;
    count += selectedYears.length;
    
    // Add spec values count
    Object.values(selectedSpecValues).forEach(values => {
      count += values.length;
    });
    
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.filterList}>
          <FlatList
            data={filterItems}
            renderItem={renderFilterItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.filterContentContainer}>
        {renderContent()}
        </View>
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
          <Text style={styles.applyButtonText}>
            Apply {getSelectedCount() > 0 ? `(${getSelectedCount()})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 16,
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
  filterList: {
    width: '35%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
  },
  filterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  activeFilterItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#F47B20',
  },
  filterItemText: {
    fontSize: 16,
    color: '#666666',
  },
  activeFilterItemText: {
    color: '#F47B20',
    fontWeight: '600',
  },
  filterContentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F47B20',
    borderColor: '#F47B20',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 32,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemStatus: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 'auto',
  },
  regionalSpecItem: {
    backgroundColor: '#F8F8F8',
  },
  steeringSideItem: {
    backgroundColor: '#F0F5FF',
  },
  selectedSpecText: {
    fontWeight: '600',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  colorItem: {
    backgroundColor: '#FFF0F5',
  },
  wheelSizeItem: {
    backgroundColor: '#FFF5EE',
  },
  bodyTypeItem: {
    backgroundColor: '#FFF5F5',
  },
  seatsItem: {
    backgroundColor: '#FFF5FF',
  },
  doorsItem: {
    backgroundColor: '#FFF5FF',
  },
  fuelTypeItem: {
    backgroundColor: '#FFFAED',
  },
  infoContainer: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 3,
    borderLeftColor: '#F47B20',
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  cylindersItem: {
    backgroundColor: '#F0FFF0',
  },
});

export default FilterScreen; 