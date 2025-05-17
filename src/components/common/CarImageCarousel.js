import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
} from 'react-native';
import {COLORS} from '../../utils/constants';
import CarImage from './CarImage';
import {preloadImages} from '../../utils/ImageCacheManager';

const {width} = Dimensions.get('window');

const CarImageCarousel = forwardRef(
  (
    {
      images,
      height = 180,
      style,
      onImagePress,
      showIndex = false,
      initialIndex = 0,
      onIndexChange,
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [imagesPreloaded, setImagesPreloaded] = useState(false);
    const flatListRef = useRef(null);
    const scrollToIndexTimeoutRef = useRef(null);
    const viewConfigRef = useRef({itemVisiblePercentThreshold: 50});
    const onViewRef = useRef(({changed}) => {
      if (changed && changed.length > 0 && changed[0].isViewable) {
        const newIndex = changed[0].index;
        if (newIndex !== activeIndex && newIndex !== undefined) {
          setActiveIndex(newIndex);
          if (onIndexChange) {
            onIndexChange(newIndex);
          }
        }
      }
    });

    // Memoize images to prevent unnecessary re-renders
    const memoizedImages = useMemo(
      () => images || [],
      [images ? JSON.stringify(images) : 0],
    );

    // Preload images when they change
    useEffect(() => {
      if (images && images.length > 0 && !imagesPreloaded) {
        // Preload visible and nearby images first
        const visibleImages = images.slice(
          Math.max(0, initialIndex - 1),
          Math.min(images.length, initialIndex + 3),
        );

        // Start with visible images, then do the rest
        preloadImages(visibleImages)
          .then(() => {
            // Preload remaining images in the background
            const remainingImages = images.filter(
              (_, i) => i < initialIndex - 1 || i > initialIndex + 2,
            );
            if (remainingImages.length > 0) {
              return preloadImages(remainingImages);
            }
          })
          .then(() => {
            setImagesPreloaded(true);
          })
          .catch(err => {
            console.log('Error preloading carousel images:', err);
          });
      }
    }, [images, initialIndex, imagesPreloaded]);

    // Simplify scrollToIndex method for better reliability
    const scrollToIndex = useCallback(
      (index, animated = true) => {
        if (!flatListRef.current || !images || images.length === 0) return;

        try {
          // Handle index type validation
          const targetIndex = typeof index === 'object' ? index.index : index;
          const isAnimated =
            typeof index === 'object'
              ? index.animated !== undefined
                ? index.animated
                : true
              : animated;

          if (images.length === 1) return; // No need to scroll with just one image

          if (targetIndex >= 0 && targetIndex < images.length) {
            // Direct offset calculation for more reliable scrolling
            const offset = targetIndex * width;
            flatListRef.current.scrollToOffset({
              offset,
              animated: isAnimated,
            });
          }
        } catch (error) {
          console.log('Error in scrollToIndex:', error);

          // Fallback for scrolling failures
          if (
            typeof index === 'number' &&
            index >= 0 &&
            index < images.length
          ) {
            setTimeout(() => {
              try {
                flatListRef.current?.scrollToOffset({
                  offset: index * width,
                  animated: false,
                });
              } catch (fallbackError) {
                console.log('Fallback scrolling also failed:', fallbackError);
              }
            }, 50);
          }
        }
      },
      [images, width],
    );

    // Implement useImperativeHandle to expose methods to parent components
    useImperativeHandle(ref, () => ({
      scrollToIndex,
      getCurrentIndex: () => activeIndex,
    }));

    // Set initial index when it changes
    useEffect(() => {
      if (initialIndex !== activeIndex && images && images.length > 0) {
        scrollToIndex(initialIndex, true);
      }
    }, [initialIndex, activeIndex, scrollToIndex, images]);

    // Clean up timeouts on unmount
    useEffect(() => {
      return () => {
        if (scrollToIndexTimeoutRef.current) {
          clearTimeout(scrollToIndexTimeoutRef.current);
        }
      };
    }, []);

    // Handle when scrolling ends to update the active index
    const handleMomentumScrollEnd = useCallback(
      event => {
        if (!event || !event.nativeEvent) return;

        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / width);

        if (
          newIndex !== activeIndex &&
          newIndex >= 0 &&
          memoizedImages &&
          newIndex < memoizedImages.length
        ) {
          console.log(`Carousel scrolled to index ${newIndex}`);
          setActiveIndex(newIndex);
          if (onIndexChange) {
            onIndexChange(newIndex);
          }
        }
      },
      [activeIndex, memoizedImages, onIndexChange, width],
    );

    // Update the index if images change (like when switching tabs)
    useEffect(() => {
      // Reset to the first image when image array changes (e.g., when switching tabs)
      if (
        memoizedImages &&
        memoizedImages.length > 0 &&
        activeIndex >= memoizedImages.length
      ) {
        console.log('Images changed, resetting carousel index to 0');
        setActiveIndex(0);
        if (onIndexChange) {
          onIndexChange(0);
        }
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToOffset({
              offset: 0,
              animated: false,
            });
          } catch (error) {
            console.log('Error resetting carousel position:', error);
          }
        }
      }
    }, [memoizedImages, activeIndex, onIndexChange]);

    // Better memoization of renderItem to prevent recreation
    const renderItem = useCallback(
      ({item, index}) => (
        <TouchableOpacity
          disabled
          style={[styles.itemContainer, {width}]}
          activeOpacity={0.9}
          onPress={() => onImagePress && onImagePress(index)}>
          <CarImage
            source={item}
            style={styles.image}
            height={height}
            priority="high"
            resizeMode="cover"
          />

          {/* Show image index if enabled */}
          {showIndex && (
            <View style={styles.indexContainer}>
              <Text style={styles.indexText}>
                {index + 1}/{memoizedImages.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
      [width, height, onImagePress, showIndex, memoizedImages.length],
    );

    // If no images or empty array, return null
    if (!memoizedImages || memoizedImages.length === 0) {
      return null;
    }

    // If only one image, just show it without carousel
    if (memoizedImages.length === 1) {
      return (
        <View style={[styles.container, {height}, style]}>
          <CarImage
            source={memoizedImages[0]}
            style={styles.image}
            resizeMode="cover"
            height={height}
          />
        </View>
      );
    }

    // Memoized dot components to prevent re-renders
    const PaginationDots = useMemo(() => {
      return (
        <View style={styles.paginationContainer}>
          {memoizedImages.map((_, index) => (
            <TouchableOpacity
              key={`dot_${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
              onPress={() => {
                setActiveIndex(index);
                scrollToIndex(index, true);
                if (onIndexChange) {
                  onIndexChange(index);
                }
              }}
            />
          ))}
        </View>
      );
    }, [memoizedImages.length, activeIndex, scrollToIndex, onIndexChange]);

    return (
      <View style={[styles.container, {height}, style]}>
        <FlatList
          ref={flatListRef}
          data={memoizedImages}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          decelerationRate={Platform.OS === 'ios' ? 0.992 : 0.98}
          snapToInterval={width}
          snapToAlignment="center"
          disableIntervalMomentum={true}
          bounces={false}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          initialScrollIndex={initialIndex}
          removeClippedSubviews={Platform.OS === 'android'}
          keyExtractor={(_, index) => `carousel-${index}`}
          onScrollToIndexFailed={info => {
            console.warn('Scroll to index failed in carousel:', info.index);
            setTimeout(() => {
              try {
                if (flatListRef.current) {
                  flatListRef.current.scrollToOffset({
                    offset: info.index * width,
                    animated: false,
                  });

                  // Update the active index
                  setActiveIndex(info.index);
                  if (onIndexChange) {
                    onIndexChange(info.index);
                  }
                }
              } catch (error) {
                console.error('Error in onScrollToIndexFailed handler:', error);
              }
            }, 100);
          }}
        />

        {/* Pagination dots */}
        {PaginationDots}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
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

export default React.memo(CarImageCarousel);
