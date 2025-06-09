import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Главная страница buyer frontend
 * Чистый и функциональный дизайн
 */
const HomePage = () => {
  const { setPageTitle, setBackendStatus } = useApp();
  const { showError } = useNotifications();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalWoodTypes: 0,
    featuredProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Главная');
    loadHomeData();
  }, [setPageTitle]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Проверка подключения к бэкенду
      try {
        setBackendStatus({ online: true });
      } catch (error) {
        setBackendStatus({ online: false });
      }

      // Моковые данные для демонстрации
      setStats({
        totalProducts: 150,
        totalSellers: 25,
        totalWoodTypes: 12,
        featuredProducts: [
          {
            id: 1,
            name: 'Сосна обрезная',
            price: 15000,
            woodType: 'Сосна',
            seller: 'ЛесТорг'
          },
          {
            id: 2,
            name: 'Дуб массив',
            price: 45000,
            woodType: 'Дуб',
            seller: 'ПремиумЛес'
          },
          {
            id: 3,
            name: 'Береза фанера',
            price: 8000,
            woodType: 'Береза',
            seller: 'ФанераПлюс'
          }
        ]
      });
      
    } catch (error) {
      console.error('Ошибка загрузки данных главной страницы:', error);
      showError('Не удалось загрузить данные. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Загрузка данных...
      </div>
    );
  }

  return (
    <div>
      {/* Hero секция */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%)',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '48rem' }}>
          <h1 className="page-title" style={{ color: 'white', marginBottom: '1rem' }}>
            Добро пожаловать в WoodMarket
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Профессиональный маркетплейс древесины с проверенными поставщиками
          </p>
          <div className="flex gap-4">
            <Link to="/products" className="btn btn-secondary">
              🌲 Каталог древесины
            </Link>
            <Link to="/analyzer" className="btn" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}>
              📐 Анализатор досок
            </Link>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <div className="flex items-center">
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>📦</span>
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {stats.totalProducts}
              </p>
              <p style={{ color: '#6b7280' }}>Товаров в каталоге</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#dcfce7',
              borderRadius: '0.5rem',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem', color: '#16a34a' }}>🏪</span>
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {stats.totalSellers}
              </p>
              <p style={{ color: '#6b7280' }}>Проверенных продавцов</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              marginRight: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem', color: '#ca8a04' }}>🌲</span>
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {stats.totalWoodTypes}
              </p>
              <p style={{ color: '#6b7280' }}>Видов древесины</p>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендуемые товары */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            Рекомендуемые товары
          </h2>
          <Link
            to="/products"
            style={{
              color: 'var(--color-primary)',
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            Смотреть все →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {stats.featuredProducts.map(product => (
            <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: '12rem',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '3rem' }}>🌲</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  {product.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  от {product.seller}
                </p>
                <div className="flex justify-between items-center">
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)'
                  }}>
                    {product.price.toLocaleString('ru-RU')} ₽/м³
                  </span>
                  <button className="btn btn-primary">
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Быстрые действия */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <Link
          to="/products"
          className="card"
          style={{
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🛒</div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Каталог товаров
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Просмотр всех доступных товаров
          </p>
        </Link>

        <Link
          to="/sellers"
          className="card"
          style={{
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏪</div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Продавцы
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Найти проверенных поставщиков
          </p>
        </Link>

        <Link
          to="/analyzer"
          className="card"
          style={{
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📐</div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Анализатор досок
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Расчет объема и количества
          </p>
        </Link>

        <Link
          to="/chats"
          className="card"
          style={{
            textDecoration: 'none',
            textAlign: 'center',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Сообщения
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Общение с продавцами
          </p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
