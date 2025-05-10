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
import {MaterialCommunityIcons, Ionicons, AntDesign} from 'src/utils/icon';
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
import {getCarList} from 'src/services/api';
import CarCard from '../explore/CarCard';
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';

const {width} = Dimensions.get('window');
const cardWidth = width * 0.8;

// Memoized card component to prevent unnecessary re-renders
const ArrivedCarCard = memo(
  ({item, onPress, toggleFavorite, shareCar, isFavorite}) => {
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
          imageUrl = {uri: `https://cdn.legendmotorsglobal.com${path}`};
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
      `${item.Year?.year || ''} ${item.Brand?.name || item.brand?.name || ''} ${
        item.CarModel?.name || ''
      }`.trim() ||
      'Car Details';

    // Get price from API response
    const price = item.price || item.Price || 750000;

    return (
      <TouchableOpacity
        style={styles.carCard}
        onPress={() => onPress(item)}
        activeOpacity={0.8}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>New Arrival</Text>
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
              <MaterialCommunityIcons
                name="steering"
                size={16}
                color="#8A2BE2"
              />
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
  },
);

// Cache for new arrivals data
let cachedNewArrivals = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const JustArrived = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {user} = useAuth();
  const {isInWishlist, addItemToWishlist, removeItemFromWishlist} =
    useWishlist();

  // Use a ref to avoid making API calls if component unmounts
  const isMounted = useRef(true);

  // Pre-process car data for better performance
  const preprocessCarData = useCallback(car => {
    // Extract body type
    // Handle undefined or null car
    if (!car) return null;

    try {
      // Process CarImages array if available
      let processedImages = [];

      // Check if car has the CarImages array (from API)
      if (
        car.CarImages &&
        Array.isArray(car.CarImages) &&
        car.CarImages.length > 0
      ) {
        processedImages = car.CarImages.map(image => {
          if (image.FileSystem && image.FileSystem.path) {
            return {
              uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.path}`,
              id: image.id,
              type: image.type,
              order: image.order,
              filename: image.FileSystem.path.split('/').pop(),
              fullPath: image.FileSystem.path,
            };
          }
          return null;
        }).filter(img => img !== null);
      }
      // Fallback to other image properties if available
      else if (
        car.images &&
        Array.isArray(car.images) &&
        car.images.length > 0
      ) {
        processedImages = car.images.map(image => {
          return typeof image === 'string' ? {uri: image} : image;
        });
      } else if (
        car.Images &&
        Array.isArray(car.Images) &&
        car.Images.length > 0
      ) {
        processedImages = car.Images.map(image => {
          return typeof image === 'string' ? {uri: image} : image;
        });
      } else if (car.image) {
        processedImages = [
          typeof car.image === 'string' ? {uri: car.image} : car.image,
        ];
      }

      car.bodyType =
        car?.SpecificationValues?.find(a => a.Specification?.key == 'body_type')
          ?.name ?? 'SUV';
      car.fuelType =
        car?.SpecificationValues?.find(a => a.Specification?.key == 'fuel_type')
          ?.name ?? 'Electric';
      car.transmissionType =
        car?.SpecificationValues?.find(
          a => a.Specification?.key == 'transmission',
        )?.name ?? 'Automatic';
      car.steeringType =
        car?.SpecificationValues?.find(a => a.Specification?.key == 'steering')
          ?.name ?? 'Left hand drive';
      car.region =
        car?.SpecificationValues?.find(
          a => a.Specification?.key == 'regional_specification',
        )?.name ?? 'China';

      // Create a normalized car object with consistent property names
      const processedCar = {
        ...car,
        id: car.id || car.carId || car.car_id || null,
        brand: car.brand || (car.Brand ? car.Brand.name : null) || null,
        model: car.model || (car.CarModel ? car.CarModel.name : null) || null,
        trim: car.trim || (car.Trim ? car.Trim.name : null) || null,
        year: car.year || car.Year || null,
        price: car.price || car.priceAED || null,
        images: processedImages, // Use our processed images
        color: car.color || car.exteriorColor || null,
        stockId: car.stockId || car.stock_id || null,
        slug: car.slug || null,
      };

      // Extract colors from slug if available

      return processedCar;
    } catch (error) {
      console.error('Error processing car:', error, car);
      return null;
    }
  }, []);
  const {selectedLanguage} = useCurrencyLanguage();

  useEffect(() => {
    fetchNewArrivals();
    return () => {
      isMounted.current = false;
    };
  }, [selectedLanguage]);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);

      // Call the API to get "Just Arrived!" cars with reduced limit
      const response = await getCarList({
        page: 1,
        limit: 10, // Reduced from 100 to just 5 for faster loading
        status: 'published',
        tags: 2,
      });

      if (
        response?.data &&
        response?.success &&
        Array.isArray(response?.data)
      ) {
        const cars = [...response?.data];

        let processedCars = [];

        if (cars.length > 0) {
          processedCars = cars.map(preprocessCarData);
        } else {
          // Fallback to most recent cars
          processedCars = cars.slice(0, 3).map(preprocessCarData);
        }

        // Update cache

        setNewArrivals([...processedCars]);
      } else {
        setNewArrivals([]);
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
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

  const navigateToCarDetail = car => {
    navigation.navigate('CarDetailScreen', {carId: car.id});
  };

  const navigateToAllNewArrivals = () => {
    navigation.navigate('ExploreScreen', {
      filters: {tagIds: [2]}, // Filter for Just Arrived tag
    });
  };

  const renderItem = ({item}) => (
    <CarCard
      item={item}
      onPress={navigateToCarDetail}
      toggleFavorite={toggleFavorite}
      shareCar={shareCar}
      isFavorite={isInWishlist(item.id) || false}
      width={Dimensions.get('window').width * 0.85}
      tag={
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>New Arrival</Text>
        </View>
      }
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="car-clock"
        size={50}
        color={COLORS.textLight}
      />
      <Text style={styles.emptyText}>No new arrivals found</Text>
    </View>
  );

  const renderLoadingItem = ({item}) => (
    <View style={[styles.carCard, styles.skeletonCard]}>
      <View style={[styles.imageContainer, styles.skeletonImage]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonText, {width: '40%', marginBottom: 8}]} />
        <View
          style={[
            styles.skeletonText,
            {width: '90%', height: 18, marginBottom: 12},
          ]}
        />
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <View
            style={[
              styles.skeletonText,
              {width: '30%', height: 14, marginRight: 8, marginBottom: 8},
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              {width: '30%', height: 14, marginRight: 8, marginBottom: 8},
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              {width: '30%', height: 14, marginRight: 8, marginBottom: 8},
            ]}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
          }}>
          <View style={[styles.skeletonText, {width: '30%', height: 14}]} />
          <View style={[styles.skeletonText, {width: '30%', height: 14}]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Just Arrived!</Text>
        <TouchableOpacity onPress={navigateToAllNewArrivals}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Be the first to see our newest vehicles
      </Text>

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
          data={newArrivals}
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
  carsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  carCard: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginRight: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#42B72A', // Green color for Just Arrived
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
    backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
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

export default JustArrived;
