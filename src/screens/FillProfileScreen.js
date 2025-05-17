import React, {useState, useEffect} from 'react';
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
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import {Picker} from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';
import {registerUser, updateUserProfile} from '../services/api';
import {useTheme} from 'src/context/ThemeContext';
import {useAuth} from 'src/context/AuthContext';
import {useCountryCodes} from 'src/context/CountryCodesContext';
import FlagIcon from 'src/components/common/FlagIcon';

const FillProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [registrationToken, setRegistrationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const {isDark} = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const {countryCodes} = useCountryCodes();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+971', // Default country code for US
    phone: '',
    location: '',
    dateOfBirth: new Date(),
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [sso, setSso] = useState(false);

  const [datePickerValue, setDatePickerValue] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const {user} = useAuth();
  useEffect(() => {
    if (route.params?.registrationToken) {
      setRegistrationToken(route.params?.registrationToken ?? '');
      setFormData(prev => ({...prev, email: route?.params?.email ?? ''}));
    } else if (route.params?.sso) {
      setSso(true);
      setFormData(prev => ({
        ...prev,
        email: user?.email ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
      }));
    }
  }, [route.params]);

  // Get country code from dial code
  const getCountryCodeFromDialCode = dialCode => {
    const country = countryCodes.find(option => option.dialCode === dialCode);
    return country ? country.iso2 : 'AE';
  };

  // Format the phone number as it's being entered
  const formatPhoneNumber = text => {
    // Remove any non-numeric characters
    let cleaned = text.replace(/\D/g, '');

    // Apply different formatting based on country code
    if (formData.countryCode === '+1') {
      // US format: (XXX) XXX-XXXX
      if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
          return cleaned;
        } else if (cleaned.length <= 6) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
            6,
            10,
          )}`;
        }
      }
    } else if (formData.countryCode === '+91') {
      // India format: XXXXX XXXXX
      if (cleaned.length > 5) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
      }
    }

    // Default format for other countries (limit to reasonable length)
    return cleaned.slice(0, 15);
  };

  // Handle phone number input with formatting
  const handlePhoneInput = text => {
    const formatted = formatPhoneNumber(text);
    setFormData(prev => ({...prev, phone: formatted}));
  };

  // Handle country code selection with appropriate phone formatting update
  const handleCountrySelect = code => {
    // Store current phone without formatting
    const currentPhone = formData.phone.replace(/\D/g, '');

    // Update country code
    setFormData(prev => ({
      ...prev,
      countryCode: code,
    }));

    // Re-format phone number according to new country format
    setTimeout(() => {
      const newFormattedPhone = formatPhoneNumber(currentPhone);
      setFormData(prev => ({
        ...prev,
        phone: newFormattedPhone,
      }));
      setOpenDropdown(null);
    }, 100);
  };

  // Render the phone input with country code
  const renderPhoneInput = () => {
    const currentCountryCode = formData.countryCode;
    const countryFlagCode = getCountryCodeFromDialCode(currentCountryCode);

    return (
      <View style={styles.phoneInputContainer}>
        <View
          style={[styles.phoneContainer, isDark && styles.phoneContainerDark]}>
          <TouchableOpacity
            style={[styles.countryCode, isDark && styles.countryCodeDark]}
            onPress={() => setOpenDropdown('countryCode')}>
            <Text style={[styles.countryCodeText, isDark && styles.textDark]}>
              {currentCountryCode}
            </Text>
            <Image
              source={{
                uri: `https://flagsapi.com/${countryFlagCode}/flat/32.png`,
              }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.phoneInput, isDark && styles.inputDark]}
            placeholder="Phone Number *"
            placeholderTextColor={isDark ? '#666666' : undefined}
            value={formData.phone}
            onChangeText={handlePhoneInput}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
      </View>
    );
  };

  // Render the dropdown options for country code
  const renderCountryCodeDropdown = () => {
    if (openDropdown !== 'countryCode') return null;
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Select Country Code
            </Text>

            <FlatList
              data={countryCodes}
              keyExtractor={(item, index) =>
                item.iso2?.toString() + index?.toString()
              }
              style={styles.countryList}
              showsVerticalScrollIndicator={true}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    formData.countryCode === item.dialCode &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => handleCountrySelect(item.dialCode)}>
                  <View style={styles.countryInfo}>
                    <Image
                      source={{
                        uri: `https://flagsapi.com/${item?.iso2}/flat/32.png`,
                      }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />
                    <Text
                      style={[
                        styles.countryText,
                        isDark && styles.textDark,
                        formData.countryCode === item.code &&
                          styles.selectedCountryText,
                      ]}>
                      {item.dialCode} {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpenDropdown(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const years = Array.from(
    {length: 100},
    (_, i) => new Date().getFullYear() - i,
  );
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
    (_, i) => i + 1,
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
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.assets && response.assets[0]) {
          setProfileImage(response.assets[0].uri);
        }
      },
    );
  };

  const handleDateChange = () => {
    setShowDateModal(false);
    const newDate = new Date(
      datePickerValue.year,
      datePickerValue.month - 1,
      datePickerValue.day,
    );
    setFormData(prev => ({...prev, dateOfBirth: newDate}));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setLoading(true);

      const formattedDate = formData.dateOfBirth.toISOString().split('T')[0];

      const formattedPhone = formData.phone.startsWith('+')
        ? formData.phone
        : `+${formData.phone}`;

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
        registrationToken: registrationToken,
        countryCode: formData.countryCode,
      };

      console.log('Registration payload:', JSON.stringify(registrationData));

      if (sso) {
        delete registrationData.registrationToken;
      }
      const response = sso
        ? await updateUserProfile(registrationData)
        : await registerUser(registrationData);

      console.log('Registration response:', response);

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (sso) {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Main'}],
                });
              } else {
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Login',
                      params: {
                        email: formData.email,
                        fromRegistration: true,
                      },
                    },
                  ],
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle location selection
  const handleLocationSelect = location => {
    setFormData(prev => ({...prev, location}));
    setOpenDropdown(null);
  };

  // Render the dropdown options for location
  const renderLocationDropdown = () => {
    if (openDropdown !== 'location') return null;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              Select Country
            </Text>

            <FlatList
              data={countryCodes}
              keyExtractor={(item, index) =>
                item.iso2?.toString() + index?.toString()
              }
              style={styles.countryList}
              showsVerticalScrollIndicator={true}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    formData.location === item.name &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => handleLocationSelect(item.name)}>
                  <View style={styles.countryInfo}>
                    <Image
                      source={{
                        uri: `https://flagsapi.com/${item?.iso2}/flat/32.png`,
                      }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />

                    <Text
                      style={[
                        styles.countryText,
                        isDark && styles.textDark,
                        formData.location === item.name &&
                          styles.selectedCountryText,
                      ]}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpenDropdown(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Render the location input
  const renderLocationInput = () => {
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.locationContainer,
            isDark && styles.locationContainerDark,
          ]}
          onPress={() => setOpenDropdown('location')}>
          <View style={styles.locationContent}>
            {formData.location && (
              <Image
                source={{
                  uri: `https://flagsapi.com/${
                    countryCodes.find(loc => loc.name === formData.location)
                      ?.iso2 ?? 'AE'
                  }/flat/32.png`,
                }}
                style={styles.flagImage}
                resizeMode="cover"
              />
            )}
            <Text
              style={[
                styles.locationText,
                isDark && styles.textDark,
                !formData.location && styles.placeholderText,
              ]}>
              {formData.location || 'Select Country'}
            </Text>
          </View>
          <Text style={[styles.inputIcon, isDark && styles.textDark]}>▼</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>
            Fill Your Profile
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.placeholderImage,
                  isDark && styles.placeholderImageDark,
                ]}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="First Name *"
              value={formData.firstName}
              onChangeText={text =>
                setFormData(prev => ({...prev, firstName: text}))
              }
              placeholderTextColor={isDark ? '#666666' : undefined}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Last Name *"
              value={formData.lastName}
              onChangeText={text =>
                setFormData(prev => ({...prev, lastName: text}))
              }
              placeholderTextColor={isDark ? '#666666' : undefined}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Email *"
              value={formData.email}
              onChangeText={text =>
                setFormData(prev => ({...prev, email: text}))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              placeholderTextColor={isDark ? '#666666' : undefined}
            />
            <Text style={styles.inputIcon}>✉️</Text>
          </View>

          {renderPhoneInput()}

          {renderLocationInput()}

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDateModal(true)}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Date of Birth"
              value={formatDate(formData.dateOfBirth)}
              editable={false}
              placeholderTextColor={isDark ? '#666666' : undefined}
            />
            <Text style={styles.inputIcon}>📅</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Picker
              selectedValue={formData.gender}
              style={[styles.input, isDark && styles.inputDark]}
              onValueChange={value =>
                setFormData(prev => ({...prev, gender: value}))
              }
              dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}>
              <Picker.Item
                label="Select Gender"
                value=""
                color={isDark ? '#FFFFFF' : '#000000'}
              />
              <Picker.Item
                label="Male"
                value="Male"
                color={isDark ? '#FFFFFF' : '#000000'}
              />
              <Picker.Item
                label="Female"
                value="Female"
                color={isDark ? '#FFFFFF' : '#000000'}
              />
              <Picker.Item
                label="Other"
                value="Other"
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </Picker>
          </View>
          {sso ? (
            <></>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Password *"
                  value={formData.password}
                  onChangeText={text =>
                    setFormData(prev => ({...prev, password: text}))
                  }
                  secureTextEntry
                  placeholderTextColor={isDark ? '#666666' : undefined}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChangeText={text =>
                    setFormData(prev => ({...prev, confirmPassword: text}))
                  }
                  secureTextEntry
                  placeholderTextColor={isDark ? '#666666' : undefined}
                />
              </View>
            </>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              formData.firstName &&
              formData.lastName &&
              formData.email &&
              formData.password &&
              formData.confirmPassword
                ? styles.activeButton
                : {},
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

        {renderCountryCodeDropdown()}
        {renderLocationDropdown()}

        <Modal
          visible={showDateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDateModal(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, isDark && styles.modalContentDark]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                  Select Date of Birth
                </Text>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Text style={[styles.closeButton, isDark && styles.textDark]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContainer}>
                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                    Month
                  </Text>
                  <Picker
                    selectedValue={datePickerValue.month}
                    style={[styles.picker, isDark && styles.pickerDark]}
                    onValueChange={value =>
                      setDatePickerValue(prev => ({...prev, month: value}))
                    }
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}>
                    {months.map(month => (
                      <Picker.Item
                        key={month.value}
                        label={month.label}
                        value={month.value}
                        color={isDark ? '#FFFFFF' : '#000000'}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                    Day
                  </Text>
                  <Picker
                    selectedValue={datePickerValue.day}
                    style={[styles.picker, isDark && styles.pickerDark]}
                    onValueChange={value =>
                      setDatePickerValue(prev => ({...prev, day: value}))
                    }
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}>
                    {days.map(day => (
                      <Picker.Item
                        key={day}
                        label={String(day)}
                        value={day}
                        color={isDark ? '#FFFFFF' : '#000000'}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.pickerColumn}>
                  <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                    Year
                  </Text>
                  <Picker
                    selectedValue={datePickerValue.year}
                    style={[styles.picker, isDark && styles.pickerDark]}
                    onValueChange={value =>
                      setDatePickerValue(prev => ({...prev, year: value}))
                    }
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}>
                    {years.map(year => (
                      <Picker.Item
                        key={year}
                        label={String(year)}
                        value={year}
                        color={isDark ? '#FFFFFF' : '#000000'}
                      />
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#1A1A1A',
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
  textDark: {
    color: '#FFFFFF',
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
  placeholderImageDark: {
    backgroundColor: '#000000',
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
  inputDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  phoneInputContainer: {
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneContainerDark: {
    borderColor: '#333333',
  },
  countryCode: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeDark: {
    borderRightColor: '#333333',
    backgroundColor: '#000000',
  },
  countryCodeText: {
    marginRight: 8,
    fontSize: 16,
    color: '#333333',
  },
  flagImage: {
    width: 24,
    height: 16,
    borderRadius: 2,
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
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalContentDark: {
    backgroundColor: '#1A1A1A',
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
    marginBottom: 20,
    textAlign: 'center',
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
  pickerDark: {
    color: '#FFFFFF',
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
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedCountryItem: {
    backgroundColor: '#F4821F',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedCountryText: {
    color: '#FFFFFF',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  locationContainerDark: {
    borderColor: '#333333',
    backgroundColor: '#000000',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
  placeholderText: {
    color: '#666666',
  },
});

export default FillProfileScreen;
