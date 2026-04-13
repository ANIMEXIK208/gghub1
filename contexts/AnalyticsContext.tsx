'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { AnalyticsDashboard, AnalyticsEvent } from '@/types/admin';

interface AnalyticsContextType {
  dashboard: AnalyticsDashboard | null;
  events: AnalyticsEvent[];
  loading: boolean;
  error: string | null;
  trackEvent: (
    eventType: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  getDashboardMetrics: (
    dateRange?: 'today' | 'week' | 'month'
  ) => Promise<void>;
  exportAnalytics: (format: 'csv' | 'pdf') => Promise<void>;
  clearError: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const getDashboardMetrics = useCallback(
    async (dateRange: 'today' | 'week' | 'month' = 'today') => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
          case 'week':
            startDate = new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000
            );
            break;
          case 'month':
            startDate = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            break;
          default:
            startDate = new Date(
              now.getTime() - 24 * 60 * 60 * 1000
            );
        }

        // Fetch analytics events
        const { data: eventsData, error: eventsError } = await supabase
          .from('analytics')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (eventsError) {
          // Check if table doesn't exist
          if (
            eventsError.message.includes('does not exist') ||
            eventsError.code === '42P01'
          ) {
            setError(
              'Database not initialized. Please run the migration in Supabase SQL Editor first.'
            );
          } else {
            throw eventsError;
          }
          return;
        }

        // Transform data
        const typedEvents = (eventsData || []) as AnalyticsEvent[];

        // Calculate metrics
        const uniqueUsers = new Set(
          typedEvents
            .map((e: AnalyticsEvent) => e.user_id)
            .filter(Boolean)
        ).size;

        const purchaseEvents = typedEvents.filter(
          (e: AnalyticsEvent) => e.event_type === 'purchase'
        );
        const totalSales = purchaseEvents.reduce(
          (sum: number, e: AnalyticsEvent) =>
            sum + (e.metadata?.amount || 0),
          0
        );

        const pageViewEvents = typedEvents.filter(
          (e: AnalyticsEvent) => e.event_type === 'page_view'
        );

        const dashboardMetrics: AnalyticsDashboard = {
          total_users: uniqueUsers,
          active_users_today: uniqueUsers,
          total_sales: totalSales,
          sales_today: totalSales,
          total_products_viewed: typedEvents.filter(
            (e: AnalyticsEvent) => e.event_type === 'product_view'
          ).length,
          conversion_rate:
            uniqueUsers > 0
              ? (purchaseEvents.length / uniqueUsers) * 100
              : 0,
          average_order_value:
            purchaseEvents.length > 0
              ? totalSales / purchaseEvents.length
              : 0,
          top_products: [],
          sales_by_date: [],
        };

        setDashboard(dashboardMetrics);
        setEvents(typedEvents);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch analytics';
        setError(errorMessage);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    getDashboardMetrics('today');
  }, [getDashboardMetrics, supabase]);

  const trackEvent = useCallback(
    async (eventType: string, metadata?: Record<string, any>) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        await supabase.from('analytics').insert({
          event_type: eventType,
          user_id: sessionData.session?.user?.id,
          metadata: metadata || {},
        });
      } catch (err) {
        console.error('Error tracking event:', err);
      }
    },
    [supabase]
  );

  const exportAnalytics = useCallback(
    async (format: 'csv' | 'pdf') => {
      try {
        if (!dashboard) return;

        if (format === 'csv') {
          const csv = [
            ['Metric', 'Value'],
            ['Total Users', dashboard.total_users],
            ['Active Users Today', dashboard.active_users_today],
            ['Total Sales', `$${dashboard.total_sales.toFixed(2)}`],
            ['Sales Today', `$${dashboard.sales_today.toFixed(2)}`],
            ['Conversion Rate', `${dashboard.conversion_rate.toFixed(2)}%`],
            ['Average Order Value', `$${dashboard.average_order_value.toFixed(2)}`],
            ['Total Products Viewed', dashboard.total_products_viewed],
          ]
            .map((row) => row.join(','))
            .join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${new Date()
            .toISOString()
            .split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Error exporting analytics:', err);
      }
    },
    [dashboard]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        dashboard,
        events,
        loading,
        error,
        trackEvent,
        getDashboardMetrics,
        exportAnalytics,
        clearError,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
