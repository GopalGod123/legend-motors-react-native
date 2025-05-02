import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Header,
  SearchBar,
  CategoryFilter,
  PromotionBanner,
  PopularBrands,
  HotDeals,
  BodyTypeSearch,
  NewsBlogs,
} from "../../components/home";
// import { FooterNav } from "../../components/navigation";
import { COLORS } from "../../utils/constants";
import MostPopular from "../../components/home/MostPopular";
import JustArrived from "../../components/home/JustArrived";
// import BottomTabNavigator from "../../navigation/BottomTabNavigator";
import Footer from "../../components/Footer";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        {/* <SearchBar /> */}
        <CategoryFilter />
        <PromotionBanner />
        <PopularBrands />
        <HotDeals />
        <BodyTypeSearch />
        <NewsBlogs />
        <MostPopular />
        <JustArrived />
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 70, // Add padding at the bottom for the footer
  }
});

export default HomeScreen;
