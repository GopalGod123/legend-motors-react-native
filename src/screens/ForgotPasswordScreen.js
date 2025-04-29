import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import EmailIcon from '../components/icons/EmailIcon';
import { requestPasswordResetOTP } from '../services/api';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email || !email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);
      
      if (response.success) {
        // Navigate to OTP verification screen
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      
      <View style={styles.iconContainer}>
        <EmailIcon width={50} height={50} />
      </View>

      <Text style={styles.description}>
        Enter your email address and we'll send you a verification code to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <EmailIcon />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={handleRequestOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
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
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 