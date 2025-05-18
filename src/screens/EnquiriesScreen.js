import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import {getUserEnquiries} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {COLORS, SPACING, FONT_SIZES, BORDER_RADIUS} from '../utils/constants';
import {Ionicons} from 'src/utils/icon';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme} from '../context/ThemeContext';

const {width} = Dimensions.get('window');

// Custom Logo component to replace the missing icon

const EnquiriesScreen = () => {
  const navigation = useNavigation();
  const {user, isAuthenticated} = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const {selectedCurrency} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();

  // Load enquiries when screen is focused
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      checkAuthAndFetchEnquiries();
    }, [isFocused]),
  );

  const checkAuthAndFetchEnquiries = async () => {
    setLoading(true);
    try {
      const authenticated = await isAuthenticated();
      setIsUserAuthenticated(authenticated);

      if (authenticated) {
        fetchEnquiries();
      } else {
        // Not authenticated, don't fetch data
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsUserAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await getUserEnquiries();
      console.log('Enquiries response:', response);

      if (response.success) {
        setEnquiries(response.data || []);
        setError(null);
      } else {
        setError(response.msg || 'Failed to load enquiries');
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnquiries();
  };

  const handleLoginPress = () => {
    navigation.navigate('Login', {
      returnTo: 'EnquiriesTab', // To return back to this screen after login
    });
  };

  const handleViewCar = enquiry => {
    // From the API response, we can see the car info is in the 'car' property
    const car = enquiry.car || {};

    // Get the car ID from either the car object or the enquiry itself
    const carId = car.id || enquiry.carId || enquiry.id || null;

    if (!carId) {
      console.error('Cannot navigate to car details: No car ID available');
      return;
    }

    console.log('Navigating to car details with carId:', carId);

    // Navigate directly to the CarDetailScreen in the root navigator
    // Not through the nested tab navigation
    navigation.navigate('CarDetailScreen', {carId});
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
        ]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />
        <View
          style={[
            styles.header,
            {borderBottomColor: isDark ? '#333333' : '#EEEEEE'},
          ]}>
          <View style={styles.headerLogoContainer}>
            <View style={styles.headerLogoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={[styles.logoImage, {width: 60, height: 60}]}
              />
              <Text
                style={[
                  styles.headerTitle,
                  {color: isDark ? '#FFFFFF' : '#212121'},
                ]}>
                My Inquiries
              </Text>
            </View>
          </View>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate('ExploreTab')}
            style={styles.searchButton}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity> */}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text
            style={[
              styles.loadingText,
              {color: isDark ? '#CCCCCC' : '#757575'},
            ]}>
            Loading inquiries...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
        ]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />
        <View
          style={[
            styles.header,
            {borderBottomColor: isDark ? '#333333' : '#EEEEEE'},
          ]}>
          <View style={styles.headerLogoContainer}>
            {/* <LegendMotorsLogo /> */}
            <Text
              style={[
                styles.headerTitle,
                {color: isDark ? '#FFFFFF' : '#212121'},
              ]}>
              My Inquiries
            </Text>
          </View>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate('ExploreTab')}
            style={styles.searchButton}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity> */}
        </View>
        <View style={styles.errorContainer}>
          <Text
            style={[styles.errorText, {color: isDark ? '#FF453A' : '#FF3B30'}]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkAuthAndFetchEnquiries}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated state - show login prompt
  if (!isUserAuthenticated) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
        ]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />
        <View
          style={[
            styles.header,
            {borderBottomColor: isDark ? '#333333' : '#EEEEEE'},
          ]}>
          <View style={styles.headerLogoContainer}>
            {/* <LegendMotorsLogo /> */}
            <Text
              style={[
                styles.headerTitle,
                {color: isDark ? '#FFFFFF' : '#212121'},
              ]}>
              My Inquiries
            </Text>
          </View>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate('ExploreTab')}
            style={styles.searchButton}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity> */}
        </View>
        <View style={styles.loginContainer}>
          <View style={styles.clipboardIconContainer}>
            <Image
              source={require('../components/icons/NoEnquiery.png')}
              style={styles.noEnquiryImage}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.noEnquiriesTitle,
              {color: isDark ? '#FFFFFF' : '#212121'},
            ]}>
            No Inquiries found
          </Text>
          <Text
            style={[
              styles.loginPromptText,
              {color: isDark ? '#CCCCCC' : '#757575'},
            ]}>
            Login/Register to track all your inquiries in one place hassle free.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}>
            <Text style={styles.loginButtonText}>
              Login/Register to Inquire
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated but no enquiries
  if (enquiries.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
        ]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#000000' : '#FFFFFF'}
        />
        <View
          style={[
            styles.header,
            {borderBottomColor: isDark ? '#333333' : '#EEEEEE'},
          ]}>
          <View style={styles.headerLogoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
            />
            <Text
              style={[
                styles.headerTitle,
                {color: isDark ? '#FFFFFF' : '#212121'},
              ]}>
              My Inquiries
            </Text>
          </View>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate('ExploreTab')}
            style={styles.searchButton}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity> */}
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.clipboardIconContainer}>
            <Image
              source={require('../components/icons/NoEnquiery.png')}
              style={styles.noEnquiryImage}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.noEnquiriesTitle,
              {color: isDark ? '#FFFFFF' : '#212121'},
            ]}>
            No Inquiries yet
          </Text>
          <Text
            style={[styles.emptyText, {color: isDark ? '#CCCCCC' : '#757575'}]}>
            You haven't made any inquiries yet. Start exploring cars and submit
            inquiries.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('ExploreTab')}>
            <Text style={styles.exploreButtonText}>Explore Cars</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render list of enquiries - updated to match the Figma design
  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#000000' : '#FFFFFF'}
      />
      <View
        style={[
          styles.header,
          {borderBottomColor: isDark ? '#333333' : '#EEEEEE'},
        ]}>
        {/* Add Legend Motors logo next to title */}
        <View style={styles.headerLogoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <Text
            style={[
              styles.headerTitle,
              {
                fontFamily: 'Effra Medium',
                fontWeight: '400',
                fontSize: 24,
                lineHeight: 24 * 1.2, // 120% of font size
                letterSpacing: 0,
                color: isDark ? '#FFFFFF' : '#212121',
              },
            ]}>
            My Inquiries
          </Text>
        </View>

        {/* Add search icon */}
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('ExploreTab')}
          style={styles.searchButton}>
          <Ionicons
            name="search"
            size={24}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={enquiries}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({item}) => {
          // The API response shows car details are in a nested 'car' object
          const car = item.car || {};

          // Process car data to ensure consistent access
          const processedCar = {
            id: car.id || item.id || item.carId || null,
            brand: car.brand || item.brand || 'Brand',
            model: car.model || item.model || 'Model',
            trim: car.trim || item.trim || '',
            image: car.image || null,
          };

          // Extract price from the car prices array
          const prices = car.prices || [];
          const price =
            prices.find(p => p.currency === selectedCurrency)?.price ||
            car.price ||
            item.price ||
            0;

          return (
            <View
              style={[
                styles.cardContainer,
                {backgroundColor: isDark ? '#0D0D0D' : 'transparent'},
              ]}>
              <View
                style={[
                  styles.carImageContainer,
                  {
                    borderColor: isDark ? '#0D0D0D' : '#E0E0E0',
                    backgroundColor: isDark ? '#0D0D0D' : '#f5f5f5',
                  },
                ]}>
                {processedCar.image ? (
                  <Image
                    source={{
                      uri: `https://cdn.legendmotorsglobal.com${processedCar.image}`,
                    }}
                    style={styles.carImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require('../components/icons/NoEnquiery.png')}
                    style={styles.carImage}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View style={styles.carDetailsContainer}>
                <Text
                  style={[
                    styles.carTitle,
                    {color: isDark ? '#FFFFFF' : '#0D0D0D'},
                  ]}>
                  {car.additionalInfo ||
                    `${processedCar.brand} ${processedCar.model} ${processedCar.trim}`}
                </Text>

                <View style={styles.priceButtonContainer}>
                  <Text
                    style={[
                      styles.priceText,
                      {color: isDark ? '#ffffff' : '#0D0D0D'},
                    ]}>
                    {selectedCurrency === 'AED' ? 'AED' : '$'}{' '}
                    {Number(price).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewCar(item)}>
                    <Text
                      style={[
                        styles.viewButtonText,
                        {color: isDark ? '#000' : '#ffff'},
                      ]}>
                      View Car
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#212121',
  },
  logoBox: {
    width: 70,
    height: 32,
    backgroundColor: '#5E366D',
    marginHorizontal: 4,
  },
  motorsText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#5E366D',
  },
  searchButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 16,
  },
  cardContainer: {
    backgroundColor: 'transparent',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 20,
    borderRadius: 24,
  },
  carImageContainer: {
    width: 104,
    height: 92,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderColor: '#E0E0E0',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  carDetailsContainer: {
    flex: 1,
    marginLeft: 16,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 10,
  },
  priceButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  viewButton: {
    backgroundColor: '#F47B20',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#F47B20',
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  clipboardIconContainer: {
    width: 194,
    height: 186,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  noEnquiriesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 24,
  },
  loginButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#F47B20',
    borderRadius: 8,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 24,
  },
  exploreButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#F47B20',
    borderRadius: 8,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noEnquiryImage: {
    width: 194,
    height: 186,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

export default EnquiriesScreen;
