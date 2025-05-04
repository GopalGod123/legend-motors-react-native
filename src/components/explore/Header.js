import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const Header = ({ 
  isViewingSpecificCar = false, 
  onBackToAllCars 
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore</Text>
      {isViewingSpecificCar && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackToAllCars}
        >
          <Text style={styles.backButtonText}>← Back to All Cars</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default Header; 