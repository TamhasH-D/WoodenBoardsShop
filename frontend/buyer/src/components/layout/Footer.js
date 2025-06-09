import React from 'react';

/**
 * Премиум подвал с glassmorphism эффектом
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">WoodMarket</h3>
            <p className="footer-description">
              Премиум маркетплейс древесины с проверенными поставщиками
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Покупателям</h4>
            <ul className="footer-links">
              <li><a href="/products">Каталог</a></li>
              <li><a href="/sellers">Продавцы</a></li>
              <li><a href="/analyzer">Анализатор</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Поддержка</h4>
            <ul className="footer-links">
              <li><a href="/help">Помощь</a></li>
              <li><a href="/contact">Контакты</a></li>
              <li><a href="/health">Статус системы</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 WoodMarket. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
