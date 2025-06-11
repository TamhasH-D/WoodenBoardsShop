import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { BUYER_TEXTS, formatCurrencyRu } from '../utils/localization';
import { apiService } from '../services/api';
import ProductImage from '../components/ui/ProductImage';

/**
 * Премиум страница каталога товаров
 * Продвинутая фильтрация, поиск, пагинация
 */
const ProductsPage = () => {
  const { setPageTitle, searchQuery, setSearchQuery, filters, setFilters, resetFilters } = useApp();
  const { addToCart, isInCart } = useCart();
  const { showCartSuccess } = useNotifications();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [woodTypes, setWoodTypes] = useState([]);
  const [sellers, setSellers] = useState([]);

  const pageSize = 12;

  // Флаг для предотвращения повторной загрузки
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      let result;
      if (searchQuery.trim()) {
        result = await apiService.searchProducts(searchQuery, currentPage, pageSize);
      } else {
        result = await apiService.getProducts(currentPage, pageSize);
      }

      setProducts(result.data || []);
      setTotalProducts(result.total || 0);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      // Не показываем ошибки пользователю, только в консоли
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, pageSize]);

  const loadInitialData = useCallback(async () => {
    try {
      // Загружаем типы древесины и продавцов для фильтров
      const [woodTypesData, sellersData] = await Promise.all([
        apiService.getAllWoodTypes(),
        apiService.getAllSellers()
      ]);

      setWoodTypes(woodTypesData.data || []);
      setSellers(sellersData.data || []);

      // Загружаем товары
      await loadProducts();
      setInitialLoaded(true);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      // Не показываем ошибки пользователю, только в консоли
    }
  }, [loadProducts]);

  // Функция для принудительного обновления
  const handleRefresh = useCallback(async () => {
    await apiService.clearCache();
    await loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.PRODUCTS);
    if (!initialLoaded) {
      loadInitialData();
    }
  }, [setPageTitle, initialLoaded, loadInitialData]);

  // Перезагружаем товары при изменении поиска или страницы (только если уже загружены)
  useEffect(() => {
    if (initialLoaded) {
      loadProducts();
    }
  }, [searchQuery, currentPage, initialLoaded, loadProducts]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showCartSuccess(product.title || product.neme || 'Товар');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="products-page">
      {/* Заголовок страницы */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h1 className="page-title">{BUYER_TEXTS.PRODUCTS}</h1>
            <p className="page-description">
              Каталог древесины от проверенных поставщиков
            </p>
            <div className="page-stats">
              {totalProducts > 0 && (
                <span className="stats-text">
                  Найдено {totalProducts} товаров
                </span>
              )}
            </div>
          </div>
          <div className="page-header-actions">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Обновление...' : '🔄 Обновить'}
            </button>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="filters-section">
        <div className="filters-card">
          {/* Поиск */}
          <div className="filter-group">
            <label className="filter-label">Поиск товаров</label>
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Введите название товара..."
                className="form-input"
              />
            </div>
          </div>

          {/* Фильтры */}
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Тип древесины</label>
              <select
                value={filters.woodType}
                onChange={(e) => handleFilterChange({ ...filters, woodType: e.target.value })}
                className="form-select"
              >
                <option value="">Все типы</option>
                {woodTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.neme || type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Продавец</label>
              <select
                value={filters.seller}
                onChange={(e) => handleFilterChange({ ...filters, seller: e.target.value })}
                className="form-select"
              >
                <option value="">Все продавцы</option>
                {sellers.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.neme || seller.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ценовой диапазон</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="От"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    priceRange: [Number(e.target.value) || 0, filters.priceRange[1]]
                  })}
                  className="form-input price-input"
                />
                <span className="price-separator">—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], Number(e.target.value) || 100000]
                  })}
                  className="form-input price-input"
                />
              </div>
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <div className="filter-actions">
            <button
              onClick={resetFilters}
              className="btn btn-ghost btn-small"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Список товаров */}
      <div className="products-section">
        {loading ? (
          <div className="products-loading">
            <div className="loading-grid">
              {Array.from({ length: pageSize }).map((_, index) => (
                <div key={index} className="product-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-price"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isInCart={isInCart(product.id)}
                />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="btn btn-secondary btn-small"
                >
                  ← Предыдущая
                </button>

                <div className="pagination-info">
                  Страница {currentPage + 1} из {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="btn btn-secondary btn-small"
                >
                  Следующая →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">Товары не найдены</h3>
            <p className="empty-description">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={resetFilters}
              className="btn btn-primary"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Карточка товара с изображением из API
 */
const ProductCard = ({ product, onAddToCart, isInCart }) => {
  return (
    <div className="product-card hover-lift">
      {/* Изображение товара через новый API */}
      <div className="product-image">
        <ProductImage
          productId={product.id}
          alt={product.title || product.neme || 'Товар'}
          className="product-image-full"
          placeholder="🌲"
          showPlaceholder={true}
        />
        {isInCart && (
          <div className="product-badge">
            В корзине
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">
          {product.title || product.neme || 'Товар'}
        </h3>

        <p className="product-description">
          {product.descrioption || product.description || 'Описание товара'}
        </p>

        <div className="product-details">
          <div className="product-volume">
            Объем: {product.volume || 0} м³
          </div>
          <div className="product-wood-type">
            Тип: {product.wood_type || 'Не указан'}
          </div>
        </div>

        <div className="product-footer">
          <div className="product-price">
            {formatCurrencyRu(product.price || 0)}
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isInCart}
            className={`btn btn-small ${isInCart ? 'btn-ghost' : 'btn-primary'}`}
          >
            {isInCart ? 'В корзине' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
