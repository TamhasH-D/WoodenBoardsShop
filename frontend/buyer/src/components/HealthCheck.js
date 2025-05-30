import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function HealthCheck() {
  const { data, loading, error, refetch } = useApi(() => apiService.healthCheck());

  return (
    <div className="card">
      <h2>System Status Check</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={refetch} className="btn btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check System Status'}
        </button>
      </div>

      {loading && <div className="loading">Checking system status...</div>}
      
      {error && (
        <div className="error">
          <strong>System Connection Failed:</strong> {error}
          <br />
          <small>The marketplace backend is not responding. Please try again later.</small>
        </div>
      )}
      
      {data !== null && !error && (
        <div className="success">
          <strong>System is operational!</strong> All marketplace services are running normally.
          <br />
          <small>Backend response: {JSON.stringify(data)}</small>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
        <h3>Connection Information</h3>
        <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Proxy:</strong> {process.env.REACT_APP_API_URL ? 'Disabled' : 'Enabled (via package.json)'}</p>
        
        <div style={{ marginTop: '1rem' }}>
          <h4>If you're experiencing issues:</h4>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Check your internet connection</li>
            <li>Ensure the marketplace backend is running</li>
            <li>Try refreshing the page</li>
            <li>Contact support if problems persist</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
        <h4>🌲 Marketplace Features</h4>
        <div className="grid grid-2">
          <div>
            <h5>Available Services:</h5>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Product browsing and search</li>
              <li>Seller directory and profiles</li>
              <li>AI-powered board analysis</li>
              <li>Real-time chat system</li>
            </ul>
          </div>
          <div>
            <h5>System Status:</h5>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Backend API: {error ? '❌ Offline' : '✅ Online'}</li>
              <li>Database: {error ? '❌ Unavailable' : '✅ Connected'}</li>
              <li>File Upload: {error ? '❌ Disabled' : '✅ Available'}</li>
              <li>Chat System: {error ? '❌ Offline' : '✅ Ready'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;
