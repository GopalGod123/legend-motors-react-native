import {Platform, PermissionsAndroid} from 'react-native';
import CleverTap from 'clevertap-react-native';
import messaging from '@react-native-firebase/messaging';
export const CLEVERTAP_EVENTS = {
  WELCOME: 'welcome',
  WELCOME_BACK: 'welcome_back',
  VIEW_CAR: 'view_car',
  VIEW_CAR_DETAILS: 'view_car_details',
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
  VIEW_CAR_ENQUIRY: 'view_car_enquiry',
  INQUIRE_CAR: 'inquiry_car',
};
export default function useCleverTap() {
  const setUpNotification = () => {
    // Enable CleverTap debug logs
    CleverTap.setDebugLevel(3);

    // Prompt for push permission (iOS)
    CleverTap.promptForPushPermission(true);

    // Request POST_NOTIFICATIONS permission for Android 13+
    async function requestNotificationPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        console.log(
          'Notification permission granted:',
          granted === PermissionsAndroid.RESULTS.GRANTED,
        );
      }
    }

    requestNotificationPermission();

    // Register for Push (iOS only)
    if (Platform.OS === 'ios') {
      CleverTap.registerForPush();
    }

    // Get CleverTap ID (debugging)
    CleverTap.getCleverTapID((err, id) => {
      console.log('CleverTap ID:', id);
    });

    CleverTap.createNotificationChannel(
      'legend-motors', // Channel ID
      'General Notifications', // Name
      'General notifications from the app', // Description
      4, // Importance (1-5)
      true, // Show Badge
    );
    // console.log('Sending user profile to CleverTap:', userProfile);

    // Push profile to CleverTap

    // ✅ Get FCM Token & Push it to CleverTap
    async function getFCMToken() {
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      if (fcmToken) {
        CleverTap.setFCMPushToken(fcmToken);
        console.log('Push token sent to CleverTap');
      }
    }

    getFCMToken();
  };
  const setUserProfileCleverTap = user => {
    const userProfile = {
      FirstName: user?.firstName,
      LastName: user?.lastName,
      Phone: user?.phone,
      Identity: user?.id, // Unique identity
      Email: user?.email,
    };
    CleverTap.profileSet(userProfile);
  };

  const sendEventCleverTap = (event, data = {}) => {
    CleverTap.recordEvent(event, data);
  };
  return {
    setUpNotification,
    setUserProfileCleverTap,
    sendEventCleverTap,
  };
}
