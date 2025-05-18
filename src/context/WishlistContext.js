import React, {createContext, useState, useContext, useEffect} from 'react';
import {addToWishlist, removeFromWishlist, getWishlist} from '../services/api';
import {useAuth} from './AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, API_KEY} from '../utils/apiConfig';

// Create context
export const WishlistContext = createContext();

// Create a module-level variable to track removals globally across screens
const globalRemovingItems = {};

// Create provider component
export const WishlistProvider = ({children}) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState({}); // Track items being removed locally
  const {user, isAuthenticated, checkAuthStatus} = useAuth();

  // Fetch wishlist items when user logs in
  useEffect(() => {
    const checkAndFetchWishlist = async () => {
      let isAuth = await checkAuthStatus();
      if (isAuth) {
        fetchWishlistItems();
      } else {
        setWishlistItems([]);
      }
    };

    checkAndFetchWishlist();
  }, []); // Add user as dependency to re-run when user changes

  // Function to fetch wishlist items
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();

      if (response.success && Array.isArray(response.data)) {
        setWishlistItems(response.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to add an item to the wishlist
  const addItemToWishlist = async carId => {
    try {
      // First check if the user is authenticated

      setLoading(true);
      const response = await addToWishlist(carId);

      if (response.success) {
        // If the car data is included in the response, add it to the state
        if (response.data && response.data.car) {
          // Check if the car is already in the wishlist
          const alreadyExists = wishlistItems.some(
            item => item.id === response.data.car.id,
          );

          if (!alreadyExists) {
            setWishlistItems(prevItems => [...prevItems, response.data.car]);
          }
        } else {
          // If no car data in response, just refresh the wishlist
          fetchWishlistItems();
        }
        return {success: true};
      }
      return {success: false};
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      return {success: false};
    } finally {
      setLoading(false);
    }
  };

  // Function to remove an item from the wishlist
  const removeItemFromWishlist = async idParam => {
    try {
      // First check if the user is authenticated

      // Check if this item is already being removed globally
      if (globalRemovingItems[idParam]) {
        return {success: true}; // Return true to prevent error messages in UI
      }

      // Mark this item as being removed globally
      globalRemovingItems[idParam] = true;

      // Also track locally
      setRemovingItems(prev => ({...prev, [idParam]: true}));

      setLoading(true);

      // Extract the carId - this is what the API needs
      let carId;

      // If the item object was passed, extract carId
      if (typeof idParam === 'object' && idParam !== null) {
        carId = idParam.carId || idParam.id;
      } else {
        // It's already a carId or wishlistId - find the corresponding car
        const foundItem = wishlistItems.find(
          item =>
            item.id === idParam ||
            item.wishlistId === idParam ||
            item.carId === idParam,
        );

        if (foundItem) {
          // Get the carId from the found item
          carId = foundItem.carId || foundItem.id;
        } else {
          // Just use the ID directly as carId
          carId = parseInt(idParam);
        }
      }

      // Call API with carId (API requires carId, not wishlistId)
      const response = await removeFromWishlist(carId);

      if (response.success) {
        // Update the local state to remove this item
        setWishlistItems(prevItems => {
          return prevItems.filter(item => {
            // Filter out this item based on carId or wishlistId
            return !(
              item.carId === carId ||
              item.id === carId ||
              (item.car && item.car.id === carId)
            );
          });
        });

        return {success: true};
      } else {
        console.error(
          `Failed to remove car ID ${carId} from wishlist: ${response.msg}`,
        );
        return {success: false};
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      return {success: false};
    } finally {
      setLoading(false);

      // Clear the local removing state for this item
      setRemovingItems(prev => {
        const updated = {...prev};
        delete updated[idParam];
        return updated;
      });

      // Clear the global tracking after a short delay
      setTimeout(() => {
        delete globalRemovingItems[idParam];
      }, 500);
    }
  };

  // Check if a car is in the wishlist
  const isInWishlist = carId => {
    if (!carId) return false;

    return wishlistItems.some(
      item =>
        item.id === carId ||
        item.carId === carId ||
        (item.car && item.car.id === carId),
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        isInWishlist,
        addItemToWishlist,
        removeItemFromWishlist,
        fetchWishlistItems,
        clearWishlist: () => {
          setWishlistItems([]);
        },
      }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
