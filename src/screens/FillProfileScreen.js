import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';
import { registerUser } from '../services/api';

const FillProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, registrationToken } = route.params || { email: '', registrationToken: '' };
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: email,
    phone: '',
    location: '',
    dateOfBirth: new Date(),
    gender: '',
    password: '',
    confirmPassword: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [datePickerValue, setDatePickerValue] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };
  
  const years = Array.from({length: 100}, (_, i) => new Date().getFullYear() - i);
  const months = [
    {value: 1, label: 'January'},
    {value: 2, label: 'February'},
    {value: 3, label: 'March'},
    {value: 4, label: 'April'},
    {value: 5, label: 'May'},
    {value: 6, label: 'June'},
    {value: 7, label: 'July'},
    {value: 8, label: 'August'},
    {value: 9, label: 'September'},
    {value: 10, label: 'October'},
    {value: 11, label: 'November'},
    {value: 12, label: 'December'},
  ];
  
  const days = Array.from(
    {length: getDaysInMonth(datePickerValue.month, datePickerValue.year)}, 
    (_, i) => i + 1
  );

  const isFormValid = () => {
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
    if (!formData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleImagePick = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleDateChange = () => {
    setShowDateModal(false);
    const newDate = new Date(
      datePickerValue.year, 
      datePickerValue.month - 1, 
      datePickerValue.day
    );
    setFormData(prev => ({ ...prev, dateOfBirth: newDate }));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    try {
      setLoading(true);
      
      const formattedDate = formData.dateOfBirth.toISOString().split('T')[0];
      
      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      
      console.log('Using registration token:', registrationToken);
      
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formattedDate,
        phone: formattedPhone,
        location: formData.location || null,
        gender: formData.gender || null,
        email: formData.email,
        password: formData.password,
        registrationToken: registrationToken
      };
      
      console.log('Registration payload:', JSON.stringify(registrationData));
      
      const response = await registerUser(registrationData);
      
      console.log('Registration response:', response);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login', { 
              email: formData.email,
              fromRegistration: true 
            })
          }
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackArrow />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fill Your Profile</Text>
      </View>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleImagePick}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name *"
            value={formData.firstName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Last Name *"
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
          <Text style={styles.inputIcon}>✉️</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneContainer}>
            <Text style={styles.countryCode}>🇺🇸 +1</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone Number *"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => {/* TODO: Implement location picker */}}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={formData.location}
            editable={false}
          />
          <Text style={styles.inputIcon}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowDateModal(true)}>
          <TextInput
            style={styles.input}
            placeholder="Date of Birth"
            value={formatDate(formData.dateOfBirth)}
            editable={false}
          />
          <Text style={styles.inputIcon}>📅</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Picker
            selectedValue={formData.gender}
            style={styles.input}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword) 
              ? styles.activeButton : {}
          ]} 
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <Picker
                  selectedValue={datePickerValue.month}
                  style={styles.picker}
                  onValueChange={(value) => 
                    setDatePickerValue(prev => ({...prev, month: value}))
                  }>
                  {months.map(month => (
                    <Picker.Item key={month.value} label={month.label} value={month.value} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <Picker
                  selectedValue={datePickerValue.day}
                  style={styles.picker}
                  onValueChange={(value) => 
                    setDatePickerValue(prev => ({...prev, day: value}))
                  }>
                  {days.map(day => (
                    <Picker.Item key={day} label={String(day)} value={day} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <Picker
                  selectedValue={datePickerValue.year}
                  style={styles.picker}
                  onValueChange={(value) => 
                    setDatePickerValue(prev => ({...prev, year: value}))
                  }>
                  {years.map(year => (
                    <Picker.Item key={year} label={String(year)} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleDateChange}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 40,
    color: '#F4821F',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryCode: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: '#F4821F',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666666',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
  },
  picker: {
    height: 150,
  },
  confirmButton: {
    backgroundColor: '#F4821F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FillProfileScreen; 