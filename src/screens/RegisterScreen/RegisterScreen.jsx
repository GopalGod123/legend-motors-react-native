import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import makeStyles from './RegisterScreen.styles';
import { useTheme } from 'src/context/ThemeContext';
import { requestOTP } from '../../services/api';
import LogoImage from '../../assets/images/logo.png';
import LightLogoImage from '../../assets/images/light-logo.png';

const RegisterScreen = () => {
    const { THEME_COLORS, isDark } = useTheme();
    const navigation = useNavigation();
    const handleBackNavigation = () => navigation.navigate('Login');
    const styles = makeStyles({ THEME_COLORS, isDark })

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const isValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      }, [email]);


      const handleRequestOTP = async () => {
          if (!isValid) return;
      
          try {
            setLoading(true);
            const res = await requestOTP(email);
            Alert.alert('Success', res.msg || 'OTP sent successfully');
            navigation.navigate('OTPVerification', { email });
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
          } finally {
            setLoading(false);
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

            <Text style={styles.title}>Create Your Account</Text>

            <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT} style={styles.inputIcon} />
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

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: !isValid ? THEME_COLORS.DISABLED_GRAY : THEME_COLORS.SECONDARY_ORANGE }]} disabled={!isValid} onPress={handleRequestOTP}>
                <Text style={styles.primaryButtonText}>Welcome Code</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
                <Text style={styles.loginTextRegular}>Already have an account? </Text>
                <TouchableOpacity onPress={handleBackNavigation}>
                    <Text style={styles.loginTextLink}>Login</Text>
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

            <TouchableOpacity style={styles.guestButton} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}>
                <Text style={styles.guestButtonText}>Join as Guest</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};


export default RegisterScreen;
