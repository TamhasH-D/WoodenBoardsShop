import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { BUYER_TEXTS } from '../utils/localization';
import { apiService } from '../services/api';

/**
 * Премиум главная страница buyer frontend
 * Современный дизайн с hero секцией, статистикой и быстрыми действиями
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
    setPageTitle(BUYER_TEXTS.HOME);
    loadHomeData();
  }, [setPageTitle, loadHomeData]);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Проверка подключения к бэкенду
      try {
        await apiService.healthCheck();
        setBackendStatus({ online: true });
      } catch (error) {
        setBackendStatus({ online: false });
      }

      // Загрузка статистики (можно добавить реальные API вызовы)
      // const [products, sellers, woodTypes] = await Promise.all([
      //   apiService.getProducts({ limit: 6 }),
      //   apiService.getSellers(),
      //   apiService.getWoodTypes()
      // ]);

      // Пока используем моковые данные
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
            seller: 'ЛесТорг',
            image: '/images/pine.jpg'
          },
          {
            id: 2,
            name: 'Дуб массив',
            price: 45000,
            woodType: 'Дуб',
            seller: 'ПремиумЛес',
            image: '/images/oak.jpg'
          },
          {
            id: 3,
            name: 'Береза фанера',
            price: 8000,
            woodType: 'Береза',
            seller: 'ФанераПлюс',
            image: '/images/birch.jpg'
          }
        ]
      });
      
    } catch (error) {
      console.error('Ошибка загрузки данных главной страницы:', error);
      showError('Не удалось загрузить данные. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  }, [setBackendStatus, showError]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner">
          <div className="spinner-ring">
            <div className="spinner-circle"></div>
          </div>
        </div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero секция */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {BUYER_TEXTS.WELCOME_TITLE}
            </h1>
            <p className="hero-subtitle">
              {BUYER_TEXTS.WELCOME_SUBTITLE}
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-large">
                🌲 Каталог древесины
              </Link>
              <Link to="/analyzer" className="btn btn-secondary btn-large">
                📐 Анализатор досок
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-icon">🌲</div>
              <h3>Премиум качество</h3>
              <p>Только проверенные поставщики</p>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-number">{stats.totalProducts}</div>
            <div className="stat-label">Товаров в каталоге</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-number">{stats.totalSellers}</div>
            <div className="stat-label">Проверенных продавцов</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌳</div>
            <div className="stat-number">{stats.totalWoodTypes}</div>
            <div className="stat-label">Видов древесины</div>
          </div>
        </div>
      </section>

      {/* Рекомендуемые товары */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Рекомендуемые товары</h2>
          <Link to="/products" className="section-link">
            Смотреть все →
          </Link>
        </div>
        
        <div className="products-grid">
          {stats.featuredProducts.map(product => (
            <div key={product.id} className="product-card hover-lift">
              <div className="product-image">
                <div className="product-placeholder">
                  🌲
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-seller">от {product.seller}</p>
                <div className="product-price">
                  {product.price.toLocaleString('ru-RU')} ₽/м³
                </div>
                <button className="btn btn-primary btn-small">
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Быстрые действия */}
      <section className="actions-section">
        <div className="actions-grid">
          <Link to="/products" className="action-card">
            <div className="action-icon">🛒</div>
            <h3>Каталог товаров</h3>
            <p>Просмотр всех доступных товаров</p>
          </Link>
          <Link to="/sellers" className="action-card">
            <div className="action-icon">🏪</div>
            <h3>Продавцы</h3>
            <p>Найти проверенных поставщиков</p>
          </Link>
          <Link to="/analyzer" className="action-card">
            <div className="action-icon">📐</div>
            <h3>Анализатор досок</h3>
            <p>Расчет объема и количества</p>
          </Link>
          <Link to="/chats" className="action-card">
            <div className="action-icon">💬</div>
            <h3>Сообщения</h3>
            <p>Общение с продавцами</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
