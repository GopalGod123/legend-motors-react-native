import React from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {AntDesign, Ionicons} from 'src/utils/icon/index';
import {useTheme} from '../../context/ThemeContext';

const FilterTabs = ({categories, activeFilter, onSelect, home = false}) => {
  const {isDark} = useTheme();

  const renderFilterItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton,
        isDark && styles.filterButtonDark,
      ]}
      onPress={() => onSelect(item.id)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.activeFilterText,
          isDark && styles.filterButtonTextDark,
        ]}>
        {item.label}{' '}
      </Text>
      <AntDesign
        name={'caretdown'}
        size={8}
        color={
          activeFilter === item.id
            ? '#ffffff'
            : isDark
            ? '#F47B20'
            : COLORS.primary
        }
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      {home ? null : (
        <Text
          style={[
            styles.filtersTitle,
            {color: isDark ? '#FFFFFF' : COLORS.textDark},
          ]}>
          {'Advanced Filters'}
        </Text>
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
    marginBottom: SPACING.sm,
  },
  filtersList: {
    paddingVertical: SPACING.xs,
    gap: 8,
  },
  filtersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
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
  filterButtonDark: {
    backgroundColor: '#2D2D2D',
    borderColor: '#F47B20',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterButtonTextDark: {
    color: '#F47B20',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});

export default FilterTabs;
