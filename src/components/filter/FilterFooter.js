import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FilterFooter = ({ 
  onReset, 
  onApply, 
  selectedCount = 0 
}) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
      >
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.applyButton}
        onPress={onApply}
      >
        <Text style={styles.applyButtonText}>
          Apply {selectedCount > 0 ? `(${selectedCount})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterFooter; 