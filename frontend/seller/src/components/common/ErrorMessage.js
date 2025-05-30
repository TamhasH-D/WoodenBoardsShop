import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  className = "",
  showRetry = true 
}) => {
  const getErrorDetails = (error) => {
    if (!error) {
      return {
        title: 'Неизвестная ошибка',
        description: 'Произошла неожиданная ошибка',
        icon: AlertTriangle
      };
    }

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету и попробуйте снова',
        icon: WifiOff
      };
    }

    // Server errors
    if (error.response?.status >= 500) {
      return {
        title: 'Ошибка сервера',
        description: 'Сервер временно недоступен. Попробуйте позже',
        icon: AlertTriangle
      };
    }

    // Client errors
    if (error.response?.status >= 400) {
      return {
        title: 'Ошибка запроса',
        description: error.response?.data?.message || 'Некорректный запрос',
        icon: AlertTriangle
      };
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        title: 'Превышено время ожидания',
        description: 'Сервер не отвечает. Попробуйте снова',
        icon: WifiOff
      };
    }

    return {
      title: 'Ошибка загрузки данных',
      description: error.message || 'Не удалось загрузить данные',
      icon: AlertTriangle
    };
  };

  const { title, description, icon: Icon } = getErrorDetails(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
        <Icon className="w-6 h-6 text-red-500" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        {description}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Попробовать снова
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
