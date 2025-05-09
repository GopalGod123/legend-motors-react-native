import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ListSearchIcon,
  EyeIcon,
  BlogIcon,
  ProfileIcon,
} from '../components/icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewsBlogsScreen from '../screens/NewsBlogsScreen';
import EnquiriesScreen from '../screens/EnquiriesScreen';
import {useTheme} from 'src/context/ThemeContext';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  console.log('bottam tab');
  const {COLORS1} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F47B20',
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarStyle: {
          backgroundColor: COLORS1?.background,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
          marginTop: 2,
        },
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
          tabBarLabel: 'Enquiries',
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
});

export default BottomTabNavigator;
