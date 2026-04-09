'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/utils/hooks/useAdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthorized, loading } = useRequireAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-green-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-green-300 mb-6">You don&apos;t have permission to access the admin dashboard.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-green-100">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-slate-950 border-r border-green-600/30 transition-all duration-300 fixed h-screen overflow-y-auto z-40`}
        >
          <div className="p-6 border-b border-green-600/30">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <Link href="/" className="text-2xl font-bold text-green-400">
                  GGHub
                </Link>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-green-600/20 rounded-lg transition-colors text-green-400"
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <NavLink
              href="/admin"
              icon="📊"
              label="Dashboard"
              isOpen={sidebarOpen}
            />
            <NavLink
              href="/admin/products"
              icon="🛍️"
              label="Products"
              isOpen={sidebarOpen}
            />
            <NavLink
              href="/admin/announcements"
              icon="📢"
              label="Announcements"
              isOpen={sidebarOpen}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
          <header className="bg-slate-950 border-b border-green-600/30 p-6 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-green-400">Admin Dashboard</h1>
              <Link
                href="/"
                className="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/40 transition-colors"
              >
                ← Back to Site
              </Link>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  isOpen,
}: {
  href: string;
  icon: string;
  label: string;
  isOpen: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-600/20 transition-colors text-green-300 hover:text-green-200 group"
    >
      <span className="text-xl">{icon}</span>
      {isOpen && <span className="font-medium">{label}</span>}
    </Link>
  );
}
