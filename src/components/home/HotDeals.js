import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Share, FlatList } from 'react-native';
import { MaterialCommunityIcons, Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { API_BASE_URL, API_KEY } from '../../utils/apiConfig';
import { CarImage } from '../common';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Single car card component with its own state
const HotDealCard = ({ item, onPress, toggleFavorite, shareCar, isFavorite }) => {
  // Extract data from the API response
  const brandName = item.Brand?.name || item.brand?.name || '';
  const carModel = item.CarModel?.name || item.model || '';
  const year = item.Year?.year || item.year || '';
  const additionalInfo = item.additionalInfo || '';
  
  const bodyType = item.SpecificationValues?.find(spec => 
    spec.Specification?.key === 'body_type'
  )?.name || item.category || 'SUV';
  
  const fuelType = item.SpecificationValues?.find(spec => 
    spec.Specification?.key === 'fuel_type'
  )?.name || item.fuelType || 'Electric';
  
  const transmission = item.SpecificationValues?.find(spec => 
    spec.Specification?.key === 'transmission'
  )?.name || item.transmissionType || 'Automatic';
  
  const region = item.SpecificationValues?.find(spec => 
    spec.Specification?.key === 'regional_specification'
  )?.name || item.country || 'China';
  
  const steeringType = item.SpecificationValues?.find(spec => 
    spec.Specification?.key === 'steering_side'
  )?.name || item.steeringType || 'Left hand drive';
  
  // Get all car images 
  let imageUrls = [];
  
  if (item.CarImages && item.CarImages.length > 0) {
    // Collect all image URLs
    console.log(`Hot Deal car ${item.id} has ${item.CarImages.length} images`);
    
    imageUrls = item.CarImages.map(image => {
      if (image.FileSystem && image.FileSystem.path) {
        return { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.path}` };
      } else if (image.FileSystem && image.FileSystem.compressedPath) {
        return { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.compressedPath}` };
      } else if (image.FileSystem && image.FileSystem.thumbnailPath) {
        return { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.thumbnailPath}` };
      }
      return null;
    }).filter(url => url !== null); // Remove any null entries
    
    console.log(`Found ${imageUrls.length} valid image URLs for hot deal car ${item.id}`);
  } else {
    console.log(`Hot Deal car ${item.id} has no images, using fallback`);
  }
  
  // If no valid images from API, use the fallback
  if (imageUrls.length === 0) {
    imageUrls = [require('./HotDealsCar.png')];
  }
  
  // Set up state for the current image index - now correctly at the component level
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Handle image scroll with improved accuracy
  const handleScroll = (event) => {
    if (!event || !event.nativeEvent) return;
    
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / styles.imageSlide.width);
    
    if (currentIndex >= 0 && currentIndex < imageUrls.length && currentIndex !== currentImageIndex) {
      setCurrentImageIndex(currentIndex);
    }
  };
  
  // Manual navigation functions for dots
  const scrollToImage = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * styles.imageSlide.width,
        animated: true
      });
    }
  };

  // Construct the car title
  let carTitle = '';
  if (additionalInfo) {
    carTitle = additionalInfo;
  } else if (year && brandName && carModel) {
    carTitle = `${year} ${brandName} ${carModel}`;
    if (item.Trim?.name) {
      carTitle += ` ${item.Trim.name}`;
    }
  } else {
    carTitle = item.title || 'Car Details';
  }

  // Get price from API response if available or use default
  const price = item.price || item.Price || 750000;

  return (
    <TouchableOpacity 
      key={item.id.toString()} 
      style={styles.cardContainer}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.tagBadge}>
        <Text style={styles.tagText}>Hot Deal!</Text>
      </View>
      
      <View style={styles.imageContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={imageUrls.length > 1}
          contentContainerStyle={{ width: cardWidth * imageUrls.length }}
        >
          {imageUrls.map((image, index) => (
            <View key={`car-image-${item.id}-${index}`} style={[styles.imageSlide, { width: cardWidth }]}>
              {typeof image === 'object' && image.uri ? (
                <CarImage
                  source={image}
                  style={styles.carImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={image}
                  style={styles.carImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </ScrollView>
        
        {/* Pagination dots for image gallery */}
        {imageUrls.length > 1 && (
          <View style={styles.paginationContainer}>
            {imageUrls.map((_, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => scrollToImage(index)}
                style={styles.paginationDotContainer}
              >
                <View
                  style={[
                    styles.paginationDot, 
                    { backgroundColor: index === currentImageIndex ? COLORS.white : 'rgba(255, 255, 255, 0.5)' }
                  ]} 
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="car" size={18} color="#FF8C00" />
            <Text style={styles.categoryText}>{bodyType}</Text>
          </View>
        </View>
        
        <Text style={styles.carTitle} numberOfLines={2} ellipsizeMode="tail">
          {carTitle}
        </Text>
        
        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="engine" size={16} color="#8A2BE2" />
            <Text style={styles.specText}>ltr</Text>
          </View>
          
          <View style={styles.specItem}>
            <Ionicons name="flash" size={16} color="#8A2BE2" />
            <Text style={styles.specText}>{fuelType}</Text>
          </View>
          
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="car-shift-pattern" size={16} color="#8A2BE2" />
            <Text style={styles.specText}>{transmission}</Text>
          </View>
          
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#8A2BE2" />
            <Text style={styles.specText}>{region}</Text>
          </View>
        </View>
        
        <View style={styles.steeringRow}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="steering" size={16} color="#8A2BE2" />
            <Text style={styles.specText}>{steeringType}</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>$ {price.toLocaleString()}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              {isFavorite ? (
                <AntDesign name="heart" size={24} color="#FF8C00" />
              ) : (
                <AntDesign name="hearto" size={24} color="#FF8C00" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={(e) => {
                e.stopPropagation();
                shareCar(item);
              }}
            >
              <Ionicons name="share-social-outline" size={24} color="#777" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HotDeals = () => {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchHotDeals();
  }, []);

  const fetchHotDeals = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch hot deals...');
      
      const response = await axios.get(`${API_BASE_URL}/car/list`, {
        params: {
          page: 1,
          limit: 50, // Increase limit to ensure we get enough cars
          sortBy: 'createdAt',
          order: 'desc',
          lang: 'en'
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log(`Fetched ${response.data.data.length} cars for hot deals section`);
        
        // Log the first car's tags to debug
        if (response.data.data.length > 0) {
          const firstCar = response.data.data[0];
          console.log('First car tags:', firstCar.Tags || 'No Tags property');
          console.log('First car full data sample:', JSON.stringify(firstCar).substring(0, 300) + '...');
        }
        
        // More flexible tag matching for "Hot Deal!"
        const cars = response.data.data;
        const hotDealCars = cars.filter(car => {
          // Check if car has Tags property
          if (!car.Tags || !Array.isArray(car.Tags)) {
            return false;
          }
          
          // Try different ways to match the "Hot Deal!" tag
          return car.Tags.some(tag => 
            tag.name === "Hot Deal!" || 
            tag.name === "Hot Deal" || 
            tag.name === "Hot Deals" ||
            (tag.id && (tag.id === 3 || tag.id === "3"))
          );
        });
        
        if (hotDealCars.length > 0) {
          console.log(`Found ${hotDealCars.length} cars with Hot Deal! tag`);
          // Log first hot deal car for debugging
          console.log('Sample hot deal car:', JSON.stringify(hotDealCars[0]).substring(0, 300) + '...');
          setHotDeals(hotDealCars);
        } else {
          console.log('No cars with Hot Deal! tag found, trying to check car.tags instead of car.Tags');
          
          // Try alternative way to find tags if car.Tags isn't working
          const altHotDealCars = cars.filter(car => {
            if (!car.tags && !car.Tags) return false;
            
            const tagsArray = car.tags || car.Tags;
            if (!Array.isArray(tagsArray)) return false;
            
            return tagsArray.some(tag => 
              (tag.name && (
                tag.name.toLowerCase().includes('hot deal') || 
                tag.name.toLowerCase().includes('hot offer')
              )) || 
              (tag.id && (tag.id === 3 || tag.id === "3"))
            );
          });
          
          if (altHotDealCars.length > 0) {
            console.log(`Found ${altHotDealCars.length} cars with alternative tag detection`);
            setHotDeals(altHotDealCars);
          } else {
            // Fall back to just returning the first few cars if no hot deals found
            console.log('No hot deal cars found with any method, using first 3 cars as fallback');
            setHotDeals(cars.slice(0, 3));
          }
        }
      } else {
        console.log('No cars found or response format issue');
        console.log('Response data:', response.data);
        setHotDeals([]);
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Error fetching hot deals:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error in request setup:', error.message);
      }
      
      // Set empty array when API fails
      setHotDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (carId) => {
    setFavorites(prevFavorites => ({
      ...prevFavorites,
      [carId]: !prevFavorites[carId]
    }));
    
    // If user is logged in, you could also call an API to save this preference
    if (user) {
      // Example API call (commented out)
      // api.toggleFavorite(carId, !favorites[carId]);
      console.log(`Toggled favorite for car ${carId} - ${!favorites[carId] ? 'added to' : 'removed from'} favorites`);
    } else {
      // Prompt user to login
      navigation.navigate('Login', { 
        returnScreen: 'HomeScreen',
        message: 'Please login to save favorites'
      });
    }
  };

  const shareCar = async (car) => {
    try {
      const carTitle = car.additionalInfo || 
        `${car.Year?.year || ''} ${car.Brand?.name || car.brand?.name || ''} ${car.CarModel?.name || ''}`;
      
      const shareUrl = `https://legendmotorsglobal.com/cars/${car.id}`;
      
      await Share.share({
        message: `Check out this ${carTitle} on Legend Motors! ${shareUrl}`,
        url: shareUrl,
        title: 'Share this car'
      });
    } catch (error) {
      console.error('Error sharing car:', error);
    }
  };

  const navigateToCarDetail = (car) => {
    navigation.navigate('CarDetailScreen', { carId: car.id });
  };

  const navigateToAllHotDeals = () => {
    navigation.navigate('ExploreScreen', { 
      filters: { tagIds: [3] } // Filter for Hot Deal tag
    });
  };

  const renderLoadingSkeletons = () => {
    const skeletonItems = Array(2).fill(0).map((_, index) => ({ id: `skeleton-${index}` }));
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {skeletonItems.map((item) => (
          <View key={item.id} style={[styles.cardContainer, { backgroundColor: '#f8f8f8' }]}>
            <View style={[styles.carImage, { backgroundColor: '#eeeeee' }]} />
            <View style={styles.cardContent}>
              <View style={[styles.skeletonLine, { width: '40%', marginBottom: 10 }]} />
              <View style={[styles.skeletonLine, { width: '80%', height: 20, marginBottom: 15 }]} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                <View style={[styles.skeletonLine, { width: '30%', marginRight: 8, marginBottom: 8 }]} />
                <View style={[styles.skeletonLine, { width: '30%', marginRight: 8, marginBottom: 8 }]} />
                <View style={[styles.skeletonLine, { width: '30%', marginRight: 8, marginBottom: 8 }]} />
                <View style={[styles.skeletonLine, { width: '30%', marginRight: 8, marginBottom: 8 }]} />
              </View>
              <View style={[styles.skeletonLine, { width: '40%', marginBottom: 15 }]} />
              <View style={[styles.skeletonLine, { width: '100%', height: 40, borderRadius: 20 }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hot Deals</Text>
        <TouchableOpacity onPress={navigateToAllHotDeals}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>Checkout our exclusive offers</Text>
      
      {loading ? (
        renderLoadingSkeletons()
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {hotDeals.length > 0 ? (
            hotDeals.map(item => (
              <HotDealCard 
                key={item.id.toString()} 
                item={item} 
                onPress={navigateToCarDetail}
                toggleFavorite={toggleFavorite}
                shareCar={shareCar}
                isFavorite={favorites[item.id] || false}
              />
            ))
          ) : (
            <View style={styles.noDealsContainer}>
              <MaterialCommunityIcons name="tag-text" size={40} color={COLORS.textLight} />
              <Text style={styles.noDealsText}>No hot deals available at the moment</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMedium,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.md,
    paddingBottom: SPACING.md,
  },
  cardContainer: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginRight: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: cardWidth,
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  imageSlide: {
    width: cardWidth,
    height: 180,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    color: '#FF8C00',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  specText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 5,
  },
  steeringRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    zIndex: 1,
  },
  discountText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#eeeeee',
    borderRadius: 6,
  },
  noDealsContainer: {
    width: cardWidth,
    height: 300,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  noDealsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#8A2BE2', // Purple color for Hot Deal
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 1,
  },
  tagText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDotContainer: {
    padding: 5, // Increase touch target size
    marginHorizontal: 3,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default HotDeals; 