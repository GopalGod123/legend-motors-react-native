import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Dimensions} from 'react-native';
import RnRangeSlider from 'rn-range-slider';
import Slider from './Slider';
const renderThumb = () => {
  return <View style={styles.thumb} />;
};
const renderRail = () => {
  return <View style={styles.rail} />;
};
const renderRailSelected = () => {
  return <View style={styles.railSelected} />;
};
const renderLabel = () => {
  return <View style={styles.label} />;
};

const PriceRangeSelector = () => {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(700);

  return (
    <View style={styles.container}>
      {/* Price Range Display */}
      <View style={styles.rangeBox}>
        <Text style={styles.label}>Price Range</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={`$ ${minValue}K`}
            editable={false}
          />
          <Text style={styles.to}> - </Text>
          <TextInput
            style={styles.input}
            value={`$ ${maxValue}K`}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.sliderContainer}>
        {/* <Text style={styles.priceLabel}>Maximum Price</Text> */}
        <View style={styles.sliderWrapper}>
          <Slider />
        </View>
        {/* <Text style={styles.priceLabel}>Minimum Price</Text> */}
      </View>
    </View>
  );
};

const {height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  rangeBox: {
    padding: 10,
    marginBottom: 20,
    width: 220,
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FCEED4',
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: 'center',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#EAE3D8',
  },
  to: {
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderContainer: {
    alignItems: 'center',
    height: height * 0.5,
    justifyContent: 'space-between',
  },
  sliderWrapper: {
    // width: height * 0.4,
    // backgroundColor: 'red',
    // height: height * 0.4,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    // transform: [{rotate: '-90deg'}],
  },

  priceLabel: {
    fontWeight: '600',
    marginVertical: 10,
  },
  sliderValueTop: {
    backgroundColor: '#E38A35',
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderValueBottom: {
    backgroundColor: '#E38A35',
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginTop: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#E38A35',
    borderRadius: 10,
  },
  rail: {
    backgroundColor: '#ccc',
    height: 5,
  },
  railSelected: {
    backgroundColor: '#E38A35',
    height: 5,
  },
  label1: {
    backgroundColor: '#E38A35',
    color: 'white',
    padding: 8,
    borderRadius: 8,
  },
  slider: {
    width: 270,
    height: 20,
    // backgroundColor: 'red',
    // transform: [{rotate: '-90deg'}, {translateX: -150}],
  },
});
export default PriceRangeSelector;
