import React, { useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

const HealthMonitoring = React.memo(() => {
  // Create stable function reference to prevent infinite loops
  const fetchHealthCheck = useCallback(() => apiService.healthCheck(), []);

  const { data: health, loading, error, refetch } = useApi(
    fetchHealthCheck,
    []
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Health Monitoring</h1>
        <p className="page-description">System status and performance metrics</p>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">System Health</h2>
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
        
        {health !== null && !error && (
          <div className="success">
            <strong>System is healthy!</strong> All services are responding correctly.
            <br />
            <small>Backend response: {JSON.stringify(health)}</small>
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
});

export default HealthMonitoring;
