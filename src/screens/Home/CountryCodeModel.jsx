import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fetchCountries } from 'src/services/api';

// Search Icon
const SearchIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 22L20 20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close Icon
const CloseIcon = ({ color }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 6L18 18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CountryCodeModal = ({
  visible,
  onClose,
  onSelectCountry,
  selectedCountry,
  colors,
}) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchCountries();
    }
  }, [visible]);

  useEffect(() => {
    if (countries.length > 0) {
      filterCountries();
    }
  }, [searchQuery, countries]);

  const fetchCountriesData = async () => {
      try {
      const data = await  fetchCountries()
      console.log(data, "datallll");
      
      setCountries(data.data);
        setFilteredCountries(data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  
    useEffect(() => {
      fetchCountriesData()
    }, [])
//   const fetchCountries = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(
//         'https://api.staging.legendmotorsglobal.com/api/v1/country-codes/list?limit=300'
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch country codes');
//       }
      
//       const data = await response.json();
      
//       if (data.success && data.data) {
//         // Assuming the API returns data in the format {data: [{id, name, code, flag}, ...]}
//         setCountries(data.data);
//         setFilteredCountries(data.data);
//       } else {
//         throw new Error(data.message || 'Failed to fetch country codes');
//       }
//     } catch (err) {
//       console.error('Error fetching country codes:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

  const filterCountries = () => {
    if (!searchQuery.trim()) {
      setFilteredCountries(countries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = countries.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
    );
    
    setFilteredCountries(filtered);
  };

  const handleSelectCountry = (country) => {
    onSelectCountry(country);
    onClose();
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        selectedCountry?.id === item.id && styles.selectedCountryItem,
      ]}
      onPress={() => handleSelectCountry(item)}
    >
      {item.flag && (
        <View style={styles.flagContainer}>
          <Text style={styles.flagText}>{item.dialCode}</Text>
        </View>
      )}
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors?.background || '#FFFFFF' },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors?.textDark || '#212121' }]}>
              Select Country
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CloseIcon color={colors?.textDark || '#212121'} />
            </TouchableOpacity>
          </View>
          
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors?.white || '#F5F5F5' },
            ]}
          >
            <SearchIcon color={colors?.textMedium || '#757575'} />
            <TextInput
              style={[styles.searchInput, { color: colors?.textDark || '#212121' }]}
              placeholder="Search country or code"
              placeholderTextColor={colors?.textMedium || '#757575'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#F47B20" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchCountries}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.id}
              style={styles.countryList}
              key={(item) => item.id}
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={10}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>No countries found</Text>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#212121',
    fontSize: 16,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCountryItem: {
    backgroundColor: '#FFF0E6',
  },
  flagContainer: {
    width: 30,
    height: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 16,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  countryCode: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F47B20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#757575',
  },
});

export default CountryCodeModal;