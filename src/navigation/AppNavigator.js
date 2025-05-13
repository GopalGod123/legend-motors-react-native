import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import FillProfileScreen from '../screens/FillProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AllBrandsScreen from '../screens/AllBrandsScreen';
import FilterScreen from '../screens/FilterScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import MyWishlistScreen from '../screens/MyWishlistScreen';
import EnquiryFormScreen from '../screens/EnquiryFormScreen';

// Import new profile screens
import EditProfileScreen from '../screens/EditProfileScreen';
import LanguageScreen from '../screens/LanguageScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import BlogPostDetailScreen from '../screens/BlogPostDetailScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';

// Test screen to help debug navigation
const TestNavigationScreen = ({ navigation }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Navigation Test</Text>
    <Button 
      title="Go to Privacy Policy" 
      onPress={() => {
        console.log('TestNavigationScreen: Navigating to PrivacyPolicy');
        navigation.navigate('PrivacyPolicy');
      }} 
    />
  </View>
);

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
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="AllBrands" component={AllBrandsScreen} />
        <Stack.Screen name="FilterScreen" component={FilterScreen} />
        <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
        <Stack.Screen name="MyWishlistScreen" component={MyWishlistScreen} />
        <Stack.Screen name="EnquiryFormScreen" component={EnquiryFormScreen} />
        
        {/* Profile Section Screens */}
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
        <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
        <Stack.Screen name="BlogPostDetailScreen" component={BlogPostDetailScreen} />
        <Stack.Screen name="TestNavigation" component={TestNavigationScreen} options={{ headerShown: true }} />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 