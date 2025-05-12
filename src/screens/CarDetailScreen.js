import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
  Linking,
  StatusBar,
  Share,
  useWindowDimensions,
  Alert,
  Modal,
  PanResponder,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getCarByIdOrSlug} from '../services/api';
import {COLORS, SPACING, FONT_SIZES, BORDER_RADIUS} from '../utils/constants';
import {CarImage, CarImageCarousel} from '../components/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AntDesign, Ionicons} from '../utils/icon';
import {Svg, Mask, G, Path, Rect} from 'react-native-svg';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useWishlist} from '../context/WishlistContext';
import RenderHtml from 'react-native-render-html';
import {useAuth} from '../context/AuthContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {
  extractColorsFromSlug,
  createColorMatchFunction,
} from '../utils/colorUtils';

// Import custom icons
const LtrIcon = require('../components/explore/icon_assets/ltr.png');
const ElectricIcon = require('../components/explore/icon_assets/electric.png');
const AutomaticIcon = require('../components/explore/icon_assets/Automatic.png');
const CountryIcon = require('../components/explore/icon_assets/country.png');
const SteeringIcon = require('../components/explore/icon_assets/Steering.png');

const {width} = Dimensions.get('window');

// Helper function to convert color names to hex color codes
const getColorHex = colorName => {
  const colorMap = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    grey: '#808080',
    gray: '#808080',
    silver: '#C0C0C0',
    gold: '#FFD700',
    beige: '#F5F5DC',
    tan: '#D2B48C',
    maroon: '#800000',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    ivory: '#FFFFF0',
    cream: '#FFFDD0',
    burgundy: '#800020',
    turquoise: '#40E0D0',
    bronze: '#CD7F32',
    champagne: '#F7E7CE',
  };

  // Default to a light gray if color not found
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = hexColor => {
  // Handle invalid input
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return false;
  }

  // Remove the # and handle both 3 and 6 character hex codes
  const hex = hexColor.replace('#', '');
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return false;
  }

  // Calculate luminance using the formula:
  // Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Color is considered dark if luminance is less than 0.5
  return luminance < 0.5;
};

const CarDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {carId, lang = 'en'} = route.params || {};
  const {selectedCurrency} = useCurrencyLanguage();
  const {user, isAuthenticated} = useAuth();
  const {theme, isDark} = useTheme();
  const colors = themeColors[theme];
  const {
    isInWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    fetchWishlistItems,
  } = useWishlist();
  const {width} = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exterior');
  const [extractedColors, setExtractedColors] = useState([]);
  const [extractedInteriorColors, setExtractedInteriorColors] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const carouselRef = useRef(null);
  const thumbnailsRef = useRef(null);
  
  // New state variables for enhanced image browsing
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
  const [exteriorImages, setExteriorImages] = useState([]);
  const [interiorImages, setInteriorImages] = useState([]);
  const [highlightImages, setHighlightImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);

  // Add state for managing accordion open/close state
  const [expandedAccordions, setExpandedAccordions] = useState({
    interior_feature: false,
    exterior_and_controls: false,
    security: false,
    comfort_and_convenience: false,
    infotainment: false,
  });

  // Add refs for the full screen thumbnails
  const fullScreenThumbnailsRef = useRef(null);
  
  // Add state to track swipe gesture
  const [swipeDirection, setSwipeDirection] = useState(null);
  
  // Add state for zoomed image
  const [imageZoomed, setImageZoomed] = useState(false);
  const [doubleTapTimer, setDoubleTapTimer] = useState(null);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true);
  
  // Create pan responder for swipe gestures in full screen mode
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Only track swipes when not zoomed
        if (!imageZoomed && Math.abs(gestureState.dx) > 20) {
          setSwipeDirection(gestureState.dx > 0 ? 'right' : 'left');
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Handle swipe gestures only when not zoomed
        if (!imageZoomed && Math.abs(gestureState.dx) > 100) {
          if (swipeDirection === 'left') {
            navigateFullScreenImage('next');
          } else if (swipeDirection === 'right') {
            navigateFullScreenImage('prev');
          }
        }
        setSwipeDirection(null);
      },
      onPanResponderGrant: (evt) => {
        // Handle double tap for zoom
        const now = Date.now();
        if (doubleTapTimer && (now - doubleTapTimer) < 300) {
          // Double tap detected
          setImageZoomed(!imageZoomed);
          setDoubleTapTimer(null);
        } else {
          setDoubleTapTimer(now);
        }
      },
    })
  ).current;

  // Function to toggle accordion state
  const toggleAccordion = category => {
    setExpandedAccordions(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    // Extract colors when car data changes
    if (car && car.slug) {
      const exteriorColors = extractColorsFromSlug(car.slug, 'exterior');
      const interiorColors = extractColorsFromSlug(car.slug, 'interior');

      setExtractedColors(exteriorColors);
      setExtractedInteriorColors(interiorColors);

      console.log('Extracted exterior colors:', exteriorColors);
      console.log('Extracted interior colors:', interiorColors);
    }
  }, [car]);

  // Effect to update isFavorite status when car data or wishlist changes
  useEffect(() => {
    if (car && car.id) {
      const favoriteStatus = isInWishlist(car.id);
      console.log(`Car ${car.id} favorite status:`, favoriteStatus);
      setIsFavorite(favoriteStatus);
    }
  }, [car, isInWishlist]);

  // Effect to update the current images when activeTab changes or when car data changes
  useEffect(() => {
    if (car && car.CarImages) {
      const exterior = getImagesByType('exterior');
      const interior = getImagesByType('interior');
      const highlight = getImagesByType('highlight') || exterior.slice(0, 2);
      
      setExteriorImages(exterior);
      setInteriorImages(interior);
      setHighlightImages(highlight);
      
      // Set the current images based on the active tab
      if (activeTab === 'exterior') {
        setCurrentImages(exterior);
      } else if (activeTab === 'interior') {
        setCurrentImages(interior);
      } else {
        setCurrentImages(highlight);
      }
      
      // Reset selected image index when changing tabs
      setSelectedImageIndex(0);
      if (carouselRef.current) {
        carouselRef.current.scrollToIndex({ index: 0, animated: false });
      }
      
      // Scroll thumbnails to beginning
      if (thumbnailsRef.current) {
        thumbnailsRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    }
  }, [car, activeTab]);

  // Reset zoom when changing images
  useEffect(() => {
    setImageZoomed(false);
  }, [fullScreenImageIndex]);
  
  // Set thumbnails loading state when changing tabs
  useEffect(() => {
    if (currentImages && currentImages.length > 0) {
      setThumbnailsLoading(true);
      // Simulate loading time for thumbnails
      const timer = setTimeout(() => {
        setThumbnailsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentImages]);

  // Function to handle viewing similar color cars
  const handleViewSimilarColorCars = () => {
    if (!car || !car.slug || extractedColors.length === 0) {
      alert('No color information available for this car.');
      return;
    }

    // Create filter object with extracted colors
    const filters = {
      specifications: {
        color: extractedColors,
      },
      extractColorsFromSlug: true,
      // Create a match function using our utility
      matchExtractedColors: createColorMatchFunction(extractedColors),
      // Flags to help ExploreScreen understand what we're filtering by
      colorFilter: true,
      colorNames: extractedColors,
    };

    // Navigate to ExploreScreen with color filters
    navigation.navigate('ExploreTab', {
      filters: filters,
      colorSearch: true,
      title: `Similar ${extractedColors.join('/')} Cars`,
    });
  };

  const fetchCarDetails = async () => {
    if (!carId) {
      setError('No car ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to fetch car details for ID: ${carId}`);

      // Add retry mechanism
      let attempts = 0;
      const maxAttempts = 2;
      let response = null;

      while (attempts < maxAttempts && !response?.success) {
        attempts++;
        if (attempts > 1) {
          console.log(`Retry attempt ${attempts} for car ID: ${carId}`);
          // Short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          response = await getCarByIdOrSlug(carId, lang);
        } catch (fetchError) {
          console.error(`Attempt ${attempts} failed:`, fetchError);
          // Continue to next attempt
        }
      }

      if (response?.success && response?.data) {
        console.log('Car details fetched successfully:', response.data);
        setCar(response.data);
      } else {
        console.log(
          'Failed to fetch car details:',
          response?.message || 'Unknown error',
        );
        setError(response?.message || 'Failed to fetch car details');
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('An error occurred while fetching car details');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleInquire = () => {
    // Navigate to the enquiry form screen with car details
    if (!car) {
      console.error('Cannot navigate to enquiry form: No car data available');
      return;
    }
    
    console.log('Navigating to enquiry form with car ID:', car.id);
    
    // Ensure we're passing a valid carId and image
    const carImageData = currentImages && currentImages.length > 0 ? currentImages[0] : null;
    
    navigation.navigate('EnquiryFormScreen', {
      carId: car.id, // Ensure this is a valid car ID
      carTitle: title || `${car.Year?.year || ''} ${car.Brand?.name || ''} ${car.CarModel?.name || ''}`,
      carImage: carImageData,
      carPrice: price,
      currency: selectedCurrency,
    });
  };

  const toggleFavorite = async () => {
    try {
      if (!car) {
        console.log('Cannot toggle favorite: No car data available');
        return;
      }

      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        Alert.alert(
          'Login Required',
          'Please log in to add cars to your wishlist',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
        return;
      }

      setProcessingWishlist(true);
      console.log(
        `Toggling favorite for car ID: ${car.id}, current status: ${isFavorite}`,
      );

      let success = false;
      if (isFavorite) {
        success = await removeItemFromWishlist(car.id);
        if (success) {
          console.log(`Successfully removed car ${car.id} from wishlist`);
          setIsFavorite(false);
        }
      } else {
        success = await addItemToWishlist(car.id);
        if (success) {
          console.log(`Successfully added car ${car.id} to wishlist`);
          setIsFavorite(true);
        }
      }

      if (!success) {
        console.error('Wishlist operation failed');
        Alert.alert('Error', 'Failed to update wishlist. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'An error occurred while updating your wishlist.');
    } finally {
      setProcessingWishlist(false);
    }
  };

  const handleShare = async () => {
    if (!car) return;

    try {
      await Share.share({
        message: `Check out this ${car.Year?.year} ${car.Brand?.name} ${car.CarModel?.name}!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getImagesByType = type => {
    if (!car || !car.CarImages || !Array.isArray(car.CarImages)) {
      return [];
    }

    return car.CarImages.filter(img => img.type === type)
      .map(img => {
        if (img.FileSystem && img.FileSystem.path) {
          return {
            uri: `https://cdn.legendmotorsglobal.com${img.FileSystem.path}`,
            id: img.id,
            type: img.type,
            order: img.order,
            filename: img.FileSystem.path.split('/').pop(),
            fullPath: img.FileSystem.path,
          };
        }
        return null;
      })
      .filter(img => img !== null);
  };

  // Open full screen image viewer
  const openFullScreenImage = (index) => {
    setFullScreenImageIndex(index);
    setFullScreenMode(true);
  };

  // Close full screen image viewer
  const closeFullScreenImage = () => {
    setFullScreenMode(false);
  };

  // Handle tab change with smooth transitions
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderSpecification = (label, value) => {
    if (!value) return null;

    return (
      <View style={styles.specItem} key={`spec-${label}`}>
        <Text style={styles.specLabel}>{label}:</Text>
        <Text style={styles.specValue}>{value}</Text>
      </View>
    );
  };

  const renderFeatureItem = ({item}) => (
    <View
      style={styles.featureItem}
      key={`feature-${item.id || Math.random().toString()}`}>
      <Icon name="check-circle" size={20} color={COLORS.primary} />
      <Text style={styles.featureText}>{item.name}</Text>
    </View>
  );

  // Group features by category
  const groupFeaturesByCategory = features => {
    return features.reduce((acc, feature) => {
      const category = feature.Feature?.key || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});
  };

  // Update the navigateFullScreenImage function to also scroll the thumbnails
  const navigateFullScreenImage = (direction) => {
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (fullScreenImageIndex + 1) % currentImages.length;
    } else {
      newIndex = fullScreenImageIndex - 1;
      if (newIndex < 0) newIndex = currentImages.length - 1;
    }
    
    setFullScreenImageIndex(newIndex);
    
    // Scroll the thumbnails to keep the selected one visible
    if (fullScreenThumbnailsRef.current) {
      fullScreenThumbnailsRef.current.scrollToIndex({
        index: newIndex,
        animated: true,
        viewPosition: 0.5 // Center the thumbnail
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, {backgroundColor: isDark ? '#333333' : colors.background}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>Loading car details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.errorContainer, {backgroundColor: isDark ? '#333333' : colors.background}]}>
        <Icon name="error-outline" size={50} color={COLORS.error} />
        <Text style={[styles.errorText, {color: colors.text}]}>{error}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchCarDetails}>
          <Text style={styles.reloadButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, {color: colors.primary}]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={[styles.errorContainer, {backgroundColor: isDark ? '#333333' : colors.background}]}>
        <Icon name="no-photography" size={50} color={colors.text} />
        <Text style={[styles.errorText, {color: colors.text}]}>Car not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, {color: colors.primary}]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Extract car details
  const brandName = car.Brand?.name || '';
  const carModel = car.CarModel?.name || '';
  const year = car.Year?.year || '';
  const title = `${year} ${brandName} ${carModel} ${car.Trim?.name || ''}`;

  // Get all features
  const features = car.FeatureValues || [];

  // Get specifications
  const specifications = car.SpecificationValues || [];

  // Group specifications by category
  const groupedSpecs = specifications.reduce((acc, spec) => {
    const category = spec.Specification?.name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(spec);
    return acc;
  }, {});

  // Extract data for the CarCard style display
  const additionalInfo = car.additionalInfo || '';
  const bodyType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'body_type')
      ?.name || 'SUV';
  const fuelType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'fuel_type')
      ?.name || 'Electric';
  const transmission =
    car.SpecificationValues?.find(a => a.Specification?.key === 'transmission')
      ?.name || 'Automatic';
  const region =
    car.SpecificationValues?.find(
      a => a.Specification?.key === 'regional_specification',
    )?.name || 'China';
  const steeringType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'steering')
      ?.name || 'Left hand drive';

  // Prepare car title
  const carTitle =
    additionalInfo ||
    (year && brandName && carModel
      ? `${year} ${brandName} ${carModel}${
          car.Trim?.name ? ` ${car.Trim.name}` : ''
        }`
      : 'Car Details');

  // Get car images
  const carImages = currentImages;

  // Get price
  const price =
    car?.CarPrices?.find(crr => crr.currency === selectedCurrency)?.price ||
    car.price;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: isDark ? '#333333' : colors.background}]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#333333" : colors.background} />

      {/* Header with back button */}
      <View style={[styles.header, {backgroundColor: isDark ? '#333333' : colors.background}]}>
        <TouchableOpacity onPress={goBack} style={styles.backButtonSmall}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Car Details</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={[styles.scrollContainer, {backgroundColor: isDark ? '#333333' : colors.background}]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Action buttons at the top */}

        {/* CarCard-style display */}
        <View style={[styles.cardContainer, {backgroundColor: isDark ? '#333333' : colors.card}]}>
          <View style={styles.imageContainer}>
            {/* Tabs for exterior/interior */}
            <View style={[styles.galleryTabs, {backgroundColor: isDark ? '#333333' : colors.card, borderBottomColor: isDark ? '#444444' : '#EEEEEE'}]}>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'exterior' && styles.activeGalleryTab,
                ]}
                onPress={() => handleTabChange('exterior')}>
                <Text
                  style={[
                    styles.galleryTabText,
                    {color: isDark ? '#AAAAAA' : '#757575'},
                    activeTab === 'exterior' && styles.activeGalleryTabText,
                  ]}>
                  Exterior
                </Text>
                {exteriorImages.length > 0 && (
                  <Text style={styles.imageCountBadge}>{exteriorImages.length}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'interior' && styles.activeGalleryTab,
                ]}
                onPress={() => handleTabChange('interior')}>
                <Text
                  style={[
                    styles.galleryTabText,
                    {color: isDark ? '#AAAAAA' : '#757575'},
                    activeTab === 'interior' && styles.activeGalleryTabText,
                  ]}>
                  Interior
                </Text>
                {interiorImages.length > 0 && (
                  <Text style={styles.imageCountBadge}>{interiorImages.length}</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => openFullScreenImage(selectedImageIndex)}
            >
              <CarImageCarousel
                images={carImages}
                style={styles.carImage}
                height={220}
                onImagePress={() => openFullScreenImage(selectedImageIndex)}
                ref={carouselRef}
                initialIndex={selectedImageIndex}
                onIndexChange={(index) => setSelectedImageIndex(index)}
                showIndex={true}
              />
            </TouchableOpacity>
            
            {/* Enhanced Thumbnails Gallery */}
            {carImages.length > 1 && (
              <View style={[styles.thumbnailsContainer, {
                backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
                borderColor: isDark ? '#444444' : '#DDDDDD',
              }]}>
                {thumbnailsLoading ? (
                  <View style={styles.thumbnailsLoadingContainer}>
                    <ActivityIndicator size="small" color="#5E366D" />
                    <Text style={[styles.thumbnailsLoadingText, {color: isDark ? '#FFFFFF' : '#333333'}]}>
                      Loading {activeTab} images...
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    ref={thumbnailsRef}
                    data={carImages}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => `thumbnail-${index}`}
                    contentContainerStyle={styles.thumbnailsContent}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    renderItem={({item, index}) => (
                      <TouchableOpacity
                        style={[
                          styles.thumbnailItem,
                          selectedImageIndex === index && styles.thumbnailItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          if (carouselRef.current) {
                            carouselRef.current.scrollToIndex({
                              index,
                              animated: true,
                            });
                          }
                        }}>
                        <CarImage
                          source={item}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        {selectedImageIndex === index && (
                          <View style={styles.thumbnailOverlay} />
                        )}
                      </TouchableOpacity>
                    )}
                    onScrollToIndexFailed={(info) => {
                      const wait = new Promise(resolve => setTimeout(resolve, 500));
                      wait.then(() => {
                        if (thumbnailsRef.current) {
                          thumbnailsRef.current.scrollToIndex({ index: info.index, animated: true });
                        }
                      });
                    }}
                  />
                )}
              </View>
            )}
          </View>

          <View style={[styles.cardContent, {backgroundColor: isDark ? '#333333' : colors.card}]}>
            <Text
              style={[styles.carTitle, {color: colors.text}]}
              numberOfLines={2}
              ellipsizeMode="tail">
              {carTitle}
            </Text>
            {/* Top row with condition badge and action buttons */}
            <View style={styles.topRow}>
              {/* Left side - badges */}
              <View style={styles.badgesContainer}>
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionText}>
                    {car.condition || 'New'}
                  </Text>
                </View>

                <View style={[styles.categoryBadge, {backgroundColor: isDark ? '#333333' : '#F5F5F5'}]}>
                  <Icon name="directions-car" size={18} color="#FF8C00" />
                  <Text style={styles.categoryText}>{bodyType || 'SUV'}</Text>
                </View>
              </View>

              {/* Right side - action buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.actionIconButton, {backgroundColor: colors.card}]}
                  onPress={toggleFavorite}
                  disabled={processingWishlist}>
                  {processingWishlist ? (
                    <ActivityIndicator size="small" color="#FF8C00" />
                  ) : isFavorite ? (
                    <AntDesign name="heart" size={24} color="#FF8C00" />
                  ) : (
                    <AntDesign name="hearto" size={24} color="#FF8C00" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionIconButton, {backgroundColor: colors.card}]}
                  onPress={() => {
                    // Handle download functionality
                    if (car.brochureFile?.path) {
                      alert('Downloading brochure...');
                      // Implement actual download logic here
                    } else {
                      alert('No brochure available for download');
                    }
                  }}>
                  <Ionicons name="download-outline" size={24} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionIconButton, {backgroundColor: colors.card}]}
                  onPress={handleShare}>
                  <Ionicons name="share-social" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Specs pills in rows, using the design from the image */}
            <View style={styles.specsContainer}>
              <View style={[styles.specPill, {backgroundColor: isDark ? '#231C26' : '#E9E5EB'}]}>
                <Image 
                  source={LtrIcon} 
                  style={[styles.specIcon, isDark && styles.specIconDark]} 
                  resizeMode="contain" 
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(spec => spec.Specification?.key === 'drive_type')?.name || 'ltr'}
                </Text>
              </View>

              <View style={[styles.specPill, {backgroundColor: isDark ? '#231C26' : '#E9E5EB'}]}>
                <Image 
                  source={ElectricIcon} 
                  style={[styles.specIcon, isDark && styles.specIconDark]} 
                  resizeMode="contain" 
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(spec => spec.Specification?.key === 'fuel_type')?.name || fuelType}
                </Text>
              </View>

              <View style={[styles.specPill, {backgroundColor: isDark ? '#231C26' : '#E9E5EB'}]}>
                <Image 
                  source={AutomaticIcon} 
                  style={[styles.specIcon, isDark && styles.specIconDark]} 
                  resizeMode="contain" 
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(spec => spec.Specification?.key === 'transmission')?.name || transmission}
                </Text>
              </View>

              <View style={[styles.specPill, {backgroundColor: isDark ? '#231C26' : '#E9E5EB'}]}>
                <Image 
                  source={CountryIcon} 
                  style={[styles.specIcon, isDark && styles.specIconDark]} 
                  resizeMode="contain" 
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(spec => spec.Specification?.key === 'regional_specification')?.name || region}
                </Text>
              </View>
              
              <View style={[styles.specPill, {backgroundColor: isDark ? '#231C26' : '#E9E5EB'}]}>
                <Image 
                  source={SteeringIcon} 
                  style={[styles.specIcon, isDark && styles.specIconDark]} 
                  resizeMode="contain" 
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(spec => spec.Specification?.key === 'steering')?.name || steeringType}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.priceRow}>
              {price ? (
                <Text style={styles.priceText}>
                  {selectedCurrency === 'USD' ? '$' : selectedCurrency} {Math.floor(price).toLocaleString()}
                </Text>
              ) : (
                <Text style={styles.priceText}>Price on Request</Text>
              )}
            </View>
          </View>
        </View>

        {/* Car Overview Section */}  
        <View style={[styles.sectionContainer, {backgroundColor: isDark ? '#333333' : colors.background, borderBottomWidth: 0}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Car Overview</Text>

          <View style={[styles.overviewList, {backgroundColor: isDark ? '#ffffff' : '#FFFFFF', borderRadius: 8}]}>
            {/* Condition */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="directions-car" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Condition:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>{car.condition || 'New'}</Text>
            </View>

            {/* Cylinders */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="settings" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Cylinders:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'cylinders',
                )?.name || '4 Cylinders'}
              </Text>
            </View>

            {/* Fuel Type */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="local-gas-station" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Fuel Type:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'fuel_type',
                )?.name || fuelType}
              </Text>
            </View>

            {/* Built Year */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="event" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Built Year:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>{year || '2025'}</Text>
            </View>

            {/* Transmission */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="transform" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Transmission:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'transmission',
                )?.name || transmission}
              </Text>
            </View>

            {/* Color */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon name="palette" size={22} color={isDark ? '#9E9E9E' : '#9E9E9E'} />
              </View>
              <Text style={[styles.overviewLabel, {color: isDark ? '#757575' : '#757575'}]}>Color:</Text>
              <Text style={[styles.overviewValue, {color: '#6f4a8e'}]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'exterior_color',
                )?.name || 'White'}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section - Redesigned with accordion categories */}
        <View style={[styles.sectionContainer, {backgroundColor: isDark ? '#333333' : colors.background, marginTop: 0}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Features</Text>

          {/* Main features grid - two column layout showing some top features */}
          <View style={[styles.featuresGrid, {backgroundColor: isDark ? '#ffffff' : '#FFFFFF'}]}>
            {/* Column 1 */}
            <View style={styles.featuresColumn}>
              {features
                .slice(0, Math.min(6, features.length / 2))
                .map(feature => (
                  <View
                    key={`feature-highlight-${
                      feature.id || Math.random().toString()
                    }`}
                    style={styles.featureItem}>
                    <Icon name="check-circle" size={20} color="#8BC34A" />
                    <Text style={[styles.featureText, {color: isDark ? '#000000' : colors.text}]}>{feature.name}</Text>
                  </View>
                ))}
            </View>

            {/* Column 2 */}
            <View style={styles.featuresColumn}>
              {features
                .slice(
                  Math.min(6, features.length / 2),
                  Math.min(12, features.length),
                )
                .map(feature => (
                  <View
                    key={`feature-highlight-${
                      feature.id || Math.random().toString()
                    }`}
                    style={styles.featureItem}>
                    <Icon name="check-circle" size={20} color="#8BC34A" />
                    <Text style={[styles.featureText, {color: isDark ? '#000000' : colors.text}]}>{feature.name}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Accordion Sections */}
          <View style={styles.accordionContainer}>
            {/* Group features by category and render each category as an accordion */}
            {Object.entries(groupFeaturesByCategory(features)).map(
              ([category, categoryFeatures]) => {
                // Get the display name for this category
                const categoryDisplayName =
                  categoryFeatures[0]?.Feature?.name ||
                  category.replace(/_/g, ' ');
                // Only show if we have features in this category
                if (categoryFeatures.length === 0) return null;

                return (
                  <View key={`accordion-${category}`} style={{
                    backgroundColor: 'transparent', 
                    borderRadius: 8, 
                    marginBottom: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: isDark ? '#444444' : '#E0E0E0'
                  }}>
                    <TouchableOpacity
                      style={[
                        styles.accordionHeader,
                        {borderBottomColor: isDark ? '#333333' : '#F0F0F0'},
                        expandedAccordions[category]
                      ]}
                      onPress={() => toggleAccordion(category)}>
                      <Text style={[styles.accordionTitle, {color: colors.text}]}>
                        {categoryDisplayName}
                      </Text>
                      <Icon
                        name={expandedAccordions[category] ? 'remove' : 'add'}
                        size={24}
                        color="#5E366D"
                      />
                    </TouchableOpacity>

                    {/* Accordion Content */}
                    {expandedAccordions[category] && (
                      <View style={[styles.accordionContent, {backgroundColor: 'transparent', borderBottomColor: isDark ? '#333333' : '#F0F0F0'}]}>
                        <Text style={[styles.accordionFeatureText, {color: colors.text}]}>
                          {categoryFeatures.map((feature, index) => (
                            <React.Fragment key={`feature-text-${feature.id}`}>
                              {feature.name}
                              {index < categoryFeatures.length - 1 ? ', ' : ''}
                            </React.Fragment>
                          ))}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              },
            )}
          </View>
        </View>

        {/* Description Section */}
        <View style={[styles.sectionContainer, {backgroundColor: isDark ? '#333333' : colors.background}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Description</Text>
          {car.description ? (
            <View style={styles.descriptionContainer}>
              <RenderHtml
                contentWidth={width - SPACING.md * 2}
                source={{html: car.description}}
                tagsStyles={{
                  p: {color: isDark ? '#FFFFFF' : '#000000', fontSize: FONT_SIZES.sm, lineHeight: 22, marginBottom: 10, marginLeft: 15},
                  strong: {fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#000000'},
                  li: {color: isDark ? '#FFFFFF' : '#000000', fontSize: FONT_SIZES.sm, lineHeight: 22, marginBottom: 5, paddingLeft: 5, marginLeft: 15},
                  ul: {marginTop: 5, marginBottom: 5, marginLeft: 15},
                }}
              />
            </View>
          ) : (
            <Text style={[styles.noDescriptionText, {color: isDark ? '#FFFFFF' : '#000000', marginLeft: 15}]}>
              No description available
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, {
        backgroundColor: isDark ? '#333333' : colors.background,
        borderTopColor: isDark ? '#444444' : colors.border
      }]}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, {color: isDark ? '#BBBBBB' : COLORS.textLight}]}>Price</Text>
          <Text style={[styles.priceLargeText, {color: isDark ? '#FFFFFF' : colors.text}]}>
            {selectedCurrency === 'USD' ? '$' : selectedCurrency} {price ? Math.floor(price).toLocaleString() : '175,000'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, styles.inquireButton]}
          onPress={handleInquire}>
            <Text style={[styles.inquireButtonText, {color: isDark ? '#000000' : '#FFFFFF'}]}>Inquire Now</Text>
          </TouchableOpacity>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={fullScreenMode}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreenImage}
      >
        <View 
          style={styles.fullScreenContainer}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeFullScreenImage}
          >
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Navigation buttons - only show when not zoomed */}
          {!imageZoomed && (
            <>
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={() => navigateFullScreenImage('prev')}
              >
                <Icon name="chevron-left" size={40} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => navigateFullScreenImage('next')}
              >
                <Icon name="chevron-right" size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
          
          {/* Zoom indicator */}
          <View style={styles.zoomIndicator}>
            <TouchableOpacity onPress={() => setImageZoomed(!imageZoomed)}>
              <Icon 
                name={imageZoomed ? "zoom-out" : "zoom-in"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          
          <CarImageCarousel
            images={carImages}
            style={[
              styles.fullScreenCarousel,
              imageZoomed && styles.zoomedCarousel
            ]}
            height={Dimensions.get('window').height * 0.8}
            initialIndex={fullScreenImageIndex}
            showIndex={!imageZoomed}
          />
          
          {/* Full screen thumbnails - only show when not zoomed */}
          {!imageZoomed && (
            <View style={styles.fullScreenThumbnailsContainer}>
              <FlatList
                ref={fullScreenThumbnailsRef}
                data={carImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `fs-thumbnail-${index}`}
                contentContainerStyle={styles.thumbnailsContent}
                initialScrollIndex={fullScreenImageIndex > 0 ? fullScreenImageIndex : 0}
                getItemLayout={(_, index) => ({
                  length: 78, // width + margins
                  offset: 78 * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    if (fullScreenThumbnailsRef.current) {
                      fullScreenThumbnailsRef.current.scrollToIndex({ index: info.index, animated: true });
                    }
                  });
                }}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    style={[
                      styles.fullScreenThumbnailItem,
                      fullScreenImageIndex === index && styles.fullScreenThumbnailItemSelected,
                    ]}
                    onPress={() => {
                      setFullScreenImageIndex(index);
                    }}>
                    <CarImage
                      source={item}
                      style={styles.fullScreenThumbnailImage}
                      resizeMode="cover"
                    />
                    {fullScreenImageIndex === index && (
                      <View style={styles.fullScreenThumbnailOverlay} />
                    )}
                  </TouchableOpacity>
                )}
              />
              
              {/* Thumbnail position indicator */}
              <View style={styles.thumbnailPositionIndicator}>
                <Text style={styles.thumbnailPositionText}>
                  {fullScreenImageIndex + 1} / {carImages.length}
                </Text>
              </View>
            </View>
          )}
          
          {/* Image type indicator - only show when not zoomed */}
          {!imageZoomed && (
            <View style={styles.imageTypeIndicator}>
              <Text style={styles.imageTypeText}>
                {activeTab === 'exterior' ? 'Exterior View' : 'Interior View'}
              </Text>
            </View>
          )}
          
          {/* Double tap instruction - shown briefly on first load */}
          {!imageZoomed && !swipeDirection && (
            <View style={styles.doubleTapInstruction}>
              <Text style={styles.doubleTapText}>Double tap to zoom</Text>
            </View>
          )}
          
          {/* Swipe instruction overlay - shown briefly */}
          {swipeDirection && !imageZoomed && (
            <View style={[
              styles.swipeIndicator,
              swipeDirection === 'left' ? styles.swipeLeft : styles.swipeRight
            ]}>
              <Icon 
                name={swipeDirection === 'left' ? 'chevron-left' : 'chevron-right'} 
                size={40} 
                color="rgba(255, 255, 255, 0.8)" 
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  backButtonSmall: {
    padding: SPACING.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80, // Extra padding for the bottom action bar
  },
  cardContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 0,
  },
  galleryTabs: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
  },
  galleryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  activeGalleryTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#5E366D',
  },
  galleryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeGalleryTabText: {
    color: '#5E366D',
    fontWeight: '600',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF2E0',
    borderRadius: 30,
  },
  conditionText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 22,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  specPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  specIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  specIconDark: {
    tintColor: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5E366D',
  },
  sectionContainer: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    position: 'relative',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  overviewList: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginHorizontal: 10,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  overviewIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overviewLabel: {
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  overviewValue: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuresColumn: {
    flex: 1,
    marginRight: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
    paddingHorizontal: 10,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 10,
    marginLeft:20
  },
  descriptionParagraph: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    marginBottom: 10,
  },
  descriptionBold: {
    fontWeight: 'bold',
  },
  descriptionList: {
    marginTop: 5,
    marginBottom: 5,
  },
  descriptionListItem: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    marginBottom: 5,
    paddingLeft: 5,
  },
  noDescriptionText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  priceContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 4,
  },
  priceLargeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquireButton: {
    backgroundColor: '#FF8C00',
    flex: 1,
    marginTop: 10,
    width: 250,
    borderRadius: 8,
  },
  inquireButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  accordionContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    marginLeft: 20,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  expandedAccordionHeader: {
    borderBottomColor: 'transparent',
  },
  accordionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  accordionContent: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  accordionFeatureText: {
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 3,
  },
  thumbnailsContainer: {
    width: '100%',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginTop: 0,
    marginBottom: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  thumbnailItem: {
    width: 80,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbnailItemSelected: {
    borderWidth: 2,
    borderColor: '#5E366D',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(94, 54, 109, 0.2)',
    borderRadius: 4,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#5E366D',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCarousel: {
    width: Dimensions.get('window').width,
  },
  fullScreenThumbnailsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 80,
    paddingVertical: 10,
  },
  fullScreenThumbnailItem: {
    width: 70,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fullScreenThumbnailItemSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fullScreenThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  imageTypeIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(94, 54, 109, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageTypeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fullScreenThumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  thumbnailPositionIndicator: {
    position: 'absolute',
    right: 10,
    bottom: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  thumbnailPositionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeLeft: {
    left: 0,
  },
  swipeRight: {
    right: 0,
  },
  thumbnailsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  thumbnailsLoadingText: {
    marginTop: 8,
    fontSize: 12,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 40,
    right: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  zoomedCarousel: {
    width: Dimensions.get('window').width * 1.5,
    height: Dimensions.get('window').height * 1.2,
    transform: [{ scale: 1.5 }],
  },
  doubleTapInstruction: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
  doubleTapText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default CarDetailScreen;
