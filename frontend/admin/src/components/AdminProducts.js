import React from 'react';
import { motion } from 'framer-motion';

function AdminProducts() {
  // Placeholder data for products
  const products = [
    { id: 1, name: 'Эко-сумка "Зеленый Мир"', seller: 'GreenShop', category: 'Аксессуары', price: '1500 ₽', status: 'Опубликован' },
    { id: 2, name: 'Деревянная разделочная доска', seller: 'WoodPallet Co.', category: 'Кухня', price: '2200 ₽', status: 'На модерации' },
    { id: 3, name: 'Набор органического мыла', seller: 'PureNature', category: 'Уход', price: '1800 ₽', status: 'Отклонен' },
    { id: 4, name: 'Керамическая ваза ручной работы', seller: 'ArtisanHome', category: 'Декор', price: '3500 ₽', status: 'Опубликован' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Управление Товарами</h1>
        {/* Add Product button can be added here if admins can add products */}
        {/* <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300">
          Добавить Товар
        </button> */}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Название
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Продавец
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.seller}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.category}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.price}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight 
                    ${product.status === 'Опубликован' ? 'text-green-900' : 
                      product.status === 'На модерации' ? 'text-yellow-900' : 'text-red-900'}`}>
                    <span aria-hidden className={`absolute inset-0 
                      ${product.status === 'Опубликован' ? 'bg-green-200' : 
                        product.status === 'На модерации' ? 'bg-yellow-200' : 'bg-red-200'} 
                      opacity-50 rounded-full`}></span>
                    <span className="relative">{product.status}</span>
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <button className="text-purple-600 hover:text-purple-800 mr-2">Детали</button>
                  {product.status === 'На модерации' && (
                    <button className="text-green-600 hover:text-green-800 mr-2">Одобрить</button>
                  )}
                  {product.status !== 'Отклонен' && product.status !== 'На модерации' && (
                     <button className="text-yellow-600 hover:text-yellow-800 mr-2">Снять с публикации</button>
                  )}
                  {product.status !== 'Отклонен' && (
                    <button className="text-red-600 hover:text-red-800">Отклонить</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default AdminProducts;