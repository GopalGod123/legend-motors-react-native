import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

const ResultsHeader = ({ 
  totalCars, 
  searchQuery = '', 
  isViewingSpecificCar = false, 
  carId = '', 
  filteredBySearch = false, 
  hasFilters = false, 
  onClearFilters 
}) => {
  // Determine the appropriate text to display
  const getResultsText = () => {
    if (isViewingSpecificCar) {
      return `Viewing car details (ID: ${carId || 'unknown'})`;
    } else if (filteredBySearch) {
      return `Found ${totalCars} cars matching "${searchQuery}"`;
    } else if (hasFilters) {
      return `Showing ${totalCars} cars`;
    } else {
      return `Total: ${totalCars} cars`;
    }
  };

  return (
    <View style={styles.resultsHeader}>
      <Text style={styles.resultsText}>{getResultsText()}</Text>
      
      {!isViewingSpecificCar && (hasFilters || filteredBySearch) && (
        <TouchableOpacity 
          style={styles.clearFiltersButton}
          onPress={onClearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: SPACING.sm,
  },
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  clearFiltersButton: {
    padding: SPACING.sm,
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.md,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ResultsHeader; 