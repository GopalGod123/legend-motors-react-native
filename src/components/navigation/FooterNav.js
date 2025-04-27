import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const FooterNav = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'Home' && styles.activeTab]} 
        onPress={() => handleTabPress('Home')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={activeTab === 'Home' ? '#FF8C00' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'Home' && styles.activeText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'Enquiries' && styles.activeTab]} 
        onPress={() => handleTabPress('Enquiries')}
      >
        <MaterialIcons 
          name="question-answer" 
          size={24} 
          color={activeTab === 'Enquiries' ? '#FF8C00' : '#666'}
        />
        <Text style={[styles.tabText, activeTab === 'Enquiries' && styles.activeText]}>Enquiries</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'Explore' && styles.activeTab]} 
        onPress={() => handleTabPress('Explore')}
      >
        <Ionicons 
          name="search" 
          size={24} 
          color={activeTab === 'Explore' ? '#FF8C00' : '#666'}
        />
        <Text style={[styles.tabText, activeTab === 'Explore' && styles.activeText]}>Explore</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'News/Blogs' && styles.activeTab]} 
        onPress={() => handleTabPress('News/Blogs')}
      >
        <MaterialIcons 
          name="article" 
          size={24} 
          color={activeTab === 'News/Blogs' ? '#FF8C00' : '#666'}
        />
        <Text style={[styles.tabText, activeTab === 'News/Blogs' && styles.activeText]}>News/Blogs</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, activeTab === 'Profile' && styles.activeTab]} 
        onPress={() => handleTabPress('Profile')}
      >
        <FontAwesome 
          name="user" 
          size={24} 
          color={activeTab === 'Profile' ? '#FF8C00' : '#666'}
        />
        <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 60,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#FF8C00',
  },
  tabText: {
    fontSize: 10,
    marginTop: 3,
    color: '#666',
  },
  activeText: {
    color: '#FF8C00',
    fontWeight: '500',
  },
});

export default FooterNav; 