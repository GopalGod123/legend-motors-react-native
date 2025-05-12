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
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';
import {useTheme, themeColors} from 'src/context/ThemeContext';
import {Svg, Mask, G, Path, Rect} from 'react-native-svg';
import {useLoginPrompt} from '../../hooks/useLoginPrompt';
const {width} = Dimensions.get('window');

const CarCard = memo(
  ({
    item,
    onPress,
    toggleFavorite,
    shareCar,
    isFavorite,
    tag = null,
    width = '100%',
    isDarkMode,
  }) => {
    const navigation = useNavigation();
    const {theme, isDark} = useTheme();
    const {selectedCurrency} = useCurrencyLanguage();
    const {showLoginPrompt} = useLoginPrompt();
    
    // Use provided isDarkMode prop if available, otherwise use the theme context
    const effectiveDarkMode = isDarkMode !== undefined ? isDarkMode : isDark;

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
    // Get pricce from API response
    const price = item?.CarPrices?.find(
      crr => crr.currency === selectedCurrency,
    )?.price;

    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            width,
            backgroundColor: effectiveDarkMode ? '#000' : COLORS.white,
            shadowColor: effectiveDarkMode ? '#000' : '#000',
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.9}>
        <View style={[styles.imageContainer, {width}]}>
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
            images={tag ? [carImages[0]] : carImages}
            style={[styles.carImage]}
            height={180}
            onImagePress={() => {}}
          />
          <View style={{position: 'absolute', top: 10, left: 10}}>{tag}</View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Mask
                  id="mask0_2256_5216"
                  style="mask-type:alpha"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="16"
                  height="16">
                  <Rect width="16" height="16" fill="#D9D9D9" />
                </Mask>
                <G mask="url(#mask0_2256_5216)">
                  <Path
                    d="M4.66693 13.3333C4.16693 13.3333 3.73082 13.175 3.35859 12.8583C2.98637 12.5416 2.76693 12.1333 2.70026 11.6333C2.27804 11.4111 1.9447 11.0944 1.70026 10.6833C1.45582 10.2722 1.33359 9.82218 1.33359 9.33329C1.33359 8.7444 1.50304 8.2194 1.84193 7.75829C2.18082 7.29718 2.63359 6.97774 3.20026 6.79996L2.00026 5.59996L1.80026 5.79996C1.67804 5.92218 1.52248 5.98329 1.33359 5.98329C1.1447 5.98329 0.989149 5.92218 0.866927 5.79996C0.744705 5.67774 0.683594 5.52218 0.683594 5.33329C0.683594 5.1444 0.744705 4.98885 0.866927 4.86663L2.20026 3.53329C2.32248 3.41107 2.47804 3.34996 2.66693 3.34996C2.85582 3.34996 3.01137 3.41107 3.13359 3.53329C3.25582 3.65551 3.31693 3.81107 3.31693 3.99996C3.31693 4.18885 3.25582 4.3444 3.13359 4.46663L2.93359 4.66663L3.86693 5.59996L4.40026 4.03329C4.53359 3.62218 4.77526 3.29163 5.12526 3.04163C5.47526 2.79163 5.86693 2.66663 6.30026 2.66663H9.70026C10.1336 2.66663 10.5253 2.79163 10.8753 3.04163C11.2253 3.29163 11.4669 3.62218 11.6003 4.03329L12.5003 6.73329C13.1336 6.85552 13.653 7.16107 14.0586 7.64996C14.4641 8.13885 14.6669 8.69996 14.6669 9.33329C14.6669 9.82218 14.5447 10.2722 14.3003 10.6833C14.0558 11.0944 13.7225 11.4111 13.3003 11.6333C13.2336 12.1333 13.0141 12.5416 12.6419 12.8583C12.2697 13.175 11.8336 13.3333 11.3336 13.3333C10.9114 13.3333 10.5308 13.2111 10.1919 12.9666C9.85304 12.7222 9.61137 12.4 9.46693 12H6.53359C6.38915 12.4 6.14748 12.7222 5.80859 12.9666C5.46971 13.2111 5.08915 13.3333 4.66693 13.3333ZM4.93359 6.66663H7.33359V3.99996H6.30026C6.15582 3.99996 6.02804 4.04163 5.91693 4.12496C5.80582 4.20829 5.72248 4.32218 5.66693 4.46663L4.93359 6.66663ZM8.66693 6.66663H11.0669L10.3336 4.46663C10.278 4.32218 10.1947 4.20829 10.0836 4.12496C9.97248 4.04163 9.84471 3.99996 9.70026 3.99996H8.66693V6.66663ZM4.66693 12C4.85582 12 5.01415 11.9361 5.14193 11.8083C5.2697 11.6805 5.33359 11.5222 5.33359 11.3333C5.33359 11.1444 5.2697 10.9861 5.14193 10.8583C5.01415 10.7305 4.85582 10.6666 4.66693 10.6666C4.47804 10.6666 4.31971 10.7305 4.19193 10.8583C4.06415 10.9861 4.00026 11.1444 4.00026 11.3333C4.00026 11.5222 4.06415 11.6805 4.19193 11.8083C4.31971 11.9361 4.47804 12 4.66693 12ZM11.3336 12C11.5225 12 11.6808 11.9361 11.8086 11.8083C11.9364 11.6805 12.0003 11.5222 12.0003 11.3333C12.0003 11.1444 11.9364 10.9861 11.8086 10.8583C11.6808 10.7305 11.5225 10.6666 11.3336 10.6666C11.1447 10.6666 10.9864 10.7305 10.8586 10.8583C10.7308 10.9861 10.6669 11.1444 10.6669 11.3333C10.6669 11.5222 10.7308 11.6805 10.8586 11.8083C10.9864 11.9361 11.1447 12 11.3336 12Z"
                    fill="#ED8721"
                  />
                </G>
              </Svg>
              <Text
                style={[
                  styles.categoryText,
                  {color: effectiveDarkMode ? '#FF8C00' : '#FF8C00'},
                ]}>
                {bodyType}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.carTitle, {color: effectiveDarkMode ? '#FFFFFF' : '#000000'}]}
            numberOfLines={2}
            ellipsizeMode="tail">
            {carTitle}
          </Text>

          {/* First row with 3 icons */}
          <View style={styles.specRow}>
            <View
              style={[
                styles.specItem,
                {backgroundColor: effectiveDarkMode ? '#3D3D3D' : '#E9E5EB'},
              ]}>
              <Image
                source={require('./icon_assets/ltr.png')}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.specText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                ltr
              </Text>
            </View>

            <View
              style={[
                styles.specItem,
                {backgroundColor: effectiveDarkMode ? '#3D3D3D' : '#E9E5EB'},
              ]}>
              <Image
                source={require('./icon_assets/electric.png')}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.specText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                {fuelType}
              </Text>
            </View>

            <View
              style={[
                styles.specItem,
                {backgroundColor: effectiveDarkMode ? '#3D3D3D' : '#E9E5EB'},
              ]}>
              <Image
                source={require('./icon_assets/Automatic.png')}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.specText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                {transmission}
              </Text>
            </View>
          </View>

          {/* Second row with 2 icons */}
          <View style={styles.specRow}>
            <View
              style={[
                styles.specItem,
                {backgroundColor: effectiveDarkMode ? '#3D3D3D' : '#E9E5EB'},
              ]}>
              <Image
                source={require('./icon_assets/country.png')}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.specText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                {region}
              </Text>
            </View>

            <View
              style={[
                styles.specItem,
                {backgroundColor: effectiveDarkMode ? '#3D3D3D' : '#E9E5EB'},
              ]}>
              <Image
                source={require('./icon_assets/Steering.png')}
                style={{width: 16, height: 16}}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.specText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                {steeringType}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            {price ? (
              <Text
                style={[
                  styles.priceText,
                  {color: effectiveDarkMode ? '#FFFFFF' : '#5E366D'},
                ]}>
                {selectedCurrency === 'USD' ? '$' : selectedCurrency} {parseInt(price).toLocaleString()}
              </Text>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs,
                  borderRadius: BORDER_RADIUS.md,
                }}
                onPress={() => {
                  showLoginPrompt();
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
                <Ionicons
                  name="share-social"
                  size={24}
                  color={effectiveDarkMode ? '#FFFFFF' : '#212121'}
                />
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
    // borderTopEndRadius: BORDER_RADIUS.lg,
    // borderTopStartRadius: BORDER_RADIUS.lg,
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
    marginBottom: 4,
    justifyContent: 'flex-start',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9E5EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 4,
    marginBottom: 8,
    minWidth: 80,
  },
  specText: {
    color: '#5E366D',
    fontSize: 12,
    marginLeft: 5,
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
