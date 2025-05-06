import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCarByIdOrSlug } from '../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { CarImage, CarImageCarousel } from '../components/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { extractColorsFromSlug, createColorMatchFunction } from '../utils/colorUtils';

const { width } = Dimensions.get('window');

// Helper function to convert color names to hex color codes
const getColorHex = (colorName) => {
  const colorMap = {
    'white': '#FFFFFF',
    'black': '#000000',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'grey': '#808080',
    'gray': '#808080',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
    'beige': '#F5F5DC',
    'tan': '#D2B48C',
    'maroon': '#800000',
    'navy': '#000080',
    'teal': '#008080',
    'olive': '#808000',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'ivory': '#FFFFF0',
    'cream': '#FFFDD0',
    'burgundy': '#800020',
    'turquoise': '#40E0D0',
    'bronze': '#CD7F32',
    'champagne': '#F7E7CE',
  };
  
  // Default to a light gray if color not found
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = (hexColor) => {
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
  const { carId, lang = 'en' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exterior');
  const [extractedColors, setExtractedColors] = useState([]);
  const [extractedInteriorColors, setExtractedInteriorColors] = useState([]);

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

  // Function to handle viewing similar color cars
  const handleViewSimilarColorCars = () => {
    if (!car || !car.slug || extractedColors.length === 0) {
      alert('No color information available for this car.');
      return;
    }

    // Create filter object with extracted colors
    const filters = {
      specifications: {
        color: extractedColors
      },
      extractColorsFromSlug: true,
      // Create a match function using our utility
      matchExtractedColors: createColorMatchFunction(extractedColors),
      // Flags to help ExploreScreen understand what we're filtering by
      colorFilter: true,
      colorNames: extractedColors
    };
    
    // Navigate to ExploreScreen with color filters
    navigation.navigate('ExploreTab', { 
      filters: filters,
      colorSearch: true,
      title: `Similar ${extractedColors.join('/')} Cars`
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
        console.log('Car details fetched successfully:', response.data.id);
        setCar(response.data);
      } else {
        console.log('Failed to fetch car details:', response?.message || 'Unknown error');
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
    // For example, navigating to an inquiry form or opening a contact modal
    console.log('Inquire about car:', car?.id);
    // For demonstration, show car ID
    alert(`Inquire about car ID: ${car?.id}`);
  };

  const getImagesByType = (type) => {
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
            fullPath: img.FileSystem.path
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

  const renderFeatureItem = ({ item }) => (
    <View style={styles.featureItem} key={`feature-${item.id || Math.random().toString()}`}>
      <Icon name="check-circle" size={20} color={COLORS.primary} />
      <Text style={styles.featureText}>{item.name}</Text>
    </View>
  );

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
  const brand = car.Brand?.name || '';
  const model = car.CarModel?.name || '';
  const trim = car.Trim?.name || '';
  const year = car.Year?.year || '';
  const title = `${year} ${brand} ${model} ${trim}`;
  
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButtonSmall}>
          <Icon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery Section */}
        <View style={styles.galleryContainer}>
          {/* Exterior/Interior tabs */}
          <View style={styles.galleryTabs}>
            <TouchableOpacity 
              style={[styles.galleryTab, activeTab === 'exterior' && styles.activeGalleryTab]}
              onPress={() => {
                setActiveTab('exterior');
              }}
            >
              <Text 
                style={[
                  styles.galleryTabText, 
                  activeTab === 'exterior' && styles.activeGalleryTabText
                ]}
              >
                Exterior
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.galleryTab, activeTab === 'interior' && styles.activeGalleryTab]}
              onPress={() => {
                setActiveTab('interior');
              }}
            >
              <Text 
                style={[
                  styles.galleryTabText, 
                  activeTab === 'interior' && styles.activeGalleryTabText
                ]}
              >
                Interior
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Main Image Carousel */}
          <CarImageCarousel
            images={getAllImages()}
            height={300}
            showIndex={true}
          />
        </View>
        
        {/* Car Title and Stock ID */}
        <View style={styles.titleContainer}>
          <Text style={styles.carTitle}>{title}</Text>
          {car.stockId && (
            <Text style={styles.stockIdText}>Stock ID: {car.stockId}</Text>
          )}
          
          {/* Badges for specifications */}
          <View style={styles.badgesContainer}>
            {specifications.map((spec, index) => {
              // Only show important specs as badges
              if (['Fuel Type', 'Transmission', 'Regional Specification', 'Steering Side'].includes(spec.Specification?.name)) {
                return (
                  <View key={`badge-${spec.id || index}`} style={styles.badge}>
                    <Text style={styles.badgeText}>{spec.name}</Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>
              AED {parseFloat(car.price || 0).toLocaleString()}
            </Text>
          </View>
        </View>
        
        {/* Car Overview Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Car Overview</Text>
          
          <View style={styles.overviewGrid}>
            {/* Basic car information - organized in 2 columns */}
            <View style={styles.overviewColumn}>
              {car.Brand && renderSpecification('Brand', car.Brand.name)}
              {car.CarModel && renderSpecification('Model', car.CarModel.name)}
              {car.Trim && renderSpecification('Trim', car.Trim.name)}
              {car.Year && renderSpecification('Year', car.Year.year)}
            </View>
            
            <View style={styles.overviewColumn}>
              {/* Extract and display key specifications */}
              {specifications.map((spec, index) => {
                // Only show certain specs in overview
                if (['Color', 'Fuel Type', 'Cylinders', 'Transmission'].includes(spec.Specification?.name)) {
                  return (
                    <View key={`overview-spec-${spec.id || index}`} style={styles.specItem}>
                      <Text style={styles.specLabel}>{spec.Specification.name}:</Text>
                      <Text style={styles.specValue}>{spec.name}</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          </View>
          
          {/* Color chips display */}
          {extractedColors.length > 0 && (
            <View style={styles.colorSection}>
              <Text style={styles.colorSectionTitle}>Detected Colors:</Text>
              <View style={styles.colorChipsContainer}>
                {extractedColors.map((colorName, index) => {
                  const bgColor = getColorHex(colorName);
                  // Calculate if text should be dark or light based on background color
                  const isDarkColor = isColorDark(bgColor);
                  
                  return (
                    <View 
                      key={`color-${index}`} 
                      style={[
                        styles.colorChip, 
                        { backgroundColor: bgColor }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.colorChipText, 
                          { color: isDarkColor ? '#FFFFFF' : '#000000' }
                        ]}
                      >
                        {colorName}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        
        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          {/* Group features by category */}
          {Object.entries(groupedSpecs).map(([category, specs]) => (
            <View key={`category-${category}`} style={styles.featureCategory}>
              <TouchableOpacity 
                style={styles.featureCategoryHeader}
                onPress={() => {
                  // If you want to implement collapsible sections
                  console.log(`Toggle ${category} visibility`);
                }}
              >
                <Text style={styles.featureCategoryTitle}>{category}</Text>
                <Icon name="add" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Show all features */}
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={`feature-${feature.id || Math.random().toString()}`} style={styles.featureItem}>
                <Icon name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>{feature.name}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Description Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          {car.description ? (
            <Text style={styles.descriptionText}>{car.additionalInfo}</Text>
          ) : (
            <Text style={styles.noDescriptionText}>No description available</Text>
          )}
        </View>
        
        {/* ID Information (for debug purposes) */}
        <View style={styles.idInfoContainer}>
          <Text style={styles.idInfoText}>Car ID: {car.id}</Text>
          {car.slug && <Text style={styles.idInfoText}>Slug: {car.slug}</Text>}
        </View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.similarCarsButton]}
          onPress={handleViewSimilarColorCars}
          disabled={!extractedColors || extractedColors.length === 0}
        >
          <Text style={styles.similarCarsButtonText}>Similar Cars</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.inquireButton]}
          onPress={handleInquire}
        >
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
  galleryContainer: {
    backgroundColor: '#F8F8F8',
  },
  galleryTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  galleryTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  activeGalleryTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  galleryTabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  activeGalleryTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  titleContainer: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  carTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  stockIdText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.sm,
  },
  badge: {
    backgroundColor: '#F0F0F0',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDark,
  },
  priceContainer: {
    marginTop: SPACING.sm,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  priceValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionContainer: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  overviewGrid: {
    flexDirection: 'row',
  },
  overviewColumn: {
    flex: 1,
  },
  specItem: {
    marginBottom: SPACING.sm,
  },
  specLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  specValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDark,
    fontWeight: '500',
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
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginLeft: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    lineHeight: 20,
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
  colorSection: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: SPACING.md,
  },
  colorSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  colorChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: 60,
    alignItems: 'center',
  },
  colorChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default CarDetailScreen; 