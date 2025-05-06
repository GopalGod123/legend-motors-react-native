import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FilterIcon } from '../icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    // Add other filter types here
  });
  
  const navigation = useNavigation();

  const handleOpenFilter = () => {
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: handleFilterApply
    });
  };

  const handleFilterApply = (filters) => {
    if (filters) {
      setSelectedFilters(prev => ({
        ...prev,
        ...filters
      }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilter}>
          <Text style={styles.filterText}>Filter</Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconLeft}>
            <Ionicons name="search" size={20} color="#5E366D" />
          </View>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by body type..."
            placeholderTextColor={COLORS.inputPlaceholder}
          />
        </View>
        
        <TouchableOpacity style={styles.filterIconRight} onPress={handleOpenFilter}>
          <FilterIcon size={20} color="#F86E1F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 23,
    marginBottom: SPACING.xl,
  },
  searchSection: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    height: 55,
    overflow: 'hidden',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#f0e6f5',
    height: '100%',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  filterText: {
    color: '#6f4a8e',
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  filterIcon: {
    fontSize: 10,
    color: '#6f4a8e',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchIconLeft: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#555',
  },
  filterIconRight: {
    paddingHorizontal: SPACING.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar; 