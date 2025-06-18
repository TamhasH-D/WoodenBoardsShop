import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductDetailPage.module.css'; // Import CSS module
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatCurrencyRu } from '../utils/localization';
import { apiService } from '../services/api';
import ProductImageWithBoards from '../components/ProductImageWithBoards';
import ProductChat from '../components/ProductChat';

// eslint-disable-next-line no-unused-vars
import { getCurrentBuyerKeycloakId } from '../utils/auth';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useApp();
  const { showSuccess, showError } = useNotifications();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [woodType, setWoodType] = useState(null);
  const [boardsCount, setBoardsCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  // buyerId теперь получается внутри ProductChat компонента

  useEffect(() => {
    loadProductData();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track product page view
  useEffect(() => {
    if (product && window.umami) {
      window.umami.track('Product - Page Viewed', {
        productId: product.id,
        productTitle: product.title || product.neme || 'Untitled',
        price: product.price,
        volume: product.volume,
        sellerId: product.seller_id,
        woodTypeId: product.wood_type_id,
        deliveryPossible: product.delivery_possible,
        hasPickupLocation: product.has_pickup_location
      });
    }
  }, [product]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные товара
      const productResponse = await apiService.getProduct(productId);
      const productData = productResponse.data;
      // No longer set page title immediately here, do it after image potentially added

      setProduct(productData);
      setPageTitle(productData.title || productData.neme || 'Товар'); // Set page title now

      // Загружаем данные продавца (can proceed even if image fetch fails)
      if (productData.seller_id) {
        try {
          const sellerResponse = await apiService.getSeller(productData.seller_id);
          setSeller(sellerResponse.data);
        } catch (err) {
          console.error('Ошибка загрузки продавца:', err);
        }
      }

      // Загружаем тип древесины (can proceed even if image fetch fails)
      if (productData.wood_type_id) {
        try {
          const woodTypeResponse = await apiService.getWoodType(productData.wood_type_id);
          setWoodType(woodTypeResponse.data);
        } catch (err) {
          console.error('Ошибка загрузки типа древесины:', err);
        }
      }

      // Загружаем количество досок
      try {
        const boardsStats = await apiService.getProductBoardsStats(productData.id);
        setBoardsCount(boardsStats.total_count || 0);
      } catch (err) {
        console.error('Ошибка загрузки количества досок:', err);
        setBoardsCount(0);
      }

    } catch (err) {
      console.error('Ошибка загрузки товара:', err);
      setError('Товар не найден');
      showError('Не удалось загрузить товар');
      setProduct(null); // Ensure product is null on error
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (product && seller) {
      // Прокручиваем к чату на этой же странице
      scrollToChat();
      showSuccess('Прокручиваем к чату с продавцом');
    }
  };

  const scrollToChat = () => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>😞</div>
          <h2 className={styles.errorTitle}>Товар не найден</h2>
          <p className={styles.errorMessage}>
            Возможно, товар был удален или ссылка неверна
          </p>
          <button
            onClick={() => navigate('/products')}
            className={styles.errorButton}
          >
            Вернуться к каталогу
          </button>
        </div>
      </div>
    );
  }

  const pricePerCubicMeter = product.volume > 0 ? (product.price / product.volume).toFixed(0) : 0;
  const isLgScreen = window.innerWidth >= 1024;
  const isMdScreen = window.innerWidth >= 768;
  const isSmScreen = window.innerWidth >= 640;


  return (
    <div className={`${styles.pageContainer} ${!isMdScreen ? styles.pageContainerResponsive : ''}`}>
      <div className={`${styles.contentWrapper} ${!isMdScreen ? styles.contentWrapperResponsive : ''}`}>
        {/* Хлебные крошки */}
        <nav className={styles.breadcrumbsNav}>
          <div className={styles.breadcrumbsInner}>
            <button
              onClick={() => navigate('/products')}
              className={styles.breadcrumbButton}
            >
              🏠 Каталог товаров
            </button>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrentPage}>
              {product.title || product.neme || 'Товар'}
            </span>
          </div>
        </nav>

        {/* Основная информация о товаре */}
        <div className={`
          ${styles.productGrid}
          ${!isLgScreen && isMdScreen ? styles.productGridMd : ''}
          ${!isMdScreen ? styles.productGridSm : ''}
        `}>
          {/* Левая колонка - Изображение и анализ */}
          <div className={styles.imageColumn}>
            {/* Изображение */}
            <div className={styles.imageContainer}>
              <ProductImageWithBoards
                product={product}
                className={styles.productImageStyle} // Pass className instead of style
              />
            </div>
          </div>

          {/* Правая колонка - Информация */}
          <div className={styles.infoColumn}>
            <div className={styles.infoHeader}>
              <h1 className={`${styles.productTitle} ${!isMdScreen ? styles.productTitleSm : ''}`}>
                {product.title || product.neme || 'Товар'}
              </h1>
              {product.delivery_possible && (
                <div className={styles.deliveryTag}>
                  🚚 Доставка
                </div>
              )}
            </div>

            <div className={styles.priceSection}>
              <span className={styles.productPrice}>
                {formatCurrencyRu(product.price || 0)}
              </span>
              <div className={styles.pricePerUnitContainer}>
                <span className={styles.pricePerUnit}>
                  {pricePerCubicMeter} ₽/м³
                </span>
                <span className={styles.priceUnitLabel}>
                  за кубический метр
                </span>
              </div>
            </div>

            {product.descrioption && (
              <div className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>
                  📝 Описание
                </h3>
                <div className={styles.descriptionContent}>
                  <p className={styles.descriptionText}>
                    {product.descrioption}
                  </p>
                </div>
              </div>
            )}

            {/* Характеристики */}
            <div className={styles.characteristicsSection}>
              <h3 className={styles.characteristicsTitle}>
                📊 Характеристики
              </h3>
              <div className={`${styles.characteristicsGrid} ${!isSmScreen ? styles.characteristicsGridSm : ''}`}>
                <div className={styles.characteristicItem}>
                  <div className={styles.characteristicLabel}>
                    📦 Объем
                  </div>
                  <div className={styles.characteristicValue}>
                    {product.volume?.toFixed(4) || '0'} м³
                  </div>
                </div>
                <div className={styles.boardCountItem}>
                  <div className={styles.boardCountLabel}>
                    🪵 Количество досок
                  </div>
                  <div className={styles.boardCountValue}>
                    {boardsCount !== null ? boardsCount : 'Загрузка...'}
                  </div>
                </div>
                {woodType && (
                  <div className={`${styles.woodTypeItem} ${!isSmScreen ? styles.woodTypeItemSm : ''}`}>
                    <div className={styles.woodTypeLabel}>
                      🌳 Тип древесины
                    </div>
                    <div className={styles.woodTypeValue}>
                      {woodType.neme || woodType.name || 'Не указан'}
                    </div>
                  </div>
                )}
                {product.pickup_location && (
                  <div className={`${styles.pickupLocationItem} ${!isSmScreen ? styles.pickupLocationItemSm : ''}`}>
                    <div className={styles.pickupLocationLabel}>
                      📍 Адрес самовывоза
                    </div>
                    <div className={styles.pickupLocationValue}>
                      {product.pickup_location}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Действия */}
            <div className={`${styles.actionsContainer} ${!isSmScreen ? styles.actionsContainerSm : ''}`}>
              <button
                onClick={handleStartChat}
                className={styles.chatButton}
              >
                <span>💬</span>
                <span>Написать продавцу</span>
              </button>

              <button
                onClick={() => navigate('/chats')}
                className={styles.allChatsButton}
              >
                <span>📋</span>
                <span>Все чаты</span>
              </button>
            </div>
          </div>
        </div>

        {/* Информация о продавце */}
        {seller && (
          <div className={styles.sellerInfoContainer}>
            <h2 className={styles.sellerInfoHeader}>
              🏪 О продавце
            </h2>
            <div className={styles.sellerDetails}>
              <div className={`
                ${styles.sellerAvatarContainer}
                ${seller.is_online ? styles.sellerAvatarOnline : styles.sellerAvatarOffline}
              `}>
                🏪
                {/* Индикатор онлайн статуса */}
                <div className={`
                  ${styles.onlineIndicator}
                  ${seller.is_online ? styles.onlineIndicatorOnline : styles.onlineIndicatorOffline}
                `} />
              </div>
              <div className={styles.sellerMeta}>
                <div className={styles.sellerNameContainer}>
                  <h3 className={styles.sellerName}>
                    {seller.neme || seller.name || 'Продавец'}
                  </h3>
                  <span className={`
                    ${styles.sellerStatusBadge}
                    ${seller.is_online ? styles.sellerStatusOnline : styles.sellerStatusOffline}
                  `}>
                    {seller.is_online ? '🟢 Онлайн' : '⚫ Офлайн'}
                  </span>
                </div>
                <div className={`${styles.sellerStatsGrid} ${!isSmScreen ? styles.sellerStatsGridSm : ''}`}>
                  <div className={styles.sellerStatItem}>
                    <div className={styles.sellerStatLabel}>
                      ID продавца
                    </div>
                    <div className={`${styles.sellerStatValue} ${styles.sellerStatValueMonospace}`}>
                      {seller.id?.substring(0, 8)}...
                    </div>
                  </div>
                  <div className={styles.sellerStatItem}>
                    <div className={styles.sellerStatLabel}>
                      Участник с
                    </div>
                    <div className={styles.sellerStatValue}>
                      {new Date(seller.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className={styles.sellerAdviceContainer}>
              <div className={styles.sellerAdviceHeader}>
                <span className={styles.sellerAdviceIcon}>💡</span>
                <span className={styles.sellerAdviceTitle}>
                  Совет
                </span>
              </div>
              <p className={styles.sellerAdviceText}>
                Свяжитесь с продавцом через чат ниже, чтобы уточнить детали товара,
                условия доставки или договориться о цене.
              </p>
            </div>
          </div>
        )}

        {/* Чат с продавцом */}
        <div ref={chatRef}>
          <ProductChat
            productId={productId}
            product={product}
            sellerId={product.seller_id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
