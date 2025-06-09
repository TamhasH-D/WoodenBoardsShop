import React from 'react';

/**
 * Компактный компонент для отображения ошибок
 * Не делает страницу огромной по вертикали
 */
const ErrorMessage = ({ error, onDismiss }) => {
  if (!error) return null;

  // Если ошибка - строка, показываем как есть
  if (typeof error === 'string') {
    return (
      <div className="error" style={{ 
        maxHeight: '120px', 
        overflow: 'auto',
        position: 'relative'
      }}>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        )}
        <strong>Ошибка:</strong> {error}
      </div>
    );
  }

  // Если ошибка - объект, извлекаем сообщение
  const message = error?.message || error?.error || 'Произошла неизвестная ошибка';
  
  return (
    <div className="error" style={{ 
      maxHeight: '120px', 
      overflow: 'auto',
      position: 'relative'
    }}>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ×
        </button>
      )}
      <strong>Ошибка:</strong> {message}
      {error?.details && (
        <details style={{ marginTop: '0.5rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
            Подробности
          </summary>
          <pre style={{ 
            fontSize: '0.75rem', 
            marginTop: '0.5rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(error.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorMessage;
