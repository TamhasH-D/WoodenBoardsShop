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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero секция */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Добро пожаловать в WoodMarket
          </h1>
          <p className="text-xl mb-6 text-primary-100">
            Профессиональный маркетплейс древесины с проверенными поставщиками
          </p>
          <div className="flex gap-4">
            <Link to="/products" className="bg-white text-primary-600 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
              🌲 Каталог древесины
            </Link>
            <Link to="/analyzer" className="bg-primary-500 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-400 transition-colors">
              📐 Анализатор досок
            </Link>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-gray-500">Товаров в каталоге</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalSellers}</p>
              <p className="text-gray-500">Проверенных продавцов</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalWoodTypes}</p>
              <p className="text-gray-500">Видов древесины</p>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендуемые товары */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Рекомендуемые товары</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            Смотреть все →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.featuredProducts.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-4xl">🌲</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">от {product.seller}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-primary-600">
                    {product.price.toLocaleString('ru-RU')} ₽/м³
                  </span>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition-colors">
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/products" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Каталог товаров</h3>
          <p className="text-gray-600 text-sm">Просмотр всех доступных товаров</p>
        </Link>

        <Link to="/sellers" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-3">🏪</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Продавцы</h3>
          <p className="text-gray-600 text-sm">Найти проверенных поставщиков</p>
        </Link>

        <Link to="/analyzer" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-3">📐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Анализатор досок</h3>
          <p className="text-gray-600 text-sm">Расчет объема и количества</p>
        </Link>

        <Link to="/chats" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Сообщения</h3>
          <p className="text-gray-600 text-sm">Общение с продавцами</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
