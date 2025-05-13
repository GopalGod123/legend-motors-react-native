import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ListSearchIcon,
  EyeIcon,
  BlogIcon,
  ProfileIcon,
} from '../components/icons';
import {useTheme, themeColors} from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewsBlogsScreen from '../screens/NewsBlogsScreen';
import EnquiriesScreen from '../screens/EnquiriesScreen';

const Tab = createBottomTabNavigator();

const CustomLabel = ({focused, color, label}) => {
  const isNewsBlogs = label === 'News/Blogs';
  return (
    <Text
      style={[
        styles.tabBarLabel,
        {
          color,
          fontSize: isNewsBlogs ? 10 : 12,
        },
      ]}>
      {label}
    </Text>
  );
};

const BottomTabNavigator = () => {
  const {theme, isDark} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F47B20',
        tabBarInactiveTintColor: isDark ? '#666666' : '#8E8E8E',
        tabBarStyle: {
          backgroundColor: themeColors[theme].background,
          height: 70 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: themeColors[theme].border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabel: ({focused, color, label}) => (
          <CustomLabel focused={focused} color={color} label={label} />
        ),
        tabBarItemStyle: {
          padding: 5,
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EnquiriesTab"
        component={EnquiriesScreen}
        options={{
          tabBarLabel: 'Inquiries',
          tabBarIcon: ({color, size}) => (
            <ListSearchIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({color, size}) => (
            <EyeIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewsTab"
        component={NewsBlogsScreen}
        options={{
          tabBarLabel: 'News/Blogs',
          tabBarIcon: ({color, size}) => (
            <BlogIcon width={size} height={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <ProfileIcon width={size} height={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
});

export default BottomTabNavigator;
