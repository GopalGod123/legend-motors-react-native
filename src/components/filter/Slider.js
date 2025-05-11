import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import RangeSlider from 'rn-range-slider';

const SLIDER_HEIGHT = 330;
const THUMB_SIZE = 24;

const RangeSliderComponent = () => {
  const [lowValue, setLowValue] = useState(20);
  const [highValue, setHighValue] = useState(76);

  const renderThumb = useCallback(() => {
    return <View style={styles.thumb} />;
  }, []);

  const renderRail = useCallback(() => {
    return <View style={styles.rail} />;
  }, []);

  const renderRailSelected = useCallback(() => {
    return <View style={styles.railSelected} />;
  }, []);

  const renderLabel = useCallback(value => {
    return (
      <View style={styles.label}>
        <Text style={styles.labelText}>${value}K</Text>
      </View>
    );
  }, []);

  const handleValueChange = useCallback((low, high) => {
    setLowValue(low);
    setHighValue(high);
  }, []);

  return (
    <View style={styles.container}>
      <RangeSlider
        style={styles.slider}
        min={20}
        max={76}
        step={1}
        floatingLabel
        vertical
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={renderLabel}
        onValueChanged={handleValueChange}
      />
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
  slider: {
    height: SLIDER_HEIGHT,
    width: 40,
  },
  rail: {
    width: 4,
    height: '100%',
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  railSelected: {
    width: 4,
    backgroundColor: '#d87c2f',
    borderRadius: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d87c2f',
  },
  label: {
    backgroundColor: '#d87c2f',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 50,
  },
  labelText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RangeSliderComponent;
