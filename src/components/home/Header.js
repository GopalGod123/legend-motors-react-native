import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ImagePlaceholder } from '../common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

const Header = ({ userName = 'User', onSettingsPress }) => {
  const [activeCurrency, setActiveCurrency] = useState('AED');

  const toggleCurrency = (currency) => {
    setActiveCurrency(currency);
  };

  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <ImagePlaceholder style={styles.profileImage} color="#ccd" />
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Good Morning</Text>
          <Text style={styles.nameText}>{userName}!</Text>
        </View>
      </View>
      
      <View style={styles.headerControls}>
        <View style={styles.currencyToggle}>
          <TouchableOpacity 
            style={[
              styles.currencyButton, 
              activeCurrency === 'AED' && styles.activeCurrencyButton
            ]}
            onPress={() => toggleCurrency('AED')}
          >
            <Text 
              style={[
                styles.currencyText, 
                activeCurrency === 'AED' ? styles.activeText : styles.inactiveText
              ]}
            >
              AED
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.currencyButton, 
              activeCurrency === 'USD' && styles.activeCurrencyButton
            ]}
            onPress={() => toggleCurrency('USD')}
          >
            <Text 
              style={[
                styles.currencyText, 
                activeCurrency === 'USD' ? styles.activeText : styles.inactiveText
              ]}
            >
              USD
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onSettingsPress}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingSection: {
    marginLeft: SPACING.md,
  },
  greetingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  nameText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 0,
    elevation: 1,
  },
  currencyButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    minWidth: 45,
    alignItems: 'center',
  },
  activeCurrencyButton: {
    backgroundColor: COLORS.currency,
  },
  currencyText: {
    fontWeight: '500',
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  activeText: {
    color: COLORS.white,
  },
  inactiveText: {
    color: '#5E366D',
  },
  iconButton: {
    marginLeft: SPACING.md,
  },
  bellIcon: {
    fontSize: FONT_SIZES.xl,
  },
  settingsIcon: {
    fontSize: FONT_SIZES.xl,
  },
});

export default Header; 