import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from './src/screens/Home/HomeScreen';
import { ThemeProvider } from './src/utils/theme';
import { COLORS } from './src/utils/constants';

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeScreen />
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
