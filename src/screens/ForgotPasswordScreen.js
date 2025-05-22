import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import EmailIcon from '../components/icons/EmailIcon';
import {requestPasswordResetOTP} from '../services/api';
import {getTranslation} from '../translations';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const {selectedLanguage} = useCurrencyLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email || !email.trim()) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterValidEmail', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);

      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('VerifyOTP', {email});
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg ||
            getTranslation('auth.failedToSendOTP', selectedLanguage),
        );
      }
    } catch (error) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        error.message ||
          getTranslation('auth.somethingWentWrong', selectedLanguage),
      );
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

      <Text style={styles.title}>
        {getTranslation('auth.forgotPasswordTitle', selectedLanguage)}
      </Text>

      <View style={styles.iconContainer}>
        <EmailIcon width={50} height={50} />
      </View>

      <Text style={styles.description}>
        {getTranslation('auth.forgotPasswordDescription', selectedLanguage)}
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <EmailIcon />
          <TextInput
            style={styles.input}
            placeholder={getTranslation('auth.email', selectedLanguage)}
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
          <Text style={styles.continueButtonText}>
            {getTranslation('auth.continue', selectedLanguage)}
          </Text>
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
