import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { 
  MercedesLogo, 
  TeslaLogo, 
  BMWLogo, 
  ToyotaLogo,
  VolvoLogo,
  BugattiLogo,
  HondaLogo,
  MoreIcon
} from '../icons/BrandLogos';

const brandData = [
  { id: 1, name: 'Mercedes', logo: (props) => <MercedesLogo {...props} /> }, 
  { id: 2, name: 'Tesla', logo: (props) => <TeslaLogo {...props} /> },
  { id: 3, name: 'BMW', logo: (props) => <BMWLogo {...props} /> },
  { id: 4, name: 'Toyota', logo: (props) => <ToyotaLogo {...props} /> },
  { id: 5, name: 'Volvo', logo: (props) => <VolvoLogo {...props} /> },
  { id: 6, name: 'Bugatti', logo: (props) => <BugattiLogo {...props} /> },
  { id: 7, name: 'Honda', logo: (props) => <HondaLogo {...props} /> },
  { id: 8, name: 'More', logo: (props) => <MoreIcon {...props} /> },
];

const PopularBrands = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search by Popular Brands</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.brandsGrid}>
        {brandData.map((brand) => (
          <TouchableOpacity key={brand.id} style={styles.brandItem}>
            <View style={styles.logoContainer}>
              {brand.logo({ size: 40, color: '#333' })}
            </View>
            <Text style={styles.brandName}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  brandItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  brandName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    textAlign: 'center',
  },
});

export default PopularBrands; 