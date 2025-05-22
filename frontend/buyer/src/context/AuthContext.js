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

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          // Check if token is still valid (would normally validate with backend)
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would normally be an API call to authenticate
      // For now, we'll simulate a successful login
      if (email && password) {
        // Mock user data
        const user = {
          id: '123456',
          email,
          name: email.split('@')[0],
          token: 'mock-jwt-token',
          role: 'buyer'
        };
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Email and password are required');
      }
    } catch (error) {
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would normally be an API call to register
      // For now, we'll simulate a successful registration
      if (name && email && password) {
        // Mock user data
        const user = {
          id: '123456',
          email,
          name,
          token: 'mock-jwt-token',
          role: 'buyer'
        };
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Name, email, and password are required');
      }
    } catch (error) {
      setError(error.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
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
