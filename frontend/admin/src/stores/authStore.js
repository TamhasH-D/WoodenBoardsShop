import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../utils/api/client';
import { toast } from 'react-hot-toast';

/**
 * Enterprise-grade authentication store with persistence
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [],
      lastActivity: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/login/', credentials);
          const { user, token, permissions } = response;

          // Store token in localStorage for API client
          localStorage.setItem('auth_token', token);

          set({
            user,
            token,
            permissions: permissions || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: new Date().toISOString(),
          });

          toast.success(`Welcome back, ${user.first_name}!`);
          return { success: true, user };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          toast.error(error.message || 'Login failed');
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Call logout endpoint to invalidate token on server
          await apiClient.post('/auth/logout/');
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        }

        // Clear local storage
        localStorage.removeItem('auth_token');

        // Reset state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          permissions: [],
          lastActivity: null,
        });

        toast.success('Logged out successfully');
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/register/', userData);
          const { user, token, permissions } = response;

          localStorage.setItem('auth_token', token);

          set({
            user,
            token,
            permissions: permissions || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: new Date().toISOString(),
          });

          toast.success('Account created successfully!');
          return { success: true, user };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          
          toast.error(error.message || 'Registration failed');
          return { success: false, error: error.message };
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.post('/auth/forgot-password/', { email });
          
          set({ isLoading: false });
          toast.success('Password reset instructions sent to your email');
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          
          toast.error(error.message || 'Failed to send reset instructions');
          return { success: false, error: error.message };
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.post('/auth/reset-password/', { token, password });
          
          set({ isLoading: false });
          toast.success('Password reset successfully');
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          
          toast.error(error.message || 'Password reset failed');
          return { success: false, error: error.message };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.post('/auth/change-password/', {
            current_password: currentPassword,
            new_password: newPassword,
          });
          
          set({ isLoading: false });
          toast.success('Password changed successfully');
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          
          toast.error(error.message || 'Password change failed');
          return { success: false, error: error.message };
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.patch('/auth/profile/', profileData);
          const { user } = response;

          set({
            user,
            isLoading: false,
            error: null,
            lastActivity: new Date().toISOString(),
          });

          toast.success('Profile updated successfully');
          return { success: true, user };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          
          toast.error(error.message || 'Profile update failed');
          return { success: false, error: error.message };
        }
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await apiClient.post('/auth/refresh/', { token });
          const { token: newToken, user, permissions } = response;

          localStorage.setItem('auth_token', newToken);

          set({
            token: newToken,
            user,
            permissions: permissions || [],
            lastActivity: new Date().toISOString(),
          });

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        set({ isLoading: true });

        try {
          const response = await apiClient.get('/auth/me/');
          const { user, permissions } = response;

          set({
            user,
            token,
            permissions: permissions || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: new Date().toISOString(),
          });

          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('auth_token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            permissions: [],
          });

          return false;
        }
      },

      updateLastActivity: () => {
        set({ lastActivity: new Date().toISOString() });
      },

      clearError: () => {
        set({ error: null });
      },

      // Utility functions
      hasPermission: (permission) => {
        const { permissions, user } = get();
        
        // Super admin has all permissions
        if (user?.is_superuser) return true;
        
        // Check if user has specific permission
        return permissions.includes(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.is_staff || user?.is_superuser;
      },

      getUser: () => {
        return get().user;
      },

      getToken: () => {
        return get().token;
      },

      isSessionExpired: () => {
        const { lastActivity } = get();
        if (!lastActivity) return true;

        const now = new Date();
        const lastActivityDate = new Date(lastActivity);
        const diffInHours = (now - lastActivityDate) / (1000 * 60 * 60);

        // Session expires after 24 hours of inactivity
        return diffInHours > 24;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
