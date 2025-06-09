import React from 'react';
import { BUYER_TEXTS } from '../../utils/localization';

/**
 * Премиум оверлей загрузки с glassmorphism эффектом
 * Показывается при глобальных операциях загрузки
 */
const LoadingOverlay = ({ message = BUYER_TEXTS.LOADING }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-backdrop" />
      
      <div className="loading-content">
        {/* Анимированный спиннер */}
        <div className="loading-spinner">
          <div className="spinner-ring">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
        </div>
        
        {/* Сообщение загрузки */}
        <div className="loading-message">
          {message}
        </div>
        
        {/* Анимированные точки */}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
