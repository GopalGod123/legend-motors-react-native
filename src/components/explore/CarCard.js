import React, {memo} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AntDesign, Ionicons, MaterialCommunityIcons} from 'src/utils/icon';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SPACING,
} from '../../utils/constants';
import {CarImage, CarImageCarousel} from '../common';
import {useNavigation} from '@react-navigation/native';
const {width} = Dimensions.get('window');

const CarCard = memo(
  ({item, onPress, toggleFavorite, shareCar, isFavorite}) => {
    const navigation = useNavigation();
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
      imageUrls = [require('src/components/home/HotDealsCar.png')];
    }

    // Construct the car title - pre-computed
    const carTitle =
      additionalInfo ||
      (year && brandName && carModel
        ? `${year} ${brandName} ${carModel}${
            item.Trim?.name ? ` ${item.Trim.name}` : ''
          }`
        : item.title || 'Car Details');
    const carImages = item.images || [item.image] || [
        require('../../components/home/car_Image.png'),
      ];
    // Get price from API response
    const price = item?.CarPrices?.[0]?.price;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onPress(item)}
        activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          {/* {typeof imageUrls[0] === 'object' && imageUrls[0].uri ? (
            <CarImage
              source={imageUrls[0]}
              style={styles.carImage}
              resizeMode="cover"
              loadingIndicatorSource={require('src/components/home/HotDealsCar.png')}
            />
          ) : (
            <Image
              source={imageUrls[0]}
              style={styles.carImage}
              resizeMode="cover"
            />
          )} */}
          <CarImageCarousel
            images={carImages}
            style={styles.carImage}
            height={180}
            onImagePress={() => {}}
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
              <MaterialCommunityIcons name="engine" size={16} color="#5E366D" />
              <Text style={styles.specText}>ltr</Text>
            </View>

            <View style={styles.specItem}>
              <Ionicons name="flash" size={16} color="#5E366D" />
              <Text style={styles.specText}>{fuelType}</Text>
            </View>

            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="car-shift-pattern"
                size={16}
                color="#5E366D"
              />
              <Text style={styles.specText}>{transmission}</Text>
            </View>

            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#5E366D"
              />
              <Text style={styles.specText}>{region}</Text>
            </View>
          </View>

          <View style={styles.steeringRow}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons
                name="steering"
                size={16}
                color="#5E366D"
              />
              <Text style={styles.specText}>{steeringType}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            {price ? (
              <Text style={styles.priceText}>$ {price.toLocaleString()}</Text>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  borderRadius: BORDER_RADIUS.md,
                }}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                }}>
                <Text style={{color: COLORS.white}}>Login to view price</Text>
              </TouchableOpacity>
            )}

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
    // width: cardWidth,
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginRight: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // overflow: 'hidden',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#ffffff',
    borderTopEndRadius: BORDER_RADIUS.lg,
    borderTopStartRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
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
    backgroundColor: '#E9E5EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
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
    color: '#5E366D',
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
    // width: cardWidth,
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
    backgroundColor: '#5E366D', // Purple color for Hot Deal
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
export default CarCard;
