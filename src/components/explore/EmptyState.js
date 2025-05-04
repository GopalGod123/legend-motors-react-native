import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

const EmptyState = ({ onClearFilters }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Cars Found</Text>
      <Text style={styles.emptyDescription}>
        No cars match your current filter criteria. 
        Try adjusting your filters or clear them to see all available cars.
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
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
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