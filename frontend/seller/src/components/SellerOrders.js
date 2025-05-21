import React from 'react';
import { motion } from 'framer-motion';

function SellerOrders() {
  // Placeholder data for orders
  const orders = [
    { id: '#1024', customer: 'Иван Петров', date: '2024-07-20', total: '120 USD', status: 'В обработке' },
    { id: '#1023', customer: 'Анна Сидорова', date: '2024-07-19', total: '85 USD', status: 'Отправлен' },
    { id: '#1022', customer: 'Олег Кузнецов', date: '2024-07-18', total: '210 USD', status: 'Доставлен' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold text-brand-primary mb-8 font-heading">Управление Заказами</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                ID Заказа
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                Клиент
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                Дата
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                Сумма
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                Статус
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-heading">{order.id}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-sans">{order.customer}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-sans">{order.date}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-sans">{order.total}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight 
                    ${order.status === 'Доставлен' ? 'text-green-900' : order.status === 'Отправлен' ? 'text-blue-900' : 'text-yellow-900'}`}>
                    <span aria-hidden className={`absolute inset-0 
                      ${order.status === 'Доставлен' ? 'bg-green-200' : order.status === 'Отправлен' ? 'bg-blue-200' : 'bg-yellow-200'} 
                      opacity-50 rounded-full`}></span>
                    <span className="relative font-sans">{order.status}</span>
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <button className="text-brand-primary hover:text-brand-primary-dark font-sans">Детали</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default SellerOrders;