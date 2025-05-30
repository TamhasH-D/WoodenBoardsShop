import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  CubeIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ServerIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { classNames } from '../../utils/helpers';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({
    users: false,
    products: false,
    chat: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // No logout needed for local admin
  const handleLogout = () => {
    console.log('Logout not available in local admin mode');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const mainNavItems = [
    { path: '/dashboard', icon: <HomeIcon className="w-5 h-5" />, label: 'Обзор' },
  ];

  const userNavItems = [
    { path: '/buyers', icon: <UsersIcon className="w-5 h-5" />, label: 'Покупатели' },
    { path: '/sellers', icon: <UsersIcon className="w-5 h-5" />, label: 'Продавцы' },
  ];

  const productNavItems = [
    { path: '/products', icon: <ShoppingBagIcon className="w-5 h-5" />, label: 'Товары' },
    { path: '/wood-types', icon: <CubeIcon className="w-5 h-5" />, label: 'Типы древесины' },
    { path: '/wood-type-prices', icon: <CurrencyDollarIcon className="w-5 h-5" />, label: 'Цены на древесину' },
    { path: '/wooden-boards', icon: <CubeIcon className="w-5 h-5" />, label: 'Деревянные доски' },
    { path: '/images', icon: <PhotoIcon className="w-5 h-5" />, label: 'Изображения' },
  ];

  const chatNavItems = [
    { path: '/chat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, label: 'Треды чата' },
    { path: '/chat/messages', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, label: 'Сообщения чата' },
  ];

  const settingsNavItems = [
    { path: '/settings', icon: <Cog6ToothIcon className="w-5 h-5" />, label: 'Настройки' },
    { path: '/system-health', icon: <ServerIcon className="w-5 h-5" />, label: 'Состояние системы' },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Админ Панель</h1>
            <p className="text-xs text-gray-400">Управление системой</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        {mainNavItems.map((item) => (
          <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={item.path}
              onClick={closeSidebar}
              className={classNames(
                'flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group',
                isActive(item.path)
                  ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                  : 'hover:bg-gray-700/50 hover:text-white text-gray-300'
              )}
            >
              <span className={classNames(
                'transition-colors duration-200',
                isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'
              )}>
                {item.icon}
              </span>
              <span className="ml-3 font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}

        {/* Users Section */}
        <div className="pt-4">
          <motion.button
            onClick={() => toggleMenu('users')}
            className="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl hover:bg-gray-700/50 transition-all duration-200 ease-in-out text-gray-300 hover:text-white group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <UsersIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
              <span className="ml-3 font-medium">Пользователи</span>
            </div>
            <motion.div
              animate={{ rotate: expandedMenus.users ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {expandedMenus.users && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4 mt-2 space-y-1 overflow-hidden"
              >
                {userNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={classNames(
                        'flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out group',
                        isActive(item.path)
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'hover:bg-gray-700/30 hover:text-white text-gray-400'
                      )}
                    >
                      <span className={classNames(
                        'transition-colors duration-200',
                        isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                      )}>
                        {item.icon}
                      </span>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Section */}
        <div className="pt-2">
          <motion.button
            onClick={() => toggleMenu('products')}
            className="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl hover:bg-gray-700/50 transition-all duration-200 ease-in-out text-gray-300 hover:text-white group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <ShoppingBagIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
              <span className="ml-3 font-medium">Товары</span>
            </div>
            <motion.div
              animate={{ rotate: expandedMenus.products ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {expandedMenus.products && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4 mt-2 space-y-1 overflow-hidden"
              >
                {productNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={classNames(
                        'flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out group',
                        isActive(item.path)
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'hover:bg-gray-700/30 hover:text-white text-gray-400'
                      )}
                    >
                      <span className={classNames(
                        'transition-colors duration-200',
                        isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                      )}>
                        {item.icon}
                      </span>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Section */}
        <div className="pt-2">
          <motion.button
            onClick={() => toggleMenu('chat')}
            className="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl hover:bg-gray-700/50 transition-all duration-200 ease-in-out text-gray-300 hover:text-white group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
              <span className="ml-3 font-medium">Чат</span>
            </div>
            <motion.div
              animate={{ rotate: expandedMenus.chat ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {expandedMenus.chat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4 mt-2 space-y-1 overflow-hidden"
              >
                {chatNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={classNames(
                        'flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out group',
                        isActive(item.path)
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'hover:bg-gray-700/30 hover:text-white text-gray-400'
                      )}
                    >
                      <span className={classNames(
                        'transition-colors duration-200',
                        isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                      )}>
                        {item.icon}
                      </span>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-700/50 mt-4">
          {settingsNavItems.map((item) => (
            <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
              <Link
                to={item.path}
                onClick={closeSidebar}
                className={classNames(
                  'flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-in-out group',
                  isActive(item.path)
                    ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                    : 'hover:bg-gray-700/50 hover:text-white text-gray-300'
                )}
              >
                <span className={classNames(
                  'transition-colors duration-200',
                  isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}>
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center px-4 py-3 rounded-xl bg-gray-800/50 text-gray-300">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Администратор</p>
            <p className="text-xs text-gray-400">Локальный доступ</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-gray-900 text-white flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <span className="text-lg font-semibold">Меню</span>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Админ Панель</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



export default AdminLayout;
