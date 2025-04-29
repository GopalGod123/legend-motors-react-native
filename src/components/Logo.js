import React from 'react';
import Svg, { Path, Text } from 'react-native-svg';

const Logo = ({ width = 150, height = 60 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 150 60">
      <Path
        d="M30 10H10V50H30V10Z"
        fill="#4A235A"
      />
      <Path
        d="M50 10H30V30H50V10Z"
        fill="#F4821F"
      />
      <Text
        x="60"
        y="35"
        fontSize="24"
        fontWeight="bold"
        fill="#333333"
        fontFamily="Arial"
      >
        Legend
      </Text>
      <Text
        x="60"
        y="50"
        fontSize="12"
        fill="#F4821F"
        fontFamily="Arial"
      >
        MOTORS
      </Text>
    </Svg>
  );
};

export default Logo; 