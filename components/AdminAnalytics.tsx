'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const AdminAnalytics: React.FC = () => {
  const { dashboard, loading, error, exportAnalytics, clearError, getDashboardMetrics } = useAnalytics();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const handleDateRangeChange = (range: 'today' | 'week' | 'month') => {
    setDateRange(range);
    getDashboardMetrics(range);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex justify-between items-start">
        <span>Error: {error}</span>
        <button
          onClick={clearError}
          className="text-red-400 hover:text-red-300 text-xl"
        >
          ✕
        </button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8 text-gray-400">
        No analytics data available yet
      </div>
    );
  }

  const metrics = [
    { label: 'Total Users', value: dashboard.total_users, icon: '👥', color: 'from-blue-600 to-blue-800' },
    { label: 'Active Today', value: dashboard.active_users_today, icon: '✅', color: 'from-green-600 to-green-800' },
    { label: 'Total Sales', value: `$${dashboard.total_sales.toFixed(2)}`, icon: '💰', color: 'from-purple-600 to-purple-800' },
    { label: 'Sales Today', value: `$${dashboard.sales_today.toFixed(2)}`, icon: '📈', color: 'from-pink-600 to-pink-800' },
    { label: 'Products Viewed', value: dashboard.total_products_viewed, icon: '👁️', color: 'from-orange-600 to-orange-800' },
    { label: 'Conversion Rate', value: `${dashboard.conversion_rate.toFixed(2)}%`, icon: '🎯', color: 'from-indigo-600 to-indigo-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-4 py-2 rounded-lg transition capitalize font-medium ${
                dateRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
          <button
            onClick={() => exportAnalytics('csv')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${metric.color} rounded-lg p-6 border border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium opacity-90">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {metric.value}
                </p>
              </div>
              <span className="text-5xl opacity-20">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Order Value */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Average Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-700 rounded">
              <span className="text-gray-300">Average Order Value</span>
              <span className="text-2xl font-bold text-green-400">
                ${dashboard.average_order_value.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-700 rounded">
              <span className="text-gray-300">Total Orders</span>
              <span className="text-2xl font-bold text-blue-400">
                {dashboard.total_sales > 0 ? Math.floor(dashboard.total_sales / dashboard.average_order_value) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {dashboard.top_products.length > 0 ? (
              dashboard.top_products.slice(0, 5).map((product, idx) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-slate-700 rounded hover:bg-slate-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400 font-bold w-6">#{idx + 1}</span>
                    <span className="text-gray-300 truncate">{product.name}</span>
                  </div>
                  <span className="font-semibold text-green-400 whitespace-nowrap">
                    {product.sales} sales
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700 rounded">
            <p className="text-gray-400 text-sm">Growth Rate</p>
            <p className="text-2xl font-bold text-indigo-400 mt-2">
              {dashboard.conversion_rate > 0
                ? `+${dashboard.conversion_rate.toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-4 bg-slate-700 rounded">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              ${dashboard.total_sales.toFixed(0)}
            </p>
          </div>
          <div className="p-4 bg-slate-700 rounded">
            <p className="text-gray-400 text-sm">Engagement</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">
              {dashboard.total_products_viewed}
            </p>
          </div>
          <div className="p-4 bg-slate-700 rounded">
            <p className="text-gray-400 text-sm">User Base</p>
            <p className="text-2xl font-bold text-pink-400 mt-2">
              {dashboard.total_users}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Trend</h3>
        <div className="h-64 flex items-center justify-center bg-slate-700 rounded">
          <p className="text-gray-400">📊 Chart visualization will be added with Chart.js or Recharts</p>
        </div>
      </div>
    </div>
  );
};
