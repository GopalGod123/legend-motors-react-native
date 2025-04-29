import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FillProfileScreen from '../screens/FillProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="FillProfile" component={FillProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 