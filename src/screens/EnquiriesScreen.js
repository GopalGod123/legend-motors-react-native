import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserEnquiries } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/constants';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const EnquiriesScreen = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchEnquiries();
  }, [user]);

  const checkAuthAndFetchEnquiries = async () => {
    setLoading(true);
    try {
      const authenticated = await isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (authenticated) {
        fetchEnquiries();
      } else {
        // Not authenticated, don't fetch data
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsUserAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await getUserEnquiries();
      
      if (response.success) {
        setEnquiries(response.data || []);
      } else {
        setError(response.msg || 'Failed to load enquiries');
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login', { 
      returnTo: 'EnquiriesTab' // To return back to this screen after login
    });
  };

  const handleViewCar = (enquiry) => {
    // Navigate to car details screen with the car ID
    navigation.navigate('ExploreTab', { 
      screen: 'CarDetailScreen',
      params: { carId: enquiry.carId }
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Enquiries</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading enquiries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Enquiries</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={checkAuthAndFetchEnquiries}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated state - show login prompt
  if (!isUserAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Enquiries</Text>
        </View>
        <View style={styles.loginContainer}>
          <View style={styles.clipboardIconContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#F47B20" />
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#F47B20" style={styles.secondClipboard} />
          </View>
          <Text style={styles.noEnquiriesTitle}>No Enquiries found</Text>
          <Text style={styles.loginPromptText}>
            Login/Register to track all your enquiries in one place hassle free.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Login/Register to Enquire</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated but no enquiries
  if (enquiries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Enquiries</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.clipboardIconContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#F47B20" />
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#F47B20" style={styles.secondClipboard} />
          </View>
          <Text style={styles.noEnquiriesTitle}>No Enquiries yet</Text>
          <Text style={styles.emptyText}>
            You haven't made any enquiries yet. Start exploring cars and submit enquiries.
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('ExploreTab')}
          >
            <Text style={styles.exploreButtonText}>Explore Cars</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render list of enquiries
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Enquiries</Text>
      </View>
      
      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.enquiryCard}>
            <View style={styles.carImageContainer}>
              {item.carImage ? (
                <Image
                  source={{ uri: item.carImage }}
                  style={styles.carImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.carImagePlaceholder}>
                  <Ionicons name="car-sport" size={40} color="#CCCCCC" />
                </View>
              )}
            </View>
            <View style={styles.enquiryDetails}>
              <Text style={styles.carTitle}>
                {item.brand} {item.model}
              </Text>
              <Text style={styles.priceText}>${item.price?.toLocaleString() || 'N/A'}</Text>
              <TouchableOpacity
                style={styles.viewCarButton}
                onPress={() => handleViewCar(item)}
              >
                <Text style={styles.viewCarButtonText}>View Car</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  clipboardIconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  secondClipboard: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.6,
    transform: [{ rotate: '-10deg' }]
  },
  noEnquiriesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  loginPromptText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  loginButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  exploreButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
  },
  enquiryCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carImageContainer: {
    width: 100,
    height: 80,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enquiryDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  carTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  priceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  viewCarButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  viewCarButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export default EnquiriesScreen; 