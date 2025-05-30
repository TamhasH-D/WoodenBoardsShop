import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function HealthCheck() {
  const { data, loading, error, refetch } = useApi(() => apiService.healthCheck());

  return (
    <div className="card">
      <h2>System Health Check</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={refetch} className="btn btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check System Health'}
        </button>
      </div>

      {loading && <div className="loading">Checking system health...</div>}
      
      {error && (
        <div className="error">
          <strong>System Connection Failed:</strong> {error}
          <br />
          <small>The backend API is not responding. Please check if the backend service is running.</small>
        </div>
      )}
      
      {data !== null && !error && (
        <div className="success">
          <strong>System is healthy!</strong> All services are responding correctly.
          <br />
          <small>Backend response: {JSON.stringify(data)}</small>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
        <h3>Connection Details</h3>
        <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Proxy:</strong> {process.env.REACT_APP_API_URL ? 'Disabled' : 'Enabled (via package.json)'}</p>
        
        <div style={{ marginTop: '1rem' }}>
          <h4>Troubleshooting</h4>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Ensure the backend API is running on port 8000</li>
            <li>Check that CORS is properly configured in the backend</li>
            <li>Verify network connectivity between frontend and backend</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;
