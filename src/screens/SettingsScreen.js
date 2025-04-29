import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName || ''} {user?.lastName || ''}
            </Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Language</Text>
          <Text style={styles.menuItemValue}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.menuItemValue}>On</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Security</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  menuItemValue: {
    fontSize: 16,
    color: '#888888',
  },
  logoutButton: {
    backgroundColor: '#F4821F',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 