import React, {createContext, useState, useContext, useEffect} from 'react';
import api from '../services/api';
import i18n from '../translations';
import {I18nManager} from 'react-native';

const CurrencyLanguageContext = createContext();

export const CurrencyLanguageProvider = ({children}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Function to change language
  const changeLanguage = language => {
    setSelectedLanguage(language);
    i18n.locale = language;

    // Handle RTL languages
    const isRTL = language === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    // Update API default params
    api.defaults.params = {
      lang: language,
    };
  };

  // Initialize language on mount
  useEffect(() => {
    changeLanguage(selectedLanguage);
  }, []);

  // Context value
  const value = {
    selectedLanguage,
    setSelectedLanguage: changeLanguage,
    t: (key, params) => i18n.t(key, params),
    selectedCurrency,
    setSelectedCurrency,
  };

  return (
    <CurrencyLanguageContext.Provider value={value}>
      {children}
    </CurrencyLanguageContext.Provider>
  );
};

export const useCurrencyLanguage = () => {
  const context = useContext(CurrencyLanguageContext);
  if (!context) {
    throw new Error(
      'useCurrencyLanguage must be used within an CurrencyLanguageProvider',
    );
  }
  return context;
};

export default CurrencyLanguageContext;
