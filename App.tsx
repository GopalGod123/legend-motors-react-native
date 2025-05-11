import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CurrencyLanguageProvider} from './src/context/CurrencyLanguageContext';
import {ThemeProvider} from './src/context/ThemeContext';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyLanguageProvider>
            <AuthProvider>
              <WishlistProvider>
                <AppNavigator />
              </WishlistProvider>
            </AuthProvider>
          </CurrencyLanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
