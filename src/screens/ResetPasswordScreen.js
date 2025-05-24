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
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import LockIcon from '../components/icons/LockIcon';
import EyeIcon from '../components/icons/EyeIcon';
import {resetPassword} from '../services/api';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import {getTranslation} from '../translations';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email, resetToken} = route.params || {};
  const {selectedLanguage} = useCurrencyLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {sendEventCleverTap} = useCleverTap();

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterNewPassword', selectedLanguage),
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.passwordTooShort', selectedLanguage),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.passwordsDoNotMatch', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(email, newPassword, resetToken);

      if (response.success) {
        sendEventCleverTap(CLEVERTAP_EVENTS.PASSWORD_RESET);
        Alert.alert(
          getTranslation('common.success', selectedLanguage),
          getTranslation('auth.passwordUpdated', selectedLanguage),
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login', params: {email}}],
                }),
            },
          ],
        );
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg ||
            getTranslation('auth.somethingWentWrong', selectedLanguage),
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
        {getTranslation('auth.createNewPassword', selectedLanguage)}
      </Text>

      <View style={styles.iconContainer}>
        <LockIcon width={50} height={50} />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <LockIcon />
          <TextInput
            style={styles.input}
            placeholder={getTranslation('auth.newPassword', selectedLanguage)}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}>
            <EyeIcon isOpen={showNewPassword} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <LockIcon />
          <TextInput
            style={styles.input}
            placeholder={getTranslation(
              'auth.confirmPassword',
              selectedLanguage,
            )}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            <EyeIcon isOpen={showConfirmPassword} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.passwordRequirements}>
        {getTranslation('auth.passwordRequirements', selectedLanguage)}
      </Text>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleResetPassword}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>
            {getTranslation('common.continue', selectedLanguage)}
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
  inputContainer: {
    gap: 16,
    marginBottom: 16,
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
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 30,
    lineHeight: 20,
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

export default ResetPasswordScreen;
