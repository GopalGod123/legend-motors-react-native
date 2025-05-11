import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DatePickerModal = ({ 
  showDateModal, 
  setShowDateModal, 
  datePickerValue, 
  setDatePickerValue, 
  handleDateChange,
  months,
  days,
  years 
}) => {
  // Platform-specific adjustments for picker display
  const pickerItemStyle = Platform.OS === 'ios' 
    ? styles.pickerItem 
    : { ...styles.pickerItem, height: 130 };
  return (
    <Modal
      visible={showDateModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDateModal(false)}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity 
                style={styles.closeButtonWrapper}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.datePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={datePickerValue.month}
                    style={styles.picker}
                    itemStyle={pickerItemStyle}
                    onValueChange={(value) =>
                      setDatePickerValue(prev => ({ ...prev, month: value }))
                    }
                  >
                    {months.map(month => (
                      <Picker.Item 
                        key={month.value} 
                        label={month.label} 
                        value={month.value}
                        color="#333" 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={datePickerValue.day}
                    style={styles.picker}
                    itemStyle={pickerItemStyle}
                    onValueChange={(value) =>
                      setDatePickerValue(prev => ({ ...prev, day: value }))
                    }
                  >
                    {days.map(day => (
                      <Picker.Item 
                        key={day} 
                        label={String(day)} 
                        value={day}
                        color="#333" 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={[styles.pickerColumn, { flex: 1.2 }]}>
                <Text style={styles.pickerLabel}>Year</Text>
                <View style={[styles.pickerWrapper, { minWidth: 100 }]}>
                  <Picker
                    selectedValue={datePickerValue.year}
                    style={styles.picker}
                    itemStyle={pickerItemStyle}
                    onValueChange={(value) =>
                      setDatePickerValue(prev => ({ ...prev, year: value }))
                    }
                  >
                    {years.map(year => (
                      <Picker.Item 
                        key={year} 
                        label={String(year)} 
                        value={year}
                        color="#333" 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateChange}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: width,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  closeButtonWrapper: {
    padding: 5,
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: Platform.OS === 'android' ? 10 : 0,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    width: '100%',
    minWidth: 90, // Ensure minimum width for all pickers
  },
  picker: {
    height: 60,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#3b82f6', // Blue color
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatePickerModal;
