import React, {useEffect} from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Navigate to the next screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('LanguageSelect');
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo_Animation.gif')}
        style={styles.logo}
        resizeMode="strech" // Use the built-in Image resizeMode property
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF', // Background color for the splash screen
  },
  logo: {
    width: Dimensions.get('window').width, // Adjust as needed
    height: Dimensions.get('window').height, // Adjust as needed
  },
});

export default SplashScreen;
