import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Edit,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { SELLER_TEXTS, formatDateRu, formatCurrencyRu } from '../../utils/localization';
import { getCurrentSellerKeycloakId } from '../../utils/auth';

const ActivityItem = ({ icon: Icon, title, description, time, action, color }) => {
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

const RecentProducts = () => {
  const keycloakId = getCurrentSellerKeycloakId();

  const productsApiFunction = useMemo(() =>
    keycloakId ? () => apiService.getSellerProductsByKeycloakId(keycloakId, 0, 5) : null,
    [keycloakId]
  );
  const { data: products, loading: productsLoading } = useApi(productsApiFunction, [keycloakId]);

  if (productsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-start space-x-4 p-4">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('RecentActivity - products data:', products);
  }

  // Fix: API returns 'data' field, not 'items'
  if (!products?.data?.length) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500">{SELLER_TEXTS.NO_PRODUCTS_FOUND}</p>
        <Link
          to="/products"
          className="inline-flex items-center mt-2 text-sm text-primary-600 hover:text-primary-700"
        >
          {SELLER_TEXTS.ADD_FIRST_PRODUCT}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.data.slice(0, 5).map((product, index) => (
        <ActivityItem
          key={product.product_uuid || index}
          icon={Package}
          title={product.name || 'Товар без названия'}
          description={`${formatCurrencyRu(product.price)} • ${product.volume} м³ • ${product.wood_type_name || 'Тип не указан'}`}
          time={formatDateRu(product.created_at, 'SHORT')}
          color="bg-blue-500"
          action={
            <Link
              to="/products"
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
            >
              <Edit className="w-3 h-3 mr-1" />
              Редактировать
            </Link>
          }
        />
      ))}
      
      {products.data.length > 5 && (
        <div className="pt-4 border-t border-gray-200">
          <Link 
            to="/products" 
            className="flex items-center justify-center w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {SELLER_TEXTS.VIEW_ALL_PRODUCTS}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

const RecentActivity = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{SELLER_TEXTS.RECENT_PRODUCTS}</h2>
          <p className="text-sm text-gray-600 mt-1">Последние добавленные товары</p>
        </div>
        <Link 
          to="/products" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          Все товары
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <RecentProducts />
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
