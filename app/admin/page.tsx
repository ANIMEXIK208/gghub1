'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';
import { useAnnouncements } from '@/contexts/AnnouncementsContext';

export default function AdminDashboard() {
  const { products, loading: productsLoading } = useProducts();
  const { announcements, loading: announcementsLoading } = useAnnouncements();
  const [redeploying, setRedeploying] = useState(false);
  const [redeployMessage, setRedeployMessage] = useState('');

  const handleRedeploy = async () => {
    setRedeploying(true);
    setRedeployMessage('');

    try {
      const buildHookUrl = process.env.NEXT_PUBLIC_NETLIFY_BUILD_HOOK_URL;

      if (!buildHookUrl) {
        setRedeployMessage('Build hook URL not configured');
        return;
      }

      const response = await fetch(buildHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRedeployMessage('✅ Redeploy triggered successfully!');
      } else {
        setRedeployMessage('❌ Failed to trigger redeploy');
      }
    } catch (error) {
      console.error('Redeploy error:', error);
      setRedeployMessage('❌ Error triggering redeploy');
    } finally {
      setRedeploying(false);
      setTimeout(() => setRedeployMessage(''), 5000);
    }
  };

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: '🛍️',
      color: 'from-blue-600 to-blue-800',
      href: '/admin/products',
    },
    {
      label: 'Total Announcements',
      value: announcements.length,
      icon: '📢',
      color: 'from-purple-600 to-purple-800',
      href: '/admin/announcements',
    },
    {
      label: 'Trending Products',
      value: products.filter(p => p.trending).length,
      icon: '⭐',
      color: 'from-yellow-600 to-yellow-800',
      href: '/admin/products',
    },
    {
      label: 'Low Stock Items',
      value: '0',
      icon: '⚠️',
      color: 'from-red-600 to-red-800',
      href: '/admin/products',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-green-300 mb-2">Welcome to Admin Dashboard 👋</h2>
        <p className="text-green-200 text-lg">
          Manage your products and announcements from a single, intuitive interface.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:shadow-green-500/20 transition-all transform hover:scale-105`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-950 border border-green-600/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-green-300 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=add"
            className="flex items-center gap-4 p-6 bg-green-600/10 border border-green-600/30 rounded-xl hover:bg-green-600/20 hover:border-green-600/50 transition-all"
          >
            <span className="text-4xl">➕</span>
            <div>
              <p className="font-semibold text-green-300">Add New Product</p>
              <p className="text-sm text-green-200/70">Create a new product listing</p>
            </div>
          </Link>

          <Link
            href="/admin/announcements?action=add"
            className="flex items-center gap-4 p-6 bg-purple-600/10 border border-purple-600/30 rounded-xl hover:bg-purple-600/20 hover:border-purple-600/50 transition-all"
          >
            <span className="text-4xl">📝</span>
            <div>
              <p className="font-semibold text-purple-300">Add Announcement</p>
              <p className="text-sm text-purple-200/70">Create a new announcement</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-4 p-6 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 hover:border-blue-600/50 transition-all"
          >
            <span className="text-4xl">👁️</span>
            <div>
              <p className="font-semibold text-blue-300">View All Products</p>
              <p className="text-sm text-blue-200/70">Manage your inventory</p>
            </div>
          </Link>

          <button
            onClick={handleRedeploy}
            disabled={redeploying}
            className="flex items-center gap-4 p-6 bg-orange-600/10 border border-orange-600/30 rounded-xl hover:bg-orange-600/20 hover:border-orange-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-4xl">{redeploying ? '⏳' : '🚀'}</span>
            <div>
              <p className="font-semibold text-orange-300">
                {redeploying ? 'Redeploying...' : 'Redeploy Site'}
              </p>
              <p className="text-sm text-orange-200/70">
                {redeploying ? 'Please wait...' : 'Trigger site rebuild'}
              </p>
            </div>
          </button>
        </div>

        {redeployMessage && (
          <div className="mt-4 p-4 bg-slate-900/50 border border-orange-600/30 rounded-lg">
            <p className="text-orange-300">{redeployMessage}</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-950 border border-green-600/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-green-300 mb-6">Recent Updates</h3>
        {productsLoading || announcementsLoading ? (
          <p className="text-green-200/70">Loading recent activity...</p>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-slate-900/50 border border-green-600/20 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-green-300">{product.name}</p>
                  <p className="text-sm text-green-200/70">Product • {product.category}</p>
                </div>
                <span className="text-green-400 font-semibold">{product.price} NGN</span>
              </div>
            ))}
            {announcements.slice(0, 3).map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-4 bg-slate-900/50 border border-purple-600/20 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-purple-300">{announcement.title}</p>
                  <p className="text-sm text-purple-200/70">Announcement</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
