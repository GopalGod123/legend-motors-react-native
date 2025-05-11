import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

// Back Arrow Icon
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Radio Button Selected
const RadioSelected = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" stroke="#F47B20" strokeWidth="2" />
    <Circle cx="12" cy="12" r="6" fill="#F47B20" />
  </Svg>
);

// Radio Button Unselected
const RadioUnselected = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" stroke="#DDDDDD" strokeWidth="2" />
  </Svg>
);

const LanguageScreen = () => {
  const navigation = useNavigation();
  const {selectedLanguage, setSelectedLanguage} = useCurrencyLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage || 'en');

  const handleSelectLanguage = language => {
    setCurrentLanguage(language.id);
    setSelectedLanguage(language.id);
  };

  const suggestedLanguages = [
    {id: 'en', name: 'English (US)'},
    {id: 'ar', name: 'Arabic'},
  ];

  const otherLanguages = [
    {id: 'zh', name: 'Mandarin'},
    {id: 'es', name: 'Spanish'},
    {id: 'ru', name: 'Russian'},
    {id: 'fr', name: 'French'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested</Text>
          
          {suggestedLanguages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={styles.languageItem}
              onPress={() => handleSelectLanguage(language)}>
              <Text style={[
                styles.languageName,
                language.id === 'en' && styles.emphasizedLanguage
              ]}>
                {language.name}
              </Text>
              {currentLanguage === language.id ? (
                <RadioSelected />
              ) : (
                <RadioUnselected />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          {otherLanguages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={styles.languageItem}
              onPress={() => handleSelectLanguage(language)}>
              <Text style={styles.languageName}>{language.name}</Text>
              {currentLanguage === language.id ? (
                <RadioSelected />
              ) : (
                <RadioUnselected />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: 380,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#212121',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7A40C6',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  languageName: {
    fontSize: 18,
    color: '#212121',
  },
  emphasizedLanguage: {
    color: '#F47B20',
  },
});

export default LanguageScreen;
