import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Компонент для обработки callback'а после аутентификации в Keycloak
 * Отображается на маршруте /auth/callback
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  useEffect(() => {
    // Если аутентификация успешна, перенаправляем на главную страницу
    if (isAuthenticated && !isLoading) {
      const redirectTo = sessionStorage.getItem('auth_redirect_to') || '/';
      sessionStorage.removeItem('auth_redirect_to');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Показываем ошибку, если что-то пошло не так
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Ошибка аутентификации
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Произошла ошибка при входе в систему. Попробуйте еще раз.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              На главную
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Показываем индикатор загрузки
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Завершение входа
          </h3>
          <p className="text-gray-600">
            Пожалуйста, подождите, мы завершаем процесс аутентификации...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
