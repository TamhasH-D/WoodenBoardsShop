import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function SellerLayout() {
  const location = useLocation();

  const navLinks = [
    { to: 'dashboard', text: 'Обзор' },
    { to: 'products', text: 'Товары' },
    { to: 'orders', text: 'Заказы' },
    { to: 'settings', text: 'Настройки' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-primary text-white p-6 space-y-4 flex flex-col">
        <h2 className="text-2xl font-bold font-heading mb-6">Панель Продавца</h2>
        <nav className="flex-grow">
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block py-2 px-4 rounded hover:bg-brand-secondary transition-colors font-sans ${
                    location.pathname.endsWith(link.to) ? 'bg-brand-secondary font-semibold' : ''
                  }`}
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-6">
          <Link to="/" className="block py-2 px-4 rounded hover:bg-brand-secondary transition-colors font-sans text-center border border-white">
            На главный сайт
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
}

export default SellerLayout;