import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { requestOTP } from '../services/api';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await requestOTP(email);
      // Navigate to OTP verification screen with email
      navigation.navigate('OTPVerification', { email });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Enter your email to receive a verification code
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Request Verification Code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLinkText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#F4821F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#F4821F',
    fontSize: 14,
  },
});

export default RegisterScreen; 