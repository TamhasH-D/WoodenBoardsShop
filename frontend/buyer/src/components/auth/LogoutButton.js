import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Кнопка выхода из системы
 * Выполняет logout через Keycloak
 */
const LogoutButton = ({ 
  className = '',
  children = 'Выйти',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  showConfirm = false,
  ...props 
}) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    if (showConfirm) {
      const confirmed = window.confirm('Вы уверены, что хотите выйти из системы?');
      if (!confirmed) return;
    }

    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Базовые стили для кнопки
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Варианты стилей
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  };

  // Размеры
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      onClick={handleLogout}
      disabled={disabled || isLoading}
      className={buttonStyles}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Выход...
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          {children}
        </>
      )}
    </button>
  );
};

export default LogoutButton;
