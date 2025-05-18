import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import CleverTap from 'clevertap-react-native';
import messaging from '@react-native-firebase/messaging';
const CLEVERTAP_EVENTS = {
  ADD_TO_WISHLIST: 'Add to Wishlist',
  REMOVE_FROM_WISHLIST: 'Remove from Wishlist',
  VIEW_PRODUCT: 'View Product',
};
export default function useCleverTapDemo() {
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
      Name: user?.firstName,
      LastName: user?.lastName,
      Identity: user?.id, // Unique identity
      Email: user?.email,
    };
    CleverTap.profileSet(userProfile);
  };

  const sendEvent = (event, data) => {
    CleverTap.recordEvent(event, data);
  };
  return {
    setUpNotification,
    setUserProfileCleverTap,
    sendEvent,
  };
}
