import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingCart, FiMessageSquare, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { sellerService } from '../services';

function SellerLayout() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(false);
  const sellerId = localStorage.getItem('sellerId') || 'demo-seller-id'; // Replace with actual auth logic

  // Fetch seller data
  const { data: sellerData } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => sellerService.getSellerById(sellerId),
    enabled: !!sellerId,
    onSuccess: (data) => {
      if (data && data.data) {
        setIsOnline(data.data.is_online);
      }
    }
  });

  const navLinks = [
    { to: 'dashboard', text: 'Обзор', icon: <FiHome className="mr-2" /> },
    { to: 'products', text: 'Товары', icon: <FiPackage className="mr-2" /> },
    { to: 'orders', text: 'Заказы', icon: <FiShoppingCart className="mr-2" /> },
    { to: 'chat', text: 'Сообщения', icon: <FiMessageSquare className="mr-2" /> },
    { to: 'settings', text: 'Настройки', icon: <FiSettings className="mr-2" /> },
  ];

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      await sellerService.toggleOnlineStatus(sellerId, !isOnline);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Error toggling online status:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-primary text-white p-6 space-y-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading">Панель Продавца</h2>
        </div>

        {/* Seller Profile */}
        <div className="flex items-center space-x-3 mb-6 p-3 bg-brand-secondary bg-opacity-30 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-primary">
            <FiUser size={20} />
          </div>
          <div>
            <p className="font-sans font-medium">Продавец</p>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <button
                onClick={toggleOnlineStatus}
                className="text-xs font-sans hover:underline"
              >
                {isOnline ? 'Онлайн' : 'Оффлайн'}
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center py-2 px-4 rounded hover:bg-brand-secondary transition-colors font-sans ${
                    location.pathname.includes(link.to) ? 'bg-brand-secondary font-semibold' : ''
                  }`}
                >
                  {link.icon}
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6 space-y-2">
          <Link to="/" className="flex items-center py-2 px-4 rounded hover:bg-brand-secondary transition-colors font-sans">
            <FiLogOut className="mr-2" />
            На главный сайт
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
}

export default SellerLayout;