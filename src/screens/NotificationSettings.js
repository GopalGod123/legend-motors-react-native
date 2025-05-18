import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
} from 'react-native';
import {Ionicons} from '../utils/icon';
import {useNavigation} from '@react-navigation/native';
import {useTheme, themeColors} from '../context/ThemeContext';

const NotificationSettings = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const [generalNotifications, setGeneralNotifications] = React.useState(true);
  const [appUpdates, setAppUpdates] = React.useState(true);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: themeColors[theme].background},
      ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeColors[theme].text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerText, {color: themeColors[theme].text}]}>
          Notification
        </Text>
      </View>
      <View
        style={[styles.settingRow, {backgroundColor: themeColors[theme].card}]}>
        <Text style={[styles.settingLabel, {color: themeColors[theme].text}]}>
          General Notifications
        </Text>
        <Switch
          value={generalNotifications}
          onValueChange={setGeneralNotifications}
          trackColor={{
            false: isDark ? '#444' : '#ddd',
            true: themeColors[theme].primary,
          }}
          thumbColor={generalNotifications ? '#fff' : '#fff'}
        />
      </View>
      <View
        style={[styles.settingRow, {backgroundColor: themeColors[theme].card}]}>
        <Text style={[styles.settingLabel, {color: themeColors[theme].text}]}>
          App Updates
        </Text>
        <Switch
          value={appUpdates}
          onValueChange={setAppUpdates}
          trackColor={{
            false: isDark ? '#444' : '#ddd',
            true: themeColors[theme].primary,
          }}
          thumbColor={appUpdates ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#222',
  },
});

export default NotificationSettings;
