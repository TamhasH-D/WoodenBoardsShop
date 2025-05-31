import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import HealthCheck from '../components/HealthCheck';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

/**
 * System management page with sub-routes
 */
const SystemPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('System Management');
  }, [setPageTitle]);

  const SystemLogsPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📝"
        title="System Logs"
        description="View and analyze system logs, error reports, and audit trails. This includes real-time log streaming and advanced filtering capabilities."
        action={
          <Button variant="primary">
            Coming Soon
          </Button>
        }
      />
    </div>
  );

  const SystemSettingsPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="⚙️"
        title="System Settings"
        description="Configure system-wide settings, user preferences, security policies, and application parameters."
        action={
          <Button variant="primary">
            Coming Soon
          </Button>
        }
      />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/system/health" replace />} />
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/logs" element={<SystemLogsPlaceholder />} />
      <Route path="/settings" element={<SystemSettingsPlaceholder />} />
    </Routes>
  );
};

export default SystemPage;
