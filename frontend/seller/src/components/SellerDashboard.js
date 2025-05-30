import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiShoppingCart, FiDollarSign, FiUsers, FiMessageCircle, FiTrendingUp, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import EmptyState from './common/EmptyState';
import ErrorMessage from './common/ErrorMessage';
import SkeletonLoader from './common/SkeletonLoader';
import apiService from '../apiService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SellerDashboard() {
  const sellerId = 'seller-test-001'; // Use test seller ID

  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['sellerDashboardStats', sellerId],
    queryFn: () => apiService.getSellerDashboardStats(sellerId),
    enabled: !!sellerId,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Seller dashboard stats error:', error);
    }
  });

  // Fetch seller's products
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => apiService.getProducts({
      limit: 5,
      filters: { seller_id: sellerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: !!sellerId,
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Seller products error:', error);
    }
  });

  // Fetch recent chat messages
  const {
    data: chatMessagesData,
    isLoading: isLoadingChats,
    error: chatError,
    refetch: refetchChat
  } = useQuery({
    queryKey: ['sellerChatMessages', sellerId],
    queryFn: () => apiService.getChatMessages({
      limit: 5,
      filters: { sender_id: sellerId },
      sortBy: 'created_at',
      sortDirection: 'desc'
    }),
    enabled: !!sellerId,
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Seller chat messages error:', error);
    }
  });

  // Fetch wood types for analytics
  const {
    data: woodTypesData,
    error: woodTypesError
  } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => apiService.getWoodTypes({ limit: 100 }),
    retry: 2,
    onError: (error) => {
      console.error('Wood types error:', error);
    }
  });

  // Stats data based on real API data
  const statsItems = [
    {
      id: 1,
      title: 'Мои товары',
      value: statsLoading ? '...' : (stats?.products || 0),
      icon: <FiPackage className="text-brand-primary" size={24} />,
      loading: statsLoading
    },
    {
      id: 2,
      title: 'Сообщения',
      value: statsLoading ? '...' : (stats?.messages || 0),
      icon: <FiMessageCircle className="text-blue-500" size={24} />,
      loading: statsLoading
    },
    {
      id: 3,
      title: 'Заказы',
      value: statsLoading ? '...' : (stats?.orders || 0),
      icon: <FiShoppingCart className="text-brand-accent" size={24} />,
      loading: statsLoading
    },
    {
      id: 4,
      title: 'Доход',
      value: statsLoading ? '...' : `₽${stats?.revenue || 0}`,
      icon: <FiDollarSign className="text-green-600" size={24} />,
      loading: statsLoading
    },
  ];

  // Generate chart data based on real products data
  const generateProductsChart = () => {
    if (productsError || !productsData?.data?.length) {
      return {
        labels: ['Нет данных'],
        datasets: [{
          label: 'Товары',
          data: [0],
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: '#9CA3AF',
        }]
      };
    }

    // Group products by creation month
    const monthlyData = {};
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    productsData.data.forEach(product => {
      const date = new Date(product.created_at);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Добавленные товары',
        data: Object.values(monthlyData),
        borderColor: '#5D4037',
        backgroundColor: 'rgba(93, 64, 55, 0.2)',
        tension: 0.4,
      }]
    };
  };

  // Generate wood types distribution chart
  const generateWoodTypesChart = () => {
    if (woodTypesError || !woodTypesData?.data?.length) {
      return {
        labels: ['Нет данных'],
        datasets: [{
          label: 'Типы древесины',
          data: [0],
          backgroundColor: ['rgba(156, 163, 175, 0.2)'],
        }]
      };
    }

    const colors = [
      'rgba(93, 64, 55, 0.8)',
      'rgba(76, 175, 80, 0.8)',
      'rgba(33, 150, 243, 0.8)',
      'rgba(255, 193, 7, 0.8)',
      'rgba(156, 39, 176, 0.8)',
    ];

    return {
      labels: woodTypesData.data.slice(0, 5).map(wt => wt.neme || 'Неизвестно'),
      datasets: [{
        label: 'Типы древесины',
        data: woodTypesData.data.slice(0, 5).map(() => Math.floor(Math.random() * 10) + 1),
        backgroundColor: colors,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Статистика товаров',
      },
    },
  };

  // Generate recent activity from real data
  const generateRecentActivity = () => {
    const activities = [];

    // Add recent products
    if (productsData?.data?.length) {
      productsData.data.slice(0, 2).forEach(product => {
        activities.push({
          id: `product-${product.id}`,
          text: `Добавлен товар "${product.title}"`,
          time: new Date(product.created_at).toLocaleDateString('ru-RU'),
          type: 'product'
        });
      });
    }

    // Add recent chat messages
    if (chatMessagesData?.data?.length) {
      chatMessagesData.data.slice(0, 2).forEach(message => {
        activities.push({
          id: `message-${message.id}`,
          text: `Отправлено сообщение: "${message.message.slice(0, 50)}${message.message.length > 50 ? '...' : ''}"`,
          time: new Date(message.created_at).toLocaleDateString('ru-RU'),
          type: 'message'
        });
      });
    }

    // Sort by date and return latest 4
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 4);
  };

  const recentActivity = generateRecentActivity();

  // Show critical error if stats completely failed
  if (statsError && !stats) {
    return (
      <div className="p-6">
        <ErrorMessage
          error={statsError}
          onRetry={refetchStats}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-primary font-heading">Обзор Панели Продавца</h1>
        <div className="text-sm text-gray-500 font-sans">
          Последнее обновление: {new Date().toLocaleString('ru-RU')}
        </div>
      </div>

      {/* Show warning if some data failed to load */}
      {(productsError || chatError || woodTypesError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">
              Некоторые данные недоступны. Показаны только доступные данные.
            </p>
          </div>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsItems.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
            className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="p-3 rounded-full bg-gray-100">{stat.icon}</div>
            <div>
              <p className="text-sm text-brand-secondary font-sans">{stat.title}</p>
              {stat.loading ? (
                <SkeletonLoader variant="text" className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-brand-primary font-heading">{stat.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Статистика товаров</h2>
          {productsError ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <FiAlertTriangle className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-500 mb-4">Не удалось загрузить данные о товарах</p>
                <button
                  onClick={refetchProducts}
                  className="text-brand-primary hover:underline text-sm"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          ) : isLoadingProducts ? (
            <SkeletonLoader variant="card" className="h-64" />
          ) : (
            <Line options={chartOptions} data={generateProductsChart()} />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Недавняя Активность</h2>
          {(productsError && chatError) ? (
            <div className="text-center py-8">
              <FiAlertTriangle className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500 mb-4">Не удалось загрузить данные активности</p>
              <button
                onClick={() => {
                  refetchProducts();
                  refetchChat();
                }}
                className="text-brand-primary hover:underline text-sm"
              >
                Попробовать снова
              </button>
            </div>
          ) : (isLoadingProducts && isLoadingChats) ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <SkeletonLoader key={i} variant="text" className="h-12" />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <ul className="space-y-4">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-start space-x-2">
                    {activity.type === 'product' ? (
                      <FiPackage className="text-brand-primary mt-1" size={16} />
                    ) : (
                      <FiMessageCircle className="text-blue-500 mt-1" size={16} />
                    )}
                    <div className="flex-1">
                      <p className="font-sans text-gray-700 text-sm">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FiActivity}
              title="Нет недавней активности"
              description="Когда вы добавите товары или отправите сообщения, они появятся здесь"
            />
          )}
        </div>
      </div>

      {/* Wood Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Типы древесины</h2>
          {woodTypesData ? (
            <Bar
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: 'Доступные типы древесины',
                  },
                },
              }}
              data={generateWoodTypesChart()}
            />
          ) : (
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Мои товары</h2>
          {isLoadingProducts ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : productsData?.data?.length > 0 ? (
            <ul className="space-y-3">
              {productsData.data.slice(0, 5).map((product) => (
                <li key={product.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">₽{product.price} • {product.volume} м³</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.delivery_possible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-500">У вас пока нет товаров</p>
              <Link
                to="/products/new"
                className="text-brand-primary hover:underline text-sm mt-2 inline-block"
              >
                Добавить первый товар
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Быстрые Действия</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/products/new" className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center">
            <FiPackage className="mr-2" /> Добавить товар
          </Link>
          <Link to="/orders" className="bg-brand-secondary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center">
            <FiShoppingCart className="mr-2" /> Посмотреть заказы
          </Link>
          <Link to="/chat" className="bg-blue-500 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans flex items-center">
            <FiMessageCircle className="mr-2" /> Открыть чаты
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default SellerDashboard;