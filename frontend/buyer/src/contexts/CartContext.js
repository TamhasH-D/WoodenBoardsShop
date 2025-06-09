import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useApp } from './AppContext';

/**
 * Контекст корзины для buyer frontend
 * Управляет товарами в корзине, количеством, расчетами
 */

// Начальное состояние корзины
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  loading: false,
  error: null
};

// Типы действий
const actionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_CART: 'LOAD_CART'
};

// Вспомогательные функции
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

const findItemIndex = (items, productId) => {
  return items.findIndex(item => item.id === productId);
};

// Редьюсер корзины
function cartReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingIndex = findItemIndex(state.items, product.id);
      
      let newItems;
      if (existingIndex >= 0) {
        // Обновляем количество существующего товара
        newItems = state.items.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Добавляем новый товар
        newItems = [...state.items, {
          id: product.id,
          name: product.name || product.neme,
          price: product.price,
          woodType: product.wood_type,
          seller: product.seller,
          quantity,
          image: product.image_url,
          volume: product.volume,
          description: product.description || product.descrioption
        }];
      }
      
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals,
        error: null
      };
    }
    
    case actionTypes.REMOVE_ITEM: {
      const productId = action.payload;
      const newItems = state.items.filter(item => item.id !== productId);
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case actionTypes.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Удаляем товар если количество 0 или меньше
        return cartReducer(state, { type: actionTypes.REMOVE_ITEM, payload: productId });
      }
      
      const newItems = state.items.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      );
      
      const totals = calculateTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        ...totals
      };
    }
    
    case actionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
      
    case actionTypes.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen
      };
      
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case actionTypes.LOAD_CART:
      const totals = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        ...totals,
        loading: false
      };
      
    default:
      return state;
  }
}

// Создание контекста
const CartContext = createContext();

// Провайдер контекста
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { setCartCount } = useApp();

  // Действия корзины
  const actions = {
    addToCart: (product, quantity = 1) => {
      dispatch({ 
        type: actionTypes.ADD_ITEM, 
        payload: { product, quantity } 
      });
    },
    
    removeFromCart: (productId) => {
      dispatch({ 
        type: actionTypes.REMOVE_ITEM, 
        payload: productId 
      });
    },
    
    updateQuantity: (productId, quantity) => {
      dispatch({ 
        type: actionTypes.UPDATE_QUANTITY, 
        payload: { productId, quantity } 
      });
    },
    
    clearCart: () => {
      dispatch({ type: actionTypes.CLEAR_CART });
    },
    
    toggleCart: () => {
      dispatch({ type: actionTypes.TOGGLE_CART });
    },
    
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },
    
    // Получение товара из корзины
    getCartItem: (productId) => {
      return state.items.find(item => item.id === productId);
    },
    
    // Проверка наличия товара в корзине
    isInCart: (productId) => {
      return findItemIndex(state.items, productId) >= 0;
    }
  };

  // Синхронизация с localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('buyer-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: actionTypes.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении корзины
  useEffect(() => {
    localStorage.setItem('buyer-cart', JSON.stringify(state.items));
    setCartCount(state.totalItems);
  }, [state.items, state.totalItems, setCartCount]);

  // Значение контекста
  const value = {
    ...state,
    ...actions
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Хук для использования контекста
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
