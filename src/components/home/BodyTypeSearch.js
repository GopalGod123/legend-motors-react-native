import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {HatchbackIcon, SedanIcon, SUVIcon} from '../icons';
import {COLORS} from 'src/utils/constants';
import {useTheme} from 'src/context/ThemeContext';

const BodyTypeItem = ({icon, title, COLORS1}) => {
  return (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.imageContainer}>{icon}</View>
      <Text style={[styles.itemTitle, {color: COLORS1?.textDark}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const BodyTypeSearch = () => {
  const {COLORS1} = useTheme();
  const bodyTypes = [
    {id: 1, title: 'Hatchback', icon: <HatchbackIcon width={60} height={40} />},
    {id: 2, title: 'Sedan', icon: <SedanIcon width={60} height={40} />},
    {id: 3, title: 'SUV', icon: <SUVIcon width={60} height={40} />},
    {id: 4, title: 'Crossover', icon: <HatchbackIcon width={60} height={40} />},
    {id: 5, title: 'Coupe', icon: <SedanIcon width={60} height={40} />},
    {id: 6, title: 'Convertible', icon: <SUVIcon width={60} height={40} />},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: COLORS1?.textDark}]}>
          Search by Body Type
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, {color: COLORS1?.textDark}]}>
            See All
          </Text>
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
            COLORS1={COLORS1}
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
    color: '#333',
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
    backgroundColor: '#FFF',
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
    color: '#333',
    textAlign: 'center',
  },
});

export default BodyTypeSearch;
