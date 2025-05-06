import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const CategoryFilter = () => {
  const categories = ['Brands', 'Trims', 'Model', 'Year'];
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryButton}>
            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    paddingHorizontal: 23,
  },
  scrollContent: {
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  categoryButton: {
    height: 48,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginRight: SPACING.md,
    minWidth: 115,
  },
  categoryText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default CategoryFilter; 