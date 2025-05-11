import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { Ionicons } from '../utils/icon';
import { submitCarEnquiry } from '../services/api';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Common country codes
const countryCodes = [
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+974', country: 'Qatar' },
  { code: '+973', country: 'Bahrain' },
  { code: '+965', country: 'Kuwait' },
  { code: '+968', country: 'Oman' },
  { code: '+962', country: 'Jordan' },
  { code: '+961', country: 'Lebanon' },
  { code: '+20', country: 'Egypt' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+92', country: 'Pakistan' },
  { code: '+63', country: 'Philippines' },
  { code: '+234', country: 'Nigeria' },
  { code: '+27', country: 'South Africa' },
  { code: '+60', country: 'Malaysia' },
  { code: '+65', country: 'Singapore' },
  { code: '+66', country: 'Thailand' },
  { code: '+62', country: 'Indonesia' },
  { code: '+81', country: 'Japan' },
  { code: '+82', country: 'South Korea' },
  { code: '+86', country: 'China' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+7', country: 'Russia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
];

const EnquiryFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, isAuthenticated } = useAuth();
  
  // Get car details from route params
  const { carId, carTitle, carImage, carPrice, currency } = route.params || {};
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(false);
  
  // Success modal state
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountryCodes, setFilteredCountryCodes] = useState(countryCodes);
  
  // Fill form with user profile data if available and checkbox is checked
  useEffect(() => {
    if (user && sameAsProfile) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Extract phone number without country code if possible
      if (user.phoneNumber) {
        const userPhone = user.phoneNumber;
        // If user phone already has the current country code, remove it
        if (userPhone.startsWith(countryCode)) {
          setPhoneNumber(userPhone.slice(countryCode.length));
        } else {
          // Try to extract from other country codes
          let foundCode = false;
          for (const country of countryCodes) {
            if (userPhone.startsWith(country.code)) {
              setCountryCode(country.code);
              setPhoneNumber(userPhone.slice(country.code.length));
              foundCode = true;
              break;
            }
          }
          
          // If no country code found, just use as is
          if (!foundCode) {
            setPhoneNumber(userPhone);
          }
        }
      }
    }
  }, [user, sameAsProfile]);

  // Handle checkbox toggle
  const toggleSameAsProfile = () => {
    const newState = !sameAsProfile;
    setSameAsProfile(newState);
    
    // If toggling on, fill the form with user data
    if (newState && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Handle phone as in the useEffect
      if (user.phoneNumber) {
        const userPhone = user.phoneNumber;
        // If user phone already has the current country code, remove it
        if (userPhone.startsWith(countryCode)) {
          setPhoneNumber(userPhone.slice(countryCode.length));
        } else {
          // Try to extract from other country codes
          let foundCode = false;
          for (const country of countryCodes) {
            if (userPhone.startsWith(country.code)) {
              setCountryCode(country.code);
              setPhoneNumber(userPhone.slice(country.code.length));
              foundCode = true;
              break;
            }
          }
          
          // If no country code found, just use as is
          if (!foundCode) {
            setPhoneNumber(userPhone);
          }
        }
      }
      
      // Clear any validation errors
      setErrors({
        name: '',
        email: '',
        phoneNumber: '',
      });
    }
  };

  // Format phone number to meet country standards
  const formatPhoneNumber = (phone, code) => {
    if (!phone) return '';
    
    // Remove any leading zeros
    let formattedPhone = phone.trim();
    while (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Remove any non-digit characters except for the plus sign at the beginning
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
    
    // Remove any + sign since we'll add the country code
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Remove the country code if it's already included
    if (code && formattedPhone.startsWith(code.replace('+', ''))) {
      formattedPhone = formattedPhone.substring(code.replace('+', '').length);
    }
    
    return formattedPhone;
  };

  // Validate the form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phoneNumber: '',
    };
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else {
      // Basic phone validation - ensure it has enough digits based on country code
      const formattedPhone = formatPhoneNumber(phoneNumber, countryCode);
      
      // Different country codes have different requirements
      // Here we're just doing a simple length check
      if (formattedPhone.length < 4) { // Minimum digits for a valid number
        newErrors.phoneNumber = 'Please enter a valid phone number';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format phone number properly
      const formattedPhone = formatPhoneNumber(phoneNumber, countryCode);
      
      // Prepare data for API
      const enquiryData = {
        carId: parseInt(carId, 10) || 0, // Ensure carId is a number
        name: name.trim(),
        phoneNumber: formattedPhone, // Send just the formatted number without country code
        emailAddress: email.trim(),
        pageUrl: `https://legendmotorsglobal.com/cars/${carId}`,
        countryCode: countryCode, // Send country code separately
      };
      
      console.log('Submitting enquiry with data:', JSON.stringify(enquiryData));
      
      const response = await submitCarEnquiry(enquiryData);
      
      if (response.success) {
        console.log('Enquiry submitted successfully:', JSON.stringify(response.data));
        
        // Show success modal instead of alert
        setSuccessModalVisible(true);
      } else {
        console.error('Failed to submit enquiry:', response.msg);
        Alert.alert('Error', response.msg || 'Failed to submit enquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error in submit handler:', error);
      Alert.alert(
        'Error',
        'An error occurred while submitting your enquiry. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close and navigation
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    // Navigate after modal is closed
    navigation.goBack();
  };

  // Handle navigation to enquiries screen
  const navigateToEnquiries = () => {
    setSuccessModalVisible(false);
    // Set a small timeout to ensure modal is dismissed
    setTimeout(() => {
      // Navigate to the Main tab navigator first, then to the EnquiriesTab
      navigation.navigate('Main', { screen: 'EnquiriesTab' });
    }, 300);
  };

  // Handle going back
  const goBack = () => {
    navigation.goBack();
  };

  // Filter countries based on search
  useEffect(() => {
    if (!countrySearch) {
      setFilteredCountryCodes(countryCodes);
      return;
    }
    
    const searchTerm = countrySearch.toLowerCase();
    const filtered = countryCodes.filter(
      country => 
        country.country.toLowerCase().includes(searchTerm) || 
        country.code.includes(searchTerm)
    );
    
    setFilteredCountryCodes(filtered);
  }, [countrySearch]);
  
  // Reset country search when modal is closed
  useEffect(() => {
    if (!countryPickerVisible) {
      setCountrySearch('');
    }
  }, [countryPickerVisible]);

  // Render country code item
  const renderCountryCodeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryCodeItem}
      onPress={() => {
        setCountryCode(item.code);
        setCountryPickerVisible(false);
      }}>
      <Text style={styles.countryCodeItemText}>{item.code} ({item.country})</Text>
    </TouchableOpacity>
  );

  // Render phone input with better country code display
  const renderPhoneInput = () => (
    <View style={styles.inputContainer}>
      <View style={[styles.input, errors.phoneNumber ? styles.inputError : null, styles.phoneInputWrapper]}>
        <TouchableOpacity
          style={styles.countryCodeContainer}
          onPress={() => setCountryPickerVisible(true)}>
          <Text style={styles.countryCodeText}>{countryCode}</Text>
          <Ionicons name="chevron-down" size={16} color="#777" />
        </TouchableOpacity>
        <TextInput
          style={styles.phoneInput}
          placeholder="Phone Number"
          placeholderTextColor="#777"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => {
            // Remove non-digit characters on input
            const digitsOnly = text.replace(/\D/g, '');
            setPhoneNumber(digitsOnly);
          }}
        />
      </View>
      {errors.phoneNumber ? (
        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Legend</Text>
            <View style={styles.logoBox} />
            <Text style={styles.motorsText}>Motors</Text>
          </View>
          
          {/* Form Title */}
          <Text style={styles.formTitle}>GET IN TOUCH</Text>
          
          {/* Car Info */}
          <View style={styles.carInfoContainer}>
            <Text style={styles.carTitle}>{carTitle}</Text>
            <View style={styles.carImageContainer}>
              {carImage ? (
                <Image
                  source={{ uri: carImage.uri }}
                  style={styles.carImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="car" size={40} color="#ccc" />
                </View>
              )}
            </View>
            {carPrice && (
              <Text style={styles.priceLabel}>
                Price
                <Text style={styles.priceValue}>
                  {' '}
                  {currency} {carPrice.toLocaleString()}
                </Text>
              </Text>
            )}
          </View>
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Your Name"
                placeholderTextColor="#777"
                value={name}
                onChangeText={setName}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.input, errors.email ? styles.inputError : null, styles.emailInputWrapper]}>
                <Ionicons name="mail" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Email"
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
            
            {/* Phone Input - using the custom component */}
            {renderPhoneInput()}
            
            {/* Auto-fill Checkbox (only if user is authenticated) */}
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleSameAsProfile}
                activeOpacity={0.7}>
                <View style={[
                  styles.checkbox,
                  sameAsProfile && { backgroundColor: '#5E366D' }
                ]}>
                  {sameAsProfile && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Auto-fill same as profile</Text>
              </TouchableOpacity>
            )}
            
            {/* Country Code Picker Modal */}
            <Modal
              visible={countryPickerVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCountryPickerVisible(false)}>
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1}
                onPress={() => setCountryPickerVisible(false)}>
                <View 
                  style={styles.modalContent}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={(e) => e.stopPropagation()}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Country Code</Text>
                    <TouchableOpacity 
                      onPress={() => setCountryPickerVisible(false)}
                      style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search country"
                      placeholderTextColor="#777"
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      autoCapitalize="none"
                    />
                    {countrySearch ? (
                      <TouchableOpacity onPress={() => setCountrySearch('')}>
                        <Ionicons name="close-circle" size={20} color="#777" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  
                  <FlatList
                    data={filteredCountryCodes}
                    renderItem={renderCountryCodeItem}
                    keyExtractor={(item) => item.code}
                    style={styles.countryCodeList}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No countries found</Text>
                      </View>
                    }
                  />
                </View>
              </TouchableOpacity>
            </Modal>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Inquire Now</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Success Modal */}
          <Modal
            visible={successModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleSuccessModalClose}>
            <TouchableOpacity 
              style={styles.successModalOverlay} 
              activeOpacity={1}
              onPress={handleSuccessModalClose}>
              <View 
                style={styles.successModalContent}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}>
                
                {/* Close button */}
                <TouchableOpacity 
                  style={styles.successModalCloseButton}
                  onPress={handleSuccessModalClose}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                
                {/* Logo */}
                <View style={styles.successModalLogoContainer}>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Legend</Text>
                    <View style={styles.logoBox} />
                    <Text style={styles.motorsText}>Motors</Text>
                  </View>
                </View>
                
                {/* Thank you message */}
                <Text style={styles.successModalTitle}>
                  🎉 Thank you for your enquiry!
                </Text>
                
                <Text style={styles.successModalMessage}>
                  We've received your request, and our team will get back to you shortly.
                  Stay tuned-We're on it!
                </Text>
                
                {/* Buttons */}
                <View style={styles.successModalButtonsContainer}>
                  <TouchableOpacity
                    style={styles.successModalButton}
                    onPress={navigateToEnquiries}>
                    <Text style={styles.successModalButtonText}>View My Enquiries</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.successModalButton, styles.successModalSecondaryButton]}
                    onPress={handleSuccessModalClose}>
                    <Text style={styles.successModalSecondaryButtonText}>Continue Browsing</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
  },
  logoBox: {
    width: 24,
    height: 24,
    backgroundColor: '#5E366D',
    marginHorizontal: 4,
    position: 'relative',
  },
  motorsText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#5E366D',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  carInfoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  carImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#757575',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
    marginLeft: 4,
  },
  emailInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  emailInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  countryCodeText: {
    fontSize: FONT_SIZES.md,
    color: '#212121',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5E366D',
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.md,
    color: '#212121',
  },
  submitButton: {
    backgroundColor: '#F47B20',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZES.md,
    color: '#212121',
  },
  countryCodeList: {
    flex: 1,
    width: '100%',
  },
  countryCodeItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: '100%',
  },
  countryCodeItemText: {
    fontSize: FONT_SIZES.md,
    color: '#212121',
  },
  noResultsContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    color: '#777',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  successModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  successModalLogoContainer: {
    marginVertical: SPACING.md,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#5E366D',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  successModalMessage: {
    fontSize: 16,
    color: '#212121',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  successModalButtonsContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  successModalButton: {
    backgroundColor: '#F47B20',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F47B20',
  },
  successModalSecondaryButtonText: {
    color: '#F47B20',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnquiryFormScreen; 