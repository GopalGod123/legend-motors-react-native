import React, {useEffect, useState, useCallback, useRef, memo} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  InteractionManager,
  ActivityIndicator,
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
import {SPACING, COLORS} from '../utils/constants';
import Header from 'src/components/home/Header';
import {FilterTabs} from 'src/components/explore';

// Memoize components that don't need frequent re-renders
const MemoizedHeader = memo(Header);
const MemoizedSearchBar = memo(SearchBar);
const MemoizedCategoryFilter = memo(CategoryFilter);
const MemoizedPromotionBanner = memo(PromotionBanner);

// Create a component for deferred loading
const DeferredComponent = memo(
  ({component: Component, isVisible, ...props}) => {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
      if (isVisible && !shouldRender) {
        // Shorter delay for rendering
        setTimeout(() => {
          setShouldRender(true);
        }, 100);
      }
    }, [isVisible, shouldRender]);

    if (!shouldRender) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#5E366D" />
        </View>
      );
    }
    return <Component {...props} />;
  },
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    header: true,
    search: true,
    categoryFilter: true,
    promotionBanner: true,
    popularBrands: true,
    hotDeals: true,
    justArrived: true,
    mostPopularCars: true,
    bodyTypeSearch: true,
    newsBlogs: true,
  });
  const scrollViewRef = useRef(null);
  const filterCategories = [
    {id: 'all', label: 'All'},
    {id: 'brands', label: 'Brands'},
    {id: 'models', label: 'Models'},
    {id: 'trims', label: 'Trims'},
    {id: 'years', label: 'Years'},
    {id: 'advanced', label: 'Advanced Filters'},
  ];
  // Load initial data and track scroll position
  const handleOpenFilter = useCallback(
    filterId => {
      // Navigate to FilterScreen with current filters
      navigation.navigate('FilterScreen', {
        filterType: ['all', 'advanced'].includes(filterId)
          ? 'brands'
          : filterId,
        // Use a callback that sets applied filters directly
        onApplyCallback: newFilters => {
          // Update filters state
          navigation.navigate('ExploreTab', {filters: newFilters});

          // The useEffect hook will automatically trigger a fetch with new filters
        },
      });
    },
    [navigation],
  );
  const handleFilterSelect = filterId => {
    // if (filterId === 'advanced') {
    // Open the filter screen
    setTimeout(() => {
      handleOpenFilter(filterId);
    }, 100);
    // }
  };
  useEffect(() => {
    // Pre-fetch car data only once
    const fetchCarData = async () => {
      try {
        await getCarList();
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    // Check if user should be prompted to login
    if (!user && !showLoginPrompt) {
      // Defer login prompt to avoid hindering initial render
      InteractionManager.runAfterInteractions(() => {
        setShowLoginPrompt(true);
      });
    }

    fetchCarData();
  }, [user, showLoginPrompt]);

  const handleScroll = useCallback(event => {
    // No need to track visibility since all sections are visible by default
  }, []);

  const handleLoginPress = useCallback(() => {
    setShowLoginPrompt(false);
    navigation.navigate('Login');
  }, [navigation]);

  const handleSkipLogin = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  // Handle navigation to settings
  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Handle navigation to wishlist
  const navigateToWishlist = useCallback(() => {
    if (user) {
      navigation.navigate('MyWishlistScreen');
    } else {
      setShowLoginPrompt(true);
    }
  }, [navigation, user]);

  const handleSearchBarFilterApply = useCallback(
    filters => {
      navigation.navigate('ExploreTab', {filters});
    },
    [navigation],
  );

  const handleSearch = useCallback(
    searchText => {
      console.log('Search text:', searchText);
      navigation.navigate('ExploreTab', {search: searchText});
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <>
        {/* Header with user info from auth context */}
        <MemoizedHeader
          user={user}
          onSettingsPress={navigateToSettings}
          onWishlistPress={navigateToWishlist}
        />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={false}>
          <View style={styles.content}>
            {/* Search Bar */}
            <MemoizedSearchBar
              onApplyFilters={handleSearchBarFilterApply}
              onSearch={handleSearch}
              home={true}
            />

            {/* Category Filter */}
            {/* <MemoizedCategoryFilter /> */}
            <FilterTabs
              categories={filterCategories}
              activeFilter={null}
              onSelect={handleFilterSelect}
              home={true}
            />

            {/* Promotion Banner */}
            <MemoizedPromotionBanner />

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
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(HomeScreen);
