import React from 'react';

/**
 * Чистый подвал
 */
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">WoodMarket</h3>
            <p className="text-gray-600 mb-4">
              Профессиональный маркетплейс древесины с проверенными поставщиками
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Система работает</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Покупателям</h4>
            <ul className="space-y-2">
              <li><a href="/products" className="text-gray-600 hover:text-primary-600 text-sm">Каталог</a></li>
              <li><a href="/sellers" className="text-gray-600 hover:text-primary-600 text-sm">Продавцы</a></li>
              <li><a href="/analyzer" className="text-gray-600 hover:text-primary-600 text-sm">Анализатор</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Поддержка</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-600 hover:text-primary-600 text-sm">Помощь</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-primary-600 text-sm">Контакты</a></li>
              <li><a href="/health" className="text-gray-600 hover:text-primary-600 text-sm">Статус системы</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">&copy; 2024 WoodMarket. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
