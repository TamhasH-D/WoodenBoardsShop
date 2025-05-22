import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import FormField from '../../common/FormField';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Админ-панель',
    siteDescription: 'Административная панель для управления платформой',
    language: 'ru',
    timezone: 'Europe/Moscow',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    notifyOnNewUser: true,
    notifyOnNewOrder: true,
    notifyOnSystemError: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked, type, value } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Общие настройки успешно сохранены');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Настройки уведомлений успешно сохранены');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Настройки</h1>

      {/* General Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <Cog6ToothIcon className="h-6 w-6 text-gray-500 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Общие настройки
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleGeneralSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormField
                  label="Название сайта"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <FormField
                  label="Описание сайта"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                />
              </div>
              <div className="sm:col-span-3">
                <FormField
                  label="Язык"
                  name="language"
                  type="select"
                  value={generalSettings.language}
                  onChange={handleGeneralChange}
                  options={[
                    { value: 'ru', label: 'Русский' },
                    { value: 'en', label: 'English' },
                  ]}
                />
              </div>
              <div className="sm:col-span-3">
                <FormField
                  label="Часовой пояс"
                  name="timezone"
                  type="select"
                  value={generalSettings.timezone}
                  onChange={handleGeneralChange}
                  options={[
                    { value: 'Europe/Moscow', label: 'Москва (GMT+3)' },
                    { value: 'Europe/London', label: 'Лондон (GMT+0)' },
                    { value: 'America/New_York', label: 'Нью-Йорк (GMT-5)' },
                  ]}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Сохранение...
                  </span>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <BellIcon className="h-6 w-6 text-gray-500 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Настройки уведомлений
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleNotificationSubmit}>
            <div className="space-y-4">
              <FormField
                label="Email уведомления"
                name="emailNotifications"
                type="checkbox"
                value={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
              />
              <FormField
                label="Браузерные уведомления"
                name="browserNotifications"
                type="checkbox"
                value={notificationSettings.browserNotifications}
                onChange={handleNotificationChange}
              />
              <FormField
                label="Уведомлять о новых пользователях"
                name="notifyOnNewUser"
                type="checkbox"
                value={notificationSettings.notifyOnNewUser}
                onChange={handleNotificationChange}
              />
              <FormField
                label="Уведомлять о новых заказах"
                name="notifyOnNewOrder"
                type="checkbox"
                value={notificationSettings.notifyOnNewOrder}
                onChange={handleNotificationChange}
              />
              <FormField
                label="Уведомлять о системных ошибках"
                name="notifyOnSystemError"
                type="checkbox"
                value={notificationSettings.notifyOnSystemError}
                onChange={handleNotificationChange}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Сохранение...
                  </span>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
