import React from 'react';
import { motion } from 'framer-motion';

function SellerDashboard() {
  // Placeholder data for dashboard widgets
  const stats = [
    { id: 1, title: 'Активные товары', value: '15', icon: '📦' },
    { id: 2, title: 'Новые заказы', value: '3', icon: '🛒' },
    { id: 3, title: 'Общий доход (мес)', value: '$1,250', icon: '💰' },
    { id: 4, title: 'Посетители (сегодня)', value: '78', icon: '👀' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-brand-primary mb-8 font-heading">Обзор Панели Продавца</h1>
      
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
            <div className="text-3xl">{stat.icon}</div>
            <div>
              <p className="text-sm text-brand-secondary font-sans">{stat.title}</p>
              <p className="text-2xl font-bold text-brand-primary font-heading">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Недавняя Активность</h2>
        <ul className="space-y-3">
          <li className="font-sans text-gray-700">Новый заказ #1024 от Ивана Петрова.</li>
          <li className="font-sans text-gray-700">Товар "Стандартный паллет" обновлен.</li>
          <li className="font-sans text-gray-700">Получено сообщение от клиента.</li>
        </ul>
      </div>

      {/* Quick Actions (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-brand-primary mb-4 font-heading">Быстрые Действия</h2>
        <div className="flex space-x-4">
          <button className="bg-brand-accent hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans">Добавить товар</button>
          <button className="bg-brand-secondary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans">Посмотреть заказы</button>
        </div>
      </div>

    </motion.div>
  );
}

export default SellerDashboard;