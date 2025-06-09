import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { BUYER_TEXTS, formatCurrencyRu } from '../../utils/localization';

/**
 * Премиум кнопка корзины с анимированным счетчиком
 * Показывает количество товаров и общую стоимость
 */
const CartButton = ({ itemCount = 0 }) => {
  const { toggleCart, totalPrice, totalItems } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="cart-button"
      aria-label={`${BUYER_TEXTS.CART} - ${totalItems} товаров`}
    >
      {/* Иконка корзины */}
      <div className="cart-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Счетчик товаров */}
        {totalItems > 0 && (
          <div className="cart-badge">
            <span className="cart-count">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>
        )}
      </div>

      {/* Информация о корзине */}
      <div className="cart-info">
        <div className="cart-label">{BUYER_TEXTS.CART}</div>
        {totalItems > 0 && (
          <div className="cart-total">
            {formatCurrencyRu(totalPrice)}
          </div>
        )}
      </div>
    </button>
  );
};

export default CartButton;
