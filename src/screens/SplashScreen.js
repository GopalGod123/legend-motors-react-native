import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import LoginPromptModal from '../components/LoginPromptModal';

const SplashScreen = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigation = useNavigation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit to show splash screen and let animation play
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (isAuthenticated()) {
        // User is logged in, navigate to home
        navigation.replace('Home');
      } else {
        // User is not logged in, show login prompt modal
        setShowLoginPrompt(true);
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [loading, isAuthenticated, navigation]);

  const handleLoginPress = () => {
    setShowLoginPrompt(false);
    navigation.replace('Login');
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    navigation.replace('LanguageSelect');
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('./logo_Animation.gif')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={handleCloseLoginPrompt}
        onLoginPress={handleLoginPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 250,
    height: 250,
  },
});

export default SplashScreen; 