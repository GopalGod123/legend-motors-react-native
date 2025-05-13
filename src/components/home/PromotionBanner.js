import React, {useState, memo} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {SPACING, BORDER_RADIUS} from '../../utils/constants';
import {useTheme} from 'src/context/ThemeContext';

const {width} = Dimensions.get('window');
const bannerWidth = width - SPACING.lg * 2;

// Memoized dot component
const PaginationDot = memo(({active, onPress, index, isDark}) => (
  <TouchableOpacity onPress={() => onPress(index)} style={styles.dotContainer}>
    <View
      style={[
        styles.dot,
        {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.5)',
        },
        active
          ? [
              styles.activeDot,
              {backgroundColor: isDark ? '#FF8C00' : '#FFFFFF'},
            ]
          : null,
      ]}
    />
  </TouchableOpacity>
));

const PromotionBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {isDark} = useTheme();

  const banners = [
    require('../../assets/images/banner1.jpg'),
    require('../../assets/images/banner2.jpg'),
  ];

  // Simplified banner navigation
  const showBanner = index => {
    setCurrentIndex(index);
  };

  return (
    <View
      style={[
        styles.promotionBanner,
        {
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.3 : 0.2,
        },
      ]}>
      {/* Show only current banner image instead of ScrollView */}
      <Image
        source={banners[currentIndex]}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            active={index === currentIndex}
            onPress={showBanner}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionBanner: {
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    height: 181,
  },
  bannerImage: {
    width: bannerWidth,
    height: 181,
    borderRadius: BORDER_RADIUS.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  dotContainer: {
    padding: 5, // Add padding to make touch target larger
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
  },
});

export default memo(PromotionBanner);
