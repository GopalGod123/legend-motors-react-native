import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Ionicons} from '../utils/icon';

const Notification = () => {
  const renderNotification = () => {
    return (
      <View>
        <Text style={styles.sectionHeader}>Today</Text>
        <View style={styles.notificationCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={24} color={'#FFFFFF'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Your offer has been accepted!</Text>
            <Text style={styles.message}>
              Congrats! your offer has been accepted by the seller for $170,000
            </Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notification</Text>

      <FlatList
        data={[1, 2, 3]}
        renderItem={renderNotification}
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A1B9A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
});

export default Notification;
