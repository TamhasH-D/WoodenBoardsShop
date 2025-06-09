import React from 'react';

/**
 * Премиум Error Boundary для buyer frontend
 * Обрабатывает ошибки React с красивым UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы показать fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Здесь можно отправить ошибку в сервис мониторинга
    // например, Sentry, LogRocket и т.д.
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            {/* Иконка ошибки */}
            <div className="error-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            {/* Заголовок ошибки */}
            <h1 className="error-title">
              Что-то пошло не так
            </h1>

            {/* Описание ошибки */}
            <p className="error-description">
              Произошла неожиданная ошибка в приложении. 
              Мы уже работаем над её исправлением.
            </p>

            {/* Действия */}
            <div className="error-actions">
              <button 
                onClick={this.handleReload}
                className="btn btn-primary"
              >
                🔄 Перезагрузить страницу
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="btn btn-secondary"
              >
                🏠 На главную
              </button>
            </div>

            {/* Детали ошибки (только в development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Детали ошибки (для разработчиков)</summary>
                <div className="error-stack">
                  <h3>Ошибка:</h3>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h3>Stack trace:</h3>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}

            {/* Информация о поддержке */}
            <div className="error-support">
              <p>
                Если проблема повторяется, обратитесь в службу поддержки
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
