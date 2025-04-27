import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import HatchbackIcon from '../icons/HatchbackIcon';

const BodyTypeItem = ({ icon, title }) => {
  return (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        {icon}
      </View>
      <Text style={styles.itemTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const BodyTypeSearch = () => {
  const bodyTypes = [
    { id: 1, title: 'Hatchback', icon: <HatchbackIcon /> },
    { id: 2, title: 'Hatchback', icon: <HatchbackIcon /> },
    { id: 3, title: 'Hatchback', icon: <HatchbackIcon /> },
    { id: 4, title: 'Hatchback', icon: <HatchbackIcon /> },
    { id: 5, title: 'Sedan', icon: <HatchbackIcon /> },
    { id: 6, title: 'SUV', icon: <HatchbackIcon /> },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search by Body Type</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {bodyTypes.map((item) => (
          <BodyTypeItem 
            key={item.id}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
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
    paddingHorizontal: 10,
  },
  itemContainer: {
    width: 110,
    marginHorizontal: 5,
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
    shadowOffset: { width: 0, height: 2 },
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