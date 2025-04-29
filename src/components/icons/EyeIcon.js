import React from 'react';
import Svg, { Path } from 'react-native-svg';

const EyeIcon = ({ isOpen = false, color = '#666666', size = 20 }) => {
  if (isOpen) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10 4.167c-4.167 0-7.5 3.333-7.5 5.833s3.333 5.833 7.5 5.833 7.5-3.333 7.5-5.833-3.333-5.833-7.5-5.833z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 4.167c-4.167 0-7.5 3.333-7.5 5.833s3.333 5.833 7.5 5.833 7.5-3.333 7.5-5.833-3.333-5.833-7.5-5.833z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.333 16.667L16.667 3.333"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default EyeIcon; 