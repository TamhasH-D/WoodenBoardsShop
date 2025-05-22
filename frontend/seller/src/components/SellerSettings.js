import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FiSave, FiUser, FiShoppingBag, FiBell } from 'react-icons/fi';
import { sellerService } from '../services';

function SellerSettings() {
  const queryClient = useQueryClient();
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic

  // Profile Information
  const [profileName, setProfileName] = useState('Иван Иванов');
  const [profileEmail, setProfileEmail] = useState('ivan.seller@example.com');
  const [profilePhone, setProfilePhone] = useState('+7 (900) 123-45-67');

  // Store Information
  const [storeName, setStoreName] = useState('Магазин Ивана');
  const [storeDescription, setStoreDescription] = useState('Лучшие товары ручной работы от Ивана.');
  const [storeAddress, setStoreAddress] = useState('г. Москва, ул. Примерная, д. 1');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newOrders: true,
    productReviews: true,
    lowStockAlerts: true,
    promotionalEmails: false,
  });

  // Fetch seller data
  const { data: sellerData, isLoading } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => sellerService.getSellerById(sellerId),
    enabled: !!sellerId,
    onSuccess: (data) => {
      if (data && data.data) {
        // In a real app, you would populate the form with the seller data from the API
        console.log('Seller data loaded:', data);
      }
    }
  });

  // Update seller mutation
  const updateSellerMutation = useMutation({
    mutationFn: (data) => sellerService.updateSeller(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', sellerId] });
      toast.success('Настройки успешно обновлены');
    },
    onError: (error) => {
      console.error('Error updating seller:', error);
      toast.error('Ошибка при обновлении настроек');
    }
  });

  const handleSaveChanges = (e) => {
    e.preventDefault();

    // Prepare data for API
    const sellerData = {
      // In a real app, you would map your form data to the API expected format
      profile_name: profileName,
      profile_email: profileEmail,
      profile_phone: profilePhone,
      store_name: storeName,
      store_description: storeDescription,
      store_address: storeAddress,
      notification_preferences: notifications
    };

    // Call the API
    updateSellerMutation.mutate(sellerData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Настройки Продавца</h1>

      <form onSubmit={handleSaveChanges} className="space-y-10">
        {/* Profile Information Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">Информация о профиле</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-gray-600 mb-1">Имя</label>
              <input
                type="text"
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
            <div>
              <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                id="profileEmail"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
            <div>
              <label htmlFor="profilePhone" className="block text-sm font-medium text-gray-600 mb-1">Телефон</label>
              <input
                type="tel"
                id="profilePhone"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
          </div>
        </motion.div>

        {/* Store Information Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">Информация о магазине</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-600 mb-1">Название магазина</label>
              <input
                type="text"
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-600 mb-1">Описание магазина</label>
              <textarea
                id="storeDescription"
                rows="4"
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-600 mb-1">Адрес магазина (для самовывоза, если применимо)</label>
              <input
                type="text"
                id="storeAddress"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-shadow duration-200 hover:shadow-md"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">Настройки уведомлений</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="newOrders" className="text-sm text-gray-700">Уведомления о новых заказах</label>
              <input id="newOrders" type="checkbox" checked={notifications.newOrders} onChange={(e) => setNotifications({...notifications, newOrders: e.target.checked})} className="h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-offset-0 transition-colors duration-200" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="productReviews" className="text-sm text-gray-700">Уведомления о новых отзывах на товары</label>
              <input id="productReviews" type="checkbox" checked={notifications.productReviews} onChange={(e) => setNotifications({...notifications, productReviews: e.target.checked})} className="h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-offset-0 transition-colors duration-200" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="lowStockAlerts" className="text-sm text-gray-700">Оповещения о низком остатке товаров</label>
              <input id="lowStockAlerts" type="checkbox" checked={notifications.lowStockAlerts} onChange={(e) => setNotifications({...notifications, lowStockAlerts: e.target.checked})} className="h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-offset-0 transition-colors duration-200" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="promotionalEmails" className="text-sm text-gray-700">Получать рекламные рассылки платформы</label>
              <input id="promotionalEmails" type="checkbox" checked={notifications.promotionalEmails} onChange={(e) => setNotifications({...notifications, promotionalEmails: e.target.checked})} className="h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-offset-0 transition-colors duration-200" />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            disabled={updateSellerMutation.isPending}
            className="bg-brand-primary hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 flex items-center"
          >
            <FiSave className="mr-2" />
            {updateSellerMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default SellerSettings;