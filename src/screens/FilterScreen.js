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

  // Specification ID mapping
  const specIdMap = {
    'body_type': 6,      // Body Type specification ID
    'fuel_type': 9,      // Fuel Type specification ID
    'transmission': 12,  // Transmission specification ID
    'drive_type': 11,    // Drive Type specification ID
    'color': 3,          // Color specification ID
    'interior_color': 4, // Interior Color specification ID
    'regional_specification': 1, // Regional Specification ID
    'steering_side': 2,  // Steering Side specification ID
    'wheel_size': 5,     // Wheel Size specification ID
    'seats': 7,          // Seats specification ID
    'doors': 8,          // Doors specification ID
    'cylinders': 10      // Cylinders specification ID
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
            fetchCylindersSpecifications(),
            fetchTransmissionSpecifications()
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
        fetchCylindersSpecifications(),
        fetchTransmissionSpecifications(),
        fetchDriveTypeSpecifications()
      ];
      
      await Promise.all(fetchPromises);
      
      setLoading(false);
    }
  };

  // Function to fetch specifications by specId using the new endpoint
  const fetchSpecificationsBySpecId = async (specKey) => {
    try {
      const specId = specIdMap[specKey];
      
      if (!specId) {
        console.error(`No specification ID defined for key: ${specKey}`);
        return;
      }
      
      console.log(`🔍 Fetching ${specKey} specifications with ID ${specId} using direct endpoint...`);
      
      const response = await filterService.fetchSpecificationValuesBySpecId(specId, { limit: 1000 });
      
      if (response.success && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} ${specKey} values`);
        console.log(`📊 Sample values: ${response.data.slice(0, 3).map(item => item.name).join(', ')}...`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          [specKey]: response.data
        }));
        
        return response.data;
      } else {
        console.error(`❌ Failed to fetch ${specKey} specifications from API:`, response.error || 'No data returned');
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching ${specKey} specifications:`, error);
      return [];
    }
  };
  
  // Function to fetch regional specifications directly
  const fetchRegionalSpecifications = async () => {
    try {
      console.log('🌎 Fetching regional specifications directly from API...');
      
      // First try using the direct specification values endpoint with correct ID (1)
      const response = await filterService.fetchSpecificationValuesBySpecId(1, { limit: 1000 });
      
      if (response.success && response.data) {
        console.log(`✅ Success! Received ${response.data.length} regional specification values directly from API`);
        console.log('📊 Regional spec API response:', JSON.stringify(response.data.slice(0, 5)));
        console.log('📊 All regional spec values from API:', response.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'regional_specification': response.data
        }));
        
        return response.data;
      }
      
      // If direct approach fails, try alternative approaches
      console.log('⚠️ Direct API approach failed, trying alternative approaches for regional specifications...');
      
      // Try the standard method through filterService as fallback
      const standardResponse = await filterService.fetchSpecificationValues('regional_specification', { limit: 100 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} regional specification values from filterService`);
        console.log('📊 Regional spec standard response:', JSON.stringify(standardResponse.data.slice(0, 5)));
        console.log('📊 All regional spec values from standard method:', standardResponse.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'regional_specification': standardResponse.data
        }));
        
        return standardResponse.data;
      }
      
      // If all approaches fail, create complete values based on the test.json data
      console.log('⚠️ All approaches failed, using complete regional specification values from API data as fallback');
      
      // Complete values from test.json data (all regional specs from the API)
      const completeRegionalSpecValues = [
        { id: 1, name: "GCC", status: "published" },
        { id: 2, name: "EU", status: "published" },
        { id: 3, name: "US", status: "draft" },
        { id: 4, name: "Asia", status: "published" },
        { id: 5, name: "Africa", status: "published" },
        { id: 6, name: "Latin America", status: "published" },
        { id: 7, name: "Australia", status: "published" },
        { id: 8, name: "Japan", status: "published" },
        { id: 9, name: "India", status: "published" },
        { id: 10, name: "China", status: "published" },
        { id: 98, name: "Yemen", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'regional_specification': completeRegionalSpecValues
      }));
      
      console.log('📊 Using complete regional specification values:', completeRegionalSpecValues.map(item => item.name).join(', '));
      return completeRegionalSpecValues;
    } catch (error) {
      console.error('❌ Error fetching regional specifications:', error);
      
      // Fallback to complete values in case of error
      const completeRegionalSpecValues = [
        { id: 1, name: "GCC", status: "published" },
        { id: 2, name: "EU", status: "published" },
        { id: 3, name: "US", status: "draft" },
        { id: 4, name: "Asia", status: "published" },
        { id: 5, name: "Africa", status: "published" },
        { id: 6, name: "Latin America", status: "published" },
        { id: 7, name: "Australia", status: "published" },
        { id: 8, name: "Japan", status: "published" },
        { id: 9, name: "India", status: "published" },
        { id: 10, name: "China", status: "published" },
        { id: 98, name: "Yemen", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'regional_specification': completeRegionalSpecValues
      }));
      
      console.log('📊 Using complete regional specification values after error:', completeRegionalSpecValues.map(item => item.name).join(', '));
      return completeRegionalSpecValues;
    }
  };
  
  // Function to fetch interior color specifications directly
  const fetchInteriorColorSpecifications = async () => {
    try {
      console.log('🎨 Fetching interior color specifications using dedicated function...');
      
      // First try using the direct specification values endpoint with correct ID (4)
      const response = await filterService.fetchSpecificationValuesBySpecId(4, { limit: 1000 });
      
      if (response.success && response.data) {
        console.log(`✅ Success! Received ${response.data.length} interior color values directly from API`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'interior_color': response.data
        }));
        
        return response.data;
      }
      
      // If direct approach fails, use fallback interior color data
      console.log('⚠️ Using fallback interior color data since API fetch failed');
      
      // Complete list of common interior car colors
      const completeInteriorColorValues = [
        { id: 1, name: "Black", status: "published" },
        { id: 2, name: "Grey", status: "published" },
        { id: 3, name: "Beige", status: "published" },
        { id: 4, name: "Brown", status: "published" },
        { id: 5, name: "Tan", status: "published" },
        { id: 6, name: "White", status: "published" },
        { id: 7, name: "Red", status: "published" },
        { id: 8, name: "Blue", status: "published" },
        { id: 9, name: "Cream", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'interior_color': completeInteriorColorValues
      }));
      
      return completeInteriorColorValues;
    } catch (error) {
      console.error('❌ Error fetching interior color specifications:', error);
      return [];
    }
  };
  
  // Function to fetch steering side specifications directly
  const fetchSteeringSideSpecifications = async () => {
    try {
      console.log('🚘 Fetching steering side specifications directly from API...');
      
      // First try using the direct specification values endpoint with correct ID (2)
      const response = await filterService.fetchSpecificationValuesBySpecId(2, { limit: 1000 });
      
      if (response.success && response.data) {
        console.log(`✅ Success! Received ${response.data.length} steering side values directly from API`);
        console.log('📊 Steering side API response:', JSON.stringify(response.data));
        console.log('📊 All steering side values from API:', response.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'steering_side': response.data
        }));
        
        return response.data;
      }
      
      // If direct approach fails, try alternative approaches
      console.log('⚠️ Direct API approach failed, trying alternative approaches for steering side...');
      
      // Try the standard method through filterService as fallback
      const standardResponse = await filterService.fetchSpecificationValues('steering_side', { limit: 100 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} steering side values from filterService`);
        console.log('📊 Steering side standard response:', JSON.stringify(standardResponse.data));
        console.log('📊 All steering side values from standard method:', standardResponse.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'steering_side': standardResponse.data
        }));
        
        return standardResponse.data;
      }
      
      // If all approaches fail, create complete values based on the test.json data
      console.log('⚠️ All approaches failed, using complete steering side values from API data as fallback');
      
      // Complete values from test.json data (all steering side options from the API)
      const completeSteeringSideValues = [
        { id: 11, name: "Left-hand drive", status: "published" },
        { id: 12, name: "Right-hand drive", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'steering_side': completeSteeringSideValues
      }));
      
      console.log('📊 Using complete steering side values:', completeSteeringSideValues.map(item => item.name).join(', '));
      return completeSteeringSideValues;
    } catch (error) {
      console.error('❌ Error fetching steering side specifications:', error);
      
      // Fallback to complete values in case of error
      const completeSteeringSideValues = [
        { id: 11, name: "Left-hand drive", status: "published" },
        { id: 12, name: "Right-hand drive", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'steering_side': completeSteeringSideValues
      }));
      
      console.log('📊 Using complete steering side values after error:', completeSteeringSideValues.map(item => item.name).join(', '));
      return completeSteeringSideValues;
    }
  };
  
  // Function to fetch drive type specifications directly
  const fetchDriveTypeSpecifications = async () => {
    return fetchSpecificationsBySpecId('drive_type');
  };
  
  // Function to fetch body type specifications directly
  const fetchBodyTypeSpecifications = async () => {
    try {
      console.log('🚗 Fetching body type specifications using dedicated function...');
      
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('body_type');
      if (specValues && specValues.length > 0) {
        return specValues;
      }
      
      // If that didn't work, use the dedicated body type fetch function - most reliable approach
      const response = await filterService.default.fetchBodyTypes();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Success! Received ${response.data.length} body type values from dedicated function`);
        console.log('📊 Body types from dedicated function:', JSON.stringify(response.data.map(item => item.name)));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'body_type': response.data
        }));
        
        return response.data;
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
          
          return allBodyTypes;
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
        
        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch body type specifications through all methods');
        
        // If we still haven't found data, manually request each known ID 
        console.log('🔍 Attempting to fetch individual body types by ID...');
        
        // Try one more approach - direct call to a specific body type ID
        try {
          console.log('🧪 Testing with a specific body type ID request');
          const testResponse = await filterService.default.api.get('/specificationvalue/51');
          console.log('🧪 Test response for body type ID 51:', JSON.stringify(testResponse.data));
          return [];
        } catch (testError) {
          console.error('❌ Test request for body type ID failed:', testError);
          return [];
        }
      }
    } catch (error) {
      console.error('❌ Error fetching body type specifications:', error);
      return [];
    }
  };
  
  // Function to fetch seats specifications directly
  const fetchSeatsSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('seats');
      if (specValues && specValues.length > 0) {
        return specValues;
      }
      
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
        
        return response.data;
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
        
        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch seat specifications through all methods');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching seat specifications:', error);
      return [];
    }
  };

  // Function to fetch doors specifications directly
  const fetchDoorsSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('doors');
      if (specValues && specValues.length > 0) {
        return specValues;
      }
      
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
        
        return response.data;
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
        
        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch door options through all methods');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching door specifications:', error);
      return [];
    }
  };

  // Function to fetch fuel type specifications directly
  const fetchFuelTypeSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('fuel_type');
      if (specValues && specValues.length > 0) {
        return specValues;
      }
      
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
        
        return response.data;
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
        
        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch fuel types through all methods');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching fuel type specifications:', error);
      return [];
    }
  };

  // Function to fetch cylinders specifications directly
  const fetchCylindersSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('cylinders');
      if (specValues && specValues.length > 0) {
        return specValues;
      }
      
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
        
        return response.data;
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
        
        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch cylinder options through all methods');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching cylinder specifications:', error);
      return [];
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

  // Add function to fetch colors data with proper matching against slugs
  const fetchColorSpecifications = async () => {
    try {
      console.log('🎨 Fetching color specifications using dedicated function...');
      
      // First try using the direct specification values endpoint with correct ID (3)
      const response = await filterService.fetchSpecificationValuesBySpecId(3, { limit: 1000 });
      
      if (response.success && response.data) {
        console.log(`✅ Success! Received ${response.data.length} color values directly from API`);
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'color': response.data
        }));
        
        return response.data;
      }
      
      // If direct approach fails, use fallback color data
      console.log('⚠️ Using fallback color data since API fetch failed');
      
      // Complete list of common car colors
      const completeColorValues = [
        { id: 1, name: "White", status: "published" },
        { id: 2, name: "Black", status: "published" },
        { id: 3, name: "Silver", status: "published" },
        { id: 4, name: "Gray", status: "published" },
        { id: 5, name: "Red", status: "published" },
        { id: 6, name: "Blue", status: "published" },
        { id: 7, name: "Green", status: "published" },
        { id: 8, name: "Yellow", status: "published" },
        { id: 9, name: "Brown", status: "published" },
        { id: 10, name: "Orange", status: "published" },
        { id: 11, name: "Beige", status: "published" },
        { id: 12, name: "Purple", status: "published" },
        { id: 13, name: "Gold", status: "published" },
        { id: 14, name: "Maroon", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'color': completeColorValues
      }));
      
      return completeColorValues;
    } catch (error) {
      console.error('❌ Error fetching color specifications:', error);
      return [];
    }
  };

  // Function to fetch wheel size specifications directly
  const fetchWheelSizeSpecifications = async () => {
    return fetchSpecificationsBySpecId('wheel_size');
  };

  // Function to fetch transmission specifications directly
  const fetchTransmissionSpecifications = async () => {
    try {
      console.log('🔄 Fetching transmission specifications directly from API...');
      
      // First try using the direct specification values endpoint with correct ID (12)
      const response = await filterService.fetchSpecificationValuesBySpecId(12, { limit: 1000 });
      
      if (response.success && response.data) {
        console.log(`✅ Success! Received ${response.data.length} transmission values directly from API`);
        console.log('📊 Transmission API response:', JSON.stringify(response.data.slice(0, 5)));
        console.log('📊 All transmission values from API:', response.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'transmission': response.data
        }));
        
        return response.data;
      }
      
      // If direct approach fails, try alternative approaches
      console.log('⚠️ Direct API approach failed, trying alternative approaches for transmissions...');
      
      // Try the standard method through filterService as fallback
      const standardResponse = await filterService.fetchSpecificationValues('transmission', { limit: 100 });
      
      if (standardResponse.success && standardResponse.data && standardResponse.data.length > 0) {
        console.log(`✅ Success! Received ${standardResponse.data.length} transmission values from filterService`);
        console.log('📊 Transmission standard response:', JSON.stringify(standardResponse.data.slice(0, 5)));
        console.log('📊 All transmission values from standard method:', standardResponse.data.map(item => item.name).join(', '));
        
        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          'transmission': standardResponse.data
        }));
        
        return standardResponse.data;
      }
      
      // If all approaches fail, create complete values based on the test.json data
      console.log('⚠️ All approaches failed, using complete transmission values from API data as fallback');
      
      // Complete values from test.json data (all transmissions from the API)
      const completeTransmissionValues = [
        { id: 94, name: "Manual", status: "published" },
        { id: 95, name: "Automatic", status: "published" },
        { id: 96, name: "Semi-Automatic", status: "published" },
        { id: 97, name: "CVT", status: "published" },
        { id: 104, name: "Dual-Clutch", status: "published" },
        { id: 105, name: "Tiptronic", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'transmission': completeTransmissionValues
      }));
      
      console.log('📊 Using complete transmission values:', completeTransmissionValues.map(item => item.name).join(', '));
      return completeTransmissionValues;
    } catch (error) {
      console.error('❌ Error fetching transmission specifications:', error);
      
      // Fallback to complete values in case of error
      const completeTransmissionValues = [
        { id: 94, name: "Manual", status: "published" },
        { id: 95, name: "Automatic", status: "published" },
        { id: 96, name: "Semi-Automatic", status: "published" },
        { id: 97, name: "CVT", status: "published" },
        { id: 104, name: "Dual-Clutch", status: "published" },
        { id: 105, name: "Tiptronic", status: "published" }
      ];
      
      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        'transmission': completeTransmissionValues
      }));
      
      console.log('📊 Using complete transmission values after error:', completeTransmissionValues.map(item => item.name).join(', '));
      return completeTransmissionValues;
    }
  };

  // Load initial data on mount
  useEffect(() => {
    // Fetch all specification values at once
    fetchAllSpecValues();
    
    // Specifically fetch critical specifications directly
    fetchBodyTypeSpecifications();
    fetchSeatsSpecifications();
    fetchDoorsSpecifications();
    fetchFuelTypeSpecifications();
    fetchCylindersSpecifications();
    fetchTransmissionSpecifications();
    fetchColorSpecifications();
  }, []);

  // Load filter data when the component mounts or when the active filter changes
  useEffect(() => {
    loadFilterData();
    
    // Always preload regional specifications data since it's commonly used
    if (!specValues['regional_specification'] || specValues['regional_specification'].length === 0) {
      console.log('🌎 Preloading regional specifications data on component mount');
      fetchRegionalSpecifications();
    }
  }, [activeFilter]);

  // Load filter data based on active filter
  const loadFilterData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading filter data for:', activeFilter);
      // Always fetch regional specifications to ensure we have them available
      if (!specValues['regional_specification'] || specValues['regional_specification'].length === 0) {
        console.log('🌎 Pre-loading regional specifications');
        await fetchRegionalSpecifications();
      }
      
      switch (activeFilter) {
        case 'brands':
          if (brands.length === 0) {
            console.log('🏢 Brand filter activated - fetching brands');
            await fetchBrands();
          }
          break;
          
        case 'models':
          if (models.length === 0) {
            console.log('🚗 Model filter activated - fetching models');
            await fetchModels();
          }
          break;
          
        case 'trims':
          if (trims.length === 0) {
            console.log('🏁 Trim filter activated - fetching trims');
            await fetchTrims();
          }
          break;
          
        case 'years':
          if (years.length === 0) {
            console.log('📅 Year filter activated - fetching years');
            await fetchYears();
          }
          break;
          
        case 'bodyType':
          if (!specValues['body_type'] || specValues['body_type'].length === 0) {
            console.log('🚙 Body Type filter activated - fetching values');
            await fetchBodyTypeSpecifications();
          }
          break;
          
        case 'fuelType':
          if (!specValues['fuel_type'] || specValues['fuel_type'].length === 0) {
            console.log('⛽ Fuel Type filter activated - fetching values');
            await fetchFuelTypeSpecifications();
          }
          break;
          
        case 'transmission':
          if (!specValues['transmission'] || specValues['transmission'].length === 0) {
            console.log('🔄 Transmission filter activated - forcefully fetching fresh values');
            await fetchTransmissionSpecifications();
          }
          break;
          
        case 'driveType':
          if (!specValues['drive_type'] || specValues['drive_type'].length === 0) {
            console.log('🚗 Drive Type filter activated - fetching values');
            await fetchDriveTypeSpecifications();
          }
          break;
          
        case 'color':
          if (!specValues['color'] || specValues['color'].length === 0) {
            console.log('🎨 Color filter activated - fetching values');
            await fetchColorSpecifications();
          }
          break;
          
        case 'interiorColor':
          if (!specValues['interior_color'] || specValues['interior_color'].length === 0) {
            console.log('🚗 Interior Color filter activated - fetching values');
            await fetchInteriorColorSpecifications();
          }
          break;
          
        case 'wheelSize':
          if (!specValues['wheel_size'] || specValues['wheel_size'].length === 0) {
            console.log('🛞 Wheel Size filter activated - fetching values');
            await fetchWheelSizeSpecifications();
          }
          break;
          
        case 'regionalSpec':
          // Always fetch fresh regional specification values when the filter is activated
          console.log('🌎 Regional Specification filter activated - forcefully fetching fresh values');
          await fetchRegionalSpecifications();
          break;
          
        case 'steeringSide':
          console.log('🚘 Steering Side filter activated - forcefully fetching fresh values');
          await fetchSteeringSideSpecifications();
          break;
          
        case 'seats':
          if (!specValues['seats'] || specValues['seats'].length === 0) {
            console.log('💺 Seats filter activated - fetching values');
            await fetchSeatsSpecifications();
          }
          break;
          
        case 'doors':
          if (!specValues['doors'] || specValues['doors'].length === 0) {
            console.log('🚪 Doors filter activated - fetching values');
            await fetchDoorsSpecifications();
          }
          break;
          
        case 'cylinders':
          if (!specValues['cylinders'] || specValues['cylinders'].length === 0) {
            console.log('🔧 Cylinders filter activated - fetching values');
            await fetchCylindersSpecifications();
          }
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
    // Only fetch models if at least one brand is selected
    if (selectedBrandIds.length === 0) {
      // Clear existing models when no brand is selected
      setModels([]);
      return;
    }
    
    // Include brand filter if brands are selected
    const params = { limit: 100 };
    params.brandId = selectedBrandIds.join(',');
    
    console.log(`🚗 Fetching models for selected brands: ${selectedBrands.join(', ')} (IDs: ${selectedBrandIds.join(', ')})`);
    
    setLoading(true);
    try {
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
        
        console.log(`✅ Found ${uniqueModels.length} models for selected brands`);
        setModels(uniqueModels);
      } else {
        console.error('❌ Error fetching models:', response.error);
        setModels([]);
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trims data
  const fetchTrims = async () => {
    // Only fetch trims if at least one model is selected
    if (selectedModelIds.length === 0) {
      // Clear existing trims when no model is selected
      setTrims([]);
      return;
    }
    
    // Include brand and model filters if selected
    const params = { limit: 100 };
    
    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }
    
    if (selectedModelIds.length > 0) {
      params.modelId = selectedModelIds.join(',');
    }
    
    console.log(`🏁 Fetching trims for selected models: ${selectedModels.join(', ')} (IDs: ${selectedModelIds.join(', ')})`);
    
    setLoading(true);
    try {
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
        
        console.log(`✅ Found ${uniqueTrims.length} trims for selected models`);
        setTrims(uniqueTrims);
      } else {
        console.error('❌ Error fetching trims:', response.error);
        setTrims([]);
      }
    } catch (error) {
      console.error('❌ Error fetching trims:', error);
      setTrims([]);
    } finally {
      setLoading(false);
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
    
    // Clear model and trim selections when brand selection changes
    setSelectedModels([]);
    setSelectedModelIds([]);
    setSelectedTrims([]);
    setSelectedTrimIds([]);
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
    
    // Clear trim selections when model selection changes
    setSelectedTrims([]);
    setSelectedTrimIds([]);
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
      specifications: selectedSpecValues,
      extractColorsFromSlug: true // Flag to indicate color extraction from slugs should be used
    };
    
    // Extra validation and logging for selected specifications
    if (selectedSpecValues.regional_specification && selectedSpecValues.regional_specification.length > 0) {
      console.log('🌎 Selected Regional Specifications:', selectedSpecValues.regional_specification.join(', '));
    }
    
    // Log selected interior colors
    if (selectedSpecValues.interior_color && selectedSpecValues.interior_color.length > 0) {
      console.log('🎨 Selected Interior Colors:', selectedSpecValues.interior_color.join(', '));
    }
    
    // Log selected exterior colors
    if (selectedSpecValues.color && selectedSpecValues.color.length > 0) {
      console.log('🎨 Selected Exterior Colors:', selectedSpecValues.color.join(', '));
      console.log('ℹ️ Will also check car slugs for color matches');
    }
    
    // Call the callback with filters
    if (onApplyCallback) {
      console.log('📤 Sending filter data to ExploreScreen');
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
    
    // Debug log for regional spec items
    if (isRegionalSpec) {
      console.log(`🌎 Rendering regional spec item: ${item.name} (ID: ${item.id}, Status: ${item.status || 'unknown'})`);
    }
    
    // Debug log for body type items
    if (isBodyType) {
      console.log(`🔍 Rendering body type item: ${item.name} (ID: ${item.id})`);
    }
    
    // Debug log for steering side items
    if (isSteeringSide) {
      console.log(`🚘 Rendering steering side item: ${item.name} (ID: ${item.id}, Status: ${item.status || 'unknown'})`);
    }
    
    // Debug log for transmission items
    if (specKey === 'transmission') {
      console.log(`🔄 Rendering transmission item: ${item.name} (ID: ${item.id}, Status: ${item.status || 'unknown'})`);
    }
    
    // Make sure we have a valid item name
    const itemName = item.name || 'Unknown';
    
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
            {brands.length > 0 ? (
              <FlatList
                data={brands}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBrandItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>No brands available</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={fetchBrands}
                >
                  <Text style={styles.reloadButtonText}>Retry Loading Brands</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      
      case 'models':
        return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Model</Text>
            {selectedBrands.length > 0 ? (
              models.length > 0 ? (
                <FlatList
                  data={models}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderModelItem}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>
                        Showing models for: {selectedBrands.join(', ')}
                      </Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.emptyContentContainer}>
                  <Text style={styles.emptyText}>No models available for selected brands</Text>
                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={fetchModels}
                  >
                    <Text style={styles.reloadButtonText}>Retry Loading Models</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>Please select a brand first</Text>
                <TouchableOpacity
                  style={styles.reloadButton}
                  onPress={() => setActiveFilter('brands')}
                >
                  <Text style={styles.reloadButtonText}>Go to Brand Selection</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      
      case 'trims':
        return (
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Select Trim</Text>
            {selectedModels.length > 0 ? (
              trims.length > 0 ? (
                <FlatList
                  data={trims}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderTrimItem}
                  showsVerticalScrollIndicator={false}
                  ListHeaderComponent={
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>
                        Showing trims for: {selectedModels.join(', ')}
                      </Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.emptyContentContainer}>
                  <Text style={styles.emptyText}>No trims available for selected models</Text>
                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={fetchTrims}
                  >
                    <Text style={styles.reloadButtonText}>Retry Loading Trims</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyText}>Please select a model first</Text>
                {selectedBrands.length > 0 ? (
                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => setActiveFilter('models')}
                  >
                    <Text style={styles.reloadButtonText}>Go to Model Selection</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={() => setActiveFilter('brands')}
                  >
                    <Text style={styles.reloadButtonText}>Go to Brand Selection</Text>
                  </TouchableOpacity>
                )}
              </View>
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
            console.log(`Showing ${values.length} Regional Specification values`);
            if (values.length > 0) {
              console.log('First 5 values:', values.slice(0, 5).map(v => `${v.name} (ID: ${v.id})`).join(', '));
              if (values.length > 5) {
                console.log('Last 5 values:', values.slice(-5).map(v => `${v.name} (ID: ${v.id})`).join(', '));
              }
            } else {
              console.log('⚠️ No regional specification values available!');
            }
          }
          
          // Log when displaying interior color filter
          if (specKey === 'interior_color') {
            console.log(`Showing ${values.length} Interior Color values:`, 
              values.slice(0, 5).map(v => v.name).join(', ') + (values.length > 5 ? '...' : ''));
          }
          
          // Log when displaying steering side filter
          if (specKey === 'steering_side') {
            console.log(`Showing ${values.length} Steering Side values`);
            if (values.length > 0) {
              console.log('All steering side values:', values.map(v => `${v.name} (ID: ${v.id})`).join(', '));
            } else {
              console.log('⚠️ No steering side values available!');
            }
          }
          
          // Log when displaying transmission filter
          if (specKey === 'transmission') {
            console.log(`Showing ${values.length} Transmission values`);
            if (values.length > 0) {
              console.log('All transmission values:', values.map(v => `${v.name} (ID: ${v.id})`).join(', '));
            } else {
              console.log('⚠️ No transmission values available!');
            }
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

  // Add effect for brand selection changes to update models
  useEffect(() => {
    // When brands selection changes, refetch models and clear existing model selection
    if (activeFilter === 'models' || activeFilter === 'brands') {
      if (selectedBrands.length === 0) {
        // If no brands selected, clear models
        setModels([]);
        setSelectedModels([]);
        setSelectedModelIds([]);
      } else {
        // Fetch models for selected brands
        fetchModels();
      }
    }
    
    // Also clear trim selection since models changed
    setSelectedTrims([]);
    setSelectedTrimIds([]);
    setTrims([]);
  }, [selectedBrands, selectedBrandIds]);

  // Add effect for model selection changes to update trims
  useEffect(() => {
    // When models selection changes, refetch trims and clear existing trim selection
    if (activeFilter === 'trims' || activeFilter === 'models') {
      if (selectedModels.length === 0) {
        // If no models selected, clear trims
        setTrims([]);
        setSelectedTrims([]);
        setSelectedTrimIds([]);
      } else {
        // Fetch trims for selected models
        fetchTrims();
      }
    }
  }, [selectedModels, selectedModelIds]);

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