import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница аналитики (заглушка)
 */
const AnalyticsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.ANALYTICS);
  }, [setPageTitle]);

  return (
    <div style={{ padding: '2rem' }}>
      <EmptyState
        icon="📈"
        title="Панель аналитики"
        description="Расширенные функции аналитики и отчетности будут доступны здесь. Это включает анализ поведения пользователей, метрики продаж и аналитику производительности."
        action={
          <Button variant="primary">
            Скоро будет доступно
          </Button>
        }
      />
    </div>
  );
};

export default AnalyticsPage;
