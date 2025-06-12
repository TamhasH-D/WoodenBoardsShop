import React from 'react';

const TestDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        Тестовая панель управления
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Пользователи</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>23</div>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            15 покупателей, 8 продавцов
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Товары</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>42</div>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            125.5 м³, 850,000 ₽
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Типы древесины</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>12</div>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Средняя цена: 6,800 ₽/м³
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Коммуникации</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>7</div>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            23 сообщения
          </p>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#374151' }}>Быстрые действия</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button style={{
            padding: '15px',
            background: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Управление продавцами и покупателями
          </button>
          <button style={{
            padding: '15px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Управление товарами
          </button>
          <button style={{
            padding: '15px',
            background: '#d97706',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Аналитика
          </button>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#374151' }}>Состояние системы</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '4px'
          }}>
            <span>Административная панель</span>
            <span style={{ color: '#059669', fontWeight: '500' }}>Готова к работе</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '4px'
          }}>
            <span>База данных</span>
            <span style={{ color: '#059669', fontWeight: '500' }}>Подключена</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#f8fafc',
            borderRadius: '4px'
          }}>
            <span>Последнее обновление</span>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>
              {new Date().toLocaleTimeString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
