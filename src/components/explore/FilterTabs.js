import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

const FilterTabs = ({ categories, activeFilter, onSelect }) => {
  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton
      ]}
      onPress={() => onSelect(item.id)}
    >
      <Text 
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.activeFilterText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Advanced Filters</Text>
      <FlatList
        horizontal
        data={categories}
        renderItem={renderFilterItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filtersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  filtersList: {
    paddingVertical: SPACING.xs,
  },
  filterButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default FilterTabs; 