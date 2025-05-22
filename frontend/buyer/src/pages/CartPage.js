import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [comments, setComments] = useState('');
  
  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    setIsCheckingOut(true);
  };
  
  // Handle order submission
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    // Here we would normally submit the order to the API
    alert('Заказ успешно оформлен!');
    clearCart();
    navigate('/profile');
  };
  
  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-wood-text mb-8">Корзина</h1>
          
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-wood-text mb-4">Ваша корзина пуста</h2>
            <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
            <Link to="/products">
              <Button variant="primary">Перейти в каталог</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Checkout view
  if (isCheckingOut) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-wood-text mb-8">Оформление заказа</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-semibold text-wood-text mb-4">Ваш заказ</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-wood-text">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <p className="font-semibold text-wood-text">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Итого:</span>
                    <span className="text-xl text-wood-dark">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => setIsCheckingOut(false)}>
                  Вернуться к корзине
                </Button>
              </Card>
            </div>
            
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-semibold text-wood-text mb-6">Данные для доставки</h2>
                
                <form onSubmit={handleSubmitOrder}>
                  {/* Delivery Method */}
                  <div className="mb-6">
                    <label className="block text-wood-text font-medium mb-2">Способ получения</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={deliveryMethod === 'pickup'}
                          onChange={() => setDeliveryMethod('pickup')}
                          className="mr-2"
                        />
                        Самовывоз
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="delivery"
                          checked={deliveryMethod === 'delivery'}
                          onChange={() => setDeliveryMethod('delivery')}
                          className="mr-2"
                        />
                        Доставка
                      </label>
                    </div>
                  </div>
                  
                  {/* Delivery Address (only if delivery is selected) */}
                  {deliveryMethod === 'delivery' && (
                    <div className="mb-6">
                      <label htmlFor="address" className="block text-wood-text font-medium mb-2">
                        Адрес доставки
                      </label>
                      <textarea
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                        rows={3}
                        required
                      />
                    </div>
                  )}
                  
                  {/* Contact Phone */}
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-wood-text font-medium mb-2">
                      Контактный телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                      placeholder="+7 (___) ___-__-__"
                      required
                    />
                  </div>
                  
                  {/* Comments */}
                  <div className="mb-6">
                    <label htmlFor="comments" className="block text-wood-text font-medium mb-2">
                      Комментарий к заказу
                    </label>
                    <textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" variant="primary" fullWidth>
                    Оформить заказ
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Cart view
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Корзина</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-200 last:border-b-0">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 bg-gray-200 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-4">
                      <img 
                        src={item.imageSrc || `https://via.placeholder.com/96?text=${encodeURIComponent(item.title)}`} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-wood-text mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.woodType}, {item.volume} м³
                      </p>
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center mr-4 mb-2 sm:mb-0">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 h-8 border-t border-b border-gray-300 text-center"
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold text-wood-dark mr-4">
                            {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={clearCart}>
                  Очистить корзину
                </Button>
                <Link to="/products">
                  <Button variant="outline">
                    Продолжить покупки
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-wood-text mb-6">Итого</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товары ({cartItems.length}):</span>
                  <span className="font-medium">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка:</span>
                  <span className="font-medium">Рассчитывается при оформлении</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center font-bold">
                  <span>Итого:</span>
                  <span className="text-2xl text-wood-dark">{cartTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              
              <Button variant="primary" fullWidth onClick={handleCheckout}>
                Оформить заказ
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
