import React, {useState, useEffect} from 'react';
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
  Alert,
  Modal,
  Platform,
  Image,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {getUserProfile, updateUserProfile} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useCountryCodes} from '../context/CountryCodesContext';
import BackArrow from '../components/BackArrow';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';

// Back Arrow Icon
const BackIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Calendar Icon
const CalendarIcon = ({color = '#212121'}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2V5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.5 9.09H20.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 4.5H5C4.17157 4.5 3.5 5.17157 3.5 6V19C3.5 19.8284 4.17157 20.5 5 20.5H19C19.8284 20.5 20.5 19.8284 20.5 19V6C20.5 5.17157 19.8284 4.5 19 4.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Email Icon
const EmailIcon = ({color = '#7A40C6'}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21H7C4 21 2 19.5 2 16V8C2 4.5 4 3 7 3H17C20 3 22 4.5 22 8V16C22 19.5 20 21 17 21Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 8.5L13.5736 12.4222C12.6941 13.1255 11.4577 13.1255 10.5781 12.4222L5.5 8.5"
      stroke={color}
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

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const {user, logout} = useAuth();
  const {theme, isDark} = useTheme();
  const {countryCodes, loading: loadingCountryCodes} = useCountryCodes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    countryCode: '+1', // Default country code for US
    phone: '',
    location: '',
    gender: '',
    profileImage: null,
  });
  const [updating, setUpdating] = useState(false);

  // Replace modals with dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Add a ref for the ScrollView to handle dropdown scrolling
  const dropdownScrollViewRef = React.useRef(null);

  // Transform API country codes data to match the required format for location options
  const locationOptions = React.useMemo(() => {
    if (!countryCodes || countryCodes.length === 0) return [];

    return countryCodes.map(country => ({
      name: country.name,
      code: country.iso2,
    }));
  }, [countryCodes]);

  // Transform API country codes data to match the required format for country code options
  const countryCodeOptions = React.useMemo(() => {
    if (!countryCodes || countryCodes.length === 0) return [];

    return countryCodes.map(country => ({
      code: country.dialCode,
      country: country.name,
      countryCode: country.iso2,
    }));
  }, [countryCodes]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // First try to sync the auth token

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
        console.log('Full profile data:', profile);

        // Format date from API format (YYYY-MM-DD) to display format (MM/DD/YYYY)
        const dateOfBirth = profile.dateOfBirth
          ? formatDateForDisplay(profile.dateOfBirth)
          : '';

        // Get country code from either dialCode (preferred) or countryCode field
        let countryCode = profile.dialCode || profile.countryCode || '1'; // Default to US

        // Format countryCode to ALWAYS include + if it doesn't already
        if (!countryCode.startsWith('+')) {
          countryCode = '+' + countryCode;
        }

        console.log(
          'Profile country/dial code from API:',
          profile.dialCode || profile.countryCode,
        );
        console.log('Formatted country code for UI:', countryCode);

        // Format phone with proper display format based on countryCode
        let formattedPhone = '';
        if (profile.phone) {
          // Get clean phone digits
          const phoneDigits = profile.phone.replace(/\D/g, '');

          // Apply formatting based on country code
          if (countryCode === '+1') {
            // US/Canada format: XXX-XXX-XXXX
            if (phoneDigits.length <= 3) {
              formattedPhone = phoneDigits;
            } else if (phoneDigits.length <= 6) {
              formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
                3,
              )}`;
            } else {
              formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
                3,
                6,
              )}-${phoneDigits.slice(6, 10)}`;
            }
          } else if (countryCode === '+91') {
            // India format: XXXXX XXXXX
            if (phoneDigits.length > 5) {
              formattedPhone = `${phoneDigits.slice(0, 5)} ${phoneDigits.slice(
                5,
              )}`;
            } else {
              formattedPhone = phoneDigits;
            }
          } else {
            // Default format (no special formatting)
            formattedPhone = phoneDigits;
          }
        }

        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: dateOfBirth,
          email: profile.email || '',
          countryCode: profile?.dialCode, // Always with + prefix
          phone: formattedPhone,
          location: profile.location || '',
          gender: profile.gender || '',
          profileImage: profile.profileImage ? profile.profileImage.id : null,
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
            {
              text: 'OK',
              onPress: () => {
                // Redirect to login
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
              },
            },
          ],
        );
      } else {
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = apiDate => {
    // Convert from YYYY-MM-DD to MM/DD/YYYY
    try {
      if (!apiDate) return '';
      const [year, month, day] = apiDate.split('-');
      return `${month}/${day}/${year}`;
    } catch (e) {
      return apiDate || ''; // Return as is if format is unexpected
    }
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = displayDate => {
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    try {
      if (!displayDate) return '';
      const [month, day, year] = displayDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
      return displayDate || ''; // Return as is if format is unexpected
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = name => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
      // Reset scroll position when opening dropdown
      setTimeout(() => {
        if (dropdownScrollViewRef.current) {
          dropdownScrollViewRef.current.scrollTo({x: 0, y: 0, animated: false});
        }
      }, 100);
    }
  };

  // Handle selection for any dropdown
  const handleDropdownSelect = (field, value) => {
    handleChange(field, value);
    setOpenDropdown(null);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
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

  const {sendEventCleverTap} = useCleverTap();
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      // Ensure token is synchronized before updating

      // Prepare data for API
      const updateData = {
        ...formData,
        dateOfBirth: formatDateForApi(formData.dateOfBirth),
      };

      // Format the phone number properly for API
      if (updateData.phone) {
        // Remove any formatting (hyphens, spaces, etc.)
        const cleanedPhone = updateData.phone.replace(/[^0-9]/g, '');
        updateData.phone = cleanedPhone;
      }

      // Ensure country code is properly formatted
      if (updateData.countryCode) {
        // API expects country code with "+" prefix
        if (!updateData.countryCode.startsWith('+')) {
          updateData.countryCode = `+${updateData.countryCode}`;
        }

        // Set dialCode field to match countryCode for API consistency
        updateData.dialCode = updateData.countryCode;
      }

      // Remove null, undefined, or empty values to prevent API errors
      Object.keys(updateData).forEach(key => {
        if (
          updateData[key] === null ||
          updateData[key] === undefined ||
          updateData[key] === ''
        ) {
          delete updateData[key];
        }
      });

      // Match API expected format - ensure we only send what the API expects
      const apiCompliantData = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        countryCode: updateData.countryCode,
        phone: updateData.phone,
        gender: updateData.gender || undefined,
        location: updateData.location || undefined,
        dateOfBirth: updateData.dateOfBirth || undefined,
        profileImage: updateData.profileImage || undefined,
      };

      console.log(
        'Updating profile with data:',
        JSON.stringify(apiCompliantData),
      );
      const response = await updateUserProfile(apiCompliantData);
      sendEventCleverTap(CLEVERTAP_EVENTS.PROFILE_UPDATE);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        // Extract specific validation errors if they exist
        const errorMessage =
          error.response.data?.message ||
          'An error occurred while updating your profile';
        Alert.alert('Error', errorMessage);
      } else if (
        error.message &&
        error.message.includes('Authentication error')
      ) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirect to login
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
              },
            },
          ],
        );
      } else {
        Alert.alert('Error', 'An error occurred while updating your profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Add gender options
  const genderOptions = ['Male', 'Female', 'Prefer not to say'];

  // Location validation
  const validateLocation = text => {
    // Only allow letters, spaces, commas, and periods in location
    return text.replace(/[^a-zA-Z\s,.]/g, '');
  };

  // Phone validation
  const validatePhone = text => {
    // Only allow numbers
    return text.replace(/[^0-9]/g, '');
  };

  // Get country code from dial code
  const getCountryCodeFromDialCode = dialCode => {
    const country = countryCodeOptions.find(option => option.code === dialCode);
    return country ? country.countryCode : 'US';
  };

  // Get country flag component based on country code
  const getCountryFlag = dialCode => {
    const countryCode = getCountryCodeFromDialCode(dialCode);
    return (
      <Image
        source={{uri: `https://flagsapi.com/${countryCode}/flat/32.png`}}
        style={{width: 24, height: 16, borderRadius: 2}}
        resizeMode="cover"
        key={`flag-${dialCode}-${countryCode}`} // Unique key to force re-render
      />
    );
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
    handleChange('phone', formatted);
  };

  // Handle country code selection with appropriate phone formatting update
  const handleCountrySelect = code => {
    // Store current phone without formatting
    const currentPhone = formData.phone.replace(/\D/g, '');

    // Update country code - use setState directly to ensure UI update
    setFormData({
      ...formData,
      countryCode: code,
    });

    // Re-format phone number according to new country format
    setTimeout(() => {
      const newFormattedPhone = formatPhoneNumber(currentPhone);
      setFormData(prevState => ({
        ...prevState,
        phone: newFormattedPhone,
      }));

      // Close dropdown
      setOpenDropdown(null);

      console.log(
        `Selected country code: ${code}, country: ${getCountryCodeFromDialCode(
          code,
        )}`,
      );
    }, 100);
  };

  // Render the phone input with country code
  const renderPhoneInput = () => {
    const currentCountryCode = formData.countryCode;
    const countryFlagCode = getCountryCodeFromDialCode(currentCountryCode);

    return (
      <View style={styles.phoneInputContainer}>
        <Text style={[styles.inputLabel, {color: themeColors[theme].text}]}>
          Phone Number
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.flagContainer,
              {borderRightColor: themeColors[theme].border},
            ]}
            onPress={() => toggleDropdown('countryCode')}>
            <Text
              style={{
                marginRight: 4,
                color: themeColors[theme].text,
                fontWeight: '500',
              }}>
              {currentCountryCode}
            </Text>
            <Image
              source={{
                uri: `https://flagsapi.com/${countryFlagCode}/flat/32.png`,
              }}
              style={{width: 24, height: 16, borderRadius: 2}}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              styles.phoneInput,
              {color: themeColors[theme].text},
            ]}
            placeholder="Phone Number"
            placeholderTextColor={isDark ? '#888888' : '#666666'}
            value={formData.phone}
            onChangeText={handlePhoneInput}
            keyboardType="phone-pad"
            maxLength={15}
            onFocus={() => setOpenDropdown(null)}
          />
        </View>
      </View>
    );
  };

  // Render the dropdown options for country code
  const renderCountryCodeDropdown = () => {
    if (openDropdown !== 'countryCode') return null;

    return (
      <View
        style={[styles.dropdownOverlay, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
        <View
          style={[
            styles.dropdownPopup,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text
            style={[styles.dropdownTitle, {color: themeColors[theme].text}]}>
            Select Country Code
          </Text>

          <FlatList
            data={countryCodeOptions}
            keyExtractor={item => `${item.code}-${item.countryCode}`}
            style={styles.countryList}
            showsVerticalScrollIndicator={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.countryCode === item.code && {
                    backgroundColor: '#F47B20',
                  },
                ]}
                onPress={() => handleCountrySelect(item.code)}>
                <View style={styles.countryInfo}>
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${item.countryCode}/flat/32.png`,
                    }}
                    style={styles.flagImage}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color:
                          formData.countryCode === item.code
                            ? '#FFFFFF'
                            : themeColors[theme].text,
                      },
                    ]}>
                    {item.code} {item.country}
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
    );
  };

  // Handle location selection
  const handleLocationSelect = location => {
    handleChange('location', location);
    setOpenDropdown(null);
  };

  // Render the dropdown options for location
  const renderLocationDropdown = () => {
    if (openDropdown !== 'location') return null;

    return (
      <View
        style={[styles.dropdownOverlay, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
        <View
          style={[
            styles.dropdownPopup,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text
            style={[styles.dropdownTitle, {color: themeColors[theme].text}]}>
            Select Country
          </Text>

          <FlatList
            data={locationOptions}
            keyExtractor={item => item.code}
            style={styles.countryList}
            showsVerticalScrollIndicator={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.location === item.name && {
                    backgroundColor: '#F47B20',
                  },
                ]}
                onPress={() => {
                  handleLocationSelect(item.name);
                }}>
                <View style={styles.countryInfo}>
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${item.code}/flat/32.png`,
                    }}
                    style={styles.flagImage}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color:
                          formData.location === item.name
                            ? '#FFFFFF'
                            : themeColors[theme].text,
                      },
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
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
        ]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: themeColors[theme].text}]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View
        style={[styles.header, {borderBottomColor: themeColors[theme].border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          Edit Profile
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* First Name */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder="First Name"
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.firstName}
              onChangeText={text => handleChange('firstName', text)}
            />
          </View>

          {/* Last Name */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder="Last Name"
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.lastName}
              onChangeText={text => handleChange('lastName', text)}
            />
          </View>

          {/* Date of Birth - Dropdown */}
          <View style={{marginBottom: 16}}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                  borderBottomLeftRadius:
                    openDropdown === 'dateOfBirth' ? 0 : 10,
                  borderBottomRightRadius:
                    openDropdown === 'dateOfBirth' ? 0 : 10,
                },
              ]}
              onPress={() => toggleDropdown('dateOfBirth')}>
              <Text
                style={[
                  styles.inputGender,
                  {
                    color: formData.dateOfBirth
                      ? themeColors[theme].text
                      : isDark
                      ? '#888888'
                      : '#666666',
                  },
                ]}>
                {formData.dateOfBirth || 'Date of Birth (MM/DD/YYYY)'}
              </Text>
              <View style={styles.inputIcon}>
                <CalendarIcon color={themeColors[theme].primary} />
              </View>
            </TouchableOpacity>

            {openDropdown === 'dateOfBirth' && (
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
                    borderColor: themeColors[theme].border,
                  },
                ]}>
                {[
                  {date: '01/01/1990', label: 'Jan 1, 1990'},
                  {date: '01/01/1995', label: 'Jan 1, 1995'},
                  {date: '01/01/2000', label: 'Jan 1, 2000'},
                ].map(option => (
                  <TouchableOpacity
                    key={option.date}
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor:
                          formData.dateOfBirth === option.date
                            ? '#F47B20'
                            : 'transparent',
                      },
                    ]}
                    onPress={() =>
                      handleDropdownSelect('dateOfBirth', option.date)
                    }>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color:
                            formData.dateOfBirth === option.date
                              ? '#FFFFFF'
                              : themeColors[theme].text,
                        },
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Email */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder="Email"
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
            />
            <View style={styles.inputIcon}>
              <EmailIcon color={themeColors[theme].primary} />
            </View>
          </View>

          {/* Location */}
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                },
              ]}
              onPress={() => toggleDropdown('location')}>
              <View style={styles.locationContainer}>
                {formData.location && (
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${
                        locationOptions.find(
                          loc => loc.name === formData.location,
                        )?.code || 'US'
                      }/flat/32.png`,
                    }}
                    style={{
                      width: 24,
                      height: 16,
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                    resizeMode="cover"
                    key={formData.location} // Add key to force re-render when location changes
                  />
                )}
                <Text
                  style={[
                    styles.input,
                    {
                      color: formData.location
                        ? themeColors[theme].text
                        : isDark
                        ? '#888888'
                        : '#666666',
                    },
                  ]}>
                  {formData.location || 'Select Country'}
                </Text>
              </View>
              <View style={styles.inputIcon}>
                <DropdownIcon />
              </View>
            </TouchableOpacity>
          </View>

          {/* Phone Number with Country Code Dropdown */}
          {renderPhoneInput()}

          {/* Gender Dropdown */}
          <View style={{marginBottom: 16}}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                  borderBottomLeftRadius: openDropdown === 'gender' ? 0 : 10,
                  borderBottomRightRadius: openDropdown === 'gender' ? 0 : 10,
                },
              ]}
              onPress={() => toggleDropdown('gender')}>
              <Text
                style={[
                  styles.inputGender,
                  {
                    color: formData.gender
                      ? themeColors[theme].text
                      : isDark
                      ? '#888888'
                      : '#666666',
                  },
                ]}>
                {formData.gender || 'Select Gender'}
              </Text>
              <View style={styles.inputIcon}>
                <DropdownIcon />
              </View>
            </TouchableOpacity>

            {openDropdown === 'gender' && (
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
                    borderColor: themeColors[theme].border,
                  },
                ]}>
                {genderOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor:
                          formData.gender === option
                            ? '#F47B20'
                            : 'transparent',
                      },
                    ]}
                    onPress={() => handleDropdownSelect('gender', option)}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color:
                            formData.gender === option
                              ? '#FFFFFF'
                              : themeColors[theme].text,
                        },
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Update Button */}
        </View>
        <TouchableOpacity
          style={[styles.updateButton, updating && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={updating}>
          {updating ? (
            <ActivityIndicator
              size="small"
              color={isDark ? '#000000' : '#FFFFFF'}
            />
          ) : (
            <Text
              color={isDark ? '#000000' : '#FFFFFF'}
              style={styles.updateButtonText}>
              Update
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Render dropdowns outside of ScrollView */}
      {renderCountryCodeDropdown()}
      {renderLocationDropdown()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  formContainer: {
    paddingVertical: 16,
    paddingBottom: 0,
  },
  inputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
  },
  inputGender: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
    marginTop: 30,
  },
  dropdownInput: {
    paddingVertical: 16,
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
    borderRightWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#F47B20',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },
  disabledButton: {
    backgroundColor: '#F8C4A6',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    marginTop: -1, // Overlap with input container
    position: 'absolute',
    top: 55, // Position below the input
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    justifyContent: 'center', // Center content vertically
    height: 45, // Fixed height for consistent alignment
  },
  dropdownItemText: {
    fontSize: 14,
    textAlign: 'center', // Center text horizontally
  },
  phoneInputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dropdownPopup: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
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
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagImage: {
    width: 24,
    height: 16,
    marginRight: 10,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#F47B20',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
});

export default EditProfileScreen;
