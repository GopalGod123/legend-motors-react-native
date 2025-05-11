import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import AllBrandsScreen from '../screens/AllBrandsScreen';
import FilterScreen from '../screens/FilterScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import MyWishlistScreen from '../screens/MyWishlistScreen';

// Import new profile screens
import EditProfileScreen from '../screens/EditProfileScreen';
import LanguageScreen from '../screens/LanguageScreen/LanguageScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen/HelpCenterScreen';
import BlogPostDetailScreen from '../screens/BlogPostDetailScreen';

import LanguageSelectScreen from 'src/screens/LanguageSelect/LanguageSelectScreen';
import RegisterScreen from 'src/screens/RegisterScreen/RegisterScreen';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import { FillProfileScreen, ForgotPasswordScreen, OTPVerificationScreen, CreateNewPasswordScreen } from 'src/screens/Auth';

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
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="ResetPassword" component={CreateNewPasswordScreen} />
        <Stack.Screen name="AllBrands" component={AllBrandsScreen} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} />
        <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
        <Stack.Screen name="MyWishlistScreen" component={MyWishlistScreen} />
        
        {/* Profile Section Screens */}
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
        <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
        <Stack.Screen name="BlogPostDetailScreen" component={BlogPostDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 