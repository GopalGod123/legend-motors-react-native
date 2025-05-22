import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  COLORS,
} from '../../utils/constants';
import {useTheme} from '../../context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';

const EmptyState = ({onClearFilters, brandName}) => {
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();

  const message = brandName
    ? t('emptyState.noCarsForBrand', {brandName})
    : t('emptyState.noCarsMatchFilters');

  return (
    <View
      style={[
        styles.emptyContainer,
        {backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF'},
      ]}>
      <Text
        style={[styles.emptyTitle, {color: isDark ? '#FFFFFF' : '#000000'}]}>
        {t('emptyState.noCarsFound')}
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          {color: isDark ? '#CCCCCC' : '#757575'},
        ]}>
        {message} {t('emptyState.tryAdjustingFilters')}
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButtonLarge}
        onPress={onClearFilters}>
        <Text style={styles.clearFiltersText}>
          {t('emptyState.clearAllFilters')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  clearFiltersButtonLarge: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default EmptyState;
