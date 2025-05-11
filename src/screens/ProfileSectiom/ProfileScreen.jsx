import React, {useState, useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Alert, Switch } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LogoutModal from '../../components/LogoutModal';
import {getUserProfile, logoutUser} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import {useTheme} from 'src/context/ThemeContext';
import {EyeIcon} from 'src/components/icons';
import makeStyles from './profileScreenStyle';
import { BellIcon, ChevronIcon, DocumentIcon, GlobeIcon, HelpIcon, InfoIcon, LogoutIcon, ShieldIcon, UserIcon } from './components/ProfileIcons';
import LogoImage from '../../assets/images/forgot-logo.png';
import Icon from 'react-native-vector-icons/MaterialIcons';


const ProfileScreen = () => {
  const navigation = useNavigation();
   const {user, logout} = useAuth();
  const {isDark, COLORS1, toggleTheme, THEME_COLORS} = useTheme();

  const styles = makeStyles({ THEME_COLORS, isDark })
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await getUserProfile();

      if (response.success && response.data) {
        console.log('Profile data received:', response.data);
        setProfileData(response.data);
      } else {
        if (user) {
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);

      if (user) {
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      }

      if (error.message && error.message.includes('Authentication error')) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
              },
            },
          ],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = screenName => {
    navigation.navigate(screenName);
  };

  const handleLogout = async () => {
    try {
      setLogoutModalVisible(false);
      await logoutUser();
      await logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  const getUserName = () => {
    if (!profileData) return 'User';

    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (profileData.email) {
      return profileData.email.split('@')[0];
    }

    return 'User';
  };

  const getProfileImageUrl = () => {
    if (profileData && profileData.profileImage) {
      const image = profileData.profileImage;

      const imagePath =
        image.webp || image.original || image.thumbnailPath || image.path;

      if (imagePath) {
        if (imagePath.startsWith('http')) {
          return imagePath;
        } else {
          return `https://cdn.legendmotorsglobal.com${imagePath}`;
        }
      }
    }

    return 'https://randomuser.me/api/portraits/men/32.jpg';
  };

  const getUserPhone = () => {
    if (!profileData || !profileData.phone) return '';

    if (profileData.countryCode) {
      return `+${profileData.countryCode} ${profileData.phone}`;
    }

    return profileData.phone;
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: COLORS1?.background}]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: COLORS1?.textDark}]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
           <View style={styles.profileSubHeader}> 
            <Image source={LogoImage} style={styles.logo} />
            <Text style={styles.logoText}>Profile</Text>
            </View>
            <TouchableOpacity style={styles.editIconContainer}>
              <Icon name="more-horiz" size={24} color={isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.TEXT_DARK} />
            </TouchableOpacity>
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

            <Text style={[styles.userName, {color: COLORS1?.textDark}]}>
              {getUserName()}
            </Text>
            <Text style={[styles.userPhone, {color: COLORS1?.textDark}]}>
              {getUserPhone()}
            </Text>

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('EditProfileScreen')}>
                <View style={styles.menuIconContainer}>
                  <UserIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Edit Profile
                </Text>
                <ChevronIcon color={COLORS1?.textDark} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <BellIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Notification
                </Text>
                <ChevronIcon color={COLORS1?.textDark} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <InfoIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  About Us
                </Text>
                <ChevronIcon color={COLORS1?.textDark} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <ShieldIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Security
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('LanguageScreen')}>
                <View style={styles.menuIconContainer}>
                  <GlobeIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Language
                </Text>
                <View style={styles.rightContainer}>
                  <Text
                    style={[styles.languageValue, {color: COLORS1?.language}]}>
                    English (US)
                  </Text>
                  <ChevronIcon color={COLORS1?.textDark} />
                </View>
              </TouchableOpacity>
              <View style={styles.toggleContainer}>
                <View style={styles.leftContainer}>
                  <EyeIcon color={COLORS1?.textDark} />
                  <Text style={[styles.toggleLabel, {color: COLORS1.textDark}]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  trackColor={{false: '#767577', true: '#000000'}}
                  thumbColor={isDark ? '#3e3e3e' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleTheme}
                  value={isDark}
                  style={{transform: [{scaleX: 1.1}, {scaleY: 1}]}}
                />
              </View>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <DocumentIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Privacy Policy
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigate('HelpCenterScreen')}>
                <View style={styles.menuIconContainer}>
                  <HelpIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.menuText, {color: COLORS1?.textDark}]}>
                  Help Center
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutItem}
                onPress={() => setLogoutModalVisible(true)}>
                <View style={styles.logoutIconContainer}>
                  <LogoutIcon color={COLORS1?.textDark} />
                </View>
                <Text style={[styles.logoutText, {color: COLORS1?.logOut}]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <LogoutModal
        visible={logoutModalVisible}
        COLORS1={COLORS1}
        onCancel={() => setLogoutModalVisible(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
