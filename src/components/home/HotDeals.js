import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import {MaterialCommunityIcons, Ionicons, AntDesign} from 'src/utils/icon';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {API_BASE_URL, API_KEY} from '../../utils/apiConfig';
import {CarImage} from '../common';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {useWishlist} from '../../context/WishlistContext';
import api, {getCarList} from 'src/services/api';
import CarCard from '../explore/CarCard';
import {processCar} from 'src/screens/ExploreScreen';

const {width} = Dimensions.get('window');
const cardWidth = width * 0.85;

// Memoize the card component to prevent unnecessary re-renders
const HotDealCard = memo(
  ({item, onPress, toggleFavorite, shareCar, isFavorite}) => {
    // Extract data from the API response
    const brandName = item.Brand?.name || item.brand?.name || '';
    const carModel = item.CarModel?.name || item.model || '';
    const year = item.Year?.year || item.year || '';
    const additionalInfo = item.additionalInfo || '';

    // Use pre-computed values whenever possible
    const bodyType = item.bodyType || 'SUV';
    const fuelType = item.fuelType || 'Electric';
    const transmission = item.transmissionType || 'Automatic';
    const region = item.region || 'China';
    const steeringType = item.steeringType || 'Left hand drive';

    // Prepare images - only use first image initially for faster loading
    let imageUrls = [];

    if (item.CarImages && item.CarImages.length > 0) {
      // Get only the first image at first for faster loading
      const firstImage = item.CarImages[0];
      if (firstImage.FileSystem) {
        const path =
          firstImage.FileSystem.thumbnailPath ||
          firstImage.FileSystem.compressedPath ||
          firstImage.FileSystem.path;

        if (path) {
          imageUrls = [{uri: `https://cdn.legendmotorsglobal.com${path}`}];
        }
      }
    }

    // If no valid images from API, use the fallback
    if (imageUrls.length === 0) {
      imageUrls = [require('./HotDealsCar.png')];
    }

    // Construct the car title - pre-computed
    const carTitle =
      additionalInfo ||
      (year && brandName && carModel
        ? `${year} ${brandName} ${carModel}${
            item.Trim?.name ? ` ${item.Trim.name}` : ''
          }`
        : item.title || 'Car Details');

    // Get price from API response
    const price = item.price || item.Price || 750000;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onPress(item)}
        activeOpacity={0.9}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>Hot Deal!</Text>
        </View>

        <View style={styles.imageContainer}>
          {typeof imageUrls[0] === 'object' && imageUrls[0].uri ? (
            <CarImage
              source={imageUrls[0]}
              style={styles.carImage}
              resizeMode="cover"
              loadingIndicatorSource={require('./HotDealsCar.png')}
            />
          ) : (
            <Image
              source={imageUrls[0]}
              style={styles.carImage}
              resizeMode="cover"
            />
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

const HotDeals = () => {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {user} = useAuth();
  const {isInWishlist, addItemToWishlist, removeItemFromWishlist} =
    useWishlist();

  // Use a ref to avoid making API calls if component unmounts
  const isMounted = useRef(true);

  // Pre-process API data to extract relevant fields and flatten the structure for better performance
  const preprocessCarData = useCallback(car => {
    // Extract body type
    const bodyType =
      car.SpecificationValues?.find(
        spec => spec.Specification?.key === 'body_type',
      )?.name ||
      car.category ||
      'SUV';

    // Extract fuel type
    const fuelType =
      car.SpecificationValues?.find(
        spec => spec.Specification?.key === 'fuel_type',
      )?.name ||
      car.fuelType ||
      'Electric';

    // Extract transmission
    const transmissionType =
      car.SpecificationValues?.find(
        spec => spec.Specification?.key === 'transmission',
      )?.name ||
      car.transmissionType ||
      'Automatic';

    // Extract region/country
    const region =
      car.SpecificationValues?.find(
        spec => spec.Specification?.key === 'regional_specification',
      )?.name ||
      car.country ||
      'China';

    // Extract steering type
    const steeringType =
      car.SpecificationValues?.find(
        spec => spec.Specification?.key === 'steering_side',
      )?.name ||
      car.steeringType ||
      'Left hand drive';

    return {
      ...car,
      bodyType,
      fuelType,
      transmissionType,
      region,
      steeringType,
    };
  }, []);

  useEffect(() => {
    fetchHotDeals();
    return () => {
      isMounted.current = false;
    };
  }, []);
  const fetchHotDeals = async () => {
    const processCarData = processCar;
    try {
      setLoading(true);
      const response = await getCarList({
        page: 1,
        limit: 10, // Reduced from 50 to 10 for faster loading
        status: 'published',
        tags: 3,
      });
      if (response?.data && response?.success && Array.isArray(response.data)) {
        const cars = [...response.data];

        // Filter for hot deals
        console.log('processedCars', cars?.[0]);

        let processedCars = [];

        if (cars.length > 0) {
          processedCars = cars.map(processCarData).filter(car => car);
        } else {
          // Fallback
          processedCars = cars
            .slice(0, 3)
            .map(processCarData)
            .filter(car => car);
        }

        console.log('processedCars', processedCars);
        // Update cache
        setHotDeals([...processedCars]);
      } else {
        setHotDeals([]);
      }
    } catch (error) {
      console.error('Error fetching hot deals:', error);
      setHotDeals([]);
    } finally {
      setLoading(false);
      if (isMounted.current) {
        setLoading(false);
      }
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

  const navigateToAllHotDeals = () => {
    navigation.navigate('ExploreScreen', {
      filters: {tagIds: [3]}, // Filter for Hot Deal tag
    });
  };

  const renderItem = ({item, index}) => (
    <CarCard
      item={item}
      onPress={navigateToCarDetail}
      toggleFavorite={toggleFavorite}
      shareCar={shareCar}
      isFavorite={isInWishlist(item.id)}
      tag={
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>Hot Deal!</Text>
        </View>
      }
      width={Dimensions.get('window').width * 0.85}
    />
  );

  const renderLoadingItem = ({item}) => (
    <View style={[styles.cardContainer, {backgroundColor: '#f8f8f8'}]}>
      <View style={[styles.carImage, {backgroundColor: '#eeeeee'}]} />
      <View style={styles.cardContent}>
        <View style={[styles.skeletonLine, {width: '40%', marginBottom: 10}]} />
        <View
          style={[
            styles.skeletonLine,
            {width: '80%', height: 20, marginBottom: 15},
          ]}
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 10,
          }}>
          <View
            style={[
              styles.skeletonLine,
              {width: '30%', marginRight: 8, marginBottom: 8},
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              {width: '30%', marginRight: 8, marginBottom: 8},
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              {width: '30%', marginRight: 8, marginBottom: 8},
            ]}
          />
          <View
            style={[
              styles.skeletonLine,
              {width: '30%', marginRight: 8, marginBottom: 8},
            ]}
          />
        </View>
        <View style={[styles.skeletonLine, {width: '40%', marginBottom: 15}]} />
        <View
          style={[
            styles.skeletonLine,
            {width: '100%', height: 40, borderRadius: 20},
          ]}
        />
      </View>
    </View>
  );

  // For empty state
  const renderEmptyComponent = () => (
    <View style={styles.noDealsContainer}>
      <MaterialCommunityIcons
        name="tag-text"
        size={40}
        color={COLORS.textLight}
      />
      <Text style={styles.noDealsText}>
        No hot deals available at the moment
      </Text>
    </View>
  );

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
        <FlatList
          data={[{id: 'skeleton-1'}, {id: 'skeleton-2'}]}
          renderItem={renderLoadingItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scrollContainer}
        />
      ) : (
        <FlatList
          data={hotDeals}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.scrollContainer}
          initialNumToRender={2}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true}
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
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
});

export default HotDeals;
