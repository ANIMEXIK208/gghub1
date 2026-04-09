import { User } from '@supabase/supabase-js';

/**
 * ============================================================
 * ROLE-BASED ACCESS CONTROL TYPES
 * ============================================================
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
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  created_at: string;
}

/**
 * ============================================================
 * ADMIN USER TYPES
 * ============================================================
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
  two_fa_secret?: string;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface AdminUserForm {
  email: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * ============================================================
 * ANALYTICS TYPES
 * ============================================================
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

export interface AnalyticsExportOptions {
  format: 'csv' | 'pdf';
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * ============================================================
 * NOTIFICATION TYPES
 * ============================================================
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

export interface NotificationForm {
  title: string;
  message: string;
  type: 'email' | 'in_app' | 'sms';
  recipient_type: 'all_users' | 'specific_users' | 'role_based';
  recipient_ids?: string[];
  template_id?: number;
}

/**
 * ============================================================
 * THEME CUSTOMIZATION TYPES
 * ============================================================
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

export interface ThemeCustomizationForm {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  layout_template?: 'default' | 'compact' | 'spacious';
  dark_mode?: boolean;
  sidebar_position?: 'left' | 'right';
}

export const DEFAULT_THEME: ThemeCustomization = {
  id: 0,
  admin_id: '',
  primary_color: '#6366f1',
  secondary_color: '#1e293b',
  accent_color: '#ec4899',
  font_family: 'Inter',
  layout_template: 'default',
  dark_mode: true,
  sidebar_position: 'left',
  is_active: true,
  created_at: '',
  updated_at: '',
};

/**
 * ============================================================
 * AUDIT LOG TYPES
 * ============================================================
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
 * ============================================================
 * OFFLINE SYNC TYPES
 * ============================================================
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

/**
 * ============================================================
 * CONTEXT API TYPES
 * ============================================================
 */

export interface AdminContextState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export interface ContextActionResult {
  success: boolean;
  message?: string;
  error?: string;
}
