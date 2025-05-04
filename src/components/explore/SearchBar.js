import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

const SearchBar = ({ 
  searchQuery, 
  onChangeText, 
  onClearSearch, 
  disabled = false 
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for cars..."
          value={searchQuery}
          onChangeText={onChangeText}
          editable={!disabled}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={onClearSearch} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchIcon}>❌</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.searchIcon}>🔍</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F8F8F8',
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  clearSearchButton: {
    padding: 5,
  },
  clearSearchIcon: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
});

export default SearchBar; 