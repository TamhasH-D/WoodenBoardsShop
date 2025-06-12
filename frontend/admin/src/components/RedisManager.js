import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function RedisManager() {
  const [redisKey, setRedisKey] = useState('');
  const [redisValue, setRedisValue] = useState('');
  const [getKey, setGetKey] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { mutate, loading, error, success } = useApiMutation();

  const handleSetValue = async (e) => {
    e.preventDefault();
    if (!redisKey.trim() || !redisValue.trim()) {
      return;
    }

    try {
      await mutate(apiService.setRedisValue, redisKey.trim(), redisValue.trim());
      setRedisKey('');
      setRedisValue('');
    } catch (err) {
      console.error('Failed to set Redis value:', err);
    }
  };

  const handleGetValue = async (e) => {
    e.preventDefault();
    if (!getKey.trim()) {
      return;
    }

    try {
      const result = await mutate(apiService.getRedisValue, getKey.trim());
      setRetrievedData(result);
    } catch (err) {
      console.error('Failed to get Redis value:', err);
      setRetrievedData(null);
    }
  };

  const predefinedKeys = [
    'system:status',
    'cache:buyers_sellers',
    'session:active',
    'config:settings',
    'analytics:daily'
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>🔧 Redis Управление</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn btn-secondary"
          style={{ fontSize: '0.9em' }}
        >
          {showAdvanced ? 'Простой режим' : 'Расширенный режим'}
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Ошибка Redis операции: {error}
        </div>
      )}

      {success && (
        <div className="success" style={{ marginBottom: '1rem' }}>
          Redis операция выполнена успешно!
        </div>
      )}

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Set Value Section */}
        <div className="card" style={{ backgroundColor: '#f7fafc' }}>
          <h4>📝 Установить значение</h4>
          <form onSubmit={handleSetValue}>
            <div className="form-group">
              <label className="form-label">Ключ *</label>
              {showAdvanced ? (
                <input
                  type="text"
                  value={redisKey}
                  onChange={(e) => setRedisKey(e.target.value)}
                  className="form-input"
                  placeholder="Введите ключ Redis..."
                  required
                />
              ) : (
                <select
                  value={redisKey}
                  onChange={(e) => setRedisKey(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Выберите ключ...</option>
                  {predefinedKeys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                  <option value="custom">Пользовательский ключ</option>
                </select>
              )}
              {!showAdvanced && redisKey === 'custom' && (
                <input
                  type="text"
                  value={redisKey}
                  onChange={(e) => setRedisKey(e.target.value)}
                  className="form-input"
                  placeholder="Введите пользовательский ключ..."
                  style={{ marginTop: '0.5rem' }}
                  required
                />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Значение *</label>
              <textarea
                value={redisValue}
                onChange={(e) => setRedisValue(e.target.value)}
                className="form-input"
                placeholder="Введите значение (JSON, строка, число)..."
                rows={4}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !redisKey.trim() || !redisValue.trim()}
            >
              {loading ? 'Сохранение...' : 'Установить значение'}
            </button>
          </form>
        </div>

        {/* Get Value Section */}
        <div className="card" style={{ backgroundColor: '#f0fff4' }}>
          <h4>🔍 Получить значение</h4>
          <form onSubmit={handleGetValue}>
            <div className="form-group">
              <label className="form-label">Ключ для поиска *</label>
              {showAdvanced ? (
                <input
                  type="text"
                  value={getKey}
                  onChange={(e) => setGetKey(e.target.value)}
                  className="form-input"
                  placeholder="Введите ключ для поиска..."
                  required
                />
              ) : (
                <select
                  value={getKey}
                  onChange={(e) => setGetKey(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Выберите ключ...</option>
                  {predefinedKeys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                  <option value="custom">Пользовательский ключ</option>
                </select>
              )}
              {!showAdvanced && getKey === 'custom' && (
                <input
                  type="text"
                  value={getKey}
                  onChange={(e) => setGetKey(e.target.value)}
                  className="form-input"
                  placeholder="Введите пользовательский ключ..."
                  style={{ marginTop: '0.5rem' }}
                  required
                />
              )}
            </div>
            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={loading || !getKey.trim()}
            >
              {loading ? 'Поиск...' : 'Получить значение'}
            </button>
          </form>

          {/* Retrieved Data Display */}
          {retrievedData && (
            <div style={{ marginTop: '1rem' }}>
              <h5>📋 Результат:</h5>
              <div 
                className="card" 
                style={{ 
                  backgroundColor: '#e6fffa', 
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                <strong>Ключ:</strong> {retrievedData.key}<br/>
                <strong>Значение:</strong><br/>
                <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                  {typeof retrievedData.value === 'object' 
                    ? JSON.stringify(retrievedData.value, null, 2)
                    : retrievedData.value
                  }
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {showAdvanced && (
        <div className="card" style={{ backgroundColor: '#fff5f5', marginTop: '1rem' }}>
          <h4>⚡ Быстрые действия</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setRedisKey('system:timestamp');
                setRedisValue(new Date().toISOString());
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9em' }}
            >
              Установить временную метку
            </button>
            <button
              onClick={() => {
                setRedisKey('admin:session');
                setRedisValue(JSON.stringify({ user: 'admin', timestamp: Date.now() }));
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9em' }}
            >
              Создать сессию админа
            </button>
            <button
              onClick={() => {
                setGetKey('system:status');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.9em' }}
            >
              Проверить статус системы
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card" style={{ backgroundColor: '#f8f9fa', marginTop: '1rem' }}>
        <h5>💡 Справка</h5>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9em' }}>
          <li><strong>Redis</strong> - система кэширования и хранения данных в памяти</li>
          <li><strong>Ключ</strong> - уникальный идентификатор для значения</li>
          <li><strong>Значение</strong> - данные, которые хранятся по ключу (строка, JSON, число)</li>
          <li><strong>Предустановленные ключи</strong> - часто используемые системные ключи</li>
          <li><strong>Расширенный режим</strong> - позволяет вводить произвольные ключи</li>
        </ul>
      </div>
    </div>
  );
}

export default RedisManager;
