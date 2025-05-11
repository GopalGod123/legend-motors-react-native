import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import lock from '../../../assets/images/lock.png';
import { useTheme } from 'src/context/ThemeContext';
import makeStyles from './CreateNewPasswordScreen.styles';

const PasswordResetSuccessModal = ({ visible, onClose, username = "Andrew" }) => {
  const { THEME_COLORS, isDark } = useTheme();
  const styles = makeStyles({ THEME_COLORS, isDark })
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Image
            source={lock}
            style={styles.lockIcon}
          />
          <Text style={styles.title}>Hey {username}!</Text>
          <Text style={styles.message}>Your new password is updated.</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PasswordResetSuccessModal;