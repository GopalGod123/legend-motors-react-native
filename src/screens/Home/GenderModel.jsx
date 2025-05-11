// First, let's create a GenderModal component similar to CountryCodeModal

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

const GenderModal = ({ visible, onClose, onSelectGender, selectedGender, colors }) => {
  const genderOptions = [
    { id: '1', name: 'Male' },
    { id: '2', name: 'Female' },
    { id: '3', name: 'Non-Binary' },
    { id: '4', name: 'Prefer not to say' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors?.white || '#FFFFFF' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors?.textDark || '#212121' }]}>
                  Select Gender
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={[styles.closeButton, { color: colors?.primary || '#F47B20' }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={genderOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selectedGender?.id === item.id && { backgroundColor: colors?.lightGray || '#F5F5F5' },
                    ]}
                    onPress={() => {
                      onSelectGender(item);
                      onClose();
                    }}>
                    <Text style={[styles.genderName, { color: colors?.textDark || '#212121' }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    fontSize: 16,
    color: '#F47B20',
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  genderName: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 16,
  },
});

export default GenderModal;