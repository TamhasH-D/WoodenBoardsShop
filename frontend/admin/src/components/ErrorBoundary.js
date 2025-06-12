import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <div className="error">
            <h2>Произошла ошибка</h2>
            <p>Произошла неожиданная ошибка. Пожалуйста, обновите страницу и попробуйте снова.</p>

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Обновить страницу
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="btn btn-secondary"
                style={{ marginLeft: '1rem' }}
              >
                Попробовать снова
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <summary>Error Details (Development Only)</summary>
                <pre style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem', overflow: 'auto' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
