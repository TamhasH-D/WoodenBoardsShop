import React from 'react';
import { motion } from 'framer-motion';

function AdminOrders() {
  // Placeholder data for orders
  const orders = [
    { id: '#1025', customer: 'Анна Сидорова', date: '2024-05-20', total: '3700 ₽', status: 'Обработан', payment: 'Оплачен' },
    { id: '#1026', customer: 'Иван Петров', date: '2024-05-21', total: '1800 ₽', status: 'В обработке', payment: 'Ожидает' },
    { id: '#1027', customer: 'Олег Кузнецов', date: '2024-05-22', total: '5200 ₽', status: 'Отправлен', payment: 'Оплачен' },
    { id: '#1028', customer: 'Мария Иванова', date: '2024-05-23', total: '2200 ₽', status: 'Доставлен', payment: 'Оплачен' },
    { id: '#1029', customer: 'Петр Алексеев', date: '2024-05-24', total: '950 ₽', status: 'Отменен', payment: 'Возвращен' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Обработан': return 'bg-blue-200 text-blue-900';
      case 'В обработке': return 'bg-yellow-200 text-yellow-900';
      case 'Отправлен': return 'bg-indigo-200 text-indigo-900';
      case 'Доставлен': return 'bg-green-200 text-green-900';
      case 'Отменен': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Оплачен': return 'bg-green-200 text-green-900';
      case 'Ожидает': return 'bg-yellow-200 text-yellow-900';
      case 'Возвращен': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Управление Заказами</h1>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Заказа</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Покупатель</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Дата</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Сумма</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус Заказа</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус Оплаты</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{order.id}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{order.customer}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{order.date}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{order.total}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${getStatusColor(order.status)}`}>
                    <span aria-hidden className={`absolute inset-0 ${getStatusColor(order.status).split(' ')[0]} opacity-50 rounded-full`}></span>
                    <span className="relative">{order.status}</span>
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${getPaymentStatusColor(order.payment)}`}>
                    <span aria-hidden className={`absolute inset-0 ${getPaymentStatusColor(order.payment).split(' ')[0]} opacity-50 rounded-full`}></span>
                    <span className="relative">{order.payment}</span>
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <button className="text-purple-600 hover:text-purple-800">Детали</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default AdminOrders;