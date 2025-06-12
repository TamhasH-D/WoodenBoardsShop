import React, { useMemo } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  MessageSquare,
  TreePine
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { formatCurrencyRu, formatNumberRu } from '../../utils/localization';
import { MOCK_IDS } from '../../utils/constants';

const MOCK_SELLER_ID = MOCK_IDS.SELLER_ID;

const StatCard = ({ title, value, change, icon: Icon, color, loading, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              {change && (
                <p className={`text-sm flex items-center ${
                  change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {change}
                </p>
              )}
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const BusinessStats = () => {
  // API calls for real data
  const productsApiFunction = useMemo(() => () => apiService.getSellerProducts(MOCK_SELLER_ID, 0, 100), []);
  const woodTypesApiFunction = useMemo(() => () => apiService.getWoodTypes(), []);
  
  const { data: products, loading: productsLoading } = useApi(productsApiFunction, []);
  const { data: woodTypes, loading: woodTypesLoading } = useApi(woodTypesApiFunction, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!products?.items) {
      return {
        totalProducts: 0,
        totalValue: 0,
        avgPrice: 0,
        totalVolume: 0
      };
    }

    const items = products.items;
    const totalProducts = items.length;
    const totalValue = items.reduce((sum, product) => sum + (product.price || 0), 0);
    const totalVolume = items.reduce((sum, product) => sum + (product.volume || 0), 0);
    const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

    return {
      totalProducts,
      totalValue,
      avgPrice,
      totalVolume
    };
  }, [products]);

  const statsData = [
    {
      title: 'Всего товаров',
      value: formatNumberRu(stats.totalProducts, 0),
      change: stats.totalProducts > 0 ? `+${stats.totalProducts}` : null,
      icon: Package,
      color: 'bg-blue-500',
      loading: productsLoading,
      description: 'Активных позиций'
    },
    {
      title: 'Общая стоимость',
      value: formatCurrencyRu(stats.totalValue),
      change: stats.totalValue > 0 ? `+${formatCurrencyRu(stats.totalValue)}` : null,
      icon: DollarSign,
      color: 'bg-green-500',
      loading: productsLoading,
      description: 'Инвентарь на складе'
    },
    {
      title: 'Средняя цена',
      value: formatCurrencyRu(stats.avgPrice),
      change: null,
      icon: TrendingUp,
      color: 'bg-purple-500',
      loading: productsLoading,
      description: 'За единицу товара'
    },
    {
      title: 'Общий объем',
      value: `${formatNumberRu(stats.totalVolume, 3)} м³`,
      change: null,
      icon: TreePine,
      color: 'bg-amber-500',
      loading: productsLoading,
      description: 'Древесины в наличии'
    },
    {
      title: 'Типы древесины',
      value: formatNumberRu(woodTypes?.items?.length || 0, 0),
      change: null,
      icon: TreePine,
      color: 'bg-emerald-500',
      loading: woodTypesLoading,
      description: 'Доступных видов'
    },
    {
      title: 'Активные чаты',
      value: '0',
      change: null,
      icon: MessageSquare,
      color: 'bg-indigo-500',
      loading: false,
      description: 'Открытых диалогов'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Статистика бизнеса</h2>
          <p className="text-sm text-gray-600 mt-1">Обзор ключевых показателей вашего магазина</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          Обновить данные
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            loading={stat.loading}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  );
};

export default BusinessStats;
