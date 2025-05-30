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

// Auth Provider component - No authentication required for admin
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false); // No loading needed
  const [error, setError] = useState(null);

  // Auto-login as admin user on mount
  useEffect(() => {
    // Create a default admin user - no authentication required
    const adminUser = {
      id: 'admin-local',
      username: 'admin',
      email: 'admin@local.system',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_products', 'manage_system'],
      isLocal: true
    };

    setCurrentUser(adminUser);
    setLoading(false);
  }, []);
  
  // No login function needed - admin is always authenticated locally
  const login = async () => {
    // Admin is always logged in locally
    return currentUser;
  };

  // No logout function needed - admin cannot logout from local system
  const logout = () => {
    console.log('Admin logout not available in local mode');
  };

  // Check if user is authenticated - always true for admin
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Get auth token - return a static token for admin
  const getToken = () => {
    return 'admin-local-token';
  };

  // Provide the auth context to children
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
