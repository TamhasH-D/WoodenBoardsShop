/**
 * Панель для тестирования API поиска продуктов
 */

import React, { useState } from 'react';

const APITestPanel = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            padding: '12px 16px',
            backgroundColor: '#3182CE',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          🧪 API Тесты
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px',
        backgroundColor: '#F7FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#2D3748'
        }}>
          🧪 Тестирование API
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#718096'
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        padding: '16px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#4A5568',
          lineHeight: '1.5'
        }}>
          Панель для тестирования исправленного API поиска продуктов. 
          Откройте консоль браузера (F12) для запуска тестов.
        </p>

        <button
          onClick={() => {
            console.log('🧪 Запуск тестов API...');
            console.log('Откройте консоль браузера для подробной информации');
            if (window.apiTestUtils) {
              window.apiTestUtils.runAllTests();
            } else {
              console.log('API тесты недоступны');
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3182CE',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px'
          }}
        >
          ▶️ Запустить тесты
        </button>

        <div style={{
          fontSize: '12px',
          color: '#718096',
          lineHeight: '1.4'
        }}>
          <strong>Инструкции:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
            <li>Откройте консоль браузера (F12)</li>
            <li>Нажмите кнопку "Запустить тесты"</li>
            <li>Проверьте результаты в консоли</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APITestPanel;
