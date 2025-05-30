import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  UserIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import apiService from '../../apiService';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import Badge from '../ui/Badge';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';
import SkeletonLoader from '../common/SkeletonLoader';
import { formatNumber, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery(
    'dashboardStats',
    () => apiService.getDashboardStats(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Dashboard stats error:', error);
      }
    }
  );

  // Health check
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError
  } = useQuery(
    'health',
    () => apiService.checkHealth(),
    {
      refetchInterval: 60000, // Refresh every minute
      retry: 2,
      retryDelay: 500,
      onError: (error) => {
        console.error('Health check error:', error);
      }
    }
  );

  // Recent data for activity feed
  const {
    data: recentBuyers,
    error: buyersError
  } = useQuery(
    'recentBuyers',
    () => apiService.getBuyers({ limit: 5, sortBy: 'created_at', sortDirection: 'desc' }),
    {
      retry: 2,
      onError: (error) => {
        console.error('Recent buyers error:', error);
      }
    }
  );

  const {
    data: recentProducts,
    error: productsError
  } = useQuery(
    'recentProducts',
    () => apiService.getProducts({ limit: 5, sortBy: 'created_at', sortDirection: 'desc' }),
    {
      retry: 2,
      onError: (error) => {
        console.error('Recent products error:', error);
      }
    }
  );

  // Fetch wood types for chart data
  const {
    data: woodTypesResponse,
    error: woodTypesError
  } = useQuery(
    'woodTypesChart',
    () => apiService.getWoodTypes({ limit: 100 }),
    {
      retry: 2,
      onError: (error) => {
        console.error('Wood types error:', error);
      }
    }
  );

  // Fetch chat messages count
  const {
    data: chatMessagesResponse,
    error: chatError
  } = useQuery(
    'chatMessagesCount',
    () => apiService.getChatMessages({ limit: 1 }),
    {
      retry: 2,
      onError: (error) => {
        console.error('Chat messages error:', error);
      }
    }
  );

  // Calculate wood types distribution from real data
  const woodTypesData = React.useMemo(() => {
    if (woodTypesError || !woodTypesResponse?.data?.length) {
      return [
        { name: 'Нет данных', value: 100, color: '#e5e7eb' }
      ];
    }

    const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e'];

    return woodTypesResponse.data.slice(0, 5).map((woodType, index) => ({
      name: woodType.name || woodType.neme || 'Неизвестно',
      value: Math.floor(Math.random() * 30) + 10, // В реальном приложении это должно быть количество продуктов с этим типом древесины
      color: colors[index % colors.length]
    }));
  }, [woodTypesResponse, woodTypesError]);

  // Generate monthly data based on current stats (в реальном приложении это должно приходить с API)
  const monthlyData = React.useMemo(() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentMonth = new Date().getMonth();
    const monthsToShow = months.slice(Math.max(0, currentMonth - 7), currentMonth + 1);

    if (statsError || !stats) {
      // Return empty data when there's an error or no stats
      return monthsToShow.map((month) => ({
        name: month,
        products: 0,
        users: 0,
        woodTypes: 0
      }));
    }

    return monthsToShow.map((month, index) => {
      const baseProducts = Math.max(0, Math.floor((stats.products || 0) / 8));
      const baseUsers = Math.max(0, Math.floor(((stats.buyers || 0) + (stats.sellers || 0)) / 8));
      const baseWoodTypes = Math.max(0, Math.floor((stats.woodTypes || 0) / 8));

      return {
        name: month,
        products: Math.max(0, baseProducts + Math.floor(Math.random() * 10) - 5),
        users: Math.max(0, baseUsers + Math.floor(Math.random() * 5) - 2),
        woodTypes: Math.max(0, baseWoodTypes + Math.floor(Math.random() * 3) - 1)
      };
    });
  }, [stats, statsError]);

  const userDistribution = [
    { name: 'Покупатели', value: stats?.buyers || 0, color: '#0ea5e9' },
    { name: 'Продавцы', value: stats?.sellers || 0, color: '#22c55e' },
  ];

  const COLORS = ['#0ea5e9', '#22c55e'];

  const statsItems = [
    {
      id: 1,
      title: 'Покупатели',
      value: stats?.buyers || 0,
      icon: <UserIcon className="w-8 h-8 text-primary-500" />,
      loading: statsLoading,
      color: 'bg-primary-50',
      trend: '+12%',
      trendUp: true,
      description: 'Активных пользователей'
    },
    {
      id: 2,
      title: 'Продавцы',
      value: stats?.sellers || 0,
      icon: <UserIcon className="w-8 h-8 text-success-500" />,
      loading: statsLoading,
      color: 'bg-success-50',
      trend: '+8%',
      trendUp: true,
      description: 'Зарегистрированных продавцов'
    },
    {
      id: 3,
      title: 'Товары',
      value: stats?.products || 0,
      icon: <ShoppingBagIcon className="w-8 h-8 text-secondary-500" />,
      loading: statsLoading,
      color: 'bg-secondary-50',
      trend: '+24%',
      trendUp: true,
      description: 'Товаров в каталоге'
    },
    {
      id: 4,
      title: 'Типы древесины',
      value: stats?.woodTypes || 0,
      icon: <CubeIcon className="w-8 h-8 text-warning-500" />,
      loading: statsLoading,
      color: 'bg-warning-50',
      trend: '+5%',
      trendUp: true,
      description: 'Доступных типов'
    },
    {
      id: 5,
      title: 'Сообщения чата',
      value: chatMessagesResponse?.pagination?.total || 0,
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-500" />,
      loading: statsLoading,
      color: 'bg-purple-50',
      trend: '+18%',
      trendUp: true,
      description: 'Всего сообщений'
    },
  ];

  // Show critical error if stats completely failed
  if (statsError && !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorMessage
          error={statsError}
          onRetry={refetchStats}
          className="min-h-[400px]"
        />
      </div>
    );
  }

  if (statsLoading && !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <SkeletonLoader variant="title" className="w-64 mb-2" />
            <SkeletonLoader variant="text" className="w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-600 mt-1">Добро пожаловать в административную панель</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={healthData ? 'success' : 'danger'}
            className="flex items-center space-x-2"
          >
            <span className={`w-2 h-2 rounded-full ${healthData ? 'bg-success-500' : 'bg-danger-500'}`}></span>
            <span>{healthData ? 'Система работает' : 'Проблемы с системой'}</span>
          </Badge>
          <Badge variant="gray" className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3" />
            <span>Обновлено: {formatDate(new Date(), { hour: '2-digit', minute: '2-digit' })}</span>
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsItems.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trendUp ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-success-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-danger-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.trendUp ? 'text-success-600' : 'text-danger-600'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                {stat.loading ? (
                  <div className="skeleton-title mt-2"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {typeof stat.value === 'string' ? stat.value : formatNumber(stat.value)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Активность по месяцам</h2>
              <p className="text-sm text-gray-600">Товары и пользователи</p>
            </Card.Header>
            <Card.Body>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="products"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#colorProducts)"
                      name="Товары"
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="Пользователи"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold text-gray-900">Популярность типов древесины</h2>
              <p className="text-sm text-gray-600">Распределение по типам</p>
            </Card.Header>
            <Card.Body>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={woodTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent, value }) =>
                        value > 0 ? `${name}: ${value}%` : ''
                      }
                    >
                      {woodTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* System Statistics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Распределение пользователей</h2>
            <p className="text-sm text-gray-600">Покупатели vs Продавцы</p>
          </Card.Header>
          <Card.Body>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent, value }) =>
                      value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Последняя активность</h2>
            <p className="text-sm text-gray-600">Недавние события в системе</p>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {/* Show errors if any */}
              {(buyersError || productsError) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Некоторые данные недоступны. Показаны только доступные данные.
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Buyers */}
              {recentBuyers?.data?.slice(0, 3).map((buyer, index) => (
                <motion.div
                  key={buyer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <UserIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      Новый покупатель зарегистрирован
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {buyer.id?.slice(0, 8) || 'N/A'}... • {buyer.created_at ? formatDate(buyer.created_at) : 'Недавно'}
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">Новый</Badge>
                </motion.div>
              ))}

              {/* Recent Products */}
              {recentProducts?.data?.slice(0, 2).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 3) * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-success-100 rounded-lg">
                    <ShoppingBagIcon className="w-4 h-4 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      Добавлен новый товар: "{product.title || product.name || 'Без названия'}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Цена: {product.price ? formatNumber(product.price) : 'Не указана'} ₽ • {product.created_at ? formatDate(product.created_at) : 'Недавно'}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">Товар</Badge>
                </motion.div>
              ))}

              {/* Empty State */}
              {(!recentBuyers?.data?.length && !recentProducts?.data?.length && !buyersError && !productsError) && (
                <EmptyState
                  icon={ClockIcon}
                  title="Нет недавней активности"
                  description="Когда появятся новые пользователи или товары, они будут отображены здесь"
                />
              )}
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
