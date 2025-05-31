import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import DataExport from '../components/DataExport';
import ApiTester from '../components/ApiTester';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

/**
 * Tools page with sub-routes
 */
const ToolsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('Tools');
  }, [setPageTitle]);

  const DataImportPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📥"
        title="Data Import"
        description="Import data from CSV, JSON, or Excel files. This feature will include validation, error reporting, and batch processing capabilities."
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
      <Route path="/" element={<Navigate to="/tools/export" replace />} />
      <Route path="/export" element={<DataExport />} />
      <Route path="/import" element={<DataImportPlaceholder />} />
      <Route path="/api-test" element={<ApiTester />} />
    </Routes>
  );
};

export default ToolsPage;
