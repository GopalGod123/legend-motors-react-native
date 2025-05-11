import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '../../components/BackArrow';
import LogoImage from '../../assets/images/LangaugeScreenLogo.png';
import styles from './LanguageSelectScreen.styles';

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
    const navigation = useNavigation();

    const handleNext = () => {
        navigation.navigate('Main');
        // navigation.navigate('Register');
        // // navigation.navigate('FillProfile');
    };

    const handleLanguageSelect = langId => {
        setSelectedLanguage(langId);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <BackArrow />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={{ width: 250, height: 100, resizeMode: 'contain' }} />
            </View>

            <Text style={styles.title}>Select a Language</Text>

            {/* <ScrollView> */}
                {languages.map(language => (
                    <TouchableOpacity
                        key={language.id}
                        style={styles.languageItem}
                        onPress={() => handleLanguageSelect(language.id)}>
                        <Text style={[styles.languageText, selectedLanguage === language.id && { color: '#ED8721' }
]}>{language.name}</Text>
                        <View
                            style={[
                                styles.radio, selectedLanguage === language.id && styles.radioSelected,
                            ]}>
                            {selectedLanguage === language.id && (
                                <View style={styles.radioInner} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            {/* </ScrollView> */}

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LanguageSelectScreen;