import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from "../../utils/constants";

const PromotionBanner = () => {
  return (
    <View style={styles.promotionBanner}>
      <View style={styles.promotionContent}>
        <View style={styles.promotionTextContainer}>
          <Text style={styles.discountText}>20%</Text>
          <Text style={styles.dealText}>Week Deals!</Text>
          <Text style={styles.dealDescription}>
            Get a new car discount,{"\n"}
            only valid this week
          </Text>
        </View>

        <Image
          source={require("./car_Image.png")}
          style={{
            width: 181, // Increase this value to make the image wider // Increase this value to make the image taller
          }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.paginationContainer}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionBanner: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  promotionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promotionTextContainer: {
    flex: 1,
  },
  discountText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  dealText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  dealDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  carImage: {
    width: 180,
    height: 100,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.placeholder,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDark,
    marginHorizontal: 3,
  },
});

export default PromotionBanner;
