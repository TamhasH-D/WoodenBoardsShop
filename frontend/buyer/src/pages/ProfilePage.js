import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { apiService } = useApi();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState({
    orders: false,
    calculations: false,
    favorites: false
  });
  
  // Mock data for demonstration
  useEffect(() => {
    // This would normally fetch data from the API
    setOrders([
      { id: '1', date: '2023-05-15', status: 'Доставлен', total: 15000 },
      { id: '2', date: '2023-06-20', status: 'В обработке', total: 8500 },
    ]);
    
    setSavedCalculations([
      { id: '1', date: '2023-05-10', woodType: 'Сосна', volume: 2.5, price: 18750 },
      { id: '2', date: '2023-06-15', woodType: 'Дуб', volume: 1.2, price: 30000 },
    ]);
    
    setFavoriteProducts([
      { id: '1', title: 'Доска обрезная сосна', price: 7500 },
      { id: '2', title: 'Доска дубовая премиум', price: 25000 },
    ]);
  }, []);
  
  // Profile information tab
  const renderProfileTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-wood-text mb-6">Личная информация</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-wood-text font-medium mb-2">Имя</label>
          <input
            type="text"
            value={currentUser?.name || ''}
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            readOnly
          />
        </div>
        
        <div>
          <label className="block text-wood-text font-medium mb-2">Email</label>
          <input
            type="email"
            value={currentUser?.email || ''}
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            readOnly
          />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button variant="primary">Редактировать профиль</Button>
        <Button variant="outline" onClick={logout}>Выйти</Button>
      </div>
    </div>
  );
  
  // Orders tab
  const renderOrdersTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-wood-text mb-6">История заказов</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
          <Link to="/products">
            <Button variant="primary">Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  № заказа
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-wood-text">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Доставлен' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.total.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/order/${order.id}`} className="text-wood-accent hover:text-wood-accent-dark">
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
  // Saved calculations tab
  const renderCalculationsTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-wood-text mb-6">Сохраненные расчеты</h2>
      
      {savedCalculations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">У вас пока нет сохраненных расчетов</p>
          <Link to="/calculator">
            <Button variant="primary">Перейти к калькулятору</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedCalculations.map((calc) => (
            <Card key={calc.id}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-wood-text">{calc.woodType}</h3>
                  <p className="text-sm text-gray-500">{calc.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-wood-dark">{calc.price.toLocaleString('ru-RU')} ₽</p>
                  <p className="text-sm text-gray-500">Объем: {calc.volume} м³</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" fullWidth>
                  Редактировать
                </Button>
                <Button variant="primary" size="sm" fullWidth>
                  Заказать
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
  // Favorite products tab
  const renderFavoritesTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-wood-text mb-6">Избранные товары</h2>
      
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">У вас пока нет избранных товаров</p>
          <Link to="/products">
            <Button variant="primary">Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favoriteProducts.map((product) => (
            <Card key={product.id} className="flex justify-between items-center p-4">
              <div>
                <h3 className="font-semibold text-wood-text">{product.title}</h3>
                <p className="text-wood-dark font-bold">{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex space-x-2">
                <Link to={`/product/${product.id}`}>
                  <Button variant="outline" size="sm">
                    Подробнее
                  </Button>
                </Link>
                <Button variant="primary" size="sm">
                  В корзину
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Личный кабинет</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card>
              <div className="flex flex-col space-y-2">
                <button
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'profile'
                      ? 'bg-wood-accent text-white'
                      : 'hover:bg-gray-100 text-wood-text'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Профиль
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'orders'
                      ? 'bg-wood-accent text-white'
                      : 'hover:bg-gray-100 text-wood-text'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  Заказы
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'calculations'
                      ? 'bg-wood-accent text-white'
                      : 'hover:bg-gray-100 text-wood-text'
                  }`}
                  onClick={() => setActiveTab('calculations')}
                >
                  Расчеты
                </button>
                <button
                  className={`text-left px-4 py-2 rounded-lg ${
                    activeTab === 'favorites'
                      ? 'bg-wood-accent text-white'
                      : 'hover:bg-gray-100 text-wood-text'
                  }`}
                  onClick={() => setActiveTab('favorites')}
                >
                  Избранное
                </button>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-grow">
            <Card>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'orders' && renderOrdersTab()}
              {activeTab === 'calculations' && renderCalculationsTab()}
              {activeTab === 'favorites' && renderFavoritesTab()}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
