import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from './LoginButton';

/**
 * Компонент для защиты маршрутов
 * Требует аутентификации для доступа к контенту
 */
const ProtectedRoute = ({ 
  children, 
  requireProfile = true,
  fallback = null,
  showLoginPrompt = true,
  className = ''
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    error,
    isFullyAuthenticated 
  } = useAuth();

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка аутентификации</h3>
          <p className="text-gray-600 mb-4">Произошла ошибка при проверке доступа</p>
          {showLoginPrompt && (
            <LoginButton>Попробовать снова</LoginButton>
          )}
        </div>
      </div>
    );
  }

  // Проверяем аутентификацию
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }

    if (!showLoginPrompt) {
      return null;
    }

    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Требуется авторизация</h3>
          <p className="text-gray-600 mb-4">
            Для доступа к этой странице необходимо войти в систему
          </p>
          <LoginButton>Войти в систему</LoginButton>
        </div>
      </div>
    );
  }

  // Проверяем загрузку профиля (если требуется)
  if (requireProfile && !isFullyAuthenticated()) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  // Показываем защищенный контент
  return children;
};

/**
 * HOC для защиты компонентов
 */
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
