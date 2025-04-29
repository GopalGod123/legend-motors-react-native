import axios from 'axios';

const API_BASE_URL = 'https://api.staging.legendmotorsglobal.com/api/v1';
const API_KEY = 'e40371f8f23b4d1fb86722c13245dcf60a7a9cd0377ca50ef58258d4a6ff7148';

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

export default api; 