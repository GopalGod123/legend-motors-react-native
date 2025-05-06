import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Image, Dimensions, Animated, TouchableOpacity } from "react-native";
import { SPACING, BORDER_RADIUS, COLORS } from "../../utils/constants";

const { width } = Dimensions.get('window');
const bannerWidth = width - (SPACING.lg * 2);

const PromotionBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef(null);
  
  const banners = [
    require("../../assets/images/banner1.jpg"),
    require("../../assets/images/banner2.jpg")
  ];

  // Auto scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (bannerScrollRef.current) {
        const newIndex = (currentIndex + 1) % banners.length;
        bannerScrollRef.current.scrollTo({
          x: newIndex * bannerWidth,
          animated: true,
        });
        setCurrentIndex(newIndex);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Handle scroll events to update the active indicator
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Update current index when scrolling ends
  const handleMomentumScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / bannerWidth);
    setCurrentIndex(index);
  };

  // Handle manual navigation to a specific banner
  const scrollToBanner = (index) => {
    if (bannerScrollRef.current) {
      bannerScrollRef.current.scrollTo({
        x: index * bannerWidth,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.promotionBanner}>
      <Animated.ScrollView
        ref={bannerScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {banners.map((banner, index) => (
          <View key={index} style={styles.bannerContainer}>
            <Image
              source={banner}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </Animated.ScrollView>
      
      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => scrollToBanner(index)}
            style={styles.dotContainer}
          >
            <View style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : null
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionBanner: {
    marginBottom: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 181,
  },
  bannerContainer: {
    width: bannerWidth,
    height: 181,
  },
  bannerImage: {
    width: bannerWidth,
    height: 181,
    borderRadius: BORDER_RADIUS.lg,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
    backgroundColor: '#FFFFFF80',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default PromotionBanner;
