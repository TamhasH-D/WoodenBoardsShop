import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function HealthCheck() {
  const { data, loading, error, refetch } = useApi(() => apiService.healthCheck());

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Health Check</h1>
        <p className="page-description">Monitor system status and backend connectivity</p>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Health Status</h2>
        </div>

        <div className="mb-4">
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
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Connection Details</h2>
        </div>

        <div className="mb-4">
          <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Proxy:</strong> {process.env.REACT_APP_API_URL ? 'Disabled' : 'Enabled (via package.json)'}</p>
        </div>

        <div>
          <h3>Troubleshooting</h3>
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
