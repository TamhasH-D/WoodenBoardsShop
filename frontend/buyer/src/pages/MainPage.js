import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import ProductGrid from '../components/product/ProductGrid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PriceCalculator from '../components/calculator/PriceCalculator';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import SkeletonLoader from '../components/common/SkeletonLoader';
import apiService from '../apiService';

const MainPage = () => {
  const [error, setError] = useState(null);

  // Fetch featured products
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => apiService.getProducts({ limit: 4, sortBy: 'created_at', sortDirection: 'desc' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Error loading products:', error);
    }
  });

  // Fetch wood types
  const {
    data: woodTypesData,
    isLoading: woodTypesLoading,
    error: woodTypesError,
    refetch: refetchWoodTypes
  } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => apiService.getWoodTypes({ limit: 8 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Error loading wood types:', error);
    }
  });

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => apiService.getBuyerDashboardStats('buyer-test-001'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error loading dashboard stats:', error);
    }
  });

  const featuredProducts = productsData?.data || [];
  const woodTypes = woodTypesData?.data || [];
  const isLoading = productsLoading || woodTypesLoading;

  // Handle critical errors (both products and wood types failed)
  const hasCriticalError = productsError && woodTypesError;

  if (hasCriticalError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <ErrorMessage
            error={productsError}
            onRetry={() => {
              refetchProducts();
              refetchWoodTypes();
            }}
            className="min-h-[400px]"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-wood-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Качественная древесина для ваших проектов
            </h1>
            <p className="text-xl mb-8 text-wood-light">
              Широкий выбор пиломатериалов различных пород древесины с доставкой по всей России
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products">
                <Button size="lg">Каталог товаров</Button>
              </Link>
              <Link to="/calculator">
                <Button variant="outline" size="lg">Рассчитать стоимость</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-wood-text">Популярные товары</h2>
            <Link to="/products" className="text-wood-accent hover:text-wood-accent-light transition duration-300">
              Смотреть все
            </Link>
          </div>

          {productsError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-yellow-800 mb-4">Не удалось загрузить товары</p>
                <Button
                  onClick={refetchProducts}
                  variant="outline"
                  size="sm"
                >
                  Попробовать снова
                </Button>
              </div>
            </div>
          ) : featuredProducts.length === 0 && !productsLoading ? (
            <EmptyState
              title="Товары пока не добавлены"
              description="Скоро здесь появятся популярные товары"
              action={
                <Link to="/products">
                  <Button>Перейти в каталог</Button>
                </Link>
              }
            />
          ) : (
            <ProductGrid products={featuredProducts} loading={productsLoading} />
          )}
        </div>
      </section>

      {/* Wood Types Section */}
      <section className="py-12 md:py-16 bg-wood-light bg-opacity-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-wood-text mb-8 text-center">
            Типы древесины
          </h2>

          {woodTypesError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-yellow-800 mb-4">Не удалось загрузить типы древесины</p>
                <Button
                  onClick={refetchWoodTypes}
                  variant="outline"
                  size="sm"
                >
                  Попробовать снова
                </Button>
              </div>
            </div>
          ) : woodTypesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <SkeletonLoader key={index} variant="card" />
              ))}
            </div>
          ) : woodTypes.length === 0 ? (
            <EmptyState
              title="Типы древесины пока не добавлены"
              description="Скоро здесь появится информация о различных типах древесины"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {woodTypes.slice(0, 4).map((type) => (
                <Card key={type.id} hover={true} className="text-center">
                  <div className="h-40 bg-wood-medium bg-opacity-20 flex items-center justify-center mb-4 rounded">
                    <span className="text-2xl font-bold text-wood-dark">{type.name || type.neme || 'Древесина'}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-wood-text mb-2">{type.name || type.neme || 'Неизвестный тип'}</h3>
                  <p className="text-gray-600 mb-4">Доступно в каталоге</p>
                  <Link to={`/wood-types/${type.id}`}>
                    <Button variant="outline" fullWidth>Подробнее</Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-wood-text mb-8 text-center">
            Рассчитайте стоимость
          </h2>
          <PriceCalculator woodTypes={woodTypes} loading={woodTypesLoading} />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-wood-dark text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-wood-medium bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Гарантия качества</h3>
              <p className="text-wood-light">
                Мы тщательно отбираем древесину и контролируем качество на всех этапах производства
              </p>
            </div>
            <div className="text-center">
              <div className="bg-wood-medium bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-wood-light">
                Доставляем заказы в кратчайшие сроки благодаря собственному автопарку
              </p>
            </div>
            <div className="text-center">
              <div className="bg-wood-medium bg-opacity-30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-wood-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Профессиональная консультация</h3>
              <p className="text-wood-light">
                Наши специалисты помогут выбрать подходящий материал для вашего проекта
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-wood-accent text-white p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Готовы начать свой проект?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Свяжитесь с нами сегодня и получите бесплатную консультацию по выбору материалов
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="secondary" size="lg">
                  Связаться с нами
                </Button>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-wood-accent">
                    Перейти в каталог
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default MainPage;
