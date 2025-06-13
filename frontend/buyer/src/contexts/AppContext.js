import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

/**
 * Контекст приложения для buyer frontend
 * Управляет глобальным состоянием, темой, языком и настройками
 */

// Начальное состояние
const initialState = {
  // UI состояние
  theme: 'light',
  sidebarOpen: false,
  pageTitle: 'Магазин древесины',
  loading: false,
  
  // Пользователь
  user: null,
  isAuthenticated: false,
  
  // Настройки
  language: 'ru',
  currency: 'RUB',
  
  // Состояние бэкенда
  backendStatus: {
    online: false,
    lastCheck: null,
    services: {}
  },
  
  // Фильтры и поиск
  searchQuery: '',
  filters: {
    category: '',
    priceRange: [0, 100000],
    woodType: '',
    seller: '',
    location: ''
  },
  
  // Корзина (базовое состояние)
  cartItemsCount: 0
};

// Типы действий
const actionTypes = {
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  SET_CART_COUNT: 'SET_CART_COUNT'
};

// Редьюсер
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case actionTypes.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload
      };
      
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case actionTypes.SET_BACKEND_STATUS:
      return {
        ...state,
        backendStatus: {
          ...state.backendStatus,
          ...action.payload,
          lastCheck: new Date().toISOString()
        }
      };
      
    case actionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
      
    case actionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
      
    case actionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
        searchQuery: ''
      };
      
    case actionTypes.SET_CART_COUNT:
      return {
        ...state,
        cartItemsCount: action.payload
      };
      
    default:
      return state;
  }
}

// Создание контекста
const AppContext = createContext();

// Провайдер контекста
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Действия
  const actions = useMemo(() => ({
    setTheme: (theme) => {
      dispatch({ type: actionTypes.SET_THEME, payload: theme });
      localStorage.setItem('buyer-theme', theme);
    },

    toggleSidebar: () => {
      dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
    },

    setPageTitle: (title) => {
      dispatch({ type: actionTypes.SET_PAGE_TITLE, payload: title });
      document.title = `${title} - Магазин древесины`;
    },

    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },

    setUser: (user) => {
      dispatch({ type: actionTypes.SET_USER, payload: user });
    },

    setBackendStatus: (status) => {
      dispatch({ type: actionTypes.SET_BACKEND_STATUS, payload: status });
    },

    setSearchQuery: (query) => {
      dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query });
    },

    setFilters: (filters) => {
      dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
    },

    resetFilters: () => {
      dispatch({ type: actionTypes.RESET_FILTERS });
    },

    setCartCount: (count) => {
      dispatch({ type: actionTypes.SET_CART_COUNT, payload: count });
    }
  }), [dispatch]);

  // Инициализация при загрузке
  useEffect(() => {
    // Загрузка темы из localStorage
    const savedTheme = localStorage.getItem('buyer-theme');
    if (savedTheme && savedTheme !== state.theme) {
      actions.setTheme(savedTheme);
    }

    // Применение темы к документу
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme, actions]);

  // Значение контекста
  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Хук для использования контекста
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
