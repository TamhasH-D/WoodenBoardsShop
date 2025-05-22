import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiEye, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function SellerOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Placeholder data for orders
  const orders = [
    {
      id: 'ORD-1001',
      customer: 'Иван Петров',
      date: '2023-05-15',
      total: '₽12,500',
      status: 'pending',
      items: [
        { id: 1, name: 'Стандартный паллет (1200x800)', quantity: 5, price: '₽1,500', total: '₽7,500' },
        { id: 2, name: 'Европаллет (1200x1000)', quantity: 2, price: '₽2,500', total: '₽5,000' }
      ],
      address: 'ул. Ленина 15, кв. 45, Москва, 123456',
      phone: '+7 (900) 123-45-67',
      email: 'ivan@example.com'
    },
    {
      id: 'ORD-1002',
      customer: 'Анна Смирнова',
      date: '2023-05-16',
      total: '₽8,000',
      status: 'processing',
      items: [
        { id: 1, name: 'Паллет усиленный (1200x800)', quantity: 4, price: '₽2,000', total: '₽8,000' }
      ],
      address: 'ул. Пушкина 10, Санкт-Петербург, 654321',
      phone: '+7 (900) 765-43-21',
      email: 'anna@example.com'
    },
    {
      id: 'ORD-1003',
      customer: 'Сергей Иванов',
      date: '2023-05-14',
      total: '₽15,000',
      status: 'shipped',
      items: [
        { id: 1, name: 'Стандартный паллет (1200x800)', quantity: 10, price: '₽1,500', total: '₽15,000' }
      ],
      address: 'ул. Гагарина 5, Казань, 420001',
      phone: '+7 (900) 111-22-33',
      email: 'sergey@example.com'
    },
    {
      id: 'ORD-1004',
      customer: 'Мария Козлова',
      date: '2023-05-13',
      total: '₽5,000',
      status: 'delivered',
      items: [
        { id: 1, name: 'Европаллет (1200x1000)', quantity: 2, price: '₽2,500', total: '₽5,000' }
      ],
      address: 'ул. Кирова 20, Новосибирск, 630099',
      phone: '+7 (900) 444-55-66',
      email: 'maria@example.com'
    },
    {
      id: 'ORD-1005',
      customer: 'Алексей Николаев',
      date: '2023-05-12',
      total: '₽3,000',
      status: 'cancelled',
      items: [
        { id: 1, name: 'Стандартный паллет (1200x800)', quantity: 2, price: '₽1,500', total: '₽3,000' }
      ],
      address: 'ул. Советская 30, Екатеринбург, 620000',
      phone: '+7 (900) 777-88-99',
      email: 'alexey@example.com'
    }
  ];

  // Get status label and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Ожидает обработки', color: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { label: 'В обработке', color: 'bg-blue-100 text-blue-800' };
      case 'shipped':
        return { label: 'Отправлен', color: 'bg-purple-100 text-purple-800' };
      case 'delivered':
        return { label: 'Доставлен', color: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Отменен', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Неизвестно', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Filter orders by search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle status update (placeholder)
  const handleStatusUpdate = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    // Here you would call your API to update the order status
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-primary font-heading">Управление Заказами</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск заказов по номеру или имени клиента..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает обработки</option>
                <option value="processing">В обработке</option>
                <option value="shipped">Отправлен</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-sans">
                  № Заказа
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-heading">{order.id}</p>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-sans">{order.customer}</p>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-sans">
                          {new Date(order.date).toLocaleDateString('ru-RU')}
                        </p>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap font-sans">{order.total}</p>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${statusInfo.color}`}>
                          <span aria-hidden className="absolute inset-0 opacity-50 rounded-full"></span>
                          <span className="relative font-sans">{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-brand-primary hover:text-brand-secondary flex items-center font-sans"
                          >
                            <FiEye className="mr-1" /> Просмотр
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-8 border-b border-gray-200 bg-white text-sm text-center">
                    {searchTerm || statusFilter !== 'all' ?
                      'Заказы не найдены. Попробуйте изменить параметры поиска.' :
                      'У вас пока нет заказов.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-brand-primary">Детали заказа {selectedOrder.id}</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Информация о клиенте</h4>
                <p><span className="font-semibold">Имя:</span> {selectedOrder.customer}</p>
                <p><span className="font-semibold">Email:</span> {selectedOrder.email}</p>
                <p><span className="font-semibold">Телефон:</span> {selectedOrder.phone}</p>
                <p><span className="font-semibold">Адрес:</span> {selectedOrder.address}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Информация о заказе</h4>
                <p><span className="font-semibold">Номер заказа:</span> {selectedOrder.id}</p>
                <p><span className="font-semibold">Дата:</span> {new Date(selectedOrder.date).toLocaleDateString('ru-RU')}</p>
                <p><span className="font-semibold">Статус:</span> {getStatusInfo(selectedOrder.status).label}</p>
                <p><span className="font-semibold">Итого:</span> {selectedOrder.total}</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-2">Товары</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border text-left">Товар</th>
                    <th className="px-4 py-2 border text-left">Количество</th>
                    <th className="px-4 py-2 border text-left">Цена</th>
                    <th className="px-4 py-2 border text-left">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 border">{item.name}</td>
                      <td className="px-4 py-2 border">{item.quantity}</td>
                      <td className="px-4 py-2 border">{item.price}</td>
                      <td className="px-4 py-2 border">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <div className="space-x-2">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FiCheckCircle className="mr-2" /> Принять заказ
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FiTruck className="mr-2" /> Отправить
                  </button>
                )}
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FiXCircle className="mr-2" /> Отменить
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SellerOrders;