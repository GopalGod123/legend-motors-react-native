import React from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {AntDesign, Ionicons} from 'src/utils/icon/index';

const FilterTabs = ({categories, activeFilter, onSelect, home = false}) => {
  const renderFilterItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton,
      ]}
      onPress={() => onSelect(item.id)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.activeFilterText,
        ]}>
        {item.label}{' '}
      </Text>
      <AntDesign
        name={'caretdown'}
        size={8}
        color={activeFilter === item.id ? '#ffffff' : COLORS.primary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      {home ? null : (
        <Text style={styles.filtersTitle}>{'Advanced Filters'}</Text>
      )}
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
  filtersList: {
    paddingVertical: SPACING.xs,
    gap: 8,
  },
  filterButton: {
    width: 115,
    height: 38,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});

export default FilterTabs;
