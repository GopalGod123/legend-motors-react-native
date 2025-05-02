import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { getUserProfile, updateUserProfile, syncAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Back Arrow Icon
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Calendar Icon
const CalendarIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2V5"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.5 9.09H20.5"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 4.5H5C4.17157 4.5 3.5 5.17157 3.5 6V19C3.5 19.8284 4.17157 20.5 5 20.5H19C19.8284 20.5 20.5 19.8284 20.5 19V6C20.5 5.17157 19.8284 4.5 19 4.5Z"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Email Icon
const EmailIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21H7C4 21 2 19.5 2 16V8C2 4.5 4 3 7 3H17C20 3 22 4.5 22 8V16C22 19.5 20 21 17 21Z"
      stroke="#7A40C6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 8.5L13.5736 12.4222C12.6941 13.1255 11.4577 13.1255 10.5781 12.4222L5.5 8.5"
      stroke="#7A40C6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Dropdown Icon
const DropdownIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// US Flag Icon
const USFlagIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <View style={{ backgroundColor: '#FFFFFF', width: 24, height: 16, borderRadius: 2 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 12, height: 8, backgroundColor: '#002868' }}>
        {/* Small white stars */}
        {Array(9).fill(0).map((_, i) => (
          <View 
            key={i} 
            style={{ 
              width: 2, 
              height: 2, 
              backgroundColor: 'white',
              marginLeft: i % 3 === 0 ? 1 : 2,
              marginTop: i < 3 ? 1 : (i < 6 ? 3 : 5)
            }} 
          />
        ))}
      </View>
      {/* Red stripes */}
      {Array(7).fill(0).map((_, i) => (
        <View 
          key={i} 
          style={{ 
            position: 'absolute',
            backgroundColor: '#bf0a30', 
            height: 16/13, 
            width: 24,
            top: i * 16/6.5
          }} 
        />
      ))}
    </View>
  </Svg>
);

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    countryCode: '',
    phone: '',
    location: '',
    gender: '',
    profileImage: null
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // First try to sync the auth token
      await syncAuthToken();
      
      // If user context has data, pre-populate the form
      if (user) {
        setFormData(prevData => ({
          ...prevData,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        }));
      }
      
      // Then try to get the full profile from API
      const response = await getUserProfile();
      if (response.success && response.data) {
        const profile = response.data;
        
        // Format date from API format (YYYY-MM-DD) to display format (MM/DD/YYYY)
        const dateOfBirth = profile.dateOfBirth ? formatDateForDisplay(profile.dateOfBirth) : '';
        
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: dateOfBirth,
          email: profile.email || '',
          countryCode: profile.countryCode || '',
          phone: profile.phone || '',
          location: profile.location || '',
          gender: profile.gender || '',
          profileImage: profile.profileImage ? profile.profileImage.id : null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Handle authentication errors
      if (error.message && error.message.includes('Authentication error')) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            { text: 'OK', onPress: () => {
                // Redirect to login
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (apiDate) => {
    // Convert from YYYY-MM-DD to MM/DD/YYYY
    try {
      const [year, month, day] = apiDate.split('-');
      return `${month}/${day}/${year}`;
    } catch (e) {
      return apiDate; // Return as is if format is unexpected
    }
  };

  const formatDateForApi = (displayDate) => {
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    try {
      const [month, day, year] = displayDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
      return displayDate; // Return as is if format is unexpected
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      // Ensure token is synchronized before updating
      await syncAuthToken();
      
      // Prepare data for API
      const updateData = {
        ...formData,
        dateOfBirth: formatDateForApi(formData.dateOfBirth)
      };

      // Remove null values to prevent API errors
      Object.keys(updateData).forEach(key => 
        updateData[key] === null && delete updateData[key]
      );

      const response = await updateUserProfile(updateData);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle authentication errors
      if (error.message && error.message.includes('Authentication error')) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            { text: 'OK', onPress: () => {
                // Redirect to login
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'An error occurred while updating your profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              value={formData.dateOfBirth}
              onChangeText={(text) => handleChange('dateOfBirth', text)}
            />
            <View style={styles.inputIcon}>
              <CalendarIcon />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
            />
            <View style={styles.inputIcon}>
              <EmailIcon />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={formData.location}
              onChangeText={(text) => handleChange('location', text)}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.flagContainer}>
              <USFlagIcon />
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender */}
          <TouchableOpacity style={styles.inputContainer}>
            <Text style={[styles.input, styles.dropdownInput]}>
              {formData.gender || 'Select Gender'}
            </Text>
            <View style={styles.inputIcon}>
              <DropdownIcon />
            </View>
          </TouchableOpacity>

          {/* Update Button */}
          <TouchableOpacity 
            style={[styles.updateButton, updating && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#212121',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212121',
    height: '100%',
  },
  dropdownInput: {
    paddingTop: 16,
  },
  phoneInput: {
    paddingLeft: 8,
  },
  inputIcon: {
    paddingRight: 16,
  },
  flagContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  updateButton: {
    backgroundColor: '#F47B20',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#F8C4A6',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 