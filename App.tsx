import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import CleverTap from 'clevertap-react-native';
import {Platform} from 'react-native';

const App = () => {
  useEffect(() => {
    // Initialize CleverTap
    CleverTap.setDebugLevel(1); // Set to 0 in production

    // Initialize with your account credentials
    CleverTap.initialize('6KK-49W-447Z', 'XXXXXX');

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      CleverTap.createNotificationChannel(
        'default',
        'Default Channel',
        'Default notification channel',
        4,
        true,
      );
    }

    // Set up notification listeners
    CleverTap.setNotificationOpenedListener(notification => {
      console.log('Notification opened:', notification);
    });

    CleverTap.setNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WishlistProvider>
          <AppNavigator />
        </WishlistProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
