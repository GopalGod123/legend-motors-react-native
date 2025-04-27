import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HatchbackIcon = ({ width = 70, height = 50, color = '#333' }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 70 50">
      <Path
        d="M10,35 H15 V40 H10 Z M55,35 H60 V40 H55 Z M5,25 C5,25 10,15 20,15 H35 C35,15 40,15 45,20 L55,20 C55,20 65,20 65,30 C65,30 65,33 63,35 H7 C7,35 5,33 5,30 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M20,15 L20,8 L50,8 L50,20"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};

export default HatchbackIcon; 