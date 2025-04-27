import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { FilterIcon } from '../icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const SearchBar = () => {
  return (
    <View style={styles.searchSection}>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterText}>Filter</Text>
        <Text style={styles.filterIcon}>▼</Text>
      </TouchableOpacity>
      
      <View style={styles.searchInputContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by body type..."
          placeholderTextColor={COLORS.inputPlaceholder}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Text>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <FilterIcon size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  filterButton: {
    backgroundColor: COLORS.filterBackground,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  filterText: {
    color: COLORS.secondary,
    fontWeight: '500',
    marginRight: SPACING.xs,
  },
  filterIcon: {
    fontSize: 10,
    color: COLORS.secondary,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
});

export default SearchBar; 