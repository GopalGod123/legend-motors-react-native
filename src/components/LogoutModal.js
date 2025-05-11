import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

const LogoutModal = ({visible, onCancel, onLogout, COLORS1}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContainer, {backgroundColor: COLORS1?.white}]}>
          <Text style={styles.logoutText}>Logout</Text>
          <Text style={[styles.confirmationText, {color: COLORS1?.textDark}]}>
            Are you sure you want to log out?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={[styles.cancelButtonText, {color: COLORS1?.white}]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={[styles.logoutButtonText, {color: COLORS1?.white}]}>
                Yes, Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Pressable style={styles.outsidePress} onPress={onCancel} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FDE7CD',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  logoutButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F47B20',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  outsidePress: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    left: 0,
    right: 0,
  },
});

export default LogoutModal;
