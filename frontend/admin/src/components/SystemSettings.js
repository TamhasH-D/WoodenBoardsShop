import React from 'react';

const SystemSettings = React.memo(() => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-description">Platform configuration and administrative controls</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Configuration</h2>
        </div>
        
        <div className="grid grid-2">
          <div>
            <h3>API Configuration</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>Version:</strong> 2.0.0
              </li>
            </ul>
          </div>
          
          <div>
            <h3>System Information</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Platform:</strong> Wood Trading Admin
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Build:</strong> Production
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SystemSettings;
