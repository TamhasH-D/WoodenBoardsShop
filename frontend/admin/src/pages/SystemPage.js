import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import HealthCheck from '../components/HealthCheck';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница управления системой с подмаршрутами
 */
const SystemPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.SYSTEM);
  }, [setPageTitle]);

  const SystemLogsPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📝"
        title={ADMIN_TEXTS.SYSTEM_LOGS}
        description="Просмотр и анализ системных логов, отчетов об ошибках и аудиторских следов. Включает потоковую передачу логов в реальном времени и расширенные возможности фильтрации."
        action={
          <Button variant="primary">
            Скоро будет доступно
          </Button>
        }
      />
    </div>
  );

  const SystemSettingsPlaceholder = () => (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="⚙️"
        title={ADMIN_TEXTS.SETTINGS}
        description="Настройка общесистемных параметров, пользовательских предпочтений, политик безопасности и параметров приложения."
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
      <Route path="/" element={<Navigate to="/system/health" replace />} />
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/logs" element={<SystemLogsPlaceholder />} />
      <Route path="/settings" element={<SystemSettingsPlaceholder />} />
    </Routes>
  );
};

export default SystemPage;
