-- GGHub Admin Dashboard - Database Migration
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Drop existing tables if they exist (for clean install)
-- DROP TABLE IF EXISTS offline_sync_queue CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS theme_customization CASCADE;
-- DROP TABLE IF EXISTS notification_templates CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS analytics CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================
-- 1. ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. ADMIN_USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX idx_admin_users_status ON admin_users(status);

-- ============================================================
-- 3. PERMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50),
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);

-- ============================================================
-- 4. ROLE_PERMISSIONS JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- 5. ANALYTICS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100),
  user_id UUID REFERENCES auth.users(id),
  product_id BIGINT REFERENCES products(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);

-- ============================================================
-- 6. NOTIFICATION_TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  template_type VARCHAR(50),
  variables JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_templates_created_by ON notification_templates(created_by);

-- ============================================================
-- 7. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  recipient_type VARCHAR(50),
  recipient_ids UUID[] DEFAULT NULL,
  template_id BIGINT REFERENCES notification_templates(id),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_created_by ON notifications(created_by);

-- ============================================================
-- 8. THEME_CUSTOMIZATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS theme_customization (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  secondary_color VARCHAR(7) DEFAULT '#1e293b',
  accent_color VARCHAR(7) DEFAULT '#ec4899',
  font_family VARCHAR(100) DEFAULT 'Inter',
  layout_template VARCHAR(50) DEFAULT 'default',
  dark_mode BOOLEAN DEFAULT TRUE,
  sidebar_position VARCHAR(20) DEFAULT 'left',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_theme_customization_admin_id ON theme_customization(admin_id);

-- ============================================================
-- 9. AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id BIGINT,
  changes JSONB,
  ip_address INET,
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================
-- 10. OFFLINE_SYNC_QUEUE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(255),
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_data JSONB,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offline_sync_queue_device_id ON offline_sync_queue(device_id);
CREATE INDEX idx_offline_sync_queue_synced_at ON offline_sync_queue(synced_at);

-- ============================================================
-- 11. INSERT DEFAULT ROLES
-- ============================================================
INSERT INTO roles (name, description, permissions) VALUES
  ('Super Admin', 'Full access to all features', '{"all": true}'::jsonb),
  ('Product Manager', 'Manage products and inventory', '{"products": ["create", "read", "update", "delete"]}'::jsonb),
  ('Content Manager', 'Manage announcements and notifications', '{"announcements": ["create", "read", "update", "delete"], "notifications": ["create", "read", "update", "delete"]}'::jsonb),
  ('Analyst', 'View analytics and reports', '{"analytics": ["read"]}'::jsonb),
  ('Moderator', 'Moderate user content and reports', '{"users": ["read", "update"], "analytics": ["read"]}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 12. INSERT DEFAULT PERMISSIONS
-- ============================================================
INSERT INTO permissions (name, description, resource, action) VALUES
  ('view_dashboard', 'View admin dashboard', 'dashboard', 'read'),
  ('create_product', 'Create new products', 'products', 'create'),
  ('read_product', 'Read products', 'products', 'read'),
  ('update_product', 'Update products', 'products', 'update'),
  ('delete_product', 'Delete products', 'products', 'delete'),
  ('create_user', 'Create admin users', 'users', 'create'),
  ('read_user', 'Read admin users', 'users', 'read'),
  ('update_user', 'Update admin users', 'users', 'update'),
  ('delete_user', 'Delete admin users', 'users', 'delete'),
  ('view_analytics', 'View analytics reports', 'analytics', 'read'),
  ('export_analytics', 'Export analytics data', 'analytics', 'export'),
  ('create_notification', 'Create notifications', 'notifications', 'create'),
  ('read_notification', 'Read notifications', 'notifications', 'read'),
  ('update_notification', 'Update notifications', 'notifications', 'update'),
  ('delete_notification', 'Delete notifications', 'notifications', 'delete'),
  ('customize_theme', 'Customize website theme', 'theme', 'update'),
  ('view_audit_logs', 'View audit logs', 'audit', 'read')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 13. ENABLE REALTIME FOR UPDATED TABLES
-- ============================================================
-- Note: These tables are typically auto-enabled for realtime by Supabase
-- Uncomment if needed, but may error on second run if already enabled:
-- ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE analytics;
-- ALTER PUBLICATION supabase_realtime ADD TABLE theme_customization;
-- ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- ============================================================
-- 14. CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_users
CREATE TRIGGER update_admin_users_modified
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for theme_customization
CREATE TRIGGER update_theme_customization_modified
BEFORE UPDATE ON theme_customization
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for notifications
CREATE TRIGGER update_notifications_modified
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Function to log last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_users SET last_login = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 15. ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Admins can view all roles" ON roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.status = 'active'
    )
  );

-- Admin users policies
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

CREATE POLICY "Users can view their own admin profile" ON admin_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can update admin users" ON admin_users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- Analytics policies
CREATE POLICY "Admins can view analytics" ON analytics
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- Notifications policies
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Theme customization policies (these don't reference admin_users, so they're safe)
CREATE POLICY "Users can view theme customization" ON theme_customization
  FOR SELECT USING (auth.uid() = admin_id OR is_active = TRUE);

CREATE POLICY "Users can update their own theme" ON theme_customization
  FOR UPDATE USING (auth.uid() = admin_id);

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE status = 'active'
    )
  );

-- ============================================================
-- 16. UPDATE THUMB SLEEVES PRODUCT IMAGE
-- ============================================================
UPDATE products 
SET image_url = 'https://cdn.phototourl.com/free/2026-04-09-cefef722-9997-4df7-b187-ec3ac9d22fcb.jpg',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Thumb Sleeves';
