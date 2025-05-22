import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../apiService';
import {
  transformProductList,
  transformWoodTypeList,
  transformBuyerList,
  transformChatThreadList,
  transformChatMessageList,
  transformWoodenBoardList
} from '../models';

// Create the API context
const ApiContext = createContext();

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// API Provider component
export const ApiProvider = ({ children }) => {
  const apiService = new ApiService();

  // State for various data types
  const [products, setProducts] = useState([]);
  const [woodTypes, setWoodTypes] = useState([]);
  const [woodTypePrices, setWoodTypePrices] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [woodenBoards, setWoodenBoards] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    products: false,
    woodTypes: false,
    woodTypePrices: false,
    buyers: false,
    chatThreads: false,
    woodenBoards: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    products: null,
    woodTypes: null,
    woodTypePrices: null,
    buyers: null,
    chatThreads: null,
    woodenBoards: null,
  });

  // Function to fetch products
  const fetchProducts = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, products: true }));
    setErrors(prev => ({ ...prev, products: null }));

    try {
      const response = await apiService.getProducts(offset, limit);
      const transformedProducts = transformProductList(response.data);
      setProducts(transformedProducts);
      return transformedProducts;
    } catch (error) {
      setErrors(prev => ({ ...prev, products: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Function to fetch wood types
  const fetchWoodTypes = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, woodTypes: true }));
    setErrors(prev => ({ ...prev, woodTypes: null }));

    try {
      const response = await apiService.getWoodTypes(offset, limit);
      const transformedWoodTypes = transformWoodTypeList(response.data);
      setWoodTypes(transformedWoodTypes);
      return transformedWoodTypes;
    } catch (error) {
      setErrors(prev => ({ ...prev, woodTypes: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, woodTypes: false }));
    }
  };

  // Function to fetch wood type prices
  const fetchWoodTypePrices = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, woodTypePrices: true }));
    setErrors(prev => ({ ...prev, woodTypePrices: null }));

    try {
      const response = await apiService.getWoodTypePrices(offset, limit);
      setWoodTypePrices(response.data);
      return response.data;
    } catch (error) {
      setErrors(prev => ({ ...prev, woodTypePrices: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, woodTypePrices: false }));
    }
  };

  // Function to fetch buyers
  const fetchBuyers = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, buyers: true }));
    setErrors(prev => ({ ...prev, buyers: null }));

    try {
      const response = await apiService.getBuyers(offset, limit);
      const transformedBuyers = transformBuyerList(response.data);
      setBuyers(transformedBuyers);
      return transformedBuyers;
    } catch (error) {
      setErrors(prev => ({ ...prev, buyers: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, buyers: false }));
    }
  };

  // Function to fetch chat threads
  const fetchChatThreads = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, chatThreads: true }));
    setErrors(prev => ({ ...prev, chatThreads: null }));

    try {
      const response = await apiService.getChatThreads(offset, limit);
      const transformedThreads = transformChatThreadList(response.data);
      setChatThreads(transformedThreads);
      return transformedThreads;
    } catch (error) {
      setErrors(prev => ({ ...prev, chatThreads: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, chatThreads: false }));
    }
  };

  // Function to fetch wooden boards
  const fetchWoodenBoards = async (offset = 0, limit = 20) => {
    setLoading(prev => ({ ...prev, woodenBoards: true }));
    setErrors(prev => ({ ...prev, woodenBoards: null }));

    try {
      const response = await apiService.getWoodenBoards(offset, limit);
      const transformedBoards = transformWoodenBoardList(response.data);
      setWoodenBoards(transformedBoards);
      return transformedBoards;
    } catch (error) {
      setErrors(prev => ({ ...prev, woodenBoards: error.message }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, woodenBoards: false }));
    }
  };

  // Provide the API service and state to children
  const value = {
    apiService,
    // Data
    products,
    woodTypes,
    woodTypePrices,
    buyers,
    chatThreads,
    woodenBoards,
    // Loading states
    loading,
    // Error states
    errors,
    // Fetch functions
    fetchProducts,
    fetchWoodTypes,
    fetchWoodTypePrices,
    fetchBuyers,
    fetchChatThreads,
    fetchWoodenBoards,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export default ApiContext;
