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


  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      if (!response.success || !response.token) {
        throw new Error(response.msg || 'Authentication failed');
      }

      const userData = {
        ...(response.user || { email, firstName: email.split('@')[0] }),
        token: response.token,
        refreshToken: response.refreshToken,
      };

      await AsyncStorage.multiSet([
        ['userToken', response.token],
        ['userData', JSON.stringify(userData)],
      ]);

      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.errors[0] || 'Login failed');
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
  const checkAuthStatus = async () => {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      const userToken = await AsyncStorage.getItem('userToken');
      const token = authToken || userToken;
      return !!token;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
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