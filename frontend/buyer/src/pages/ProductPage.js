import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('standard'); // Добавляем состояние для выбранного варианта
  const [quantity, setQuantity] = useState(1); // Добавляем состояние для количества

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Replace with your actual API endpoint, using the product ID
        // Assuming the API returns product data including a 'variants' object
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
        // Set initial selected variant if variants exist
        if (data.variants && Object.keys(data.variants).length > 0) {
          setSelectedVariant(Object.keys(data.variants)[0]);
        }
      } catch (error) {
        setError(error);
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Depend on 'id' to refetch when the ID changes

  // Handle variant selection
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Mock Add to Cart function (replace with actual logic)
  const addToCart = () => {
    console.log(`Added ${quantity} of ${product.name} (${selectedVariant}) to cart`);
    // Add actual cart logic here (e.g., update global cart state, send to backend)
    alert(`Добавлено ${quantity} шт. ${product.name} (${product.variants[selectedVariant].name}) в корзину!`);
  };

  if (loading) {
    return <div className="text-white">Загрузка товара...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка при загрузке товара: {error.message}</div>;
  }

  if (!product || !product.variants || Object.keys(product.variants).length === 0) {
    return <div className="text-white">Товар или варианты не найдены.</div>;
  }

  const currentVariant = product.variants[selectedVariant];

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="@container">
          <div className="@[480px]:p-4">
            <div
              className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
              style={{
                backgroundImage:
                  `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("${currentVariant.imageUrl || product.imageUrl || 'https://via.placeholder.com/960x480'}")`, // Use variant image if available
              }}
            >
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                  {product.name} ({currentVariant.name})
                </h1>
                <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                  {product.description}
                </h2>
              </div>
              {/* Add more product details here */}
            </div>
          </div>
        </div>
        {/* Additional product details section */}
        <div className="px-4 py-5">
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Детали товара</h2>
          <p className="text-[#9daebe] text-base font-normal leading-normal">Цена: ${currentVariant.price}</p>
          {/* Add other details like dimensions, material, etc. */}
          <div className="mt-6">
            <label className="block text-white font-medium mb-2">Выберите вариант</label>
            <div className="flex gap-4">
              {Object.keys(product.variants).map(variantKey => (
                <button
                  key={variantKey}
                  className={`px-4 py-2 rounded-lg transition duration-300 ${selectedVariant === variantKey ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  onClick={() => handleVariantChange(variantKey)}
                >
                  {product.variants[variantKey].name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="quantity" className="block text-white font-medium mb-2">Количество</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-600 focus:border-amber-600 text-gray-900"
            />
          </div>

          <div className="mt-8">
            <button
              onClick={addToCart}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-300 shadow-md"
            >
              Добавить в корзину
            </button>
          </div>

        </div>

        {/* Placeholder sections - keep for now, might need dynamic logic later */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Рекомендуемые товары</h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {/* Placeholder for recommended products */}
          </div>
        </div>
        <div className="@container">
          <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-white tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                Готовы сделать заказ?
              </h1>
              <p className="text-white text-base font-normal leading-normal max-w-[720px]">
                Свяжитесь с нами сегодня, чтобы получить индивидуальное предложение и экспертную консультацию.
              </p>
            </div>
            <div className="flex flex-1 justify-center">
              <div className="flex justify-center">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#dce8f3] text-[#141a1f] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow">
                  <span className="truncate">Связаться</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;