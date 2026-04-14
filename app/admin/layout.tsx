'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAdmin } from '@/utils/hooks/useAdminAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AdminUsersProvider } from '@/contexts/AdminUsersContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login' || pathname === '/admin/login/';
  const { isAuthorized, loading } = useRequireAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading && !isLoginRoute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-green-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoginRoute && !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-green-300 mb-6">You don&apos;t have permission to access the admin dashboard.</p>
          <Link href="/admin/login" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AdminUsersProvider>
        <AnalyticsProvider>
          <NotificationsProvider>
            <AdminLayoutContent
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            >
              {children}
            </AdminLayoutContent>
          </NotificationsProvider>
        </AnalyticsProvider>
      </AdminUsersProvider>
    </ThemeProvider>
  );
}

function AdminLayoutContent({
  sidebarOpen,
  setSidebarOpen,
  children,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes('admin_users') ||
        event.message.includes('analytics') ||
        event.message.includes('notifications') ||
        event.message.includes('theme_customization')
      ) {
        setError(
          'Database tables not initialized. Please run the migration in Supabase SQL Editor first.'
        );
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-950 border border-red-600/50 rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Setup Required</h1>
          <p className="text-green-300 mb-6">{error}</p>
          <div className="bg-slate-900 rounded p-4 mb-6 text-sm text-green-200">
            <p className="font-mono mb-2">
              📋 To fix this:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Open the file: <code className="bg-slate-800 px-2 py-1 rounded">migrations/20260409_enhanced_admin_system.sql</code></li>
              <li>Copy all the SQL code</li>
              <li>Paste into the SQL Editor and click Run</li>
              <li>Then refresh this page</li>
            </ol>
          </div>
          <Link
            href="/"
            className="block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ← Back to Home
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
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Admin error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-950/20 border border-red-600/50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">❌ Error Loading Component</h2>
          <p className="text-green-300 mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <details className="text-left bg-slate-900 rounded p-4 mb-6 text-xs text-green-300 font-mono overflow-auto max-h-40">
            <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
            {this.state.error?.stack}
          </details>
          {this.state.error?.message.includes('admin_users') ||
          this.state.error?.message.includes('analytics') ||
          this.state.error?.message.includes('notifications') ? (
            <div className="bg-slate-900 rounded p-4 mb-6 text-sm">
              <p className="text-yellow-400 font-bold mb-2">💡 Quick Fix:</p>
              <p className="text-green-300">
                Run the database migration in Supabase SQL Editor using: <code className="bg-slate-800 px-2 py-1 rounded">migrations/20260409_enhanced_admin_system.sql</code>
              </p>
            </div>
          ) : null}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
