import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

// Auth Provider component - Auto-login as test buyer
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false); // No loading needed
  const [error, setError] = useState(null);

  // Auto-login as test buyer on mount
  useEffect(() => {
    // Create a default test buyer user
    const testBuyer = {
      id: 'buyer-test-001',
      email: 'test.buyer@example.com',
      name: 'Тестовый Покупатель',
      token: 'buyer-test-token',
      role: 'buyer',
      phone: '+7 (900) 123-45-67',
      address: 'г. Москва, ул. Тестовая, д. 1',
      preferences: {
        woodTypes: ['дуб', 'сосна', 'береза'],
        priceRange: { min: 1000, max: 50000 }
      }
    };

    setCurrentUser(testBuyer);
    setLoading(false);
  }, []);
  
  // Login function - always returns current test user
  const login = async (email, password) => {
    // Test buyer is always logged in
    return currentUser;
  };

  // Register function - always returns current test user
  const register = async (name, email, password) => {
    // Test buyer is always logged in
    return currentUser;
  };

  // Logout function - no logout for test mode
  const logout = () => {
    console.log('Logout not available in test buyer mode');
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };
  
  // Provide the auth context to children
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
