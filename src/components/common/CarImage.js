import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/constants';
import { getAllPossibleImageUrls } from '../../utils/apiConfig';

const CarImage = ({ source, style, resizeMode = 'cover' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const [possibleUrls, setPossibleUrls] = useState([]);
  const [currentSource, setCurrentSource] = useState(source);
  
  // Fallback image
  const fallbackImage = require('../home/car_Image.png');
  
  // Generate all possible URLs when source changes
  useEffect(() => {
    if (typeof source === 'object' && source.uri) {
      // For remote images with URIs, generate fallback URLs
      const allUrls = getAllPossibleImageUrls(source.uri.split('/').pop());
      console.log('Trying these image URLs:', allUrls);
      setPossibleUrls(allUrls);
      
      // Set the first URL to try
      if (allUrls.length > 0) {
        setCurrentSource({ uri: allUrls[0] });
      } else {
        setCurrentSource(source);
      }
    } else {
      // For local resources (numbers), just use as is
      setCurrentSource(source);
      setPossibleUrls([]);
    }
    
    setUrlIndex(0);
    setError(false);
    setLoading(true);
  }, [source]);
  
  const handleLoadStart = () => {
    setLoading(true);
  };
  
  const handleLoadEnd = () => {
    setLoading(false);
  };
  
  const handleError = (e) => {
    console.log('Image load error:', e.nativeEvent?.error || 'Unknown error');
    console.log('Failed image URI:', currentSource?.uri);
    
    // Try the next URL in our list if available
    const nextIndex = urlIndex + 1;
    if (possibleUrls.length > 0 && nextIndex < possibleUrls.length) {
      console.log(`Trying alternative URL (${nextIndex + 1}/${possibleUrls.length}):`, possibleUrls[nextIndex]);
      setUrlIndex(nextIndex);
      setCurrentSource({ uri: possibleUrls[nextIndex] });
      setLoading(true);
    } else {
      // If we've tried all URLs and none worked, show the fallback
      console.log('All image URLs failed, using fallback');
      setError(true);
      setLoading(false);
    }
  };
  
  // If source is a number (local resource) or has no URI property
  if (typeof currentSource === 'number' || !currentSource?.uri) {
    return (
      <Image 
        source={typeof currentSource === 'number' ? currentSource : fallbackImage}
        style={style}
        resizeMode={resizeMode}
      />
    );
  }
  
  return (
    <View style={style}>
      <Image 
        source={error ? fallbackImage : currentSource}
        style={[styles.image, { opacity: error ? 0.7 : 1 }]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoad={() => setLoading(false)}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        defaultSource={fallbackImage}
      />
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
  }
});

export default CarImage; 