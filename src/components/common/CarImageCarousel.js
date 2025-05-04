import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  TouchableOpacity,
  Text
} from 'react-native';
import { COLORS } from '../../utils/constants';
import CarImage from './CarImage';

const { width } = Dimensions.get('window');

const CarImageCarousel = ({ 
  images, 
  height = 180,
  style,
  onImagePress,
  showIndex = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Handle when scrolling ends to update the active index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setActiveIndex(newIndex);
  };

  // Go to a specific image
  const goToImage = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  // Handle rendering each image item in the carousel
  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.imageContainer, { width }]}
      onPress={() => onImagePress && onImagePress(index)}
    >
      <CarImage
        source={item}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Show image index if enabled */}
      {showIndex && (
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>{index + 1}/{images.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // If no images or empty array, return null
  if (!images || images.length === 0) {
    return null;
  }

  // If only one image, just show it without carousel
  if (images.length === 1) {
    return (
      <View style={[styles.container, { height }, style]}>
        <CarImage
          source={images[0]}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(_, index) => `car_image_${index}`}
      />

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={`dot_${index}`}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive
            ]}
            onPress={() => goToImage(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indexContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CarImageCarousel; 