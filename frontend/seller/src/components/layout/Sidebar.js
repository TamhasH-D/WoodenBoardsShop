import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  TreePine,
  Search,
  User,
  LogOut,
  UserCircle
} from 'lucide-react';
import { SELLER_TEXTS } from '../../utils/localization';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      path: '/',
      label: SELLER_TEXTS.DASHBOARD,
      icon: LayoutDashboard,
      description: 'Обзор бизнеса'
    },
    {
      path: '/products',
      label: SELLER_TEXTS.PRODUCTS,
      icon: Package,
      description: 'Управление товарами'
    },
    {
      path: '/wood-types',
      label: SELLER_TEXTS.WOOD_TYPES,
      icon: TreePine,
      description: 'Типы древесины'
    },
    {
      path: '/board-analyzer',
      label: 'Анализатор досок',
      icon: Search,
      description: 'AI анализ изображений'
    },
    {
      path: '/chats',
      label: SELLER_TEXTS.CHATS,
      icon: MessageSquare,
      description: 'Общение с клиентами'
    },
    {
      path: '/profile',
      label: SELLER_TEXTS.SELLER_PROFILE,
      icon: User,
      description: 'Настройки профиля'
    }
  ];

  const handleLogout = () => {
    // Очистка локального хранилища
    localStorage.clear();
    sessionStorage.clear();

    // Перенаправление на страницу входа или главную страницу
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">WoodShop</h1>
            <p className="text-xs text-gray-500">Панель продавца</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon 
                className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                `} 
              />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${active ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Продавец
            </p>
            <p className="text-xs text-gray-500 truncate">
              seller@woodshop.ru
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Выйти из системы"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
