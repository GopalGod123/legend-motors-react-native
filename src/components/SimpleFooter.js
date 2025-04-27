import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HomeIcon, EnquiriesIcon, ExploreIcon, NewsIcon, ProfileIcon } from './icons/FooterIcons';

const SimpleFooter = ({ activeTab = 'Home', onTabPress }) => {
  const getIcon = (id, isActive) => {
    const color = isActive ? '#F47B20' : '#8E8E8E';
    const size = 24;
    
    switch (id) {
      case 'Home':
        return <HomeIcon size={size} color={color} />;
      case 'Enquiries':
        return <EnquiriesIcon size={size} color={color} />;
      case 'Explore':
        return <ExploreIcon size={size} color={color} />;
      case 'News':
        return <NewsIcon size={size} color={color} />;
      case 'Profile':
        return <ProfileIcon size={size} color={color} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'Home', label: 'Home' },
    { id: 'Enquiries', label: 'Enquiries' },
    { id: 'Explore', label: 'Explore' },
    { id: 'News', label: 'News/Blogs' },
    { id: 'Profile', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => onTabPress && onTabPress(tab.id)}
          >
            <View style={styles.iconContainer}>
              {getIcon(tab.id, isActive)}
            </View>
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.activeTabLabel
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E8E',
  },
  activeTabLabel: {
    color: '#F47B20',
    fontWeight: 'bold',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: 4,
    backgroundColor: '#F47B20',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default SimpleFooter; 