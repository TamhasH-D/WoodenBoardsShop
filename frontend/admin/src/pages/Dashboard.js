import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

/**
 * Modern dashboard page with analytics and quick actions
 */
const Dashboard = () => {
  const { setPageTitle, setBackendStatus } = useApp();
  const { showError, showSuccess } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Test backend connectivity
      try {
        await apiService.healthCheck();
        setBackendStatus({ online: true });
      } catch (error) {
        setBackendStatus({ online: false });
      }

      // Load system statistics
      const systemStats = await apiService.getSystemStats();
      setStats(systemStats);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError('Failed to load dashboard data. Please check your connection.');
      
      // Set default stats for offline mode
      setStats({
        buyers: { total: 0, online: 0 },
        sellers: { total: 0, online: 0 },
        products: { total: 0, totalVolume: 0, totalValue: 0 },
        woodTypes: { total: 0 },
        prices: { total: 0, avgPrice: 0 },
        boards: { total: 0 },
        images: { total: 0 },
        communication: { threads: 0, messages: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [setBackendStatus, showError]);

  useEffect(() => {
    setPageTitle('Dashboard');
    loadDashboardData();
  }, [setPageTitle, loadDashboardData]);

  const handleRefresh = () => {
    showSuccess('Refreshing dashboard data...');
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Welcome Back! 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitor and manage your wood trading platform with enterprise-grade tools
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              System Online
            </span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon="🔄"
            className="hover-lift"
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/tools/export'}
            icon="📊"
            className="hover-lift"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Premium Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Users Stats Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                👥
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Users
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Active platform members
                </p>
              </div>
            </div>
          </div>

          {/* Main Number */}
          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.buyers.total + stats.sellers.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                <span className="w-2 h-2 bg-success-500 rounded-full" />
                {stats.buyers.total} Buyers
              </span>
              <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                <span className="w-2 h-2 bg-brand-500 rounded-full" />
                {stats.sellers.total} Sellers
              </span>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Products Stats Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                📦
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Products
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Available inventory
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.products.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.products.totalVolume.toFixed(2)} m³ Total
              </span>
              <span className="text-success-600 dark:text-success-400">
                ${stats.products.totalValue.toFixed(2)} Value
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+8% inventory growth</span>
          </div>
        </div>

        {/* Wood Types Stats Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-warning-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                🌳
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Wood Types
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Available varieties
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.woodTypes.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.prices.total} Price Points
              </span>
              <span className="text-warning-600 dark:text-warning-400">
                ${stats.prices.avgPrice.toFixed(2)} Avg/m³
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-warning-600 dark:text-warning-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Stable pricing</span>
          </div>
        </div>

        {/* Communication Stats Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                💬
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Communication
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Active conversations
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.communication.threads}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.communication.messages} Messages
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                Active Threads
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+24% engagement</span>
          </div>
        </div>
      </div>

      {/* Premium Quick Actions Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Quick Actions
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Frequently used admin tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* User Management Actions */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/users/buyers'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🛒</span>
                <h3 className="text-lg font-semibold">Manage Buyers</h3>
              </div>
              <p className="text-brand-100 text-sm mb-4">
                View, edit, and manage buyer accounts and their activities
              </p>
              <div className="flex items-center text-sm text-brand-200">
                <span>Go to Buyers</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-success-500 to-success-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/users/sellers'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏪</span>
                <h3 className="text-lg font-semibold">Manage Sellers</h3>
              </div>
              <p className="text-success-100 text-sm mb-4">
                Oversee seller accounts, products, and business operations
              </p>
              <div className="flex items-center text-sm text-success-200">
                <span>Go to Sellers</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-warning-500 to-warning-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/products/wood-types'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌳</span>
                <h3 className="text-lg font-semibold">Wood Types</h3>
              </div>
              <p className="text-warning-100 text-sm mb-4">
                Manage wood types, pricing, and product categories
              </p>
              <div className="flex items-center text-sm text-warning-200">
                <span>Manage Products</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/tools/export'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📤</span>
                <h3 className="text-lg font-semibold">Export Data</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Export system data in various formats for analysis
              </p>
              <div className="flex items-center text-sm text-purple-200">
                <span>Export Tools</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/tools/api-test'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧪</span>
                <h3 className="text-lg font-semibold">API Tester</h3>
              </div>
              <p className="text-slate-100 text-sm mb-4">
                Test API endpoints and monitor system connectivity
              </p>
              <div className="flex items-center text-sm text-slate-200">
                <span>Test APIs</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-error-500 to-error-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/system/health'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔧</span>
                <h3 className="text-lg font-semibold">System Health</h3>
              </div>
              <p className="text-error-100 text-sm mb-4">
                Monitor system status and perform health checks
              </p>
              <div className="flex items-center text-sm text-error-200">
                <span>Check Health</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="small"
            onClick={() => window.location.href = '/system/logs'}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            View All Logs
          </Button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft overflow-hidden">
          <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      System initialized successfully
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    All services are running and database connections are healthy
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Dashboard loaded with {stats.buyers.total + stats.sellers.total} users
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Analytics data refreshed and statistics updated
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">🔄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Auto-refresh enabled
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Dashboard will automatically update every 30 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
