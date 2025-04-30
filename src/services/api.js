import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/apiConfig';
import { generateMockCars } from './mockCarData';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export const requestOTP = async (email) => {
  try {
    const response = await api.post('/auth/requestOtp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verifyOtp', { email, otp });
    // Return the response data with registration token
    return {
      success: response.data.success,
      message: response.data.message,
      registrationToken: response.data.token || response.data.registrationToken
    };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    console.log('API register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API register error:', error.response?.data || error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error.response.data || { message: 'Registration failed' };
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/rootLogin', { email, password });
    const data = response.data;
    
    console.log('Login API response:', data);
    
    // Store token in memory for later requests
    if (data.success && data.token) {
      // Set token to Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    
    return data;
  } catch (error) {
    console.error('API login error:', error.response?.data || error.message);
    if (error.response) {
      throw error.response.data || { message: 'Login failed' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

// Function to check if user is logged in
export const isAuthenticated = () => {
  return !!api.defaults.headers.common['Authorization'];
};

// Function to logout user
export const logoutUser = async () => {
  try {
    // Call the logout endpoint
    const response = await api.post('/auth/logout');
    console.log('Logout response:', response.data);
    
    // Remove token from Authorization header
    delete api.defaults.headers.common['Authorization'];
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API call fails, still remove the token
    delete api.defaults.headers.common['Authorization'];
    
    throw error;
  }
};

// Password Reset Functions
export const requestPasswordResetOTP = async (email) => {
  try {
    const response = await api.post('/auth/mobile/request-password-reset-otp', { email });
    return response.data;
  } catch (error) {
    console.error('Request password reset OTP error:', error.response?.data || error);
    if (error.response) {
      throw error.response.data || { message: 'Failed to request password reset' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

export const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/mobile/verify-password-reset-otp', { email, otp });
    return response.data;
  } catch (error) {
    console.error('Verify password reset OTP error:', error.response?.data || error);
    if (error.response) {
      throw error.response.data || { message: 'Invalid OTP' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

export const resetPassword = async (email, newPassword, resetToken) => {
  try {
    const response = await api.post('/auth/mobile/reset-password', {
      email,
      newPassword,
      resetToken
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error);
    if (error.response) {
      throw error.response.data || { message: 'Failed to reset password' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

// Brand and Filter APIs
export const getBrandList = async (params = {}) => {
  try {
    const response = await api.get('/brand/list', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching brand list:', error);
    if (error.response) {
      throw error.response.data || { message: 'Failed to fetch brands' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

// Car Model API
export const getCarModelList = async (params = {}) => {
  try {
    const response = await api.get('/carmodel/list', { 
      params,
      headers: {
        'x-api-key': API_KEY
      }
    });
    console.log('Car model API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching car model list:', error);
    if (error.response) {
      throw error.response.data || { message: 'Failed to fetch car models' };
    } else if (error.request) {
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      throw { message: error.message || 'An unknown error occurred' };
    }
  }
};

// Fetch unique car brands from the car models endpoint
export const getUniqueBrands = async (params = {}) => {
  try {
    // Use the new API endpoint specified in the requirements
    const response = await axios.get('https://api.staging.legendmotorsglobal.com/api/v1/car/list', {
      params: {
        ...params,
        limit: 100 // Request more items to get a good variety of brands
      },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });
    
    // Log the response to debug
    console.log('Brand API response structure:', JSON.stringify(response.data).substring(0, 500) + '...');
    
    // Check for success and data
    if (response.data && response.data.success) {
      const brandsMap = {};
      
      // Handle the data array format from the API example schema
      if (Array.isArray(response.data.data)) {
        response.data.data.forEach(model => {
          if (model.brand && model.brand.id) {
            const brandId = model.brand.id;
            // Use lowercase name as key to avoid case-sensitive duplicates
            brandsMap[brandId] = {
              id: brandId,
              name: model.brand.name || '',
              slug: model.brand.slug || '',
              logo: model.brand.logo || null
            };
          }
        });
      }
      
      // Convert map values to array
      const uniqueBrands = Object.values(brandsMap);
      console.log(`Found ${uniqueBrands.length} unique brands`);
      
      return {
        success: true,
        data: uniqueBrands,
        message: 'Brands retrieved successfully'
      };
    }
    
    // If API fails or returns unexpected format, use fallback data
    return {
      success: true,
      data: [
        { id: 1, name: 'TOYOTA', slug: 'toyota', logo: null },
        { id: 2, name: 'HONDA', slug: 'honda', logo: null },
        { id: 3, name: 'MERCEDES', slug: 'mercedes', logo: null },
        { id: 4, name: 'BMW', slug: 'bmw', logo: null },
        { id: 5, name: 'CHERY', slug: 'chery', logo: null },
        { id: 6, name: 'BYD', slug: 'byd', logo: null }
      ],
      message: 'Fallback brands retrieved'
    };
  } catch (error) {
    console.error('Error fetching unique brands:', error);
    // Return fallback data on error
    return {
      success: true,
      data: [
        { id: 1, name: 'TOYOTA', slug: 'toyota', logo: null },
        { id: 2, name: 'HONDA', slug: 'honda', logo: null },
        { id: 3, name: 'MERCEDES', slug: 'mercedes', logo: null },
        { id: 4, name: 'BMW', slug: 'bmw', logo: null },
        { id: 5, name: 'CHERY', slug: 'chery', logo: null },
        { id: 6, name: 'BYD', slug: 'byd', logo: null }
      ],
      message: 'Mock brands retrieved for development'
    };
  }
};

// Car listing API
export const getCarList = async (params = {}) => {
  try {
    // REAL API CALL
    // Debug the parameters being sent to the API
    console.log('Car API params:', JSON.stringify(params));
    
    // Make API call with parameters
    const response = await api.get('/car/list', { params });
    console.log('Car list API raw response:', response.status);
    
    // Debug response structure
    if (response.data) {
      console.log('Response shape:', Object.keys(response.data));
      if (response.data.data) {
        console.log('data.data shape:', typeof response.data.data, Array.isArray(response.data.data));
      }
    }
    
    // Handle successful response with data
    if (response.data) {
      // Case 1: response.data.data is an array of cars
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Found cars in response.data.data array');
        return {
          success: response.data.success || true,
          data: response.data.data,
          pagination: response.data.pagination || { 
            totalItems: response.data.data.length,
            currentPage: params.page || 1
          }
        };
      }
      
      // Case 2: response.data.data.cars is an array of cars
      else if (response.data.data && response.data.data.cars && Array.isArray(response.data.data.cars)) {
        console.log('Found cars in response.data.data.cars array');
        return {
          success: response.data.success || true,
          data: {
            cars: response.data.data.cars,
            total: response.data.data.total || response.data.data.cars.length
          }
        };
      }
      
      // Case 3: response.data.cars is an array of cars
      else if (response.data.cars && Array.isArray(response.data.cars)) {
        console.log('Found cars in response.data.cars array');
        return {
          success: response.data.success || true,
          data: response.data
        };
      }
      
      // Case 4: response.data itself might be the direct array of cars
      else if (Array.isArray(response.data)) {
        console.log('Found cars in direct response.data array');
        return {
          success: true,
          data: response.data,
          total: response.data.length
        };
      }
      
      // If we got here but have a success property, we have data but in an unexpected format
      else if (response.data.success) {
        console.log('Response has success property but cars are in unknown location');
        // Try to extract data from the response
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Found array in response.data.${key}, assuming it's cars`);
            return {
              success: true,
              data: response.data[key],
              total: response.data[key].length
            };
          }
        }
        
        // Return the original response if we can't extract
        return response.data;
      }
      
      // Just return the original response if all else fails
      return response.data;
    }
    
    // Return the original response if none of the above conditions match
    return response.data;
    
  } catch (error) {
    console.error('Error in getCarList API call:', error.message);
    // Return mock data in case of error
    return generateMockCars(params.page || 1, params.limit || 10);
  }
};

export default api; 