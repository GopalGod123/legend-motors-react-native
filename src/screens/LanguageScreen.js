import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
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
  const {selectedLanguage, setSelectedLanguage, t} = useCurrencyLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage);

  const handleSelectLanguage = language => {
    setCurrentLanguage(language.id);
    setSelectedLanguage(language.id);
  };

  const languages = [
    {id: 'en', name: t('language.english'), category: t('language.suggested')},
    {id: 'ar', name: t('language.arabic'), category: t('language.suggested')},
    {id: 'zh', name: t('language.mandarin'), category: t('language.languages')},
    {id: 'es', name: t('language.spanish'), category: t('language.languages')},
    {id: 'ru', name: t('language.russian'), category: t('language.languages')},
    {id: 'fr', name: t('language.french'), category: t('language.languages')},
  ];

  // Group languages by category
  const groupedLanguages = languages.reduce((acc, language) => {
    if (!acc[language.category]) {
      acc[language.category] = [];
    }
    acc[language.category].push(language);
    return acc;
  }, {});

  // Convert to array of sections
  const sections = Object.keys(groupedLanguages).map(category => ({
    title: category,
    data: groupedLanguages[category],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language.selectLanguage')}</Text>
      </View>

      <View style={styles.content}>
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map(language => (
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
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#212121',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A40C6',
    marginBottom: 8,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  languageName: {
    fontSize: 16,
    color: '#212121',
  },
});

export default LanguageScreen;
