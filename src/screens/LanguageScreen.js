import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

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
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    // Here you would also store the selected language in your app's state/storage
  };

  const languages = [
    { id: '1', name: 'English (US)', category: 'Suggested' },
    { id: '2', name: 'Arabic', category: 'Suggested' },
    { id: '3', name: 'Mandarin', category: 'Language' },
    { id: '4', name: 'Spanish', category: 'Language' },
    { id: '5', name: 'Russian', category: 'Language' },
    { id: '6', name: 'French', category: 'Language' },
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
    data: groupedLanguages[category]
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>
      
      <View style={styles.content}>
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map(language => (
              <TouchableOpacity
                key={language.id}
                style={styles.languageItem}
                onPress={() => handleSelectLanguage(language.name)}
              >
                <Text style={styles.languageName}>{language.name}</Text>
                {selectedLanguage === language.name ? (
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