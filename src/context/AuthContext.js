import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, logoutUser, isAuthenticated } from '../services/api';

// Create an authentication context
const AuthContext = createContext();

// Authentication Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored auth token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load stored token
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        
        if (token && userData) {
          // If a token exists, set it for API calls
          setUser(JSON.parse(userData));
          // No need to set in api.js as that's handled in login
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginUser(email, password);
      
      // If login successful, save user data and token
      if (response.success && response.token) {
        console.log('User data from API:', response.user);
        
        // Store user details from the response
        // If no user object is returned, create a basic one with the email
        const userData = {
          ...(response.user || { firstName: email.split('@')[0], email: email }),
          token: response.token,
          refreshToken: response.refreshToken
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        return { success: true };
      } else {
        throw new Error(response.msg || 'No token received from server');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call logout API
      await logoutUser();
      
      // Clear storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Update state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear the local data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  const checkAuthStatus = () => {
    return isAuthenticated() && user != null;
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 