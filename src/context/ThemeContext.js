// ThemeContext.js
import React, {createContext, useState, useEffect, useContext} from 'react';
import {Appearance} from 'react-native';

import {
  BORDER_RADIUS,
  COLORS,
  darkColors,
  FONT_SIZES,
  SPACING,
} from 'src/utils/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  const theme = {
    isDark,
    COLORS1: isDark ? darkColors : COLORS,
    SPACING,
    FONT_SIZES,
    BORDER_RADIUS,
    toggleTheme: () => setIsDark(!isDark),
  };

  useEffect(() => {
    const sub = Appearance.addChangeListener(({colorScheme}) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
