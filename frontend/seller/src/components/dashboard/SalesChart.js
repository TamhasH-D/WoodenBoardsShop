import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import { formatCurrencyRu } from '../../utils/localization';
import { MOCK_IDS } from '../../utils/constants';

const MOCK_SELLER_ID = MOCK_IDS.SELLER_ID;

// Mock data for demonstration
const generateMockSalesData = (products) => {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
    const sales = Math.floor(Math.random() * 5) + 1; // 1-5 sales per day
    const revenue = sales * (Math.random() * 50000 + 10000); // Random revenue
    
    data.push({
      day: dayName,
      date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      sales,
      revenue: Math.round(revenue),
      products: Math.floor(Math.random() * 3) + 1
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === 'revenue' ? 'Выручка' : 
             entry.name === 'sales' ? 'Продажи' : 
             entry.name === 'products' ? 'Товары' : entry.name}: {' '}
            {entry.name === 'revenue' ? formatCurrencyRu(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, change, icon: Icon, trend }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );
};

const SalesChart = () => {
  const productsApiFunction = useMemo(() => () => apiService.getSellerProducts(MOCK_SELLER_ID, 0, 20), []);
  const { data: products, loading: productsLoading } = useApi(productsApiFunction, []);

  const salesData = useMemo(() => {
    return generateMockSalesData(products?.items || []);
  }, [products]);

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const avgDailySales = Math.round(totalSales / 7);

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Аналитика продаж</h2>
          <p className="text-sm text-gray-600 mt-1">Статистика за последние 7 дней</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Последняя неделя</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Общие продажи"
          value={totalSales.toString()}
          change="+12%"
          icon={BarChart3}
          trend="up"
        />
        <StatCard
          title="Общая выручка"
          value={formatCurrencyRu(totalRevenue)}
          change="+8%"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Среднее в день"
          value={avgDailySales.toString()}
          change="+5%"
          icon={Calendar}
          trend="up"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Динамика продаж</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Продажи</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Выручка</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
