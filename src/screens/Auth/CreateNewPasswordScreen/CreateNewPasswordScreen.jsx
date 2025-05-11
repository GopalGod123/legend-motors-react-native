import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LogoImage from '../../../assets/images/forgot-logo.png';
import makeStyles from './CreateNewPasswordScreen.styles';
import { useTheme } from 'src/context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import PasswordResetSuccessModal from './PasswordResetSuccessModal';
import { resetPassword } from 'src/services/api';

const CreateNewPasswordScreen = () => {
  const { THEME_COLORS, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { email, resetToken } = route.params || {};

  const styles = makeStyles({ THEME_COLORS, isDark });

  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  // Navigate back
  const handleBackNavigation = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Close modal and navigate to Login
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login', params: { email } }] });
  }, [navigation, email]);

  // Handle password reset
  const handleResetPassword = useCallback(async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      console.log(email, newPassword, resetToken, "email, newPassword, resetTokenemail, newPassword, resetToken");
      
      const response = await resetPassword(email, newPassword, resetToken);
      if (response.success) {
        setModalVisible(true);
      } else {
        Alert.alert('Error', response.msg || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }, [email, newPassword, confirmPassword, resetToken]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackNavigation}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BACKGROUND}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Password</Text>
        </View>

        <Image source={LogoImage} style={styles.logo} />

        <View style={styles.form}>
          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry={showPassword}
              autoCapitalize="none"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={showConfirmPassword}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: THEME_COLORS.SECONDARY_ORANGE }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>

        <PasswordResetSuccessModal visible={modalVisible} onClose={handleCloseModal} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateNewPasswordScreen;
