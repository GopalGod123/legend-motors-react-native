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
import {useTheme} from 'src/context/ThemeContext';
import {styles} from './languageScreenStyle';
import {color} from 'src/utils/constants';

// Back Arrow Icon
const BackIcon = ({color}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
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
  const {COLORS1} = useTheme();
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const handleSelectLanguage = language => {
    setSelectedLanguage(language);
    // Here you would also store the selected language in your app's state/storage
  };

  const languages = [
    {id: '1', name: 'English (US)', category: 'Suggested'},
    {id: '2', name: 'Arabic', category: 'Suggested'},
    {id: '3', name: 'Mandarin', category: 'Language'},
    {id: '4', name: 'Spanish', category: 'Language'},
    {id: '5', name: 'Russian', category: 'Language'},
    {id: '6', name: 'French', category: 'Language'},
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
    <SafeAreaView
      style={[styles.container, {backgroundColor: COLORS1?.background}]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton]}
          onPress={() => navigation.goBack()}>
          <BackIcon color={COLORS1?.backArrow} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: COLORS1.textDark}]}>
          Language
        </Text>
      </View>

      <View style={styles.content}>
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: COLORS1.heading}]}>
              {section.title}
            </Text>
            {section.data.map(language => (
              <TouchableOpacity
                key={language.id}
                style={styles.languageItem}
                onPress={() => handleSelectLanguage(language.name)}>
                <Text style={[styles.languageName, {color: COLORS1.textDark}]}>
                  {language.name}
                </Text>
                {selectedLanguage === language.name ? (
                  <RadioSelected />
                ) : (
                  <RadioUnselected />
                )}
              </TouchableOpacity>
            ))}
            {section.title === 'Suggested' && (
              <View
                style={[
                  styles.suggestedSeparator,
                  {borderBottomColor: COLORS1?.heading},
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default LanguageScreen;
