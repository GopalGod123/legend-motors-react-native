import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  Header,
  SearchBar,
  CategoryFilter,
  PromotionBanner,
  PopularBrands,
  HotDeals,
  BodyTypeSearch,
  NewsBlogs
} from '../components/home';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  console.log('User data in HomeScreen:', user);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with user info from auth context */}
      <Header 
        userName={user?.firstName || 'User'} 
        onSettingsPress={() => navigation.navigate('Settings')} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Search Bar */}
          <SearchBar />
          
          {/* Category Filter */}
          <CategoryFilter />
          
          {/* Promotion Banner */}
          <PromotionBanner />
          
          {/* Hot Deals */}
          <HotDeals />
          
          {/* Popular Brands */}
          <PopularBrands />
          
          {/* Body Type Search */}
          <BodyTypeSearch />
          
          {/* News and Blogs */}
          <NewsBlogs />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 20,
  }
});

export default HomeScreen; 