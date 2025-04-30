import { getUniqueBrands } from './api';
import axios from 'axios';
import { API_KEY } from '../utils/apiConfig';

/**
 * Extract specifications from car data by specification key
 * @param {Array} carsData - Array of car objects
 * @param {String} specificationKey - The key to filter by (e.g. 'body_type', 'fuel_type')
 * @returns {Array} Array of unique specification values
 */
export const extractSpecificationsFromCars = (carsData, specificationKey) => {
  if (!Array.isArray(carsData) || carsData.length === 0) {
    return [];
  }
  
  // Create a map to hold unique specification values by id
  const specValueMap = {};
  const specValueNames = new Set(); // To prevent duplicates by name
  
  // Process cars to extract unique specification values
  carsData.forEach(car => {
    if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
      car.SpecificationValues.forEach(specValue => {
        if (specValue.Specification && 
            specValue.Specification.key === specificationKey && 
            specValue.id && 
            specValue.name) {
          
          // Normalize name to prevent duplicates
          const normalizedName = specValue.name.trim().toUpperCase();
          
          // Only add if both ID is unique and name is unique
          if (!specValueMap[specValue.id] && !specValueNames.has(normalizedName)) {
            specValueNames.add(normalizedName);
            specValueMap[specValue.id] = {
              id: specValue.id,
              name: specValue.name,
              slug: specValue.slug || '',
              specificationId: specValue.Specification.id,
              specificationName: specValue.Specification.name,
            };
          }
        }
      });
    }
  });
  
  // Convert map values to array and sort alphabetically
  const uniqueSpecValues = Object.values(specValueMap).sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );
  
  console.log(`Extracted ${uniqueSpecValues.length} unique ${specificationKey} values`);
  return uniqueSpecValues;
};

/**
 * Fetch specification values by key
 * @param {String} specKey - Specification key to fetch values for
 * @returns {Promise<Array>} - Array of specification values
 */
export const fetchSpecificationValues = async (specKey) => {
  try {
    // Use the car list API to get cars with specification data
    const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
      params: {
        limit: 100 // Request larger number to get more variety
      },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    console.log(`Fetching ${specKey} specification values, API status:`, response.status);
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Extract unique specification values from car data
      const extractedValues = extractSpecificationsFromCars(response.data.data, specKey);
      
      if (extractedValues.length > 0) {
        return {
          success: true,
          data: extractedValues
        };
      }
    }
    
    // Return fallback data based on the spec key
    const fallbackData = getFallbackSpecValues(specKey);
    return {
      success: true,
      data: fallbackData,
      message: `Fallback ${specKey} values retrieved`
    };
    
  } catch (error) {
    console.error(`Error fetching ${specKey} values:`, error);
    // Return minimal fallback data on error
    const fallbackData = getFallbackSpecValues(specKey).slice(0, 3);
    return {
      success: true,
      data: fallbackData,
      message: `Fallback ${specKey} values retrieved (error)`
    };
  }
};

/**
 * Get fallback specification values based on the key
 * @param {String} specKey - Specification key
 * @returns {Array} Array of fallback values
 */
const getFallbackSpecValues = (specKey) => {
  const fallbackData = {
    'body_type': [
      { id: 51, name: 'SUV', slug: 'suv', specificationId: 6, specificationName: 'Body Type' },
      { id: 50, name: 'Sedan', slug: 'sedan', specificationId: 6, specificationName: 'Body Type' },
      { id: 52, name: 'Hatchback', slug: 'hatchback', specificationId: 6, specificationName: 'Body Type' },
      { id: 53, name: 'Truck', slug: 'truck', specificationId: 6, specificationName: 'Body Type' },
      { id: 54, name: 'Convertible', slug: 'convertible', specificationId: 6, specificationName: 'Body Type' },
    ],
    'fuel_type': [
      { id: 76, name: 'Electric', slug: 'electric', specificationId: 9, specificationName: 'Fuel Type' },
      { id: 74, name: 'Petrol', slug: 'petrol', specificationId: 9, specificationName: 'Fuel Type' },
      { id: 75, name: 'Diesel', slug: 'diesel', specificationId: 9, specificationName: 'Fuel Type' },
      { id: 77, name: 'Hybrid', slug: 'hybrid', specificationId: 9, specificationName: 'Fuel Type' },
    ],
    'transmission': [
      { id: 95, name: 'Automatic', slug: 'automatic', specificationId: 12, specificationName: 'Transmission' },
      { id: 96, name: 'Manual', slug: 'manual', specificationId: 12, specificationName: 'Transmission' },
      { id: 97, name: 'CVT', slug: 'cvt', specificationId: 12, specificationName: 'Transmission' },
    ],
    'steering_side': [
      { id: 11, name: 'Left-hand drive', slug: 'left-hand-drive', specificationId: 2, specificationName: 'Steering Side' },
      { id: 12, name: 'Right-hand drive', slug: 'right-hand-drive', specificationId: 2, specificationName: 'Steering Side' },
    ],
    'regional_specification': [
      { id: 10, name: 'China', slug: 'china', specificationId: 1, specificationName: 'Regional Specification' },
      { id: 1, name: 'GCC', slug: 'gcc', specificationId: 1, specificationName: 'Regional Specification' },
      { id: 2, name: 'European', slug: 'european', specificationId: 1, specificationName: 'Regional Specification' },
      { id: 3, name: 'American', slug: 'american', specificationId: 1, specificationName: 'Regional Specification' },
      { id: 4, name: 'Japanese', slug: 'japanese', specificationId: 1, specificationName: 'Regional Specification' },
    ],
    'drive_type': [
      { id: 105, name: 'All-wheel Drive', slug: 'all-wheel-drive', specificationId: 13, specificationName: 'Drive Type' },
      { id: 106, name: 'Front-wheel Drive', slug: 'front-wheel-drive', specificationId: 13, specificationName: 'Drive Type' },
      { id: 107, name: 'Rear-wheel Drive', slug: 'rear-wheel-drive', specificationId: 13, specificationName: 'Drive Type' },
    ]
  };
  
  return fallbackData[specKey] || [];
};

export default {
  extractSpecificationsFromCars,
  fetchSpecificationValues
}; 