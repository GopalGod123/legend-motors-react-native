import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, {
  loginUser,
  logoutUser,
  syncAuthToken,
  refreshAuthToken,
  getUserProfile,
} from '../services/api';
import useCleverTap from 'src/services/NotificationHandler';

// Create an authentication context
const AuthContext = createContext();

// Authentication Provider component
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {setUserProfileCleverTap} = useCleverTap();
  useEffect(() => {
    if (user?.email) {
      setUserProfileCleverTap(user);
    }
  }, [user?.email]);
  // Check for stored auth token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load stored token
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('userData');

        // Check for any valid token
        const validToken = token;

        if (validToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
          if (userData) {
            const parsedUserData = JSON.parse(userData);

            if (!parsedUserData.token) {
              parsedUserData.token = validToken;
            }

            // Update state with user data
            setUser(parsedUserData);
          }

          // Set token for API calls

          console.log(
            'User session restored - token will remain valid until logout',
          );
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setLoading(false);
        let aa = await checkAuthStatus();
        console.log('isAuthenticated', aa);
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
          email: email,
          ...response.user,
          token: response.token,
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        api.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.token}`;
        // Update state
        setUser(userData);
        console.log('Login successful - token will remain valid until logout');

        return {success: true};
      } else {
        throw new Error(response.msg || 'No token received from server');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const ssoApi = async idToken => {
    try {
      const response = await api.post('auth/signin/sso', {idToken});
      const data = response.data;

      console.log('Login API DATA:', data);

      // Store token in AsyncStorage
      if (data.success && data.accessToken) {
        // Store in both places for compatibility
        const userData = {
          ...data.user,
          token: data.accessToken,
        };
        console.log('Login API response:', userData);

        // Save to AsyncStorage
        await AsyncStorage.setItem('token', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${data.accessToken}`;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        // Update state
        setUser(userData);
        console.log(
          'SSO login successful - token will remain valid until logout',
        );

        return {success: true};
      } else {
        throw new Error(data.msg || 'No token received from server');
      }
    } catch (error) {
      console.error('API login error:', error.response?.data || error.message);
      if (error.response) {
        throw error.response.data || {message: 'Login failed'};
      } else if (error.request) {
        throw {
          message: 'No response from server. Please check your connection.',
        };
      } else {
        throw {message: error.message || 'An unknown error occurred'};
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // Call logout API
      await logoutUser();

      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('refreshToken');

      // Update state
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear the local data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (token) {
        const response = await getUserProfile();
        console.log('response', response);
        if (response.success) {
          setUser(response.data);
          setIsAuthenticated(true);
          return true;
        }
      }
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await refreshAuthToken(refreshToken);
        if (response.success) {
          const res = await getUserProfile();

          if (res.success) {
            setUser(res.data);
            setIsAuthenticated(true);
            return true;
          }
        }
      }
    } catch (error) {
      console.log('refresh cahth');
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await refreshAuthToken(refreshToken);
          if (response.success) {
            const res = await getUserProfile();
            if (res.success) {
              setUser(res.data);
              setIsAuthenticated(true);
              return true;
            }
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        return false;
      }
    }
  };

  // Mock function to maintain API compatibility - does nothing
  const forceRefreshToken = async () => {
    console.log('Token refresh disabled - token remains valid until logout');
    return {success: true};
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken: forceRefreshToken,
    isAuthenticated,
    checkAuthStatus,
    ssoApi,
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
