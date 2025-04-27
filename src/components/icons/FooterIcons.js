import React from 'react';
import { View, StyleSheet } from 'react-native';

export const HomeIcon = ({ size = 24, color = '#8E8E8E' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.house, { borderColor: color }]}>
      <View style={[styles.roof, { borderBottomColor: color }]} />
      <View style={[styles.door, { backgroundColor: color }]} />
    </View>
  </View>
);

export const EnquiriesIcon = ({ size = 24, color = '#8E8E8E' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.document, { borderColor: color }]}>
      <View style={[styles.line, { backgroundColor: color, top: size * 0.2 }]} />
      <View style={[styles.line, { backgroundColor: color, top: size * 0.4 }]} />
      <View style={[styles.line, { backgroundColor: color, top: size * 0.6 }]} />
      <View style={[styles.magnifier, { borderColor: color, right: -size * 0.25, bottom: -size * 0.1 }]}>
        <View style={[styles.handle, { backgroundColor: color }]} />
      </View>
    </View>
  </View>
);

export const ExploreIcon = ({ size = 24, color = '#8E8E8E' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.circle, { borderColor: color }]}>
      <View style={[styles.pupil, { backgroundColor: color }]} />
    </View>
  </View>
);

export const NewsIcon = ({ size = 24, color = '#8E8E8E' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.newspaper, { borderColor: color }]}>
      <View style={[styles.headline, { backgroundColor: color, top: size * 0.2 }]} />
      <View style={[styles.headline, { backgroundColor: color, top: size * 0.4, width: '60%' }]} />
      <View style={[styles.headline, { backgroundColor: color, top: size * 0.6 }]} />
    </View>
  </View>
);

export const ProfileIcon = ({ size = 24, color = '#8E8E8E' }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View style={[styles.head, { borderColor: color }]} />
    <View style={[styles.body, { borderColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Home icon styles
  house: {
    width: '80%',
    height: '70%',
    borderWidth: 1.5,
    borderRadius: 2,
    position: 'relative',
    top: '15%',
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: -8,
    left: '30%',
  },
  door: {
    width: '30%',
    height: '40%',
    position: 'absolute',
    bottom: 0,
    left: '35%',
  },
  
  // Enquiries icon styles
  document: {
    width: '70%',
    height: '85%',
    borderWidth: 1.5,
    borderRadius: 3,
    position: 'relative',
  },
  line: {
    width: '70%',
    height: 1.5,
    position: 'absolute',
    left: '15%',
  },
  magnifier: {
    width: '40%',
    height: '40%',
    borderWidth: 1.5,
    borderRadius: 8,
    position: 'absolute',
  },
  handle: {
    width: '50%',
    height: 1.5,
    position: 'absolute',
    bottom: -5,
    right: -5,
    transform: [{ rotate: '45deg' }],
  },
  
  // Explore icon styles
  circle: {
    width: '90%',
    height: '90%',
    borderWidth: 1.5,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: '40%',
    height: '40%',
    borderRadius: 100,
  },
  
  // News icon styles
  newspaper: {
    width: '85%',
    height: '85%',
    borderWidth: 1.5,
    borderRadius: 3,
    position: 'relative',
  },
  headline: {
    width: '80%',
    height: 2,
    position: 'absolute',
    left: '10%',
  },
  
  // Profile icon styles
  head: {
    width: '45%',
    height: '45%',
    borderWidth: 1.5,
    borderRadius: 100,
    marginBottom: 2,
  },
  body: {
    width: '60%',
    height: '40%',
    borderTopWidth: 0,
    borderWidth: 1.5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default {
  HomeIcon,
  EnquiriesIcon,
  ExploreIcon,
  NewsIcon,
  ProfileIcon,
}; 