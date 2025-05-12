import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

const EmptyState = ({ onClearFilters, brandName }) => {
  const { theme, isDark } = useTheme();
  
  const message = brandName 
    ? `No cars available for ${brandName}.` 
    : 'No cars match your current filter criteria.';
  
  return (
    <View style={[styles.emptyContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        No Cars Found
      </Text>
      <Text style={[styles.emptyDescription, { color: isDark ? '#CCCCCC' : '#757575' }]}>
        {message}
        {' '}Try adjusting your filters or clear them to see all available cars.
      </Text>
      <TouchableOpacity 
        style={styles.clearFiltersButtonLarge}
        onPress={onClearFilters}
      >
        <Text style={styles.clearFiltersText}>Clear All Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  clearFiltersButtonLarge: {
    padding: SPACING.md,
    backgroundColor: '#FF6B6B',
    borderRadius: BORDER_RADIUS.md,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default EmptyState; 