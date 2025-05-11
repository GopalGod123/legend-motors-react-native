import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Share,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  FontAwesome,
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
import {useTheme} from 'src/context/ThemeContext';

const {width} = Dimensions.get('window');
const cardWidth = width * 0.8;

// Create a proper React component for car cards
const PopularCarCard = ({
  item,
  onPress,
  toggleFavorite,
  shareCar,
  isFavorite,
  COLORS1,
}) => {
  // Extract data from the API response
  const brandName = item.Brand?.name || item.brand?.name || '';
  const carModel = item.CarModel?.name || item.model || '';
  const year = item.Year?.year || item.year || '';
  const additionalInfo = item.additionalInfo || '';

  const bodyType =
    item.SpecificationValues?.find(
      spec => spec.Specification?.key === 'body_type',
    )?.name ||
    item.bodyType ||
    'SUV';

  const fuelType =
    item.SpecificationValues?.find(
      spec => spec.Specification?.key === 'fuel_type',
    )?.name ||
    item.fuelType ||
    'Electric';

  const transmission =
    item.SpecificationValues?.find(
      spec => spec.Specification?.key === 'transmission',
    )?.name ||
    item.transmissionType ||
    'Automatic';

  const region =
    item.SpecificationValues?.find(
      spec => spec.Specification?.key === 'regional_specification',
    )?.name ||
    item.location ||
    'China';

  const steeringType =
    item.SpecificationValues?.find(
      spec => spec.Specification?.key === 'steering_side',
    )?.name ||
    item.steeringType ||
    'Left hand drive';

  // Get all car images
  let imageUrls = [];

  if (item.CarImages && item.CarImages.length > 0) {
    // Collect all image URLs
    // console.log(`Car ${item.id} has ${item.CarImages.length} images`);

    imageUrls = item.CarImages.map(image => {
      if (image.FileSystem && image.FileSystem.path) {
        return {
          uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.path}`,
        };
      } else if (image.FileSystem && image.FileSystem.compressedPath) {
        return {
          uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.compressedPath}`,
        };
      } else if (image.FileSystem && image.FileSystem.thumbnailPath) {
        return {
          uri: `https://cdn.legendmotorsglobal.com${image.FileSystem.thumbnailPath}`,
        };
      }
      return null;
    }).filter(url => url !== null); // Remove any null entries

    // console.log(`Found ${imageUrls.length} valid image URLs`);
  } else if (item.images && item.images.length > 0) {
    // console.log(`Car ${item.id} has ${item.images.length} images in item.images property`);
    imageUrls = item.images.map(image => {
      return typeof image === 'string' ? {uri: image} : image;
    });
  } else {
    console.log(`Car ${item.id} has no images, using fallback`);
  }

  // If no valid images from API, use the fallback
  if (imageUrls.length === 0) {
    imageUrls = [require('./HotDealsCar.png')];
  }

  // We'll use local component state for this component instance
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Add auto-sliding functionality
  useEffect(() => {
    let interval;

    if (imageUrls.length > 1) {
      interval = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % imageUrls.length;
        scrollToImage(nextIndex);
      }, 2000); // Change image every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentImageIndex, imageUrls.length]);

  // Handle image scroll with improved accuracy
  const handleScroll = event => {
    if (!event || !event.nativeEvent) return;

    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / cardWidth);

    if (
      currentIndex >= 0 &&
      currentIndex < imageUrls.length &&
      currentIndex !== currentImageIndex
    ) {
      setCurrentImageIndex(currentIndex);
    }
  };

  // Manual navigation functions for dots
  const scrollToImage = index => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * cardWidth,
        animated: true,
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
      style={[styles.carCard, {backgroundColor: COLORS1?.white}]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}>
      <View style={styles.tagBadge}>
        <Text style={[styles.tagText, {color: COLORS1?.textDark}]}>
          Popular
        </Text>
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
          contentContainerStyle={{width: cardWidth * imageUrls.length}}>
          {imageUrls.map((image, index) => (
            <View
              key={`popular-${item.id}-${index}`}
              style={[styles.imageSlide, {width: cardWidth}]}>
              {typeof image === 'object' && image.uri ? (
                <CarImage
                  source={image}
                  style={styles.carImage}
                  resizeMode="cover"
                  loadingIndicatorSource={require('./HotDealsCar.png')}
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
                style={styles.paginationDotContainer}>
                <View
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor:
                        index === currentImageIndex
                          ? COLORS.white
                          : 'rgba(255, 255, 255, 0.5)',
                    },
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
            <Text style={[styles.categoryText, {color: COLORS1?.textDark}]}>
              {bodyType}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.carTitle, {color: COLORS1?.textDark}]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {carTitle}
        </Text>

        <View style={styles.specRow}>
          <View style={[styles.specItem, {backgroundColor: COLORS1.itrBg}]}>
            <MaterialCommunityIcons
              name="engine"
              size={16}
              color={COLORS1?.itr}
            />
            <Text style={[styles.specText, {color: COLORS1?.textDark}]}>
              ltr
            </Text>
          </View>

          <View style={[styles.specItem, {backgroundColor: COLORS1.itrBg}]}>
            <Ionicons name="flash" size={16} color={COLORS1?.itr} />
            <Text style={[styles.specText, {color: COLORS1?.textDark}]}>
              {fuelType}
            </Text>
          </View>

          <View style={[styles.specItem, {backgroundColor: COLORS1.itrBg}]}>
            <MaterialCommunityIcons
              name="car-shift-pattern"
              size={16}
              color={COLORS1?.itr}
            />
            <Text style={[styles.specText, {color: COLORS1?.textDark}]}>
              {transmission}
            </Text>
          </View>

          <View style={[styles.specItem, {backgroundColor: COLORS1.itrBg}]}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS1?.itr}
            />
            <Text style={[styles.specText, {color: COLORS1?.textDark}]}>
              {region}
            </Text>
          </View>
        </View>

        <View style={styles.steeringRow}>
          <View style={[styles.specItem, {backgroundColor: COLORS1.itrBg}]}>
            <MaterialCommunityIcons
              name="steering"
              size={16}
              color={COLORS1?.itr}
            />
            <Text style={[styles.specText, {color: COLORS1?.textDark}]}>
              {steeringType}
            </Text>
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
};

const MostPopularCars = () => {
  const {COLORS1} = useTheme();
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {user} = useAuth();
  const {isInWishlist, addItemToWishlist, removeItemFromWishlist} =
    useWishlist();

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
          limit: 1000,
          sortBy: 'createdAt',
          order: 'desc',
          lang: 'en',
          // Removed the featured parameter which might be causing errors
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        console.log(
          `Fetched ${response.data.data.length} cars for popular section`,
        );
        setPopularCars(response.data.data);
      } else {
        console.log('No cars found or response format issue');
        setPopularCars([]);
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

      // Set empty array when API fails
      setPopularCars([]);
    } finally {
      setLoading(false);
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
      // Prompt user to login
      navigation.navigate('Login', {
        returnScreen: 'HomeScreen',
        message: 'Please login to save favorites',
      });
      return;
    }

    try {
      if (isInWishlist(carId)) {
        const success = await removeItemFromWishlist(carId);
        if (success) {
          console.log(`Removed car ${carId} from wishlist`);
        }
      } else {
        const success = await addItemToWishlist(carId);
        if (success) {
          console.log(`Added car ${carId} to wishlist`);
        }
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

  const renderLoadingSkeletons = () => {
    // Create an array of 3 items for the loading skeleton
    const skeletonItems = Array(3)
      .fill(0)
      .map((_, index) => ({id: `skeleton-${index}`}));

    return (
      <FlatList
        data={skeletonItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.carsList}
        ItemSeparatorComponent={() => <View style={{width: 15}} />}
        renderItem={() => (
          <View style={[styles.carCard, styles.skeletonCard]}>
            <View style={[styles.imageContainer, styles.skeletonImage]} />
            <View style={styles.cardContent}>
              <View
                style={[styles.skeletonText, {width: '60%', marginBottom: 8}]}
              />
              <View
                style={[
                  styles.skeletonText,
                  {width: '90%', height: 18, marginBottom: 12},
                ]}
              />
              <View
                style={[
                  styles.skeletonText,
                  {width: '40%', height: 24, marginBottom: 12},
                ]}
              />
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.skeletonText, {width: '30%'}]} />
                <View style={[styles.skeletonText, {width: '30%'}]} />
                <View style={[styles.skeletonText, {width: '30%'}]} />
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
        <Text style={[styles.title, {color: COLORS1?.textDark}]}>
          Most Popular Cars
        </Text>
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
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.carsList}
          renderItem={({item}) => (
            <PopularCarCard
              key={item.id.toString()}
              item={item}
              onPress={navigateToCarDetail}
              toggleFavorite={toggleFavorite}
              shareCar={shareCar}
              isFavorite={isInWishlist(item.id)}
              COLORS1={COLORS1}
            />
          )}
          ItemSeparatorComponent={() => <View style={{width: 15}} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="car-search"
                size={50}
                color={COLORS.textLight}
              />
              <Text style={[styles.emptyText, {color: COLORS1?.textDark}]}>
                No popular cars found
              </Text>
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
    width: cardWidth,
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#ffffff', // Ensuring white background
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  imageSlide: {
    width: cardWidth,
    height: 180,
    backgroundColor: '#ffffff', // White background
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

export default MostPopularCars;
