import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, Image, TextInput, Alert, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'src/context/ThemeContext';
import makeStyles from './OTPVerificationScreen.styles';
import LogoImage from '../../../assets/images/logo.png';
import LightLogoImage from '../../../assets/images/light-logo.png';
import { requestOTP, verifyOTP } from 'src/services/api';
import { useNavigation, useRoute } from '@react-navigation/native';

const OTPVerificationScreen = () => {
    const { THEME_COLORS, isDark } = useTheme();
    const styles = makeStyles({ THEME_COLORS, isDark })
    const route = useRoute();
    const navigation = useNavigation();
    const otpInputs = useRef([]);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(route.params.email || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = ({ nativeEvent }, index) => {
        if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleResendCode = async () => {
        try {
          setLoading(true);
          await requestOTP(email);
          setTimer(30);
          Alert.alert('Success', 'New verification code has been sent to your email');
        } catch (error) {
          Alert.alert('Error', error.message || 'Failed to resend verification code');
        } finally {
          setLoading(false);
        }
      };

      const handleVerifyOTP = async () => {
          const otpString = otp.join('');
          if (otpString.length !== 6) {
            Alert.alert('Error', 'Please enter the complete verification code');
            return;
          }
      
          try {
            setLoading(true);
            const response = await verifyOTP(email, otpString);
            
            if (!response.registrationToken) {
              Alert.alert('Error', 'Registration token not received from server');
              return;
            }
            
            navigation.replace('FillProfile', { 
              email,
              registrationToken: response.registrationToken
            });
          } catch (error) {
            console.error('OTP verification error:', error);
            Alert.alert('Error', error.message || 'Failed to verify OTP');
          } finally {
            setLoading(false);
          }
        };

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [timer]);

    const handleBackNavigation = () => { };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT} />

            <TouchableOpacity style={styles.backButton} onPress={handleBackNavigation}>
                <Ionicons name="arrow-back" size={24} color={isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BACKGROUND} />
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
                    editable={false}
                />
            </View>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(input) => (otpInputs.current[index] = input)}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                    />
                ))}
            </View>

            <Pressable  onPress={timer === 0 ? handleResendCode: {}}>
                <Text style={styles.timerText}>
                    Resend Code {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}
                </Text>
            </Pressable>

            <TouchableOpacity style={[styles.primaryButton]} onPress={handleVerifyOTP}>
                <Text style={styles.primaryButtonText}>Verify Welcome Code</Text>
            </TouchableOpacity>

        </SafeAreaView>
    )
}

export default OTPVerificationScreen