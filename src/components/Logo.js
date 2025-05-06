import React from 'react';
import { Image } from 'react-native';
import { Asset } from 'expo-asset';

// Preload the image to avoid issues
Asset.fromModule(require('../assets/images/LangaugeScreenLogo.png')).downloadAsync();

const Logo = ({ width = 200, height = 80 }) => {
  try {
    return (
      <Image
        source={require('../assets/images/LangaugeScreenLogo.png')}
        style={{ width, height, resizeMode: 'contain' }}
      />
    );
  } catch (error) {
    console.error('Error loading logo image:', error);
    // Fallback text if image fails to load
    return (
      <Image
        source={{ uri: 'https://raw.githubusercontent.com/legend-motors/assets/main/logo.png' }}
        style={{ width, height, resizeMode: 'contain' }}
        defaultSource={require('../assets/images/LangaugeScreenLogo.png')}
      />
    );
  }
};

export default Logo; 