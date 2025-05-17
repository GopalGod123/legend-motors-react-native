import React, {useEffect} from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const navigation = useNavigation();
  const {user, isAuthenticated} = useAuth();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Check if user is authenticated
      const isUserAuthenticated = await isAuthenticated();

      // Navigate based on authentication status
      setTimeout(() => {
        if (isUserAuthenticated) {
          // User is authenticated, go directly to main screen
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          // User is not authenticated, go to language selection
          navigation.reset({
            index: 0,
            routes: [{name: 'LanguageSelect'}],
          });
        }
      }, 3000);
    };

    checkAuthAndNavigate();

    // Clean up any timers on component unmount
    return () => {};
  }, [navigation, isAuthenticated]);

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
