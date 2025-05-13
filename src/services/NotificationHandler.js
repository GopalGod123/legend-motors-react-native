import {useEffect} from 'react';
import {Platform, Alert} from 'react-native';
import CleverTap from 'clevertap-react-native';

export default function useCleverTapNotifications() {
  useEffect(() => {
    // Set Debug Level
    CleverTap.setDebugLevel(3);

    // Register for Push Notifications (iOS)
    if (Platform.OS === 'ios') {
      CleverTap.registerForPush();
    }

    // Get CleverTap ID
    CleverTap.getCleverTapID((err, id) => {
      console.log('CleverTap ID:', id);
    });

    // Get Push Token (Firebase or APNs)

    CleverTap.onUserLogin({
      Name: 'satyam',
      Identity: '909090',
      Email: 'satyam@gmail.com',
      custom1: 20,
    });
    // Optional: Track App Launch
    CleverTap.isPushPermissionGranted((err, res) => {
      console.log('Push Permission Granted:', res);
    });
    CleverTap.recordEvent('App Launched');

    // Handle Notification Clicks
    const onNotificationClick = event => {
      const data = event.nativeEvent;
      console.log('Notification clicked:', data);

      Alert.alert('Notification Clicked', JSON.stringify(data));
    };

    CleverTap.addListener(
      CleverTap.CleverTapPushNotificationClicked,
      onNotificationClick,
    );

    return () => {
      CleverTap.removeListener(
        CleverTap.CleverTapPushNotificationClicked,
        onNotificationClick,
      );
    };
  }, []);
}
