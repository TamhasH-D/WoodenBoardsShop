import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  ServerIcon
} from '@heroicons/react/24/outline';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({
    users: false,
    products: false,
    chat: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    // Redirect to login
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-semibold border-b border-gray-700">
          Админ Панель
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-md transition-colors duration-200 ease-in-out 
                ${isActive(item.path) ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'}`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}

          {/* Users Section */}
          <div className="pt-4">
            <button
              onClick={() => toggleMenu('users')}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left rounded-md hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            >
              <div className="flex items-center">
                <UsersIcon className="w-5 h-5" />
                <span className="ml-3">Пользователи</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.users ? 'transform rotate-180' : ''}`} />
            </button>
            {expandedMenus.users && (
              <div className="pl-4 mt-1 space-y-1">
                {userNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ease-in-out 
                      ${isActive(item.path) ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'}`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Products Section */}
          <div>
            <button
              onClick={() => toggleMenu('products')}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left rounded-md hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            >
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="ml-3">Товары</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.products ? 'transform rotate-180' : ''}`} />
            </button>
            {expandedMenus.products && (
              <div className="pl-4 mt-1 space-y-1">
                {productNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ease-in-out 
                      ${isActive(item.path) ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'}`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div>
            <button
              onClick={() => toggleMenu('chat')}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left rounded-md hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span className="ml-3">Чат</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.chat ? 'transform rotate-180' : ''}`} />
            </button>
            {expandedMenus.chat && (
              <div className="pl-4 mt-1 space-y-1">
                {chatNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ease-in-out 
                      ${isActive(item.path) ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'}`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          {settingsNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-md transition-colors duration-200 ease-in-out 
                ${isActive(item.path) ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-700 hover:text-white'}`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-md border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors duration-200 ease-in-out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="ml-3">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
