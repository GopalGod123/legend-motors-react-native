import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FilterList = ({ filterItems, activeFilter, onSelect }) => {
  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item.id && styles.activeFilterItem,
      ]}
      onPress={() => onSelect(item.id)}
    >
      <Text style={[
        styles.filterItemText,
        activeFilter === item.id && styles.activeFilterItemText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.filterList}>
      <FlatList
        data={filterItems}
        renderItem={renderFilterItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterList: {
    width: '35%',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
  },
  filterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  activeFilterItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#F47B20',
  },
  filterItemText: {
    fontSize: 16,
    color: '#666666',
  },
  activeFilterItemText: {
    color: '#F47B20',
    fontWeight: '600',
  },
});

export default FilterList; 