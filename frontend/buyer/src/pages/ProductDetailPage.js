import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChatInterface from '../components/chat/ChatInterface';
import { useApi } from '../context/ApiContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiService } = useApi();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [woodType, setWoodType] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);

        // Fetch product
        const productResponse = await apiService.getProduct(id);
        const productData = productResponse.data;
        setProduct(productData);

        // Fetch wood type
        try {
          const woodTypeResponse = await apiService.getWoodType(productData.wood_type_id);
          setWoodType(woodTypeResponse.data);
        } catch (error) {
          console.error('Error loading wood type:', error);
        }

        // Fetch seller (if we had a seller API endpoint)
        try {
          // This is a placeholder - replace with actual seller API call
          // const sellerResponse = await apiService.getSeller(productData.seller_id);
          // setSeller(sellerResponse.data);
          setSeller({
            id: productData.seller_id,
            name: 'Продавец',
            rating: 4.5,
            location: 'Москва'
          });
        } catch (error) {
          console.error('Error loading seller:', error);
        }

      } catch (error) {
        console.error('Error loading product:', error);
        setError('Не удалось загрузить информацию о товаре. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id, apiService]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    // Create a cart item from the product
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      volume: product.volume,
      woodType: woodType ? woodType.neme : 'Неизвестный тип',
      imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.title)}`,
      deliveryPossible: product.delivery_possible,
      pickupLocation: product.pickup_location
    };

    // Add to cart
    addToCart(cartItem, quantity);

    // Show success message
    setAddedToCart(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const handleContactSeller = () => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    // Toggle chat interface
    setShowChat(!showChat);
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-lg mx-auto">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-wood-text mb-4">Ошибка</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // No product found
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-lg mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-wood-text mb-4">Товар не найден</h2>
            <p className="mb-6 text-gray-600">Запрашиваемый товар не существует или был удален.</p>
            <Link to="/products">
              <Button>Перейти в каталог</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate total price
  const totalPrice = product.price * quantity;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-wood-accent">Главная</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link to="/products" className="text-gray-500 hover:text-wood-accent">Каталог</Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-wood-text">{product.title}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img
              src={`https://via.placeholder.com/600x400?text=${encodeURIComponent(product.title)}`}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-wood-text mb-2">{product.title}</h1>
            <div className="flex items-center mb-6">
              <span className="text-sm bg-wood-light bg-opacity-30 text-wood-dark px-3 py-1 rounded-full">
                {woodType ? woodType.neme : 'Неизвестный тип древесины'}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{product.descrioption || 'Описание отсутствует'}</p>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Цена за м³</p>
                <p className="text-3xl font-bold text-wood-dark">{product.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Объем</p>
                <p className="text-xl font-semibold text-wood-text">{product.volume} м³</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-wood-text font-medium mb-2">Количество</label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24 rounded-l-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                />
                <div className="bg-gray-100 rounded-r-lg border border-l-0 border-gray-300 px-4 flex items-center">
                  <span className="text-gray-600">шт.</span>
                </div>
              </div>
            </div>

            <div className="bg-wood-light bg-opacity-30 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-wood-text font-medium">Итого:</span>
                <span className="text-2xl font-bold text-wood-dark">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              {addedToCart ? (
                <Button variant="success" className="bg-green-600 hover:bg-green-700">
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    Добавлено в корзину
                  </span>
                </Button>
              ) : isInCart(product.id) ? (
                <div className="flex flex-col space-y-2">
                  <Button variant="primary" onClick={handleAddToCart}>
                    Добавить еще ({getItemQuantity(product.id)} в корзине)
                  </Button>
                  <Link to="/cart">
                    <Button variant="outline" fullWidth>
                      Перейти в корзину
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button variant="primary" onClick={handleAddToCart}>
                  Добавить в корзину
                </Button>
              )}
              <Button variant="outline" onClick={handleContactSeller}>
                Связаться с продавцом
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Delivery Info */}
          <Card>
            <h3 className="text-xl font-semibold text-wood-text mb-4">Доставка</h3>
            {product.delivery_possible ? (
              <div>
                <p className="text-gray-600 mb-2">Доставка доступна</p>
                <p className="text-gray-600">Стоимость доставки рассчитывается индивидуально в зависимости от адреса и объема заказа.</p>
              </div>
            ) : (
              <p className="text-gray-600">Доставка не предусмотрена для данного товара. Только самовывоз.</p>
            )}
          </Card>

          {/* Pickup Info */}
          <Card>
            <h3 className="text-xl font-semibold text-wood-text mb-4">Самовывоз</h3>
            {product.pickup_location ? (
              <p className="text-gray-600">{product.pickup_location}</p>
            ) : (
              <p className="text-gray-600">Информация о месте самовывоза отсутствует. Пожалуйста, свяжитесь с продавцом.</p>
            )}
          </Card>

          {/* Seller Info */}
          <Card>
            <h3 className="text-xl font-semibold text-wood-text mb-4">Продавец</h3>
            {seller ? (
              <div>
                <p className="font-medium text-wood-text mb-1">{seller.name}</p>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">{seller.rating.toFixed(1)}</span>
                </div>
                <p className="text-gray-600">{seller.location}</p>
                <Link to={`/products?seller=${seller.id}`}>
                  <Button variant="text" className="mt-2 p-0 text-wood-accent hover:text-wood-accent-dark">
                    Все товары продавца
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-600">Информация о продавце недоступна</p>
            )}
          </Card>
        </div>

        {/* Chat Interface */}
        {showChat && seller && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-wood-text mb-6">Чат с продавцом</h2>
            <ChatInterface sellerId={seller.id} productId={product.id} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
