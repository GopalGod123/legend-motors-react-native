import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FilterIcon} from '../icons';
import {COLORS, SPACING, BORDER_RADIUS} from '../../utils/constants';
import {Ionicons} from 'src/utils/icon';
let timer = null;
const SearchBar = ({
  searchQuery = '',
  onSearch,
  onClearSearch,
  disabled = false,
  onApplyFilters,
  currentFilters = {},
  home = false,
}) => {
  // Use currentFilters directly instead of copying to state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Track if this is the first render
  const isFirstRender = useRef(true);

  const navigation = useNavigation();

  // // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Remove the useEffect that watches currentFilters

  const handleOpenFilter = () => {
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: handleFilterApply,
      currentFilters: currentFilters, // Pass the prop directly
    });
  };

  const handleFilterApply = filters => {
    if (filters && onApplyFilters) {
      // Skip state update and directly call parent callback
      onApplyFilters(filters);
    }
  };

  const handleTextChange = text => {
    setLocalSearchQuery(text);
    if (onSearch && !home) {
      console.log('first');
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        onSearch(text);
      }, 500);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  // Skip first render to prevent update loops
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.searchSection, disabled && styles.disabledSearch]}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleOpenFilter}
          disabled={disabled}>
          <Text style={[styles.filterText, disabled && styles.disabledText]}>
            Filter
          </Text>
          <Text style={[styles.filterIcon, disabled && styles.disabledText]}>
            ▼
          </Text>
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconLeft}>
            <Ionicons
              name="search"
              size={20}
              color={disabled ? '#C0C0C0' : '#5E366D'}
            />
          </View>
          <TextInput
            style={[styles.searchInput, disabled && styles.disabledInput]}
            placeholder="Sports Car"
            placeholderTextColor={
              disabled ? '#C0C0C0' : COLORS.inputPlaceholder
            }
            value={localSearchQuery}
            onChangeText={handleTextChange}
            editable={!disabled}
            onSubmitEditing={() => {
              console.log('Search text:', localSearchQuery);
              onSearch(localSearchQuery);
            }}
            enterKeyHint="search"
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
              disabled={disabled}>
              <Ionicons
                name="close-circle"
                size={18}
                color={disabled ? '#C0C0C0' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconRight}
          onPress={handleOpenFilter}
          disabled={disabled}>
          <FilterIcon size={20} color={disabled ? '#C0C0C0' : '#F86E1F'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: SPACING.xl,
  },
  searchSection: {
    flexDirection: 'row',
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#9E86A7',
    height: 55,
    overflow: 'hidden',
    alignItems: 'center',
  },
  disabledSearch: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
  },
  filterButton: {
    backgroundColor: '#DFD8E2',
    height: '100%',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#9E86A7',
  },
  filterText: {
    color: '#6f4a8e',
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  disabledText: {
    color: '#a0a0a0',
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
  disabledInput: {
    color: '#a0a0a0',
  },
  filterIconRight: {
    paddingHorizontal: SPACING.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SearchBar;
