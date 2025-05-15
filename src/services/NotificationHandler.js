import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import CleverTap from 'clevertap-react-native';
import messaging from '@react-native-firebase/messaging';

export default function useCleverTapDemo() {
  useEffect(() => {
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

    // 👉 Send Unique User Profile
    const userProfile = {
      Name: 'TestUser_' + Math.floor(Math.random() * 1000),
      Identity: 'user_' + Math.floor(Math.random() * 100000), // Unique identity
      Email: 'testuser_' + Math.floor(Math.random() * 1000) + '@example.com',
      Phone: '+91123456789' + Math.floor(Math.random() * 10),
      custom1: 'DemoTest',
    };
    CleverTap.createNotificationChannel(
      'sat-test', // Channel ID
      'General Notifications', // Name
      'General notifications from the app', // Description
      4, // Importance (1-5)
      true, // Show Badge
    );
    console.log('Sending user profile to CleverTap:', userProfile);

    // Push profile to CleverTap
    CleverTap.onUserLogin(userProfile);

    // ✅ Get FCM Token & Push it to CleverTap
    async function getFCMToken() {
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      if (fcmToken) {
        CleverTap.setPushToken(fcmToken);
        console.log('Push token sent to CleverTap');
      }
    }

    getFCMToken();

    // Optional: Record an event
    CleverTap.recordEvent('Demo_User_Login', {method: 'ReactNativeTest'});
  }, []);
}
