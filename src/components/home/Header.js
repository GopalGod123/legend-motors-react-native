import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ImagePlaceholder } from '../common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ user, onSettingsPress, onWishlistPress }) => {
  const [activeCurrency, setActiveCurrency] = useState('AED');

  // Get firstName from user object or use default
  const getFirstName = () => {
    if (!user) return 'User';
    
    let name = user.firstName || 'User';
    
    // If the firstName looks like an email address, extract just the first part
    if (name.includes('@')) {
      // Extract part before @ symbol
      name = name.split('@')[0];
    }
    
    // If the name contains dots (like "gopal.khandelwal"), take only the first part
    if (name.includes('.')) {
      name = name.split('.')[0];
    }
    
    // Capitalize the first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const toggleCurrency = (currency) => {
    setActiveCurrency(currency);
  };

  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <ImagePlaceholder style={styles.profileImage} color="#ccd" />
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Good Morning</Text>
          <Text style={styles.nameText}>{getFirstName()}!</Text>
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
          <Ionicons name="notifications" size={28} color="#5E366D" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={onWishlistPress}
        >
          <Ionicons name="heart" size={28} color="#5E366D" />
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
    paddingHorizontal: 23,
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
});

export default Header; 