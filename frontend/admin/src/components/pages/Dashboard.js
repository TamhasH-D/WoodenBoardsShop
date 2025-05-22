import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  UserIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon
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
  Cell
} from 'recharts';
import apiService from '../../apiService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    buyers: 0,
    sellers: 0,
    products: 0,
    woodTypes: 0
  });

  // Fetch data for dashboard
  const { data: buyersData, isLoading: buyersLoading } = useQuery('buyers', () =>
    apiService.getBuyers({ limit: 1 })
  );

  const { data: sellersData, isLoading: sellersLoading } = useQuery('sellers', () =>
    apiService.getSellers({ limit: 1 })
  );

  const { data: productsData, isLoading: productsLoading } = useQuery('products', () =>
    apiService.getProducts({ limit: 1 })
  );

  const { data: woodTypesData, isLoading: woodTypesLoading } = useQuery('woodTypes', () =>
    apiService.getWoodTypes({ limit: 1 })
  );

  // Health check
  const { data: healthData } = useQuery('health', () =>
    apiService.checkHealth()
  );

  useEffect(() => {
    if (buyersData) {
      setStats(prev => ({ ...prev, buyers: buyersData.pagination?.total || 0 }));
    }
    if (sellersData) {
      setStats(prev => ({ ...prev, sellers: sellersData.pagination?.total || 0 }));
    }
    if (productsData) {
      setStats(prev => ({ ...prev, products: productsData.pagination?.total || 0 }));
    }
    if (woodTypesData) {
      setStats(prev => ({ ...prev, woodTypes: woodTypesData.pagination?.total || 0 }));
    }
  }, [buyersData, sellersData, productsData, woodTypesData]);

  // Mock data for charts
  const productData = [
    { name: 'Янв', value: 12 },
    { name: 'Фев', value: 19 },
    { name: 'Мар', value: 15 },
    { name: 'Апр', value: 25 },
    { name: 'Май', value: 32 },
    { name: 'Июн', value: 28 },
  ];

  const userDistribution = [
    { name: 'Покупатели', value: stats.buyers },
    { name: 'Продавцы', value: stats.sellers },
  ];

  const COLORS = ['#8884d8', '#82ca9d'];

  const statsItems = [
    {
      id: 1,
      title: 'Покупатели',
      value: stats.buyers,
      icon: <UserIcon className="w-8 h-8 text-purple-500" />,
      loading: buyersLoading,
      color: 'bg-purple-100'
    },
    {
      id: 2,
      title: 'Продавцы',
      value: stats.sellers,
      icon: <UserIcon className="w-8 h-8 text-green-500" />,
      loading: sellersLoading,
      color: 'bg-green-100'
    },
    {
      id: 3,
      title: 'Товары',
      value: stats.products,
      icon: <ShoppingBagIcon className="w-8 h-8 text-blue-500" />,
      loading: productsLoading,
      color: 'bg-blue-100'
    },
    {
      id: 4,
      title: 'Типы древесины',
      value: stats.woodTypes,
      icon: <CubeIcon className="w-8 h-8 text-amber-500" />,
      loading: woodTypesLoading,
      color: 'bg-amber-100'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Панель управления</h1>
        <div className="flex items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${healthData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className={`w-2 h-2 mr-2 rounded-full ${healthData ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {healthData ? 'Система работает' : 'Проблемы с системой'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsItems.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`${stat.color} p-6 rounded-lg shadow-sm flex items-center space-x-4`}
          >
            {stat.icon}
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              {stat.loading ? (
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Добавление товаров по месяцам</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Количество" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Распределение пользователей</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Последняя активность</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
            <UserIcon className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <p className="text-sm text-gray-800">Новый покупатель зарегистрирован</p>
              <p className="text-xs text-gray-500">2 часа назад</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
            <ShoppingBagIcon className="w-5 h-5 text-green-500 mt-1" />
            <div>
              <p className="text-sm text-gray-800">Добавлен новый товар: "Сосновая доска 50x100"</p>
              <p className="text-xs text-gray-500">5 часов назад</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500 mt-1" />
            <div>
              <p className="text-sm text-gray-800">Новое сообщение в чате от покупателя</p>
              <p className="text-xs text-gray-500">1 день назад</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
