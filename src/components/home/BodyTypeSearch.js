import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {HatchbackIcon, SedanIcon, SUVIcon} from '../icons';
import {useTheme} from 'src/context/ThemeContext';

const BodyTypeItem = ({icon, title, isDark}) => {
  return (
    <TouchableOpacity style={styles.itemContainer}>
      <View
        style={[
          styles.imageContainer,
          {backgroundColor: isDark ? '#1A1A1A' : '#FFF'},
        ]}>
        {icon}
      </View>
      <Text style={[styles.itemTitle, {color: isDark ? '#FFFFFF' : '#333'}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const BodyTypeSearch = () => {
  const bodyTypes = [
    {id: 1, title: 'Hatchback', icon: <HatchbackIcon width={60} height={40} />},
    {id: 2, title: 'Sedan', icon: <SedanIcon width={60} height={40} />},
    {id: 3, title: 'SUV', icon: <SUVIcon width={60} height={40} />},
    {id: 4, title: 'Crossover', icon: <HatchbackIcon width={60} height={40} />},
    {id: 5, title: 'Coupe', icon: <SedanIcon width={60} height={40} />},
    {id: 6, title: 'Convertible', icon: <SUVIcon width={60} height={40} />},
  ];
  const {isDark} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
      ]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: isDark ? '#FFFFFF' : '#333'}]}>
          Search by Body Type
        </Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {bodyTypes.map(item => (
          <BodyTypeItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            isDark={isDark}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 23,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 20,
  },
  itemContainer: {
    width: 110,
    marginRight: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default BodyTypeSearch;
