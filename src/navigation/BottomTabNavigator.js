import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../utils/constants';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';

// Placeholder components for other tabs
const EnquiriesScreen = () => (
  <View style={styles.placeholder}>
    <Text>Enquiries Screen</Text>
  </View>
);

const NewsScreen = () => (
  <View style={styles.placeholder}>
    <Text>News/Blogs Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholder}>
    <Text>Profile Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#CCCCCC',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color }]}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="EnquiriesTab" 
        component={EnquiriesScreen} 
        options={{
          tabBarLabel: 'Enquiries',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color }]}>📋</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreScreen} 
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color: color === COLORS.primary ? COLORS.primary : color }]}>👁️</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="NewsTab" 
        component={NewsScreen} 
        options={{
          tabBarLabel: 'News/Blogs',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color }]}>📰</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.icon, { color }]}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomTabNavigator; 