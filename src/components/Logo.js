import React from 'react';
import {Image} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';
// import { Asset } from 'expo-asset';

// Preload the image to avoid issues
// Asset.fromModule(require('../assets/images/LangaugeScreenLogo.png')).downloadAsync();

const Logo = ({width = 200, height = 80}) => {
  const {isDark} = useTheme();
  try {
    return (
      <Image
        source={
          isDark
            ? require('../assets/images/legeng-motors-dark.png')
            : require('../assets/images/legend-motors-light.png')
        }
        style={{width, height, resizeMode: 'contain'}}
      />
    );
  } catch (error) {
    console.error('Error loading logo image:', error);
    // Fallback text if image fails to load
    return (
      <Image
        source={{
          uri: 'https://raw.githubusercontent.com/legend-motors/assets/main/logo.png',
        }}
        style={{width, height, resizeMode: 'contain'}}
        defaultSource={require('../assets/images/LangaugeScreenLogo.png')}
      />
    );
  }
};

export default Logo;
