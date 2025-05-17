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
  isAuthenticated,
  syncAuthToken,
  refreshAuthToken,
} from '../services/api';

// Create an authentication context
const AuthContext = createContext();

// Authentication Provider component
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored auth token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load stored token
        const token = await AsyncStorage.getItem('userToken');
        const authToken = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('userData');

        // Check for any valid token
        const validToken = token || authToken;

        if (validToken) {
          // Ensure both token locations are in sync
          if (token && !authToken)
            await AsyncStorage.setItem('auth_token', token);
          if (authToken && !token)
            await AsyncStorage.setItem('userToken', authToken);

          // Ensure we have userData if we have a token
          if (userData) {
            // Parse and validate userData
            try {
              const parsedUserData = JSON.parse(userData);

              // If userData is malformed or missing token, update it
              if (!parsedUserData.token) {
                parsedUserData.token = validToken;
                await AsyncStorage.setItem(
                  'userData',
                  JSON.stringify(parsedUserData),
                );
              }

              // Update state with user data
              setUser(parsedUserData);
            } catch (parseError) {
              console.error('Error parsing userData:', parseError);
              // If userData is invalid, create a new basic one
              const basicUserData = {
                token: validToken,
              };
              await AsyncStorage.setItem(
                'userData',
                JSON.stringify(basicUserData),
              );
              setUser(basicUserData);
            }
          } else if (validToken) {
            // Create basic userData if missing
            const basicUserData = {token: validToken};
            await AsyncStorage.setItem(
              'userData',
              JSON.stringify(basicUserData),
            );
            setUser(basicUserData);
          }

          // Set token for API calls
          syncAuthToken();
          console.log(
            'User session restored - token will remain valid until logout',
          );
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
          ...(response.user || {firstName: email.split('@')[0], email: email}),
          token: response.token,
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        syncAuthToken();

        // Update state
        setUser(userData);
        console.log('Login successful - token will remain valid until logout');

        return {success: true};
      } else {
        throw new Error(response.msg || 'No token received from server');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      return {success: false, error: error.message || 'Login failed'};
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
        console.log('Login API response:', data);

        // Save to AsyncStorage
        await AsyncStorage.setItem('userToken', data.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        syncAuthToken();

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
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('userData');

      // Update state
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still clear the local data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('auth_token');
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
      const userData = await AsyncStorage.getItem('userData');
      const token = authToken || userToken;

      // If we have a token but one of the storage locations is missing, sync them
      if (token) {
        // Ensure both storage locations have the token
        if (!authToken) await AsyncStorage.setItem('auth_token', token);
        if (!userToken) await AsyncStorage.setItem('userToken', token);

        // If we have a token but no userData, try to reconstruct basic userData
        if (!userData && token) {
          const basicUserData = {
            token: token,
          };
          await AsyncStorage.setItem('userData', JSON.stringify(basicUserData));
        }

        // Ensure the token is synchronized with API headers
        syncAuthToken();

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
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
    isAuthenticated: checkAuthStatus,
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
