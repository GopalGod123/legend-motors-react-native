import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useTheme } from 'src/context/ThemeContext';

const FilterTabs = ({ categories, activeFilter, onSelect }) => {
    const {isDark, COLORS1 } = useTheme();

    const renderFilterItem = ({ item }) => {
      const isActive = activeFilter === item.id;
      return (
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              borderWidth: 1,
              borderColor: COLORS.primary,
              backgroundColor: isActive
                ? COLORS.primary
                : isDark
                ? COLORS1.card
                : '#F0F0F0',
            },
          ]}
          onPress={() => onSelect(item.id)}
        >
          <Text
            style={{
              color: isActive ? '#FFFFFF' : COLORS.primary,
              fontWeight: isActive ? '600' : '500',
              fontSize: FONT_SIZES.sm,
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    };
    

  return (
    <View style={[styles.filtersContainer, { backgroundColor: isDark ? COLORS1.background : '#FFFFFF' }]}>
      <Text style={[styles.filtersTitle, { color: COLORS1.primaryText }]}>Advanced Filters</Text>
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