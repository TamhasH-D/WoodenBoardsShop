import { useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';

function HealthCheck() {
  // Create stable API function to prevent infinite loops
  const healthApiFunction = useMemo(() => () => apiService.healthCheck(), []);
  const { data, loading, error, refetch } = useApi(healthApiFunction, []);

  return (
    <div className="card">
      <h2>{BUYER_TEXTS.SYSTEM_STATUS}</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={refetch} className="btn btn-primary" disabled={loading}>
          {loading ? BUYER_TEXTS.REFRESHING : BUYER_TEXTS.REFRESH_STATUS}
        </button>
      </div>

      {loading && <div className="loading">{BUYER_TEXTS.REFRESHING}</div>}

      {error && (
        <div className="error">
          <strong>{BUYER_TEXTS.SYSTEM_ERROR}:</strong> {error}
          <br />
          <small>Бэкенд торговой площадки не отвечает. Попробуйте позже.</small>
        </div>
      )}

      {data !== null && !error && (
        <div className="success">
          <strong>{BUYER_TEXTS.SYSTEM_HEALTHY}!</strong> Все сервисы торговой площадки работают нормально.
          <br />
          <small>Ответ бэкенда: {JSON.stringify(data)}</small>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
        <h3>Информация о подключении</h3>
        <p><strong>URL API:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
        <p><strong>Окружение:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Прокси:</strong> {process.env.REACT_APP_API_URL ? 'Отключен' : 'Включен (через package.json)'}</p>

        <div style={{ marginTop: '1rem' }}>
          <h4>Если у вас возникли проблемы:</h4>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Проверьте подключение к интернету</li>
            <li>Убедитесь, что бэкенд торговой площадки запущен</li>
            <li>Попробуйте обновить страницу</li>
            <li>Обратитесь в службу поддержки, если проблемы не исчезают</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
        <h4>🌲 Возможности торговой площадки</h4>
        <div className="grid grid-2">
          <div>
            <h5>Доступные сервисы:</h5>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Просмотр и поиск товаров</li>
              <li>Каталог и профили продавцов</li>
              <li>ИИ-анализ досок</li>
              <li>Система чатов в реальном времени</li>
            </ul>
          </div>
          <div>
            <h5>Статус системы:</h5>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Backend API: {error ? '❌ Не в сети' : '✅ В сети'}</li>
              <li>База данных: {error ? '❌ Недоступна' : '✅ Подключена'}</li>
              <li>Загрузка файлов: {error ? '❌ Отключена' : '✅ Доступна'}</li>
              <li>Система чатов: {error ? '❌ Не в сети' : '✅ Готова'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;
