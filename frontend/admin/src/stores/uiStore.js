import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise-grade UI state management store
 */
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'light',
      systemTheme: 'light',
      
      // Layout state
      sidebarCollapsed: false,
      sidebarMobile: false,
      
      // Loading states
      globalLoading: false,
      loadingStates: {},
      
      // Modal states
      modals: {},
      
      // Notification states
      notifications: [],
      
      // Page state
      pageTitle: 'Admin Dashboard',
      breadcrumbs: [],
      
      // Table states
      tableStates: {},
      
      // Form states
      formStates: {},
      
      // Search states
      searchStates: {},
      
      // Filter states
      filterStates: {},
      
      // Preferences
      preferences: {
        itemsPerPage: 25,
        dateFormat: 'MMM dd, yyyy',
        timeFormat: '24h',
        currency: 'USD',
        language: 'en',
        timezone: 'UTC',
        animations: true,
        soundEffects: false,
        compactMode: false,
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      setSystemTheme: (systemTheme) => {
        set({ systemTheme });
        const { theme } = get();
        if (theme === 'system') {
          document.documentElement.classList.toggle('dark', systemTheme === 'dark');
        }
      },

      // Layout actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleMobileSidebar: () => {
        set((state) => ({ sidebarMobile: !state.sidebarMobile }));
      },

      setMobileSidebar: (open) => {
        set({ sidebarMobile: open });
      },

      // Loading actions
      setGlobalLoading: (loading) => {
        set({ globalLoading: loading });
      },

      setLoading: (key, loading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading,
          },
        }));
      },

      getLoading: (key) => {
        return get().loadingStates[key] || false;
      },

      clearLoading: (key) => {
        set((state) => {
          const newLoadingStates = { ...state.loadingStates };
          delete newLoadingStates[key];
          return { loadingStates: newLoadingStates };
        });
      },

      // Modal actions
      openModal: (modalId, props = {}) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { open: true, props },
          },
        }));
      },

      closeModal: (modalId) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { open: false, props: {} },
          },
        }));
      },

      isModalOpen: (modalId) => {
        return get().modals[modalId]?.open || false;
      },

      getModalProps: (modalId) => {
        return get().modals[modalId]?.props || {};
      },

      // Notification actions
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          id,
          type: 'info',
          autoClose: true,
          duration: 5000,
          ...notification,
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove notification
        if (newNotification.autoClose) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Page actions
      setPageTitle: (title) => {
        set({ pageTitle: title });
        document.title = `${title} - Admin Dashboard`;
      },

      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      // Table actions
      setTableState: (tableId, state) => {
        set((currentState) => ({
          tableStates: {
            ...currentState.tableStates,
            [tableId]: {
              ...currentState.tableStates[tableId],
              ...state,
            },
          },
        }));
      },

      getTableState: (tableId) => {
        return get().tableStates[tableId] || {};
      },

      clearTableState: (tableId) => {
        set((state) => {
          const newTableStates = { ...state.tableStates };
          delete newTableStates[tableId];
          return { tableStates: newTableStates };
        });
      },

      // Form actions
      setFormState: (formId, state) => {
        set((currentState) => ({
          formStates: {
            ...currentState.formStates,
            [formId]: {
              ...currentState.formStates[formId],
              ...state,
            },
          },
        }));
      },

      getFormState: (formId) => {
        return get().formStates[formId] || {};
      },

      clearFormState: (formId) => {
        set((state) => {
          const newFormStates = { ...state.formStates };
          delete newFormStates[formId];
          return { formStates: newFormStates };
        });
      },

      // Search actions
      setSearchState: (searchId, state) => {
        set((currentState) => ({
          searchStates: {
            ...currentState.searchStates,
            [searchId]: {
              ...currentState.searchStates[searchId],
              ...state,
            },
          },
        }));
      },

      getSearchState: (searchId) => {
        return get().searchStates[searchId] || {};
      },

      clearSearchState: (searchId) => {
        set((state) => {
          const newSearchStates = { ...state.searchStates };
          delete newSearchStates[searchId];
          return { searchStates: newSearchStates };
        });
      },

      // Filter actions
      setFilterState: (filterId, state) => {
        set((currentState) => ({
          filterStates: {
            ...currentState.filterStates,
            [filterId]: {
              ...currentState.filterStates[filterId],
              ...state,
            },
          },
        }));
      },

      getFilterState: (filterId) => {
        return get().filterStates[filterId] || {};
      },

      clearFilterState: (filterId) => {
        set((state) => {
          const newFilterStates = { ...state.filterStates };
          delete newFilterStates[filterId];
          return { filterStates: newFilterStates };
        });
      },

      // Preference actions
      setPreference: (key, value) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }));
      },

      setPreferences: (preferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        }));
      },

      getPreference: (key, defaultValue = null) => {
        return get().preferences[key] ?? defaultValue;
      },

      resetPreferences: () => {
        set({
          preferences: {
            itemsPerPage: 25,
            dateFormat: 'MMM dd, yyyy',
            timeFormat: '24h',
            currency: 'USD',
            language: 'en',
            timezone: 'UTC',
            animations: true,
            soundEffects: false,
            compactMode: false,
          },
        });
      },

      // Utility actions
      reset: () => {
        set({
          sidebarCollapsed: false,
          sidebarMobile: false,
          globalLoading: false,
          loadingStates: {},
          modals: {},
          notifications: [],
          pageTitle: 'Admin Dashboard',
          breadcrumbs: [],
          tableStates: {},
          formStates: {},
          searchStates: {},
          filterStates: {},
        });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        preferences: state.preferences,
      }),
    }
  )
);
