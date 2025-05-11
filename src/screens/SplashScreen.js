import React, {useEffect} from 'react';
import {View, StyleSheet, Image, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Just wait for a short time to show the splash screen
    const timer = setTimeout(() => {
      // Navigate to LanguageSelect screen after splash
      navigation.replace('LanguageSelect');
    }, 3000); // Increased to 3 seconds to ensure animation is visible

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'transparent'}}>
      <View style={styles.container}>
        <Image
          source={require('./logo_Animation.gif')}
          style={styles.logo}
          resizeMode="contain"
          resizeMethod="resize"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
