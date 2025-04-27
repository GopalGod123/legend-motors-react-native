import React from 'react';
import { View, StyleSheet } from 'react-native';

// This component creates a colored placeholder that can be used instead of actual images
// during development
const ImagePlaceholder = ({ style, color = '#ddd' }) => {
  return (
    <View style={[styles.placeholder, { backgroundColor: color }, style]} />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#ddd',
  },
});

export default ImagePlaceholder; 