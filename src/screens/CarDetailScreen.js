import React, {useState, useEffect} from 'react';
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
import {
  extractColorsFromSlug,
  createColorMatchFunction,
} from '../utils/colorUtils';

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
  const {
    isInWishlist, 
    addItemToWishlist, 
    removeItemFromWishlist,
    fetchWishlistItems
  } = useWishlist();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exterior');
  const [extractedColors, setExtractedColors] = useState([]);
  const [extractedInteriorColors, setExtractedInteriorColors] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);
  
  // Add state for managing accordion open/close state
  const [expandedAccordions, setExpandedAccordions] = useState({
    interior_feature: false,
    exterior_and_controls: false,
    security: false,
    comfort_and_convenience: false,
    infotainment: false,
  });
  
  // Function to toggle accordion state
  const toggleAccordion = (category) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [category]: !prev[category]
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
    // Here you would implement functionality to inquire about the car
    console.log('Inquire about car:', car?.id);
    // For demonstration, show car ID
    alert(`Inquire about car ID: ${car?.id}`);
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
              style: 'cancel' 
            },
            { 
              text: 'Login', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }

      setProcessingWishlist(true);
      console.log(`Toggling favorite for car ID: ${car.id}, current status: ${isFavorite}`);
      
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

  const getAllImages = () => {
    const exteriorImages = getImagesByType('exterior');
    const interiorImages = getImagesByType('interior');

    return activeTab === 'exterior' ? exteriorImages : interiorImages;
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
  const groupFeaturesByCategory = (features) => {
    return features.reduce((acc, feature) => {
      const category = feature.Feature?.key || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchCarDetails}>
          <Text style={styles.reloadButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="no-photography" size={50} color={COLORS.textLight} />
        <Text style={styles.errorText}>Car not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
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
  const bodyType = car.SpecificationValues?.find(a => a.Specification?.key === 'body_type')?.name || 'SUV';
  const fuelType = car.SpecificationValues?.find(a => a.Specification?.key === 'fuel_type')?.name || 'Electric';
  const transmission = car.SpecificationValues?.find(a => a.Specification?.key === 'transmission')?.name || 'Automatic';
  const region = car.SpecificationValues?.find(a => a.Specification?.key === 'regional_specification')?.name || 'China';
  const steeringType = car.SpecificationValues?.find(a => a.Specification?.key === 'steering')?.name || 'Left hand drive';
  
  // Prepare car title
  const carTitle = additionalInfo || 
    (year && brandName && carModel ? 
      `${year} ${brandName} ${carModel}${car.Trim?.name ? ` ${car.Trim.name}` : ''}` : 
      'Car Details');
  
  // Get car images
  const carImages = getAllImages();
  
  // Get price
  const price = car?.CarPrices?.find(crr => crr.currency === selectedCurrency)?.price || car.price;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButtonSmall}>
          <Icon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Car Details
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Action buttons at the top */}
        
        
        {/* CarCard-style display */}
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            {/* Tabs for exterior/interior */}
            <View style={styles.galleryTabs}>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'exterior' && styles.activeGalleryTab,
                ]}
                onPress={() => setActiveTab('exterior')}>
                <Text
                  style={[
                    styles.galleryTabText,
                    activeTab === 'exterior' && styles.activeGalleryTabText,
                  ]}>
                  Exterior
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'interior' && styles.activeGalleryTab,
                ]}
                onPress={() => setActiveTab('interior')}>
                <Text
                  style={[
                    styles.galleryTabText,
                    activeTab === 'interior' && styles.activeGalleryTabText,
                  ]}>
                  Interior
                </Text>
              </TouchableOpacity>
            </View>
            
            <CarImageCarousel
              images={carImages}
              style={styles.carImage}
              height={240}
              onImagePress={() => {}}
            />
          </View>

          <View style={styles.cardContent}>
            {/* Top row with condition badge and action buttons */}
            <View style={styles.topRow}>
              {/* Left side - badges */}
              <View style={styles.badgesContainer}>
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionText}>{car.condition || 'New'}</Text>
                </View>
                
                <View style={styles.categoryBadge}>
                  <Icon name="directions-car" size={18} color="#FF8C00" />
                  <Text style={styles.categoryText}>{bodyType || 'SUV'}</Text>
                </View>
              </View>
              
              {/* Right side - action buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionIconButton}
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
                  style={styles.actionIconButton}
                  onPress={() => {
                    // Handle download functionality
                    if (car.brochureFile?.path) {
                      alert('Downloading brochure...');
                      // Implement actual download logic here
                    } else {
                      alert('No brochure available for download');
                    }
                  }}>
                  <Ionicons name="download-outline" size={24} color="#212121" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={handleShare}>
                  <Ionicons name="share-social" size={24} color="#212121" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Car Title */}
            <Text style={styles.carTitle} numberOfLines={2} ellipsizeMode="tail">
              {carTitle}
            </Text>

            {/* Specs pills in rows, using the design from the image */}
            <View style={styles.specsContainer}>
              <View style={styles.specPill}>
                <Icon name="settings" size={18} color="#5E366D" />
                <Text style={styles.specPillText}>ltr</Text>
              </View>

              <View style={styles.specPill}>
                <Icon name="bolt" size={18} color="#5E366D" />
                <Text style={styles.specPillText}>Electric</Text>
              </View>

              <View style={styles.specPill}>
                <Icon name="sync" size={18} color="#5E366D" />
                <Text style={styles.specPillText}>Automatic</Text>
              </View>

              <View style={styles.specPill}>
                <Icon name="public" size={18} color="#5E366D" />
                <Text style={styles.specPillText}>China</Text>
              </View>
            </View>

            <View style={styles.specsContainer}>
              <View style={styles.specPill}>
                <Icon name="drive-eta" size={18} color="#5E366D" />
                <Text style={styles.specPillText}>Left hand drive</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.priceRow}>
              {price ? (
                <Text style={styles.priceText}>
                  {selectedCurrency} {price.toLocaleString()}
                </Text>
              ) : (
                <Text style={styles.priceText}>Price on Request</Text>
              )}
            </View>
          </View>
        </View>

        {/* Car Overview Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Car Overview</Text>
          <View style={styles.sectionTitleLine} />

          <View style={styles.overviewList}>
            {/* Condition */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="directions-car" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Condition:</Text>
              <Text style={styles.overviewValue}>
                {car.condition || 'New'}
              </Text>
            </View>

            {/* Cylinders */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="settings" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Cylinders:</Text>
              <Text style={styles.overviewValue}>
                {specifications.find(spec => spec.Specification?.name === 'Cylinders')?.name || 'None - Electric'}
              </Text>
            </View>

            {/* Fuel Type */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="local-gas-station" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Fuel Type:</Text>
              <Text style={styles.overviewValue}>
                {specifications.find(spec => spec.Specification?.name === 'Fuel Type')?.name || fuelType}
              </Text>
            </View>

            {/* Built Year */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="event" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Built Year:</Text>
              <Text style={styles.overviewValue}>
                {year}
              </Text>
            </View>

            {/* Transmission */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="transform" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Transmission:</Text>
              <Text style={styles.overviewValue}>
                {specifications.find(spec => spec.Specification?.name === 'Transmission')?.name || transmission}
              </Text>
            </View>

            {/* Color */}
            <View style={styles.overviewItem}>
              <View style={styles.overviewIconContainer}>
                <Icon name="palette" size={20} color="#9E9E9E" />
              </View>
              <Text style={styles.overviewLabel}>Color:</Text>
              <Text style={styles.overviewValue}>
                {specifications.find(spec => spec.Specification?.name === 'Color')?.name || 'Black'}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section - Redesigned with accordion categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.sectionTitleLine} />

          {/* Main features grid - two column layout showing some top features */}
          <View style={styles.featuresGrid}>
            {/* Column 1 */}
            <View style={styles.featuresColumn}>
              {features.slice(0, Math.min(6, features.length / 2)).map(feature => (
                <View 
                  key={`feature-highlight-${feature.id || Math.random().toString()}`}
                  style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#8BC34A" />
                  <Text style={styles.featureText}>{feature.name}</Text>
                </View>
              ))}
            </View>
            
            {/* Column 2 */}
            <View style={styles.featuresColumn}>
              {features.slice(Math.min(6, features.length / 2), Math.min(12, features.length)).map(feature => (
                <View 
                  key={`feature-highlight-${feature.id || Math.random().toString()}`}
                  style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#8BC34A" />
                  <Text style={styles.featureText}>{feature.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Accordion Sections */}
          <View style={styles.accordionContainer}>
            {/* Group features by category and render each category as an accordion */}
            {Object.entries(groupFeaturesByCategory(features)).map(([category, categoryFeatures]) => {
              // Get the display name for this category
              const categoryDisplayName = categoryFeatures[0]?.Feature?.name || category.replace(/_/g, ' ');
              // Only show if we have features in this category
              if (categoryFeatures.length === 0) return null;
              
              return (
                <View key={`accordion-${category}`}>
                  <TouchableOpacity 
                    style={[
                      styles.accordionHeader,
                      expandedAccordions[category] && styles.expandedAccordionHeader
                    ]}
                    onPress={() => toggleAccordion(category)}>
                    <Text style={styles.accordionTitle}>
                      {categoryDisplayName}
                    </Text>
                    <Icon 
                      name={expandedAccordions[category] ? "remove" : "add"} 
                      size={24} 
                      color="#9E9E9E" 
                    />
                  </TouchableOpacity>
                  
                  {/* Accordion Content */}
                  {expandedAccordions[category] && (
                    <View style={styles.accordionContent}>
                      <Text style={styles.accordionFeatureText}>
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
            })}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.sectionTitleLine} />
          {car.description ? (
            <View style={styles.descriptionContainer}>
              <RenderHtml
                contentWidth={width - (SPACING.md * 2)}
                source={{ html: car.description }}
                tagsStyles={{
                  p: styles.descriptionParagraph,
                  strong: styles.descriptionBold,
                  li: styles.descriptionListItem,
                  ul: styles.descriptionList
                }}
              />
            </View>
          ) : (
            <Text style={styles.noDescriptionText}>
              No description available
            </Text>
          )}
        </View>

        {/* ID Information (for debug purposes)
        <View style={styles.idInfoContainer}>
          <Text style={styles.idInfoText}>Car ID: {car.id}</Text>
          {car.slug && <Text style={styles.idInfoText}>Slug: {car.slug}</Text>}
        </View> */}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, styles.similarCarsButton]}
          onPress={handleViewSimilarColorCars}
          disabled={!extractedColors || extractedColors.length === 0}>
          <Text style={styles.similarCarsButtonText}>Similar Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.inquireButton]}
          onPress={handleInquire}>
          <Text style={styles.inquireButtonText}>Inquire Now</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#ffffff',
    borderTopEndRadius: BORDER_RADIUS.lg,
    borderTopStartRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryTabs: {
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  galleryTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  activeGalleryTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5E366D',
  },
  galleryTabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  activeGalleryTabText: {
    color: '#5E366D',
    fontWeight: '600',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderTopEndRadius: BORDER_RADIUS.lg,
    borderTopStartRadius: BORDER_RADIUS.lg,
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    lineHeight: 22,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  specPillText: {
    fontSize: 14,
    color: '#424242',
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
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    position: 'relative',
    paddingBottom: 10,
  },
  sectionTitleLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 3,
    backgroundColor: '#5E366D',
    borderRadius: 1.5,
  },
  overviewList: {
    marginTop: SPACING.xs,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  overviewIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    flex: 1,
  },
  overviewValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#5E366D',
  },
  featureCategory: {
    marginBottom: SPACING.md,
  },
  featureCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  featureCategoryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  featuresGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  featuresColumn: {
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    lineHeight: 20,
  },
  descriptionParagraph: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
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
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 5,
    paddingLeft: 5,
  },
  noDescriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  idInfoContainer: {
    padding: SPACING.md,
    backgroundColor: '#F8F8F8',
  },
  idInfoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarCarsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    flex: 1,
  },
  similarCarsButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  inquireButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textDark,
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
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  accordionContainer: {
    marginTop: SPACING.md,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expandedAccordionHeader: {
    borderBottomColor: '#5E366D',
  },
  accordionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textDark,
    textTransform: 'capitalize',
  },
  accordionContent: {
    paddingVertical: SPACING.sm,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accordionFeatureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
});

export default CarDetailScreen;
