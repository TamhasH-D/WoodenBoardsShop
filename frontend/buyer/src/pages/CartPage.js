import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { BUYER_TEXTS } from '../utils/localization';

const CartPage = () => {
  const { setPageTitle } = useApp();
  const { items, totalItems, totalPrice } = useCart();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.CART);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.CART}</h1>
        <p className="page-description">
          {totalItems > 0 ? `${totalItems} товаров на сумму ${totalPrice.toLocaleString('ru-RU')} ₽` : 'Корзина пуста'}
        </p>
      </div>
      
      <div className="card">
        {totalItems > 0 ? (
          <div>
            <p>Товары в корзине:</p>
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <h3>{item.name}</h3>
                <p>Количество: {item.quantity}</p>
                <p>Цена: {(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Корзина пуста. Добавьте товары из каталога.</p>
        )}
      </div>
    </div>
  );
};

export default CartPage;
