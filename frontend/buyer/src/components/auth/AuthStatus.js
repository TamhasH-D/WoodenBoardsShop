import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

/**
 * Компонент отображения статуса аутентификации
 * Показывает информацию о пользователе и кнопки входа/выхода
 */
const AuthStatus = ({ 
  showUserInfo = true,
  showButtons = true,
  compact = false,
  className = ''
}) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    error,
    isFullyAuthenticated
  } = useAuth();

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Проверка аутентификации...</span>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Ошибка аутентификации</span>
        </div>
        {showButtons && <LoginButton size="sm">Повторить вход</LoginButton>}
      </div>
    );
  }

  // Неаутентифицированное состояние
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {!compact && (
          <span className="text-sm text-gray-600">Не авторизован</span>
        )}
        {showButtons && <LoginButton size="sm" />}
      </div>
    );
  }

  // Аутентифицированное состояние
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showUserInfo && (
        <div className="flex items-center space-x-2">
          {/* Аватар пользователя */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 
                 user?.email?.charAt(0)?.toUpperCase() || 
                 'П'}
              </span>
            </div>
          </div>

          {/* Информация о пользователе */}
          {!compact && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.name || user?.preferred_username || 'Покупатель'}
              </span>
              {user?.email && (
                <span className="text-xs text-gray-500">{user.email}</span>
              )}
            </div>
          )}

          {/* Индикатор статуса профиля */}
          <div className="flex items-center">
            {isFullyAuthenticated() ? (
              <div className="flex items-center text-green-600" title="Профиль загружен">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600" title="Загрузка профиля">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      {showButtons && (
        <div className="flex items-center space-x-2">
          <LogoutButton 
            size="sm" 
            variant="ghost"
            showConfirm={true}
          >
            {compact ? 'Выйти' : 'Выход'}
          </LogoutButton>
        </div>
      )}
    </div>
  );
};

export default AuthStatus;
