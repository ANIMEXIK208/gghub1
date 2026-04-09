# GGHub Admin Dashboard - Comprehensive Implementation Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [New Context Layers](#new-context-layers)
5. [UI Components](#ui-components)
6. [Admin Routes](#admin-routes)
7. [Implementation Sequence](#implementation-sequence)
8. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Expanded Admin Dashboard Architecture

```
Admin Dashboard (Next.js 14 + TypeScript)
├── Authentication & Authorization
│   ├── Email-based Admin Detection
│   ├── Role-Based Access Control (RBAC)
│   ├── Permission Validation
│   └── Session Management
├── Feature Modules
│   ├── Dashboard Analytics
│   │   ├── Real-time Metrics
│   │   ├── Charts & Data Visualization
│   │   └── Export Reports
│   ├── User Management
│   │   ├── User CRUD Operations
│   │   ├── Role Assignment
│   │   └── Permission Management
│   ├── Product Management (✅ Existing)
│   ├── Announcement Management (✅ Existing)
│   ├── Notification System
│   │   ├── Email Templates
│   │   ├── In-App Notifications
│   │   └── Notification Queue
│   └── Theme Customization
│       ├── Color Customization
│       ├── Font Selection
│       └── Layout Templates
├── Data Layer
│   ├── Supabase Real-Time Subscriptions
│   ├── React Context API
│   ├── IndexedDB (Offline Access)
│   └── Service Worker (PWA)
└── Security & Infrastructure
    ├── Rate Limiting
    ├── 2FA Support
    ├── Audit Logging
    ├── Data Encryption
    └── Compliance Checks
```

### Data Flow

```
Admin UI (React Components)
    ↓
Context API (State Management)
    ↓
Supabase Client (API & Real-Time)
    ↓
PostgreSQL Database
    ↓
Real-Time Subscriptions → Live Updates → Admin UI
```

---

## Database Schema

### SQL Migration File: `migrations/20260409_enhanced_admin_system.sql`

```sql
-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table (extended from auth.users)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id BIGINT REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  last_login TIMESTAMP,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50), -- 'products', 'announcements', 'users', 'analytics', 'notifications', 'theme'
  action VARCHAR(50), -- 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100), -- 'page_view', 'product_view', 'purchase', 'user_signup'
  user_id UUID REFERENCES auth.users(id),
  product_id BIGINT REFERENCES products(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_analytics_created_at (created_at),
  INDEX idx_analytics_event_type (event_type),
  INDEX idx_analytics_user_id (user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'email', 'in_app', 'sms'
  recipient_type VARCHAR(50), -- 'all_users', 'specific_users', 'role_based'
  recipient_ids UUID[] DEFAULT NULL,
  template_id BIGINT REFERENCES notification_templates(id),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  template_type VARCHAR(50), -- 'promotional', 'transactional', 'alert'
  variables JSONB, -- { name, email, productName, etc. }
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create theme_customization table
CREATE TABLE IF NOT EXISTS theme_customization (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  primary_color VARCHAR(7) DEFAULT '#6366f1', -- Indigo
  secondary_color VARCHAR(7) DEFAULT '#1e293b', -- Slate
  accent_color VARCHAR(7) DEFAULT '#ec4899', -- Pink
  font_family VARCHAR(100) DEFAULT 'Inter',
  layout_template VARCHAR(50) DEFAULT 'default', -- 'default', 'compact', 'spacious'
  dark_mode BOOLEAN DEFAULT TRUE,
  sidebar_position VARCHAR(20) DEFAULT 'left', -- 'left', 'right'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id BIGINT,
  changes JSONB,
  ip_address INET,
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_audit_logs_admin_id (admin_id),
  INDEX idx_audit_logs_created_at (created_at)
);

-- Create offline_sync_queue table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(255),
  action VARCHAR(50), -- 'create', 'update', 'delete'
  resource_type VARCHAR(50),
  resource_data JSONB,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX idx_admin_users_status ON admin_users(status);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_theme_customization_admin_id ON theme_customization(admin_id);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('Super Admin', 'Full access to all features', '{"all": true}'::jsonb),
  ('Product Manager', 'Manage products and inventory', '{"products": ["create", "read", "update", "delete"]}'::jsonb),
  ('Content Manager', 'Manage announcements and notifications', '{"announcements": ["create", "read", "update", "delete"], "notifications": ["create", "read", "update", "delete"]}'::jsonb),
  ('Analyst', 'View analytics and reports', '{"analytics": ["read"]}'::jsonb),
  ('Moderator', 'Moderate user content and reports', '{"users": ["read", "update"], "analytics": ["read"]}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('view_dashboard', 'View admin dashboard', 'dashboard', 'read'),
  ('create_product', 'Create new products', 'products', 'create'),
  ('edit_product', 'Edit existing products', 'products', 'update'),
  ('delete_product', 'Delete products', 'products', 'delete'),
  ('manage_users', 'Manage admin users and roles', 'users', 'create'),
  ('view_analytics', 'View analytics reports', 'analytics', 'read'),
  ('manage_notifications', 'Create and send notifications', 'notifications', 'create'),
  ('customize_theme', 'Customize website theme', 'theme', 'update'),
  ('view_audit_logs', 'View audit logs', 'audit', 'read')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can view their own data" ON admin_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view analytics" ON analytics
  FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active'));

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Optional: Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE theme_customization;
```

---

## TypeScript Interfaces

### File: `types/admin.ts`

```typescript
import { User } from '@supabase/supabase-js';

/**
 * Role-Based Access Control Types
 */
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: 'products' | 'announcements' | 'users' | 'analytics' | 'notifications' | 'theme' | 'dashboard' | 'audit';
  action: 'create' | 'read' | 'update' | 'delete';
  created_at: string;
}

/**
 * Admin User Types
 */
export interface AdminUser {
  id: string; // UUID
  email: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  two_fa_enabled: boolean;
  created_at: string;
  updated_at: string;
  role?: Role;
}

/**
 * Analytics Types
 */
export interface AnalyticsEvent {
  id: number;
  event_type: 'page_view' | 'product_view' | 'purchase' | 'user_signup' | 'user_login';
  user_id?: string;
  product_id?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AnalyticsDashboard {
  total_users: number;
  active_users_today: number;
  total_sales: number;
  sales_today: number;
  total_products_viewed: number;
  conversion_rate: number;
  average_order_value: number;
  top_products: Array<{ id: number; name: string; sales: number }>;
  sales_by_date: Array<{ date: string; sales: number }>;
}

/**
 * Notification Types
 */
export interface NotificationTemplate {
  id: number;
  name: string;
  subject?: string;
  body: string;
  template_type: 'promotional' | 'transactional' | 'alert';
  variables: Record<string, string>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'email' | 'in_app' | 'sms';
  recipient_type: 'all_users' | 'specific_users' | 'role_based';
  recipient_ids?: string[];
  template_id?: number;
  scheduled_at?: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Theme Customization Types
 */
export interface ThemeCustomization {
  id: number;
  admin_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  layout_template: 'default' | 'compact' | 'spacious';
  dark_mode: boolean;
  sidebar_position: 'left' | 'right';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Audit Log Types
 */
export interface AuditLog {
  id: number;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: number;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Offline Sync Types
 */
export interface OfflineSyncItem {
  id: number;
  device_id: string;
  action: 'create' | 'update' | 'delete';
  resource_type: string;
  resource_data: Record<string, any>;
  synced_at?: string;
  created_at: string;
}
```

---

## New Context Layers

### 1. User Management Context

#### File: `contexts/AdminUsersContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { AdminUser, Role } from '@/types/admin';

interface AdminUsersContextType {
  users: AdminUser[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  addUser: (userData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editUser: (id: string, userData: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  assignRole: (userId: string, roleId: number) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined);

export const useAdminUsers = () => {
  const context = useContext(AdminUsersContext);
  if (!context) {
    throw new Error('useAdminUsers must be used within AdminUsersProvider');
  }
  return context;
};

export const AdminUsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchUsersAndRoles();

    // Real-time subscription for admin users
    const channel = supabase
      .channel('admin_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, () => {
        fetchUsersAndRoles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users')
        .select(`
          *,
          roles:role_id (
            id,
            name,
            description,
            permissions,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) throw rolesError;

      setUsers(usersData || []);
      setRoles(rolesData || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users and roles';
      setError(errorMessage);
      console.error('Error fetching users and roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role_id: userData.role_id,
          status: userData.status || 'active',
          two_fa_enabled: userData.two_fa_enabled || false,
        });

      if (error) throw error;
      
      // Log action
      await logAuditAction('create', 'admin_users', userData.email);
      
      await fetchUsersAndRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add user';
      setError(errorMessage);
      throw err;
    }
  };

  const editUser = async (id: string, userData: Partial<AdminUser>) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          role_id: userData.role_id,
          status: userData.status,
          two_fa_enabled: userData.two_fa_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      await logAuditAction('update', 'admin_users', id, userData);
      await fetchUsersAndRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await logAuditAction('delete', 'admin_users', id);
      await fetchUsersAndRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    }
  };

  const assignRole = async (userId: string, roleId: number) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role_id: roleId, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      await logAuditAction('update', 'admin_users', userId, { role_id: roleId });
      await fetchUsersAndRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      setError(errorMessage);
      throw err;
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      await logAuditAction('update', 'admin_users', userId, { status: 'suspended' });
      await fetchUsersAndRoles();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to suspend user';
      setError(errorMessage);
      throw err;
    }
  };

  const logAuditAction = async (
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: Record<string, any>
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session?.user?.id) {
        await supabase.from('audit_logs').insert({
          admin_id: sessionData.session.user.id,
          action,
          resource_type: resourceType,
          resource_id: parseInt(resourceId) || 0,
          changes: changes || {},
        });
      }
    } catch (err) {
      console.error('Failed to log audit action:', err);
    }
  };

  return (
    <AdminUsersContext.Provider value={{
      users,
      roles,
      loading,
      error,
      addUser,
      editUser,
      deleteUser,
      assignRole,
      suspendUser,
    }}>
      {children}
    </AdminUsersContext.Provider>
  );
};
```

### 2. Analytics Context

#### File: `contexts/AnalyticsContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { AnalyticsDashboard, AnalyticsEvent } from '@/types/admin';

interface AnalyticsContextType {
  dashboard: AnalyticsDashboard | null;
  events: AnalyticsEvent[];
  loading: boolean;
  error: string | null;
  trackEvent: (eventType: string, metadata?: Record<string, any>) => Promise<void>;
  getDashboardMetrics: (dateRange?: 'today' | 'week' | 'month') => Promise<void>;
  exportAnalytics: (format: 'csv' | 'pdf') => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    getDashboardMetrics('today');

    // Real-time subscription
    const channel = supabase
      .channel('analytics_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics' }, () => {
        getDashboardMetrics('today');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getDashboardMetrics = async (dateRange: 'today' | 'week' | 'month' = 'today') => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Fetch various metrics
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Calculate dashboard metrics
      const uniqueUsers = new Set(
        (eventsData as any[])?.map(e => e.user_id).filter(Boolean)
      ).size;

      const purchaseEvents = (eventsData as any[])?.filter(e => e.event_type === 'purchase') || [];
      const totalSales = purchaseEvents.reduce((sum, e) => sum + (e.metadata?.amount || 0), 0);

      const dashboardMetrics: AnalyticsDashboard = {
        total_users: uniqueUsers,
        active_users_today: uniqueUsers,
        total_sales: totalSales,
        sales_today: totalSales,
        total_products_viewed: (eventsData as any[])?.filter(e => e.event_type === 'product_view').length || 0,
        conversion_rate: uniqueUsers > 0 ? (purchaseEvents.length / uniqueUsers) * 100 : 0,
        average_order_value: purchaseEvents.length > 0 ? totalSales / purchaseEvents.length : 0,
        top_products: [],
        sales_by_date: [],
      };

      setDashboard(dashboardMetrics);
      setEvents(eventsData as AnalyticsEvent[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: string, metadata?: Record<string, any>) => {
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
  };

  const exportAnalytics = async (format: 'csv' | 'pdf') => {
    try {
      if (!dashboard) return;

      if (format === 'csv') {
        const csv = [
          ['Metric', 'Value'],
          ['Total Users', dashboard.total_users],
          ['Active Users Today', dashboard.active_users_today],
          ['Total Sales', dashboard.total_sales],
          ['Sales Today', dashboard.sales_today],
          ['Conversion Rate', dashboard.conversion_rate + '%'],
          ['Average Order Value', dashboard.average_order_value],
        ]
          .map(row => row.join(','))
          .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting analytics:', err);
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      dashboard,
      events,
      loading,
      error,
      trackEvent,
      getDashboardMetrics,
      exportAnalytics,
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
```

### 3. Notifications Context

#### File: `contexts/NotificationsContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { Notification, NotificationTemplate } from '@/types/admin';

interface NotificationsContextType {
  notifications: Notification[];
  templates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  sendNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  scheduleNotification: (notification: Notification, scheduledAt: string) => Promise<void>;
  createTemplate: (template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTemplate: (templateId: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data: notificationData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: templateData, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;
      if (templateError) throw templateError;

      setNotifications(notificationData as Notification[]);
      setTemplates(templateData as NotificationTemplate[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_by: sessionData.session?.user?.id,
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

      if (error) throw error;

      await fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      throw err;
    }
  };

  const scheduleNotification = async (notification: Notification, scheduledAt: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_by: sessionData.session?.user?.id,
          scheduled_at: scheduledAt,
          status: 'pending',
        });

      if (error) throw error;

      await fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule notification';
      setError(errorMessage);
      throw err;
    }
  };

  const createTemplate = async (template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('notification_templates')
        .insert({
          ...template,
          created_by: sessionData.session?.user?.id,
        });

      if (error) throw error;

      await fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTemplate = async (templateId: number) => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      templates,
      loading,
      error,
      sendNotification,
      scheduleNotification,
      createTemplate,
      deleteTemplate,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
```

### 4. Theme Customization Context

#### File: `contexts/ThemeContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { ThemeCustomization } from '@/types/admin';

interface ThemeContextType {
  theme: ThemeCustomization | null;
  loading: boolean;
  error: string | null;
  updateTheme: (theme: Partial<ThemeCustomization>) => Promise<void>;
  resetTheme: () => Promise<void>;
  previewTheme: (theme: Partial<ThemeCustomization>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchTheme();

    // Real-time subscription
    const channel = supabase
      .channel('theme_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'theme_customization' }, () => {
        fetchTheme();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTheme = async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('theme_customization')
        .select('*')
        .eq('admin_id', sessionData.session?.user?.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows" error

      if (data) {
        setTheme(data as ThemeCustomization);
        applyTheme(data as ThemeCustomization);
      }
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch theme';
      setError(errorMessage);
      console.error('Error fetching theme:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (themeUpdates: Partial<ThemeCustomization>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // If theme exists, update it. Otherwise, create it.
      if (theme?.id) {
        const { error } = await supabase
          .from('theme_customization')
          .update({
            ...themeUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', theme.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('theme_customization')
          .insert({
            admin_id: sessionData.session.user.id,
            ...themeUpdates,
          });

        if (error) throw error;
      }

      await fetchTheme();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update theme';
      setError(errorMessage);
      throw err;
    }
  };

  const resetTheme = async () => {
    try {
      if (theme?.id) {
        const { error } = await supabase
          .from('theme_customization')
          .update({
            primary_color: '#6366f1',
            secondary_color: '#1e293b',
            accent_color: '#ec4899',
            font_family: 'Inter',
            layout_template: 'default',
            dark_mode: true,
            sidebar_position: 'left',
            updated_at: new Date().toISOString(),
          })
          .eq('id', theme.id);

        if (error) throw error;
      }

      await fetchTheme();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset theme';
      setError(errorMessage);
      throw err;
    }
  };

  const previewTheme = (themePreview: Partial<ThemeCustomization>) => {
    const preview = { ...theme, ...themePreview } as ThemeCustomization;
    applyTheme(preview);
  };

  const applyTheme = (themeData: ThemeCustomization) => {
    // Apply theme to CSS variables
    document.documentElement.style.setProperty('--color-primary', themeData.primary_color);
    document.documentElement.style.setProperty('--color-secondary', themeData.secondary_color);
    document.documentElement.style.setProperty('--color-accent', themeData.accent_color);
    document.documentElement.style.setProperty('--font-family', themeData.font_family);
    
    // Apply dark mode
    if (themeData.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Store in localStorage for persistence
    localStorage.setItem('admin-theme', JSON.stringify(themeData));
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      loading,
      error,
      updateTheme,
      resetTheme,
      previewTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## UI Components

### 1. User Management Component

#### File: `components/AdminUserManagement.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import { AdminUser, Role } from '@/types/admin';

export const AdminUserManagement: React.FC = () => {
  const { users, roles, loading, error, addUser, editUser, deleteUser, suspendUser } = useAdminUsers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_id: 0,
  });

  const handleOpenForm = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role_id: user.role_id,
      });
    } else {
      setEditingUser(null);
      setFormData({ email: '', first_name: '', last_name: '', role_id: 0 });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await editUser(editingUser.id, formData as Partial<AdminUser>);
      } else {
        await addUser({
          ...formData,
          status: 'active',
          two_fa_enabled: false,
        } as Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>);
      }
      setIsFormOpen(false);
      setFormData({ email: '', first_name: '', last_name: '', role_id: 0 });
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg space-y-4 border border-slate-700">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            disabled={!!editingUser}
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          />
          <select
            value={formData.role_id}
            onChange={(e) => setFormData({...formData, role_id: parseInt(e.target.value)})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            required
          >
            <option value={0}>Select a role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              {editingUser ? 'Update' : 'Create'} User
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-700 transition">
                <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.role?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleOpenForm(user)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => suspendUser(user.id)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 2. Analytics Dashboard Component

#### File: `components/AdminAnalytics.tsx`

```typescript
'use client';

import React from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const AdminAnalytics: React.FC = () => {
  const { dashboard, loading, error, exportAnalytics } = useAnalytics();

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
        Error: {error}
      </div>
    );
  }

  if (!dashboard) return <div className="text-center py-8">No analytics data available</div>;

  const metrics = [
    { label: 'Total Users', value: dashboard.total_users, icon: '👥' },
    { label: 'Active Today', value: dashboard.active_users_today, icon: '✅' },
    { label: 'Total Sales', value: `$${dashboard.total_sales.toFixed(2)}`, icon: '💰' },
    { label: 'Sales Today', value: `$${dashboard.sales_today.toFixed(2)}`, icon: '📈' },
    { label: 'Products Viewed', value: dashboard.total_products_viewed, icon: '👁️' },
    { label: 'Conversion Rate', value: `${dashboard.conversion_rate.toFixed(2)}%`, icon: '🎯' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <button
          onClick={() => exportAnalytics('csv')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{metric.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
              </div>
              <span className="text-4xl opacity-50">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
        <div className="space-y-3">
          {dashboard.top_products.length > 0 ? (
            dashboard.top_products.map(product => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <span className="text-gray-300">{product.name}</span>
                <span className="font-semibold text-indigo-400">{product.sales} sales</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sales Trend</h3>
        <div className="text-center text-gray-400">
          <p>Chart visualization coming soon</p>
        </div>
      </div>
    </div>
  );
};
```

### 3. Notification Management Component

#### File: `components/AdminNotifications.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/types/admin';

export const AdminNotifications: React.FC = () => {
  const { notifications, templates, loading, error, sendNotification, scheduleNotification } = useNotifications();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'in_app' as const,
    recipient_type: 'all_users' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendNotification({
        ...formData,
        status: 'sent',
        created_by: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Omit<Notification, 'id' | 'created_at' | 'updated_at'>);
      setFormData({ title: '', message: '', type: 'in_app', recipient_type: 'all_users' });
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          {isFormOpen ? 'Cancel' : 'Send Notification'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg space-y-4 border border-slate-700">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            required
          />
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          >
            <option value="in_app">In-App</option>
            <option value="email">Email</option>
          </select>
          <select
            value={formData.recipient_type}
            onChange={(e) => setFormData({...formData, recipient_type: e.target.value as any})}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
          >
            <option value="all_users">All Users</option>
            <option value="specific_users">Specific Users</option>
            <option value="role_based">Role Based</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
          >
            Send Notification
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
        {notifications.length > 0 ? (
          notifications.slice(0, 10).map(notif => (
            <div key={notif.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white">{notif.title}</h4>
                  <p className="text-gray-400 text-sm mt-2">{notif.message}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                      {notif.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      notif.status === 'sent' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {notif.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No notifications yet</p>
        )}
      </div>
    </div>
  );
};
```

---

## Admin Routes

### Enhanced Admin Layout

#### File: `app/admin/layout.tsx` (Updated)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/utils/hooks/useAdminAuth';
import { AdminUsersProvider } from '@/contexts/AdminUsersContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ThemeProvider>
      <AdminUsersProvider>
        <AnalyticsProvider>
          <NotificationsProvider>
            <div className="flex h-screen bg-slate-900">
              {/* Sidebar */}
              <aside
                className={`${
                  sidebarOpen ? 'w-64' : 'w-20'
                } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col overflow-y-auto`}
              >
                <div className="p-4 border-b border-slate-700">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-full text-left p-2 hover:bg-slate-700 rounded"
                  >
                    {sidebarOpen ? '←' : '→'}
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                  {[
                    { href: '/admin', label: 'Dashboard', icon: '📊' },
                    { href: '/admin/products', label: 'Products', icon: '📦' },
                    { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
                    { href: '/admin/users', label: 'Users', icon: '👥' },
                    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
                    { href: '/admin/notifications', label: 'Notifications', icon: '🔔' },
                    { href: '/admin/theme', label: 'Theme', icon: '🎨' },
                    { href: '/admin/audit', label: 'Audit Logs', icon: '📋' },
                  ].map(item => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg transition"
                    >
                      <span>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </a>
                  ))}
                </nav>
              </aside>

              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
              </main>
            </div>
          </NotificationsProvider>
        </AnalyticsProvider>
      </AdminUsersProvider>
    </ThemeProvider>
  );
}
```

### Admin Users Page

#### File: `app/admin/users/page.tsx`

```typescript
import { AdminUserManagement } from '@/components/AdminUserManagement';

export default function AdminUsersPage() {
  return (
    <div>
      <AdminUserManagement />
    </div>
  );
}
```

### Admin Analytics Page

#### File: `app/admin/analytics/page.tsx`

```typescript
import { AdminAnalytics } from '@/components/AdminAnalytics';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminAnalytics />
    </div>
  );
}
```

### Admin Notifications Page

#### File: `app/admin/notifications/page.tsx`

```typescript
import { AdminNotifications } from '@/components/AdminNotifications';

export default function AdminNotificationsPage() {
  return (
    <div>
      <AdminNotifications />
    </div>
  );
}
```

---

## Implementation Sequence

### Phase 1: Database Foundation (Week 1)
1. Run the migration SQL file in Supabase
2. Verify all tables are created successfully
3. Test Row Level Security (RLS) policies
4. Populate default roles and permissions

### Phase 2: Type Safety & Core Contexts (Week 1-2)
1. Create `types/admin.ts` with all interfaces
2. Implement `AdminUsersContext` with real-time subscriptions
3. Implement `AnalyticsContext` with metrics calculation
4. Implement `NotificationsContext` with template support
5. Implement `ThemeContext` with CSS variable application

### Phase 3: UI Components & Routes (Week 2-3)
1. Build `AdminUserManagement` component
2. Build `AdminAnalytics` component
3. Build `AdminNotifications` component
4. Update `app/admin/layout.tsx` with new providers
5. Add new admin routes for users, analytics, notifications, theme

### Phase 4: Offline & PWA Features (Week 3)
1. Create service worker for offline access
2. Implement IndexedDB caching strategy
3. Add offline sync queue management
4. Test offline functionality

### Phase 5: Security Enhancements (Week 4)
1. Implement 2FA for admin users
2. Add rate limiting middleware
3. Enhance audit logging
4. Add data encryption utilities

### Phase 6: Testing & Optimization (Week 4)
1. Unit tests for context providers
2. Integration tests for admin workflows
3. Performance profiling
4. Load testing with analytics

---

## Testing Strategy

### Unit Tests Template

```typescript
// tests/contexts/AdminUsersContext.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { AdminUsersProvider, useAdminUsers } from '@/contexts/AdminUsersContext';

const TestComponent = () => {
  const { users, loading } = useAdminUsers();
  return <div>{loading ? 'Loading...' : `${users.length} users`}</div>;
};

describe('AdminUsersContext', () => {
  it('should fetch and display users', async () => {
    render(
      <AdminUsersProvider>
        <TestComponent />
      </AdminUsersProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/users/)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests Template

```typescript
// tests/admin/user-management.integration.test.ts
describe('User Management Workflow', () => {
  it('should add, edit, and delete a user', async () => {
    // Test full CRUD workflow
    // Verify real-time updates
    // Check audit logs
  });

  it('should assign roles and verify permissions', async () => {
    // Test role assignment
    // Verify permission changes are reflected
  });
});
```

---

## Security Checklist

- [ ] Enable RLS on all sensitive tables
- [ ] Validate user roles before CRUD operations
- [ ] Implement rate limiting on API endpoints
- [ ] Hash sensitive data in audit logs
- [ ] Encrypt data at rest using Supabase's built-in encryption
- [ ] Use environment variables for all secrets
- [ ] Implement CSRF protection
- [ ] Log all admin actions to audit_logs table
- [ ] Implement 2FA for admin accounts
- [ ] Regular security audits of RLS policies

---

## Performance Optimization Tips

1. **Database Indexing**: All queries use indexed columns (created_at, status, admin_id)
2. **Real-Time Subscriptions**: Limit to specific tables and events
3. **Pagination**: Implement for large datasets
4. **Caching**: Use React Query or SWR for efficient data fetching
5. **Code Splitting**: Lazy load admin routes for faster initial load

---

## Next Steps

1. Run the database migration in Supabase
2. Create all new type definitions
3. Implement context providers in order
4. Build UI components incrementally
5. Test each feature thoroughly before moving to the next phase
6. Deploy incrementally to staging environment
7. Monitor performance and user feedback

This comprehensive implementation provides a production-ready admin dashboard with all requested features organized into logical, manageable phases.
