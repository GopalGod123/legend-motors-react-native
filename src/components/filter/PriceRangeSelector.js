import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Dimensions} from 'react-native';
import Slider from './Slider';
import {useTheme} from '../../context/ThemeContext';
import {COLORS} from 'src/utils/constants';

const PriceRangeSelector = ({onSelectItem}) => {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(700);
  const {isDark} = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Price Range Display */}
      <View style={[styles.rangeBox, isDark && styles.rangeBoxDark]}>
        <Text style={[styles.label, isDark && styles.labelDark]}>
          Price Range
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={`$ ${minValue}K`}
            editable={false}
          />
          <Text style={[styles.to, isDark && styles.toDark]}> - </Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={`$ ${maxValue}K`}
            editable={false}
          />
        </View>
      </View>

      <View
        style={[styles.sliderContainer, isDark && styles.sliderContainerDark]}>
        <View style={styles.sliderWrapper}>
          <Slider
            min={0}
            max={700}
            onChange={({min, max}) => {
              setMinValue(min);
              setMaxValue(max);
              onSelectItem({min, max});
            }}
          />
        </View>
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
  containerDark: {
    backgroundColor: '#1A1A1A',
  },
  rangeBox: {
    padding: 10,
    marginBottom: 20,
    width: 220,
  },
  rangeBoxDark: {
    backgroundColor: '#1A1A1A',
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333333',
  },
  labelDark: {
    color: '#FFFFFF',
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
    color: '#333333',
  },
  inputDark: {
    backgroundColor: '#3D3D3D',
    borderColor: '#4D4D4D',
    color: '#FFFFFF',
  },
  to: {
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  toDark: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    alignItems: 'center',
    height: height * 0.5,
    justifyContent: 'space-between',
  },
  sliderContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  sliderWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  priceLabel: {
    fontWeight: '600',
    marginVertical: 10,
  },
  sliderValueTop: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderValueBottom: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    marginTop: 10,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  rail: {
    backgroundColor: '#ccc',
    height: 5,
  },
  railSelected: {
    backgroundColor: COLORS.primary,
    height: 5,
  },
  label1: {
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: 8,
    borderRadius: 8,
  },
  slider: {
    width: 270,
    height: 20,
  },
});
export default PriceRangeSelector;
