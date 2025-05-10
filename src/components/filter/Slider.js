import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const SLIDER_HEIGHT = 330;
const THUMB_SIZE = 24;

const clamp = value => {
  'worklet';
  return Math.min(SLIDER_HEIGHT - THUMB_SIZE, Math.max(0, value));
};

const RangeSlider = () => {
  const top = useSharedValue(0); // Upper thumb
  const bottom = useSharedValue(SLIDER_HEIGHT - THUMB_SIZE); // Lower thumb

  const topGesture = Gesture.Pan().onUpdate(e => {
    let newValue = top.value + e.changeY;
    newValue = Math.min(SLIDER_HEIGHT - THUMB_SIZE, Math.max(0, newValue));
    if (newValue > bottom.value - THUMB_SIZE) {
      newValue = bottom.value - THUMB_SIZE;
    }
    top.value = newValue;
  });

  const bottomGesture = Gesture.Pan().onUpdate(e => {
    bottom.value = Math.min(
      SLIDER_HEIGHT - THUMB_SIZE,
      Math.max(0, bottom.value + e.changeY),
    );
    if (bottom.value < top.value + THUMB_SIZE) {
      bottom.value = top.value + THUMB_SIZE;
    }
  });

  const valueFromPosition = pos => {
    const maxVal = 76;
    const minVal = 20;
    const range = SLIDER_HEIGHT - THUMB_SIZE;
    const percent = 1 - pos / range;
    return Math.round(minVal + percent * (maxVal - minVal));
  };

  // Animated styles
  const topThumbStyle = useAnimatedStyle(() => ({
    top: top.value,
  }));

  const bottomThumbStyle = useAnimatedStyle(() => ({
    top: bottom.value,
  }));

  const topLabelStyle = useAnimatedStyle(() => ({
    top: top.value + THUMB_SIZE / 2 - 16,
  }));

  const bottomLabelStyle = useAnimatedStyle(() => ({
    top: bottom.value + THUMB_SIZE / 2 - 16,
  }));

  const selectedTrackStyle = useAnimatedStyle(() => ({
    top: top.value + THUMB_SIZE / 2,
    height: Math.max(bottom.value - top.value, 4),
  }));

  return (
    <View style={styles.container}>
      {/* Track background */}
      <View style={styles.track} />

      {/* Selected range track */}
      <Animated.View style={[styles.selectedTrack, selectedTrackStyle]} />

      {/* Top Thumb */}
      <GestureDetector gesture={topGesture}>
        <Animated.View style={[styles.thumb, topThumbStyle]} />
      </GestureDetector>

      {/* Bottom Thumb */}
      <GestureDetector gesture={bottomGesture}>
        <Animated.View style={[styles.thumb, bottomThumbStyle]} />
      </GestureDetector>

      {/* Top Label */}
      <Animated.View style={[styles.label, topLabelStyle]}>
        <Text style={styles.labelText}>${valueFromPosition(top.value)}K</Text>
      </Animated.View>

      {/* Bottom Label */}
      <Animated.View style={[styles.label, bottomLabelStyle]}>
        <Text style={styles.labelText}>
          ${valueFromPosition(bottom.value)}K
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SLIDER_HEIGHT,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    position: 'absolute',
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: '#ccc',
    borderRadius: 2,
    left: 12,
    zIndex: 0,
  },
  selectedTrack: {
    position: 'absolute',
    width: 4,
    left: 12,
    backgroundColor: '#d87c2f',
    borderRadius: 2,
    zIndex: 1,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d87c2f',
    zIndex: 2, // ensures it's above the track
    left: 0,
  },
  label: {
    position: 'absolute',
    left: 40, // push right of the thumb
    backgroundColor: '#d87c2f',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    minWidth: 50,
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RangeSlider;
