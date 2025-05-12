import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import LogoutModal from '../components/LogoutModal';
import {getUserProfile, syncAuthToken, logoutUser} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {languages} from './LanguageSelectScreen';
// SVG icons as React components
const UserIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8445 22.1618C8.15273 22.1618 5 21.5873 5 19.2865C5 16.9858 8.13273 14.8618 11.8445 14.8618C15.5364 14.8618 18.6891 16.9652 18.6891 19.266C18.6891 21.5658 15.5564 22.1618 11.8445 22.1618Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8375 11.6735C14.2602 11.6735 16.2239 9.7099 16.2239 7.28718C16.2239 4.86445 14.2602 2.8999 11.8375 2.8999C9.41477 2.8999 7.45022 4.86445 7.45022 7.28718C7.44204 9.70172 9.39204 11.6654 11.8066 11.6735C11.8175 11.6735 11.8275 11.6735 11.8375 11.6735Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const BellIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9964 3.01416C7.5621 3.01416 5.63543 7.0294 5.63543 9.68368C5.63543 11.6675 5.92305 11.0837 4.82496 13.5037C3.484 16.9523 8.87638 18.3618 11.9964 18.3618C15.1154 18.3618 20.5078 16.9523 19.1678 13.5037C18.0697 11.0837 18.3573 11.6675 18.3573 9.68368C18.3573 7.0294 16.4297 3.01416 11.9964 3.01416Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.306 21.0122C13.0117 22.4579 10.9927 22.4751 9.68604 21.0122"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const InfoIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6785 3.84872C12.9705 4.66372 12.6885 9.78872 13.5115 10.6127C14.3345 11.4347 19.2795 11.0187 20.4675 10.0837C23.3255 7.83272 15.9385 1.24672 13.6785 3.84872Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1377 14.2902C19.2217 15.3742 16.3477 21.5542 10.6517 21.5542C6.39771 21.5542 2.94971 18.1062 2.94971 13.8532C2.94971 8.55317 8.17871 5.16317 9.67771 6.66217C10.5407 7.52517 9.56871 11.5862 11.1167 13.1352C12.6647 14.6842 17.0537 13.2062 18.1377 14.2902Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ShieldIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="18" height="21" viewBox="0 0 18 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.98457 20.1057C11.3196 20.1057 16.6566 17.7837 16.6566 11.3787C16.6566 4.97473 16.9346 4.47373 16.3196 3.85773C15.7036 3.24173 12.4936 1.25073 8.98457 1.25073C5.47557 1.25073 2.26557 3.24173 1.65057 3.85773C1.03457 4.47373 1.31257 4.97473 1.31257 11.3787C1.31257 17.7837 6.65057 20.1057 8.98457 20.1057Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.38574 10.3749L8.27774 12.2699L12.1757 8.36987"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const GlobeIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 12.5C2.75 5.563 5.063 3.25 12 3.25C18.937 3.25 21.25 5.563 21.25 12.5C21.25 19.437 18.937 21.75 12 21.75C5.063 21.75 2.75 19.437 2.75 12.5Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.2045 14.3999H15.2135"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.2045 10.3999H12.2135"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.19521 14.3999H9.20421"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const DocumentIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.7161 16.2234H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7161 12.0369H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.2511 7.86011H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9085 2.75C15.9085 2.75 8.23149 2.754 8.21949 2.754C5.45949 2.771 3.75049 4.587 3.75049 7.357V16.553C3.75049 19.337 5.47249 21.16 8.25649 21.16C8.25649 21.16 15.9325 21.157 15.9455 21.157C18.7055 21.14 20.4155 19.323 20.4155 16.553V7.357C20.4155 4.573 18.6925 2.75 15.9085 2.75Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const HelpIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21.25C17.109 21.25 21.25 17.109 21.25 12C21.25 6.891 17.109 2.75 12 2.75C6.891 2.75 2.75 6.891 2.75 12C2.75 17.109 6.891 21.25 12 21.25Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.9551V17.0442"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13.52C12 12.56 12.42 12.07 13.05 11.64C13.66 11.22 14.3 10.73 14.36 10.06C14.48 8.75 13.46 7.75 12.15 7.75C11.07 7.75 10.15 8.43 9.88 9.43C9.79 9.79 9.73 10.17 9.69 10.56"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const MoonIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ChevronIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <Path
        d="M1 1L7 7L1 13"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const LogoutIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.016 7.38948V6.45648C15.016 4.42148 13.366 2.77148 11.331 2.77148H6.45597C4.42197 2.77148 2.77197 4.42148 2.77197 6.45648V17.5865C2.77197 19.6215 4.42197 21.2715 6.45597 21.2715H11.341C13.37 21.2715 15.016 19.6265 15.016 17.5975V16.6545"
        stroke="#FF8A65"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.8096 12.0215H9.76855"
        stroke="#FF8A65"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.8813 9.1062L21.8093 12.0212L18.8813 14.9372"
        stroke="#FF8A65"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {user, logout} = useAuth();
  const {selectedLanguage, setSelectedLanguage} = useCurrencyLanguage();
  const {theme, toggleTheme, isDark} = useTheme();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // Empty dependency array since fetchUserProfile is stable

  // Refresh profile when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const handleNavigate = screenName => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);

      // Call logout API
      await logoutUser();

      // Call context logout
      await logout();

      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Logout error:', error);

      // Even if there's an error, still try to log out locally
      logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  // Format user name from profile data
  const getUserName = () => {
    if (!userProfile) return 'User';

    const firstName = userProfile.firstName || '';
    const lastName = userProfile.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (userProfile.email) {
      // If no name, use first part of email
      return userProfile.email.split('@')[0];
    }

    return 'User';
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (userProfile && userProfile.profileImage) {
      const image = userProfile.profileImage;

      // Try different image paths
      const imagePath =
        image.webp || image.original || image.thumbnailPath || image.path;

      if (imagePath) {
        // If path starts with http, use as is, otherwise prepend a base URL
        if (imagePath.startsWith('http')) {
          return imagePath;
        } else {
          return `https://cdn.legendmotorsglobal.com${imagePath}`;
        }
      }
    }

    // Default avatar
    return 'https://randomuser.me/api/portraits/men/32.jpg';
  };

  // Get user phone with formatting
  const getUserPhone = () => {
    if (!userProfile || !userProfile.phone) return '';

    // Add country code if available
    if (userProfile.countryCode) {
      return `+${userProfile.countryCode} ${userProfile.phone}`;
    }

    return userProfile.phone;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors[theme].background}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
            Profile & settings
          </Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Text style={[styles.logoText, {color: themeColors[theme].text}]}>
              Profile
            </Text>
            {/* <TouchableOpacity
              style={[
                styles.editIconContainer,
                {borderColor: themeColors[theme].border},
              ]}> */}
              {/* <Text
                style={[styles.editIconText, {color: themeColors[theme].text}]}>
                ···
              </Text> */}
            {/* </TouchableOpacity> */}
          </View>

          <View style={styles.profileInfoContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={{uri: getProfileImageUrl()}}
                style={styles.avatar}
              />
              <View style={styles.badgeContainer}>
                <View style={styles.badgeIcon}></View>
              </View>
            </View>

            <Text style={[styles.userName, {color: themeColors[theme].text}]}>
              {getUserName()}
            </Text>
            <Text style={styles.userPhone}>{getUserPhone()}</Text>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('EditProfileScreen')}>
                <View style={styles.menuIconContainer}>
                  <UserIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Edit Profile
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}>
                <View style={styles.menuIconContainer}>
                  <BellIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Notification
                </Text>
                <ChevronIcon />
              </TouchableOpacity>
{/* 
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}>
                <View style={styles.menuIconContainer}>
                  <InfoIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  About Us
                </Text>
                <ChevronIcon />
              </TouchableOpacity> */}

              {/* <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}>
                <View style={styles.menuIconContainer}>
                  <ShieldIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Security
                </Text>
                <ChevronIcon />
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('LanguageScreen')}>
                <View style={styles.menuIconContainer}>
                  <GlobeIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Language
                </Text>
                <View style={styles.rightContainer}>
                  <Text style={[
                    styles.languageValue, 
                    {color: isDark ? 'white' : '#7A40C6'}
                  ]}>
                    {languages.find(lang => lang.id == selectedLanguage)?.name}
                  </Text>
                  <ChevronIcon />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                <View style={styles.menuIconContainer}>
                  <DocumentIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Privacy Policy
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('HelpCenterScreen')}>
                <View style={styles.menuIconContainer}>
                  <HelpIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  Help Center
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={toggleTheme}>
                <View style={styles.menuItemLeft}>
                  <MoonIcon />
                  <Text
                    style={[
                      styles.menuItemText,
                      {color: themeColors[theme].text},
                    ]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: '#767577',
                    true: themeColors[theme].primary,
                  }}
                  thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutItem}
                onPress={() => setShowLogoutModal(true)}>
                <View style={styles.logoutIconContainer}>
                  <LogoutIcon />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -8,
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F47B20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 12,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{rotate: '-45deg'}],
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  menuContainer: {
    width: '100%',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 14,
    color: '#7A40C6',
    marginRight: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default ProfileScreen;
