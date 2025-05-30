import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function HealthCheck() {
  const { data, loading, error, refetch } = useApi(() => apiService.healthCheck());

  return (
    <div className="card">
      <h2>Backend Health Check</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={refetch} className="btn btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check Health'}
        </button>
      </div>

      {loading && <div className="loading">Checking backend health...</div>}
      
      {error && (
        <div className="error">
          <strong>Backend Connection Failed:</strong> {error}
          <br />
          <small>Make sure the backend is running on the correct port and CORS is configured.</small>
        </div>
      )}
      
      {data !== null && !error && (
        <div className="success">
          <strong>Backend is healthy!</strong> API is responding correctly.
          <br />
          <small>Response: {JSON.stringify(data)}</small>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
        <h3>Connection Details</h3>
        <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Proxy:</strong> {process.env.REACT_APP_API_URL ? 'Disabled' : 'Enabled (via package.json)'}</p>
      </div>
    </div>
  );
}

export default HealthCheck;
