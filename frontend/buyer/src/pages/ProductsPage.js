import React, { useEffect, useState } from 'react';import { Link } from 'react-router-dom';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error);
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-white">Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка при загрузке товаров: {error.message}</div>;
  }

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-white tracking-light text-[32px] font-bold leading-tight">Наши товары</p>
            <p className="text-[#90adcb] text-sm font-normal leading-normal">Изучите наш широкий ассортимент высококачественных поддонов и досок, идеально подходящих для любого проекта.</p>
          </div>
        </div>
        {/* Filter buttons - keep for now, but might need dynamic logic later */}
        <div className="flex gap-3 p-3 flex-wrap pr-4">
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#223649] pl-4 pr-4">
            <p className="text-white text-sm font-medium leading-normal">Все</p>
          </button>
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#223649] pl-4 pr-4">
            <p className="text-white text-sm font-medium leading-normal">Поддоны</p>
          </button>
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#223649] pl-4 pr-4">
            <p className="text-white text-sm font-medium leading-normal">Доски</p>
          </button>
          <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#223649] pl-4 pr-4">
            <p className="text-white text-sm font-medium leading-normal">Индивидуальные заказы</p>
          </button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {products.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="flex flex-col gap-3 pb-3">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                style={{
                  backgroundImage:
                    `url("${product.imageUrl || 'https://via.placeholder.com/150'}")`,
                }}
              ></div>
              <div>
                <p className="text-white text-base font-medium leading-normal">{product.name}</p>
                <p className="text-[#90adcb] text-sm font-normal leading-normal">{product.description}</p>
              </div>
            </Link>
          ))}
        </div>
        {/* Pagination - keep for now, but might need dynamic logic later */}
        <div className="flex items-center justify-center p-4">
          <button className="flex size-10 items-center justify-center">
            <div className="text-white" data-icon="CaretLeft" data-size="18px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
              </svg>
            </div>
          </button>
          <button className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-full bg-[#223649]">1</button>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full">2</button>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full">3</button>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full">Next</button>
          <button className="flex size-10 items-center justify-center">
            <div className="text-white" data-icon="CaretRight" data-size="18px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;