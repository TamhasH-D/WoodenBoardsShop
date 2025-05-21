import React from 'react';
import { motion } from 'framer-motion';

function AdminDashboard() {
  // Placeholder data for dashboard widgets
  const stats = [
    { id: 1, title: 'Всего пользователей', value: '150', icon: '👥' },
    { id: 2, title: 'Всего товаров', value: '75', icon: '🛍️' },
    { id: 3, title: 'Всего заказов', value: '320', icon: '📄' },
    { id: 4, title: 'Доход (мес)', value: '$12,500', icon: '📈' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Обзор Панели Администратора</h1>
      
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
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Недавняя Активность Платформы</h2>
        <ul className="space-y-3">
          <li className="text-gray-700">Новый пользователь зарегистрирован: user@example.com.</li>
          <li className="text-gray-700">Продавец "WoodPallet Co." добавил новый товар.</li>
          <li className="text-gray-700">Заказ #1025 успешно обработан.</li>
        </ul>
      </div>

      {/* System Health (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Состояние Системы</h2>
        <p className="text-green-600 font-semibold">Все системы работают в штатном режиме.</p>
      </div>

    </motion.div>
  );
}

export default AdminDashboard;