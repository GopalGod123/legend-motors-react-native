import React, {useState, useEffect, useRef, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
} from 'src/utils/icon';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {CarImage} from '../common';
import {API_BASE_URL, API_KEY} from '../../utils/apiConfig';
import axios from 'axios';
import {useAuth} from '../../context/AuthContext';
import {useWishlist} from '../../context/WishlistContext';

const {width} = Dimensions.get('window');
const cardWidth = width * 0.8;

// Memoized card component to prevent unnecessary re-renders
const PopularCarCard = memo(({item, onPress, toggleFavorite, shareCar, isFavorite}) => {
  // Use pre-computed values whenever possible
  const bodyType = item.bodyType || 'SUV';
  const fuelType = item.fuelType || 'Electric';
  const transmission = item.transmissionType || 'Automatic';
  const region = item.region || 'China';
  const steeringType = item.steeringType || 'Left hand drive';

  // Use only one image for faster rendering
  let imageUrl = null;
  
  if (item.CarImages && item.CarImages.length > 0) {
    const firstImage = item.CarImages[0];
    if (firstImage.FileSystem) {
      const path = 
        firstImage.FileSystem.thumbnailPath || 
        firstImage.FileSystem.compressedPath || 
        firstImage.FileSystem.path;
      
      if (path) {
        imageUrl = { uri: `https://cdn.legendmotorsglobal.com${path}` };
      }
    }
  }

  // If no valid image from API, use the fallback
  if (!imageUrl) {
    imageUrl = require('./HotDealsCar.png');
  }

  // Pre-computed car title
  const carTitle = 
    item.additionalInfo || 
    `${item.Year?.year || ''} ${item.Brand?.name || item.brand?.name || ''} ${item.CarModel?.name || ''}`.trim() || 
    'Car Details';

  // Get price from API response
  const price = item.price || item.Price || 750000;

  return (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => onPress(item)}
      activeOpacity={0.8}>
      <View style={styles.tagBadge}>
        <Text style={styles.tagText}>Popular</Text>
      </View>

      <View style={styles.imageContainer}>
        <CarImage
          source={imageUrl}
          style={styles.carImage}
          resizeMode="cover"
          loadingIndicatorSource={require('./HotDealsCar.png')}
        />
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
            <MaterialCommunityIcons
              name="car-shift-pattern"
              size={16}
              color="#8A2BE2"
            />
            <Text style={styles.specText}>{transmission}</Text>
          </View>

          <View style={styles.specItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#8A2BE2"
            />
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
              onPress={e => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}>
              {isFavorite ? (
                <AntDesign name="heart" size={24} color="#FF8C00" />
              ) : (
                <AntDesign name="hearto" size={24} color="#FF8C00" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={e => {
                e.stopPropagation();
                shareCar(item);
              }}>
              <Ionicons name="share-social-outline" size={24} color="#777" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Cache for popular cars data
let cachedPopularCars = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const MostPopularCars = () => {
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {user} = useAuth();
  const {isInWishlist, addItemToWishlist, removeItemFromWishlist} = useWishlist();
  
  // Use a ref to avoid making API calls if component unmounts
  const isMounted = useRef(true);

  // Pre-process car data for better performance
  const preprocessCarData = useCallback((car) => {
    // Extract body type
    const bodyType = car.SpecificationValues?.find(
      spec => spec.Specification?.key === 'body_type',
    )?.name || car.category || 'SUV';

    // Extract fuel type
    const fuelType = car.SpecificationValues?.find(
      spec => spec.Specification?.key === 'fuel_type',
    )?.name || car.fuelType || 'Electric';

    // Extract transmission
    const transmissionType = car.SpecificationValues?.find(
      spec => spec.Specification?.key === 'transmission',
    )?.name || car.transmissionType || 'Automatic';

    // Extract region/country
    const region = car.SpecificationValues?.find(
      spec => spec.Specification?.key === 'regional_specification',
    )?.name || car.country || 'China';

    // Extract steering type
    const steeringType = car.SpecificationValues?.find(
      spec => spec.Specification?.key === 'steering_side',
    )?.name || car.steeringType || 'Left hand drive';

    return {
      ...car,
      bodyType,
      fuelType,
      transmissionType,
      region,
      steeringType
    };
  }, []);

  useEffect(() => {
    fetchPopularCars();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPopularCars = async () => {
    try {
      setLoading(true);

      const now = Date.now();
      // Use cached data if available and not expired
      if (cachedPopularCars && now - lastFetchTime < CACHE_DURATION) {
        setPopularCars(cachedPopularCars);
        setLoading(false);
        return;
      }

      // Call the API with reduced parameters
      const response = await axios.get(`${API_BASE_URL}/car/list`, {
        params: {
          page: 1,
          limit: 5, // Reduced from 1000 to just 5 for faster loading
          sortBy: 'createdAt',
          order: 'desc',
          lang: 'en',
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!isMounted.current) return;

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        // Process the cars data
        const processedCars = response.data.data.map(preprocessCarData);
        
        // Update cache
        cachedPopularCars = processedCars;
        lastFetchTime = now;
        
        setPopularCars(processedCars);
      } else {
        setPopularCars([]);
      }
    } catch (error) {
      console.error('Error fetching popular cars:', error);
      setPopularCars([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const navigateToCarDetail = car => {
    navigation.navigate('CarDetailScreen', {carId: car.id});
  };

  const navigateToAllPopular = () => {
    navigation.navigate('ExploreScreen', {
      filters: {sortBy: 'popularity', order: 'desc'},
    });
  };

  const toggleFavorite = async carId => {
    if (!user) {
      navigation.navigate('Login', {
        returnScreen: 'HomeScreen',
        message: 'Please login to save favorites',
      });
      return;
    }

    try {
      if (isInWishlist(carId)) {
        await removeItemFromWishlist(carId);
      } else {
        await addItemToWishlist(carId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const shareCar = async car => {
    try {
      const carTitle =
        car.additionalInfo ||
        `${car.Year?.year || ''} ${car.Brand?.name || car.brand?.name || ''} ${
          car.CarModel?.name || ''
        }`;

      const shareUrl = `https://legendmotorsglobal.com/cars/${car.id}`;

      await Share.share({
        message: `Check out this ${carTitle} on Legend Motors! ${shareUrl}`,
        url: shareUrl,
        title: 'Share this car',
      });
    } catch (error) {
      console.error('Error sharing car:', error);
    }
  };

  const renderItem = ({ item }) => (
    <PopularCarCard
      item={item}
      onPress={navigateToCarDetail}
      toggleFavorite={toggleFavorite}
      shareCar={shareCar}
      isFavorite={isInWishlist(item.id)}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="car-search"
        size={50}
        color={COLORS.textLight}
      />
      <Text style={styles.emptyText}>No popular cars found</Text>
    </View>
  );

  const renderLoadingItem = ({ item }) => (
    <View style={[styles.carCard, styles.skeletonCard]}>
      <View style={[styles.imageContainer, styles.skeletonImage]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonText, {width: '60%', marginBottom: 8}]} />
        <View style={[styles.skeletonText, {width: '90%', height: 18, marginBottom: 12}]} />
        <View style={[styles.skeletonText, {width: '40%', height: 24, marginBottom: 12}]} />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={[styles.skeletonText, {width: '30%'}]} />
          <View style={[styles.skeletonText, {width: '30%'}]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Most Popular Cars</Text>
        <TouchableOpacity onPress={navigateToAllPopular}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <FlatList
          data={[{id: 'skeleton-1'}, {id: 'skeleton-2'}]}
          renderItem={renderLoadingItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.carsList}
          ItemSeparatorComponent={() => <View style={{width: 15}} />}
        />
      ) : (
        <FlatList
          data={popularCars}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.carsList}
          renderItem={renderItem}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
          ItemSeparatorComponent={() => <View style={{width: 15}} />}
          ListEmptyComponent={renderEmptyComponent}
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
    shadowOffset: {width: 0, height: 2},
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
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#ffffff', // Ensuring white background
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
