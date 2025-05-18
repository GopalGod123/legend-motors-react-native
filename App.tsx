import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CurrencyLanguageProvider} from './src/context/CurrencyLanguageContext';
import useCleverTapNotifications from 'src/services/NotificationHandler';
import {ThemeProvider} from './src/context/ThemeContext';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {CountryCodesProvider} from './src/context/CountryCodesContext';

const App = () => {
  // useCleverTapNotifications();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '789807190580-mo23ir6p664eb69bug94iq12ciluesjl.apps.googleusercontent.com',
    });
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyLanguageProvider>
            <AuthProvider>
              <CountryCodesProvider>
                <WishlistProvider>
                  <AppNavigator />
                </WishlistProvider>
              </CountryCodesProvider>
            </AuthProvider>
          </CurrencyLanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
