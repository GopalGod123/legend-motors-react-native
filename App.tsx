import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import {CurrencyLanguageProvider} from './src/context/CurrencyLanguageContext';
const App = () => {
  return (
    <SafeAreaProvider>
      <CurrencyLanguageProvider>
        <AuthProvider>
          <WishlistProvider>
            <AppNavigator />
          </WishlistProvider>
        </AuthProvider>
      </CurrencyLanguageProvider>
    </SafeAreaProvider>
  );
};

export default App;
