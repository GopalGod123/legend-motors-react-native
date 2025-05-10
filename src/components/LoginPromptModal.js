import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use SVG for the lock icon to avoid image loading issues
const LockIcon = () => (
  <Image
    source={require('./icons/promptModel.png')}
    style={{ width: 80, height: 80 }}
    resizeMode="contain"
  />
);


const PROMPT_SHOWN_KEY = 'login_prompt_dismissed';

const LoginPromptModal = ({ visible, onClose, onLoginPress }) => {
  const { isAuthenticated, user } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  // First check AsyncStorage to see if user has previously dismissed the modal
  useEffect(() => {
    const checkPromptDismissed = async () => {
      try {
        const promptDismissed = await AsyncStorage.getItem(PROMPT_SHOWN_KEY);
        setHasCheckedStorage(true);
        
        if (promptDismissed === 'true') {
          // User has previously dismissed the modal
          console.log('User has previously dismissed login prompt');
          onClose();
        }
      } catch (error) {
        console.error('Error checking prompt dismissed status:', error);
        setHasCheckedStorage(true);
      }
    };
    
    if (visible) {
      checkPromptDismissed();
    }
  }, [visible, onClose]);
  
  // Then check authentication status
  useEffect(() => {
    if (!hasCheckedStorage) return;
    
    const checkAuthAndSetModal = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated();
        setShouldShowModal(visible && !isUserAuthenticated);
        
        // If user is already logged in, close the modal automatically
        if (isUserAuthenticated && visible) {
          console.log('User is already logged in, not showing login prompt');
          onClose();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setShouldShowModal(false);
      }
    };
    
    checkAuthAndSetModal();
  }, [visible, isAuthenticated, user, hasCheckedStorage, onClose]);
  
  // If user is logged in or modal shouldn't be shown, don't render it
  if (!shouldShowModal) {
    return null;
  }

  const handleDismiss = async () => {
    try {
      // Mark the prompt as dismissed in AsyncStorage
      await AsyncStorage.setItem(PROMPT_SHOWN_KEY, 'true');
      console.log('Login prompt marked as dismissed');
    } catch (error) {
      console.error('Error saving prompt dismissed status:', error);
    }
    
    // Close the modal
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={shouldShowModal}
      statusBarTranslucent={true}
      onRequestClose={handleDismiss}>
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={handleDismiss} />
        
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.modalBody}>
            <View style={styles.iconRow}>
              <LockIcon />
            </View>

            <Text style={styles.title}>Login page</Text>
            <Text style={styles.description}>
              Log in or register to access exclusive features and deals!
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onLoginPress}>
              <Text style={styles.loginButtonText}>Login / Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    top: 278,
    left: 44,
    width: 340,
    height: 373,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#666666',
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  loginButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginPromptModal; 