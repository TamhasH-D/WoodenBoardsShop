import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import DataExport from '../components/DataExport';
import ApiTester from '../components/ApiTester';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница инструментов с подмаршрутами
 */
const ToolsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.TOOLS);
  }, [setPageTitle]);

  const DataImportPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📥"
        title={ADMIN_TEXTS.DATA_IMPORT}
        description="Импорт данных из файлов CSV, JSON или Excel. Эта функция будет включать валидацию, отчеты об ошибках и возможности пакетной обработки."
        action={
          <Button variant="primary">
            Скоро будет доступно
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
