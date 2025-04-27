import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

const CategoryFilter = () => {
  const categories = ['Brands', 'Trims', 'Model', 'Year'];
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {categories.map((category, index) => (
          <View key={index} style={styles.buttonContainer}>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>{category}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  scrollContent: {
    paddingBottom: SPACING.sm,
  },
  buttonContainer: {
    marginRight: SPACING.md,
    width: 70,
  },
  categoryButton: {
    height: 35,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  categoryText: {
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: SPACING.xs,
    fontSize: 13,
  },
  dropdownIcon: {
    fontSize: 8,
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default CategoryFilter; 