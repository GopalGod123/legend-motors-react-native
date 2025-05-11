import React from 'react';
import {useTheme} from '../../context/ThemeContext';

export const withTheme = IconComponent => {
  return ({color, ...props}) => {
    const {theme, isDark} = useTheme();
    const defaultColor = isDark ? '#666666' : '#8E8E8E';
    return <IconComponent color={color || defaultColor} {...props} />;
  };
};
