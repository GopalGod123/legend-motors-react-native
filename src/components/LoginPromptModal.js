import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const LockIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
    <Circle cx={40} cy={40} r={40} fill="#4A235A" />
    <Path
      d="M40 32c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z"
      fill="#F4821F"
    />
    <Path
      d="M48 36H32c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4V40c0-2.21-1.79-4-4-4z"
      fill="#F4821F"
    />
  </Svg>
);

const LoginPromptModal = ({ visible, onClose, onLoginPress }) => {
  const { isAuthenticated, user } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  
  useEffect(() => {
    // Only show the modal if the user is not authenticated and the parent wants to show it
    const checkAuthAndSetModal = async () => {
      const isUserAuthenticated = await isAuthenticated();
      setShouldShowModal(visible && !isUserAuthenticated);
      
      // If user is already logged in, close the modal automatically
      if (isUserAuthenticated && visible) {
        console.log('User is already logged in, not showing login prompt');
        onClose();
      }
    };
    
    checkAuthAndSetModal();
  }, [visible, isAuthenticated, user]);
  
  // If user is logged in, don't render the modal at all
  if (!shouldShowModal) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={shouldShowModal}
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Pressable onPress={() => {}} style={styles.modalBody}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={10}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <LockIcon />
            </View>

            <Text style={styles.title}>Unlock the full experience!</Text>
            <Text style={styles.description}>
              Log in or register now to access exclusive features and deals!
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onLoginPress}>
              <Text style={styles.loginButtonText}>Login / Register</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalBody: {
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: -12,
    top: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '600',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginPromptModal; 