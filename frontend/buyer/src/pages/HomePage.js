import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../components/auth';
import Home from '../components/Home';

/**
 * Главная страница buyer frontend
 * Использует реальные данные из API
 */
const HomePage = () => {
  const { setPageTitle } = useApp();
  const { isAuthenticated, user, buyerProfile } = useAuth();

  useEffect(() => {
    setPageTitle('Главная');
  }, [setPageTitle]);

  return (
    <div>
      {/* Информационная панель аутентификации для демонстрации */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '0.5rem',
          padding: '1rem',
          margin: '1rem',
          fontSize: '0.875rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>
            🔐 Статус аутентификации (только в режиме разработки)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div>
              <strong>Аутентифицирован:</strong> {isAuthenticated ? '✅ Да' : '❌ Нет'}
            </div>
            {user && (
              <>
                <div>
                  <strong>Email:</strong> {user.email || 'Не указан'}
                </div>
                <div>
                  <strong>Имя:</strong> {user.name || user.preferred_username || 'Не указано'}
                </div>
                <div>
                  <strong>Keycloak ID:</strong> {user.sub?.substring(0, 8)}...
                </div>
              </>
            )}
            {buyerProfile && (
              <>
                <div>
                  <strong>Buyer ID:</strong> {buyerProfile.id?.substring(0, 8)}...
                </div>
                <div>
                  <strong>Статус:</strong> {buyerProfile.is_online ? 'Онлайн' : 'Оффлайн'}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Home />
    </div>
  );
};

export default HomePage;
