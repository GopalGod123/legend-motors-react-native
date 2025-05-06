import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  Dimensions,
  Share
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  MaterialCommunityIcons, 
  Ionicons, 
  AntDesign, 
  FontAwesome 
} from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { CarImage } from '../common';
import { API_BASE_URL, API_KEY } from '../../utils/apiConfig';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

const MostPopularCars = () => {
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchPopularCars();
  }, []);

  const fetchPopularCars = async () => {
    try {
      setLoading(true);
      
      // Call the API to get popular cars - using simpler parameters to avoid errors
      const response = await axios.get(`${API_BASE_URL}/car/list`, {
        params: {
          page: 1,
          limit: 5,
          sortBy: 'createdAt',
          order: 'desc',
          lang: 'en'
          // Removed the featured parameter which might be causing errors
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log(`Fetched ${response.data.data.length} cars for popular section`);
        setPopularCars(response.data.data);
      } else {
        console.log('No cars found or response format issue, using fallback data');
        setPopularCars(getFallbackData());
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Error fetching popular cars:', error);
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error in request setup:', error.message);
      }
      
      // Use fallback data when API fails
      setPopularCars(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = () => {
    // Fallback data in case API fails
    return [
      {
        id: 1,
        title: '2024 BYD SONG PLUS HONOR',
        brand: { name: 'BYD' },
        model: 'Song Plus',
        price: '120,000',
        year: 2024,
        mileage: '0',
        fuelType: 'Electric',
        transmissionType: 'Automatic',
        bodyType: 'SUV',
        location: 'Dubai',
        images: [require('./HotDealsCar.png')],
      },
      {
        id: 2,
        title: '2023 Toyota Land Cruiser 300',
        brand: { name: 'Toyota' },
        model: 'Land Cruiser 300',
        price: '350,000',
        year: 2023,
        mileage: '1,200',
        fuelType: 'Petrol',
        transmissionType: 'Automatic', 
        bodyType: 'SUV',
        location: 'Abu Dhabi',
        images: [require('./HotDealsCar.png')],
      },
      {
        id: 3,
        title: '2024 Mercedes-Benz S500',
        brand: { name: 'Mercedes-Benz' },
        model: 'S500',
        price: '450,000',
        year: 2024,
        mileage: '0',
        fuelType: 'Hybrid',
        transmissionType: 'Automatic',
        bodyType: 'Sedan',
        location: 'Sharjah',
        images: [require('./HotDealsCar.png')],
      },
    ];
  };

  const navigateToCarDetail = (car) => {
    navigation.navigate('CarDetailScreen', { carId: car.id });
  };

  const navigateToAllPopular = () => {
    navigation.navigate('ExploreScreen', { 
      filters: { sortBy: 'popularity', order: 'desc' } 
    });
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

  const renderCarItem = ({ item }) => {
    // Extract data from the API response
    const brandName = item.Brand?.name || item.brand?.name || '';
    const carModel = item.CarModel?.name || item.model || '';
    const year = item.Year?.year || item.year || '';
    const additionalInfo = item.additionalInfo || '';
    
    const bodyType = item.SpecificationValues?.find(spec => 
      spec.Specification?.key === 'body_type'
    )?.name || item.bodyType || 'SUV';
    
    const fuelType = item.SpecificationValues?.find(spec => 
      spec.Specification?.key === 'fuel_type'
    )?.name || item.fuelType || 'Electric';
    
    const transmission = item.SpecificationValues?.find(spec => 
      spec.Specification?.key === 'transmission'
    )?.name || item.transmissionType || 'Automatic';
    
    const region = item.SpecificationValues?.find(spec => 
      spec.Specification?.key === 'regional_specification'
    )?.name || item.location || 'China';
    
    const steeringType = item.SpecificationValues?.find(spec => 
      spec.Specification?.key === 'steering_side'
    )?.name || item.steeringType || 'Left hand drive';
    
    // Get first image from API response or use fallback
    let imageSource = require('./HotDealsCar.png');
    
    if (item.CarImages && item.CarImages.length > 0) {
      const image = item.CarImages[0];
      if (image.FileSystem && image.FileSystem.path) {
        imageSource = { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.path}` };
      } else if (image.FileSystem && image.FileSystem.compressedPath) {
        imageSource = { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.compressedPath}` };
      } else if (image.FileSystem && image.FileSystem.thumbnailPath) {
        imageSource = { uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.thumbnailPath}` };
      }
    } else if (item.images && item.images.length > 0) {
      imageSource = typeof item.images[0] === 'string'
        ? { uri: item.images[0] }
        : item.images[0];
    }

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
    
    // Get favorite status
    const isFavorite = favorites[item.id] || false;

    return (
      <TouchableOpacity 
        style={styles.carCard}
        onPress={() => navigateToCarDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>Popular</Text>
        </View>
        
        <Image
          source={imageSource}
          style={styles.carImage}
          resizeMode="cover"
        />
        
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

  const renderLoadingSkeletons = () => {
    // Create an array of 3 items for the loading skeleton
    const skeletonItems = Array(3).fill(0).map((_, index) => ({ id: `skeleton-${index}` }));
    
    return (
      <FlatList
        data={skeletonItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.carsList}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        renderItem={() => (
          <View style={[styles.carCard, styles.skeletonCard]}>
            <View style={[styles.imageContainer, styles.skeletonImage]} />
            <View style={styles.cardContent}>
              <View style={[styles.skeletonText, { width: '60%', marginBottom: 8 }]} />
              <View style={[styles.skeletonText, { width: '90%', height: 18, marginBottom: 12 }]} />
              <View style={[styles.skeletonText, { width: '40%', height: 24, marginBottom: 12 }]} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={[styles.skeletonText, { width: '30%' }]} />
                <View style={[styles.skeletonText, { width: '30%' }]} />
                <View style={[styles.skeletonText, { width: '30%' }]} />
              </View>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Most Popular Cars</Text>
        <TouchableOpacity onPress={navigateToAllPopular}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        renderLoadingSkeletons()
      ) : (
        <FlatList
          data={popularCars}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.carsList}
          renderItem={renderCarItem}
          ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="car-search" size={50} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No popular cars found</Text>
            </View>
          }
        />
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
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  carsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  carCard: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#1E90FF', // Blue color for Most Popular
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
  carImage: {
    width: '100%',
    height: 180,
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
    minHeight: 44, // Ensure space for 2 lines
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
  // Skeleton styles
  skeletonCard: {
    backgroundColor: COLORS.white,
  },
  skeletonImage: {
    backgroundColor: '#EEEEEE',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#EEEEEE',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
  },
  emptyContainer: {
    width: cardWidth,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
});

export default MostPopularCars; 