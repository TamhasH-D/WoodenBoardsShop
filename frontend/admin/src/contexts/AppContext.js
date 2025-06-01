import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, LOADING_STATES } from '../utils/constants';

// App context
const AppContext = createContext();

// Action types
const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  SET_THEME: 'SET_THEME',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU'
};

// Initial state
const getInitialState = () => {
  const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
  const defaultPreferences = {
    sidebarCollapsed: false,
    theme: 'light',
    pageSize: 20,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    language: 'en'
  };

  return {
    loading: LOADING_STATES.IDLE,
    error: null,
    userPreferences: savedPreferences ? 
      { ...defaultPreferences, ...JSON.parse(savedPreferences) } : 
      defaultPreferences,
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    theme: 'light',
    breadcrumbs: [],
    pageTitle: 'Admin Dashboard',
    backendStatus: {
      online: false,
      lastChecked: null,
      version: null
    }
  };
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: LOADING_STATES.ERROR
      };

    case APP_ACTIONS.SET_USER_PREFERENCES:
      const newPreferences = { ...state.userPreferences, ...action.payload };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(newPreferences));
      return {
        ...state,
        userPreferences: newPreferences
      };

    case APP_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      };

    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
        userPreferences: {
          ...state.userPreferences,
          theme: action.payload
        }
      };

    case APP_ACTIONS.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action.payload
      };

    case APP_ACTIONS.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload
      };

    case APP_ACTIONS.SET_BACKEND_STATUS:
      return {
        ...state,
        backendStatus: {
          ...state.backendStatus,
          ...action.payload,
          lastChecked: new Date()
        }
      };

    case APP_ACTIONS.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        mobileMenuOpen: !state.mobileMenuOpen
      };

    default:
      return state;
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Set loading state
  const setLoading = useCallback((loading) => {
    dispatch({
      type: APP_ACTIONS.SET_LOADING,
      payload: loading
    });
  }, []);

  // Set error
  const setError = useCallback((error) => {
    dispatch({
      type: APP_ACTIONS.SET_ERROR,
      payload: error
    });
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback((preferences) => {
    dispatch({
      type: APP_ACTIONS.SET_USER_PREFERENCES,
      payload: preferences
    });
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    const collapsed = !state.sidebarCollapsed;
    dispatch({
      type: APP_ACTIONS.SET_SIDEBAR_COLLAPSED,
      payload: collapsed
    });
    updateUserPreferences({ sidebarCollapsed: collapsed });
  }, [state.sidebarCollapsed, updateUserPreferences]);

  // Set theme
  const setTheme = useCallback((theme) => {
    dispatch({
      type: APP_ACTIONS.SET_THEME,
      payload: theme
    });
    updateUserPreferences({ theme });
  }, [updateUserPreferences]);

  // Set breadcrumbs
  const setBreadcrumbs = useCallback((breadcrumbs) => {
    dispatch({
      type: APP_ACTIONS.SET_BREADCRUMBS,
      payload: breadcrumbs
    });
  }, []);

  // Set page title
  const setPageTitle = useCallback((title) => {
    dispatch({
      type: APP_ACTIONS.SET_PAGE_TITLE,
      payload: title
    });
    // Also update document title
    document.title = `${title} - Admin Dashboard`;
  }, []);

  // Set backend status
  const setBackendStatus = useCallback((status) => {
    dispatch({
      type: APP_ACTIONS.SET_BACKEND_STATUS,
      payload: status
    });
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    dispatch({
      type: APP_ACTIONS.TOGGLE_MOBILE_MENU
    });
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const { theme } = state.userPreferences;
    document.documentElement.setAttribute('data-theme', theme);
  }, [state.userPreferences]);

  // Context value
  const value = {
    // State
    loading: state.loading,
    error: state.error,
    userPreferences: state.userPreferences,
    sidebarCollapsed: state.sidebarCollapsed,
    mobileMenuOpen: state.mobileMenuOpen,
    theme: state.theme,
    breadcrumbs: state.breadcrumbs,
    pageTitle: state.pageTitle,
    backendStatus: state.backendStatus,

    // Actions
    setLoading,
    setError,
    updateUserPreferences,
    toggleSidebar,
    setTheme,
    setBreadcrumbs,
    setPageTitle,
    setBackendStatus,
    toggleMobileMenu
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// HOC for components that need app context
export const withApp = (Component) => {
  return function WrappedComponent(props) {
    const app = useApp();
    return <Component {...props} app={app} />;
  };
};

export default AppContext;
