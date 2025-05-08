import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {
  SearchBar,
  CategoryFilter,
  PromotionBanner,
  PopularBrands,
  HotDeals,
  BodyTypeSearch,
  NewsBlogs,
  MostPopularCars,
  JustArrived,
} from '../components/home';
import LoginPromptModal from '../components/LoginPromptModal';
import {getCarList} from '../services/api';
import {SPACING} from '../utils/constants';
import Header from 'src/components/home/Header';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(true);

  console.log('User data in HomeScreen:', user);

  // Fetch car list data when component mounts
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const carData = await getCarList();
        console.log('Cars fetched in HomeScreen');
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCarData();
  }, []);

  const handleLoginPress = () => {
    setShowLoginPrompt(false);
    navigation.navigate('Login');
  };

  const handleSkipLogin = () => {
    setShowLoginPrompt(false);
  };

  // Handle navigation to settings
  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Handle navigation to wishlist
  const navigateToWishlist = () => {
    if (user) {
      navigation.navigate('MyWishlistScreen');
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <>
        {/* Header with user info from auth context */}
        <Header
          user={user}
          onSettingsPress={navigateToSettings}
          onWishlistPress={navigateToWishlist}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Search Bar */}
            <SearchBar />

            {/* Category Filter */}
            <CategoryFilter />

            {/* Promotion Banner */}
            <PromotionBanner />

            {/* Popular Brands */}
            <PopularBrands />

            {/* Hot Deals */}
            <HotDeals />

            {/* Just Arrived */}
            <JustArrived />

            {/* Most Popular Cars */}
            <MostPopularCars />

            {/* Body Type Search */}
            <BodyTypeSearch />

            {/* News and Blogs */}
            <NewsBlogs />
          </View>
        </ScrollView>
      </>
      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={handleSkipLogin}
        onLoginPress={handleLoginPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 70,
  },
});

export default HomeScreen;
