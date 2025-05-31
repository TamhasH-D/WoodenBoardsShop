import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

/**
 * Analytics page placeholder
 */
const AnalyticsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('Analytics');
  }, [setPageTitle]);

  return (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📈"
        title="Analytics Dashboard"
        description="Advanced analytics and reporting features will be available here. This includes user behavior analysis, sales metrics, and performance insights."
        action={
          <Button variant="primary">
            Coming Soon
          </Button>
        }
      />
    </div>
  );
};

export default AnalyticsPage;
