import React, { useState } from 'react';
import { motion } from 'framer-motion';

function AdminSettings() {
  const [siteName, setSiteName] = useState('EcoMarket');
  const [adminEmail, setAdminEmail] = useState('admin@ecomarket.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifications, setNotifications] = useState({
    newUsers: true,
    newOrders: true,
    productUpdates: false,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Placeholder for save logic
    console.log('Settings saved:', { siteName, adminEmail, maintenanceMode, notifications });
    alert('Настройки сохранены!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Настройки Платформы</h1>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Общие Настройки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Название Сайта</label>
              <input 
                type="text" 
                id="siteName" 
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Администратора</label>
              <input 
                type="email" 
                id="adminEmail" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Режим Обслуживания</h2>
          <div className="flex items-center">
            <input 
              id="maintenanceMode" 
              type="checkbox" 
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              Включить режим обслуживания
            </label>
          </div>
          {maintenanceMode && (
            <p className="mt-2 text-sm text-yellow-600">Сайт будет недоступен для пользователей, кроме администраторов.</p>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Настройки Уведомлений</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input id="newUsers" type="checkbox" checked={notifications.newUsers} onChange={(e) => setNotifications({...notifications, newUsers: e.target.checked})} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <label htmlFor="newUsers" className="ml-2 block text-sm text-gray-900">Уведомлять о новых пользователях</label>
            </div>
            <div className="flex items-center">
              <input id="newOrders" type="checkbox" checked={notifications.newOrders} onChange={(e) => setNotifications({...notifications, newOrders: e.target.checked})} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <label htmlFor="newOrders" className="ml-2 block text-sm text-gray-900">Уведомлять о новых заказах</label>
            </div>
            <div className="flex items-center">
              <input id="productUpdates" type="checkbox" checked={notifications.productUpdates} onChange={(e) => setNotifications({...notifications, productUpdates: e.target.checked})} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
              <label htmlFor="productUpdates" className="ml-2 block text-sm text-gray-900">Уведомлять об обновлениях товаров (модерация)</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Сохранить Настройки
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default AdminSettings;