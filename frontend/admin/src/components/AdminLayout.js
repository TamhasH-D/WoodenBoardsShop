import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function AdminLayout() {
  const location = useLocation();

  const navLinks = [
    { to: 'dashboard', text: 'Обзор' },
    { to: 'users', text: 'Пользователи' },
    { to: 'products', text: 'Товары' },
    { to: 'orders', text: 'Заказы' },
    { to: 'settings', text: 'Настройки' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-semibold border-b border-gray-700">
          Админ Панель
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2.5 rounded-md transition-colors duration-200 ease-in-out 
                          ${location.pathname === link.to 
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'hover:bg-gray-700 hover:text-white'
                          }`}
            >
              {link.text}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link 
            to="/" 
            className="block w-full text-center px-4 py-2.5 rounded-md border border-gray-600 hover:bg-gray-700 hover:text-white transition-colors duration-200 ease-in-out"
          >
            Вернуться на сайт
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;