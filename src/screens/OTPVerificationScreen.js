import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Logo from '../components/Logo';
import BackArrow from '../components/BackArrow';
import {verifyOTP, requestOTP} from '../services/api';
import {useTheme} from 'src/context/ThemeContext';

const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params;
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const otpInputs = useRef([]);
  const {isDark} = useTheme();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
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

      // Log the response to debug
      console.log('Verification response:', response);

      if (!response.registrationToken) {
        Alert.alert('Error', 'Registration token not received from server');
        return;
      }

      // Navigate to profile screen with email and registration token
      navigation.replace('FillProfile', {
        email,
        registrationToken: response.registrationToken,
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      await requestOTP(email);
      setTimer(30);
      Alert.alert(
        'Success',
        'New verification code has been sent to your email',
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to resend verification code',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={isDark ? styles.containerDark : styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Logo />
      </View>

      <Text style={[styles.title, isDark && styles.textDark]}>
        Create Your Account
      </Text>

      <View
        style={[styles.emailContainer, isDark && styles.emailContainerDark]}>
        <Text style={styles.emailIcon}>✉️</Text>
        <Text style={[styles.email, isDark && styles.textDark]}>{email}</Text>
      </View>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={input => (otpInputs.current[index] = input)}
            style={[styles.otpInput, isDark && styles.otpInputDark]}
            value={digit}
            onChangeText={value => handleOtpChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <Text style={[styles.timerText, isDark && styles.textDark]}>
        Resend Code {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}
      </Text>

      <TouchableOpacity
        style={styles.verifyButton}
        onPress={handleVerifyOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify Welcome Code</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  textDark: {
    color: '#FFFFFF',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  emailContainerDark: {
    backgroundColor: '#000000',
  },
  emailIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  email: {
    fontSize: 16,
    color: '#666666',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  otpInputDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  timerText: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: '#F4821F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
