import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Platform, StatusBar, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LogoImage from '../../assets/images/logo.png';
import LightLogoImage from '../../assets/images/light-logo.png';
import makeStyles from './LoginScreen.styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from 'src/context/ThemeContext';
import CheckIcon from 'src/components/icons/CheckIcon';
import { useAuth } from 'src/context/AuthContext';

const LoginScreen = () => {
  const { THEME_COLORS, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const initialEmail = route.params?.email || route.params?.fromRegistration || '';
  const styles = makeStyles({ THEME_COLORS, isDark })
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const handleBackNavigation = () => navigation.goBack();


  useEffect(() => {
      if (route.params?.email && route.params?.fromRegistration) {
        Alert.alert(
          'Registration Complete',
          'Your account has been created successfully. Please log in with your credentials.'
        );
      }
    }, [route.params]);

  const isValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && password.length > 0;
  }, [email, password]);
    
  const handleLogin = async () => {
    if (!isValid) return;

    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      console.error('Login Error: ', error);
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT} />
      <TouchableOpacity style={styles.backButton} onPress={handleBackNavigation}>
        <Ionicons name="arrow-back" size={24} color={isDark ?  THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BACKGROUND} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={isDark ? LightLogoImage : LogoImage} style={{ width: 250, height: 100, resizeMode: 'contain' }} />
      </View>

      <Text style={styles.title}>Login to Your Account</Text>
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

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed"
          size={20}
          color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={secureEntry}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)}>
          <Ionicons
            name={secureEntry ? 'eye-off' : 'eye'}
            size={20}
            color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
          />
        </TouchableOpacity>
      </View>


      <View style={styles.rememberContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <CheckIcon />}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: !isValid ? THEME_COLORS.DISABLED_GRAY : THEME_COLORS.SECONDARY_ORANGE }]}
        onPress={handleLogin}
        disabled={!isValid || loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>


      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot the password?</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' && (<TouchableOpacity style={styles.socialButton} onPress={() => {/* handle Apple sign-in */ }}>
        <Image
          source={require('../../assets/images/apple.png')}
          style={styles.socialIcon}
          resizeMode="contain"
        />
        <Text style={styles.socialButtonText}>Continue with Apple</Text>
      </TouchableOpacity>)}

      {Platform.OS === 'android' && (
        <TouchableOpacity style={styles.socialButton} onPress={() => { /* handle Google sign-in */ }}>
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>)}

    </SafeAreaView>
  )
}

export default LoginScreen