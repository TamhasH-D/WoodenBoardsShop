import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Auth context
const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component - Auto-login as test seller
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false); // No loading needed
  const [error, setError] = useState(null);
  
  // Auto-login as test seller on mount
  useEffect(() => {
    // Create a default test seller user
    const testSeller = {
      id: 'seller-test-001',
      email: 'test.seller@example.com',
      name: 'Тестовый Продавец',
      token: 'seller-test-token',
      role: 'seller',
      phone: '+7 (900) 987-65-43',
      address: 'г. Санкт-Петербург, ул. Продавцов, д. 5',
      businessInfo: {
        companyName: 'ООО "Тестовая Древесина"',
        inn: '1234567890',
        description: 'Поставщик качественной древесины',
        specialization: ['дуб', 'сосна', 'береза', 'ясень'],
        experience: '5 лет',
        rating: 4.8,
        totalSales: 150
      },
      bankDetails: {
        accountNumber: '40817810000000000001',
        bankName: 'Тестовый Банк',
        bik: '044525225'
      },
      settings: {
        notifications: {
          newOrders: true,
          productReviews: true,
          lowStockAlerts: true,
          promotionalEmails: false
        },
        isOnline: true,
        autoAcceptOrders: false
      }
    };
    
    setCurrentUser(testSeller);
    setLoading(false);
  }, []);
  
  // Login function - always returns current test user
  const login = async (email, password) => {
    // Test seller is always logged in
    return currentUser;
  };
  
  // Register function - always returns current test user
  const register = async (name, email, password) => {
    // Test seller is always logged in
    return currentUser;
  };
  
  // Logout function - no logout for test mode
  const logout = () => {
    console.log('Logout not available in test seller mode');
  };
  
  // Check if user is authenticated - always true for test seller
  const isAuthenticated = () => {
    return !!currentUser;
  };
  
  // Get auth token - return a static token for test seller
  const getToken = () => {
    return 'seller-test-token';
  };
  
  // Update seller profile
  const updateProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Toggle online status
  const toggleOnlineStatus = () => {
    setCurrentUser(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        isOnline: !prev.settings.isOnline
      }
    }));
  };
  
  // Provide the auth context to children
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    updateProfile,
    toggleOnlineStatus
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
