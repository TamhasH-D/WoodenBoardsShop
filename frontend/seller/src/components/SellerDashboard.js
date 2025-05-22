import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiShoppingCart, FiDollarSign, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { productService, chatService } from '../services';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SellerDashboard() {
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', sellerId],
    queryFn: () => productService.getProductsBySellerId(sellerId),
    enabled: !!sellerId,
  });

  // Fetch chat threads
  const { data: chatThreadsData, isLoading: isLoadingChats } = useQuery({
    queryKey: ['sellerChatThreads', sellerId],
    queryFn: () => chatService.getSellerChatThreads(sellerId),
    enabled: !!sellerId,
  });

  // Stats data
  const stats = [
    {
      id: 1,
      title: 'Активные товары',
      value: isLoadingProducts ? '...' : (productsData?.data?.length || 0),
      icon: <FiPackage className="text-brand-primary" size={24} />
    },
    {
      id: 2,
      title: 'Новые заказы',
      value: '3', // Replace with actual data when available
      icon: <FiShoppingCart className="text-brand-accent" size={24} />
    },
    {
      id: 3,
      title: 'Общий доход (мес)',
      value: '₽75,000', // Replace with actual data when available
      icon: <FiDollarSign className="text-green-600" size={24} />
    },
    {
      id: 4,
      title: 'Активные чаты',
      value: isLoadingChats ? '...' : (chatThreadsData?.data?.length || 0),
      icon: <FiMessageCircle className="text-blue-500" size={24} />
    },
  ];

  // Chart data
  const salesData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        label: 'Продажи',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#5D4037',
        backgroundColor: 'rgba(93, 64, 55, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Посетители',
        data: [7, 11, 5, 8, 3, 7],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Статистика продаж и посещений',
      },
    },
  };

  // Recent activity data (replace with actual data when available)
  const recentActivity = [
    { id: 1, text: 'Новый заказ #1024 от Ивана Петрова.', time: '2 часа назад' },
    { id: 2, text: 'Товар "Стандартный паллет" обновлен.', time: '5 часов назад' },
    { id: 3, text: 'Получено сообщение от клиента Анны Смирновой.', time: '1 день назад' },
    { id: 4, text: 'Добавлен новый товар "Европаллет (1200x1000)".', time: '2 дня назад' },
  ];

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

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
              <p className="text-2xl font-bold text-brand-primary font-heading">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Аналитика</h2>
          <Line options={chartOptions} data={salesData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Недавняя Активность</h2>
          <ul className="space-y-4">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="font-sans text-gray-700">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </li>
            ))}
          </ul>
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