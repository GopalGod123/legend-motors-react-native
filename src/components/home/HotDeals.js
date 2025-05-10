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
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';

const {width} = Dimensions.get('window');
const cardWidth = width * 0.85;

// Memoize the card component to prevent unnecessary re-renders

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
    fetchHotDeals();
    return () => {
      isMounted.current = false;
    };
  }, [selectedLanguage]);
  const fetchHotDeals = async () => {
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
          processedCars = cars.map(preprocessCarData).filter(car => car);
        } else {
          // Fallback
          processedCars = cars
            .slice(0, 3)
            .map(preprocessCarData)
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
