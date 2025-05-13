import React from 'react';
import {View, StyleSheet, Text, Dimensions, Platform} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import {COLORS} from 'src/utils/constants';

const SLIDER_HEIGHT =
  Platform.OS == 'android'
    ? Dimensions.get('window').height * 0.55
    : Dimensions.get('window').height * 0.4;
const HANDLE_SIZE = 30;
const DAMPING = 0.3; // Adjust this to make thumb slower (0.2 slower, 0.5 faster)

const VerticalRangeSlider = ({min = 0, max = 100, onChange}) => {
  const lowerThumbY = useSharedValue(SLIDER_HEIGHT - HANDLE_SIZE);
  const upperThumbY = useSharedValue(0);

  const clamp = (value, minValue, maxValue) => {
    'worklet';
    return Math.min(Math.max(value, minValue), maxValue);
  };

  const updateRange = () => {
    'worklet';
    const range = max - min;

    const lowerValue = Math.round(
      min +
        ((SLIDER_HEIGHT - HANDLE_SIZE - lowerThumbY.value) /
          (SLIDER_HEIGHT - HANDLE_SIZE)) *
          range,
    );

    const upperValue = Math.round(
      min +
        ((SLIDER_HEIGHT - HANDLE_SIZE - upperThumbY.value) /
          (SLIDER_HEIGHT - HANDLE_SIZE)) *
          range,
    );

    if (onChange) runOnJS(onChange)({min: lowerValue, max: upperValue});
  };

  const lowerGesture = Gesture.Pan().onUpdate(e => {
    const newY = lowerThumbY.value + e.translationY * DAMPING;
    lowerThumbY.value = clamp(
      newY,
      upperThumbY.value + HANDLE_SIZE,
      SLIDER_HEIGHT - HANDLE_SIZE,
    );
    updateRange();
  });

  const upperGesture = Gesture.Pan().onUpdate(e => {
    const newY = upperThumbY.value + e.translationY * DAMPING;
    upperThumbY.value = clamp(newY, 0, lowerThumbY.value - HANDLE_SIZE);
    updateRange();
  });

  const lowerThumbStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: lowerThumbY.value,
  }));

  const upperThumbStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: upperThumbY.value,
  }));

  const selectedRangeStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: upperThumbY.value + HANDLE_SIZE / 2,
    height: lowerThumbY.value - upperThumbY.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <View style={styles.track} />

        <Animated.View style={[styles.selectedRange, selectedRangeStyle]} />

        <GestureDetector gesture={upperGesture}>
          <Animated.View style={[styles.thumb, upperThumbStyle]}>
            {/* <Text style={styles.thumbLabel}>▲</Text> */}
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={lowerGesture}>
          <Animated.View style={[styles.thumb, lowerThumbStyle]}>
            {/* <Text style={styles.thumbLabel}>▼</Text> */}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  sliderContainer: {
    width: 60,
    height: SLIDER_HEIGHT,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    width: 10,
    height: '100%',
    left: 25,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedRange: {
    width: 10,
    left: 25,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  thumb: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    left: 15,
  },
  thumbLabel: {
    color: 'white',
    fontSize: 12,
  },
});

export default VerticalRangeSlider;
