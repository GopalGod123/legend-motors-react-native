import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useTheme, themeColors } from '../../context/ThemeContext';

const ResultsHeader = ({ 
  totalCars, 
  searchQuery = '', 
  isViewingSpecificCar = false, 
  carId = '', 
  filteredBySearch = false, 
  hasFilters = false, 
  onClearFilters 
}) => {
  const { isDark, theme } = useTheme();

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Determine the appropriate text to display
  const getResultsText = () => {
    if (isViewingSpecificCar) {
      return (
        <Text style={[styles.resultsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Viewing car details (ID: {carId || 'unknown'})
        </Text>
      );
    } else if (filteredBySearch && searchQuery) {
      return (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.resultsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Results for "</Text>
          <Text style={styles.searchQueryText}>{searchQuery}</Text>
          <Text style={[styles.resultsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>"</Text>
        </View>
      );
    } else if (hasFilters) {
      return (
        <Text style={[styles.resultsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Showing {totalCars} cars
        </Text>
      );
    } else {
      return (
        <Text style={[styles.resultsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Total: {totalCars} cars
        </Text>
      );
    }
  };

  const getCountText = () => {
    if (filteredBySearch && searchQuery) {
      return (
        <Text style={styles.totalCountText}>
          {formatNumber(totalCars)} founds
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={[styles.resultsHeader, { borderBottomColor: isDark ? '#444444' : '#F0F0F0' }]}>
      <View style={styles.resultTextContainer}>
        {getResultsText()}
      </View>
      
      <View style={styles.rightContainer}>
        {getCountText()}
        
        {!isViewingSpecificCar && (hasFilters || filteredBySearch) && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={onClearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
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
    marginBottom: SPACING.sm,
  },
  resultTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchQueryText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalCountText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  clearFiltersButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.sm,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ResultsHeader; 