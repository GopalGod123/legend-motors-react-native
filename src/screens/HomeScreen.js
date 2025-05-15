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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import Header from '../components/home/Header';
import {FilterTabs} from '../components/explore';
import {useTheme} from '../context/ThemeContext';

// Memoize components that don't need frequent re-renders
const MemoizedHeader = memo(Header);
const MemoizedSearchBar = memo(SearchBar);
const MemoizedCategoryFilter = memo(CategoryFilter);
const MemoizedPromotionBanner = memo(PromotionBanner);

// Key for AsyncStorage
const LOGIN_PROMPT_SHOWN = 'login_prompt_dismissed';

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
  const {user, isAuthenticated} = useAuth();
  const {isDark} = useTheme();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [checkedPromptStatus, setCheckedPromptStatus] = useState(false);
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

  // Check login prompt status once
  useEffect(() => {
    const checkLoginPromptStatus = async () => {
      try {
        // Check if the user is authenticated
        const userAuthenticated = await isAuthenticated();

        if (userAuthenticated) {
          // If user is logged in, don't show the prompt
          setShowLoginPrompt(false);
          setCheckedPromptStatus(true);
          return;
        }

        // Check if prompt has been shown before
        const promptShown = await AsyncStorage.getItem(LOGIN_PROMPT_SHOWN);

        if (promptShown === 'true') {
          // Prompt has been shown before, don't show it again
          setShowLoginPrompt(false);
        } else {
          // Defer login prompt to avoid hindering initial render
          InteractionManager.runAfterInteractions(() => {
            setShowLoginPrompt(true);
          });
        }

        setCheckedPromptStatus(true);
      } catch (error) {
        console.error('Error checking login prompt status:', error);
        setCheckedPromptStatus(true);
      }
    };

    if (!checkedPromptStatus) {
      checkLoginPromptStatus();
    }
  }, [isAuthenticated, checkedPromptStatus]);

  useEffect(() => {
    // Pre-fetch car data only once
    const fetchCarData = async () => {
      try {
        await getCarList();
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCarData();
  }, []);

  // Add a state to prevent multiple navigations
  const [isNavigating, setIsNavigating] = useState(false);

  const handleScroll = useCallback(
    event => {
      // Get current scroll position
      const currentOffset = event.nativeEvent.contentOffset.y;
      // Get the screen height
      const screenHeight = event.nativeEvent.layoutMeasurement.height;
      // Get the total content height
      const contentHeight = event.nativeEvent.contentSize.height;

      // Check if user has scrolled to the bottom (with a small threshold)
      const isScrolledToBottom =
        currentOffset + screenHeight >= contentHeight - 20;

      if (isScrolledToBottom && !isNavigating) {
        // Set navigating flag to prevent multiple triggers
        setIsNavigating(true);

        // Add a small delay to make the transition feel smoother
        setTimeout(() => {
          navigation.navigate('ExploreTab');

          // Reset the flag after a bit longer to prevent immediate re-triggering
          // if the user navigates back to the home screen
          setTimeout(() => {
            setIsNavigating(false);
          }, 1000);
        }, 300);
      }
    },
    [navigation, isNavigating],
  );

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
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5'},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#2D2D2D' : '#FFFFFF'}
      />
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
          <View
            style={[
              styles.content,
              {backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5'},
            ]}>
            {/* Search Bar */}
            <MemoizedSearchBar
              onApplyFilters={handleSearchBarFilterApply}
              onSearch={handleSearch}
              home={true}
            />

            {/* Category Filter */}
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
      {/* Login Prompt Modal - only show if checked and should be shown */}
      {checkedPromptStatus && (
        <LoginPromptModal
          visible={showLoginPrompt}
          onClose={handleSkipLogin}
          onLoginPress={handleLoginPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 60,
    paddingBottom: 24,
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
