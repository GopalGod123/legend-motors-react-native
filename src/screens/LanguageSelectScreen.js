import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import Logo from '../components/Logo';
import LoginPromptModal from '../components/LoginPromptModal';

const languages = [
  { id: 'en', name: 'English (US)' },
  { id: 'zh', name: 'Mandarin' },
  { id: 'es', name: 'Spanish' },
  { id: 'ar', name: 'Arabic' },
  { id: 'ru', name: 'Russian' },
  { id: 'fr', name: 'French' },
];

const LanguageSelectScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigation = useNavigation();

  const handleNext = () => {
    // Show login prompt instead of navigating directly
    setShowLoginPrompt(true);
  };

  const handleLoginPress = () => {
    setShowLoginPrompt(false);
    navigation.navigate('Login');
  };

  const handleSkipLogin = () => {
    setShowLoginPrompt(false);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Logo />
      </View>

      <Text style={styles.title}>Select a Language</Text>

      <ScrollView style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.id}
            style={styles.languageItem}
            onPress={() => setSelectedLanguage(language.id)}>
            <Text style={styles.languageText}>{language.name}</Text>
            <View
              style={[
                styles.radio,
                selectedLanguage === language.id && styles.radioSelected,
              ]}>
              {selectedLanguage === language.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={handleSkipLogin}
        onLoginPress={handleLoginPress}
      />
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
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  languageText: {
    fontSize: 16,
    color: '#333333',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#F4821F',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F4821F',
  },
  nextButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LanguageSelectScreen; 