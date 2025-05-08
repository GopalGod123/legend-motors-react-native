import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';

const App = () => {
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
