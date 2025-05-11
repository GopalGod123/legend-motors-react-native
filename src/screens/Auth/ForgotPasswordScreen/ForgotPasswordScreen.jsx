import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, Keyboard, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LogoImage from '../../../assets/images/forgot-logo.png';
import makeStyles from './ForgotPasswordScreen.styles';
import { useTheme } from 'src/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { requestPasswordResetOTP } from 'src/services/api';

const ForgotPasswordScreen = () => {
  const { THEME_COLORS, isDark } = useTheme();
  const navigation = useNavigation();
  const styles = makeStyles({ THEME_COLORS, isDark })

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBackNavigation = () => navigation.goBack();
console.log('====================================');
console.log(email, "lll");
  const handleRequestOTP = async () => {
    console.log(email, "emailemailemail");
    
    Keyboard.dismiss();

    if (!email || !email.trim()) {
    console.log(email, "falsesvjh");
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);

      if (response.success) {
        navigation.navigate('VerifyOTP', { email });
      } else {
        Alert.alert('Error', response.msg || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <StatusBar barStyle={isDark ? 'dark-content' : 'light-content'} backgroundColor={isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackNavigation}>
            <Ionicons name="arrow-back" size={24} color={isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BACKGROUND} />
          </TouchableOpacity>
          <Text style={styles.title}>Forgot Password</Text>
        </View>

        <Image source={LogoImage} style={styles.logo} />

        <Text style={styles.subtitle}>Forgot Password</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail"
            size={20}
            color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: THEME_COLORS.SECONDARY_ORANGE }]}
          onPress={handleRequestOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Forgot Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
