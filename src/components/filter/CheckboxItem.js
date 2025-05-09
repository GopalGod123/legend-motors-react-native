import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Ionicons} from 'src/utils/icon';

const CheckboxItem = ({
  label,
  isSelected,
  onSelect,
  icon = null,
  colorIndicator = null,
  status = '',
  customStyle = {},
}) => {
  return (
    <TouchableOpacity
      style={[styles.checkboxItem, customStyle]}
      onPress={onSelect}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </View>

      {colorIndicator && (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colorIndicator,
            marginRight: 10,
            borderWidth: 1,
            borderColor: '#DDDDDD',
          }}
        />
      )}

      {icon}

      <Text style={[styles.checkboxLabel, isSelected && styles.selectedLabel]}>
        {label}
      </Text>

      {status && <Text style={styles.itemStatus}>{status}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F47B20',
    borderColor: '#F47B20',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  selectedLabel: {
    fontWeight: '600',
  },
  itemStatus: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 'auto',
  },
});

export default CheckboxItem;
