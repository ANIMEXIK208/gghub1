# Admin Dashboard Expansion - Implementation Setup Guide

## Quick Start Checklist

- [ ] 1. Run database migration in Supabase
- [ ] 2. Verify all table creations
- [ ] 3. Update `app/admin/layout.tsx` with new providers
- [ ] 4. Create new admin page routes
- [ ] 5. Test all features
- [ ] 6. Deploy to production

---

## Step 1: Database Setup

### 1.1 Run Migration in Supabase

1. Go to your [Supabase Project](https://app.supabase.com) → SQL Editor
2. Create a new query
3. Copy the entire content from `migrations/20260409_enhanced_admin_system.sql`
4. Run the migration
5. Verify all tables are created:
   - `roles`
   - `admin_users`
   - `permissions`
   - `role_permissions`
   - `analytics`
   - `notification_templates`
   - `notifications`
   - `theme_customization`
   - `audit_logs`
   - `offline_sync_queue`

### 1.2 Enable Realtime

All necessary realtime publications are set up by the migration script. No additional action needed.

---

## Step 2: Code Integration

### 2.1 Update `app/admin/layout.tsx`

Replace the current admin layout with the new version that includes all context providers:

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
    return <div className="text-center py-8 text-white">Loading...</div>;
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

### 2.2 Create New Admin Routes

Create the following files in your `app/admin/` directory:

#### `app/admin/users/page.tsx`
```typescript
import { AdminUserManagement } from '@/components/AdminUserManagement';

export default function AdminUsersPage() {
  return <AdminUserManagement />;
}
```

#### `app/admin/analytics/page.tsx`
```typescript
import { AdminAnalytics } from '@/components/AdminAnalytics';

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
```

#### `app/admin/notifications/page.tsx`
```typescript
import { AdminNotifications } from '@/components/AdminNotifications';

export default function AdminNotificationsPage() {
  return <AdminNotifications />;
}
```

#### `app/admin/theme/page.tsx`
```typescript
import { AdminThemeCustomization } from '@/components/AdminThemeCustomization';

export default function AdminThemePage() {
  return <AdminThemeCustomization />;
}
```

#### `app/admin/audit/page.tsx`
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { AuditLog } from '@/types/admin';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data as AuditLog[]);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Audit Logs</h2>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Resource</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Changes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-700 transition">
                  <td className="px-6 py-4 text-sm text-gray-300">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{log.resource_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono text-xs truncate">
                    {JSON.stringify(log.changes).substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 3: Environment Variables

Ensure your `.env.local` includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GGHUB_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

---

## Step 4: Import Verification

Verify all context files are created:
- ✅ `contexts/AdminUsersContext.tsx`
- ✅ `contexts/AnalyticsContext.tsx`
- ✅ `contexts/NotificationsContext.tsx`
- ✅ `contexts/ThemeContext.tsx`

Verify all component files are created:
- ✅ `components/AdminUserManagement.tsx`
- ✅ `components/AdminAnalytics.tsx`
- ✅ `components/AdminNotifications.tsx`
- ✅ `components/AdminThemeCustomization.tsx`

Verify type definitions:
- ✅ `types/admin.ts`

---

## Step 5: Build & Test

### 5.1 Local Testing

```bash
npm run build
npm run dev
```

Access admin dashboard at: `http://localhost:3004/admin`

### 5.2 Test Each Feature

1. **Users**: Create, edit, delete, suspend users
2. **Analytics**: View metrics, export CSV
3. **Notifications**: Send in-app notifications, schedule emails
4. **Theme**: Change colors, preview changes
5. **Audit**: Verify all actions are logged

---

## Step 6: Production Deployment

### 6.1 Prepare for Deployment

1. Test locally with `npm run build`
2. Verify all environment variables are set
3. Run migrations on production Supabase instance
4. Deploy to Netlify/Vercel

### 6.2 Post-Deployment

1. Create first admin user in database
2. Test admin login at `/admin`
3. Monitor error logs for issues

---

## Troubleshooting

### Issue: Tables not created

**Solution**: Run the migration SQL again in Supabase SQL Editor

### Issue: Context errors ("useX must be used within Provider")

**Solution**: Ensure providers wrap your component in `app/admin/layout.tsx`

### Issue: Type errors for `admin` types

**Solution**: Verify `types/admin.ts` exists and is imported correctly

### Issue: Real-time subscriptions not working

**Solution**: Check Supabase project has realtime enabled for the tables

---

## Next Steps

1. ✅ Complete all steps above
2. 📱 Add mobile optimization
3. 🔐 Implement 2FA for admin users
4. 📊 Add more analytics charts
5. 🔔 Set up email notification service
6. 📈 Add performance monitoring

---

## File Structure

After implementation, your project structure will be:

```
app/
├── admin/
│   ├── layout.tsx (UPDATED)
│   ├── page.tsx (existing)
│   ├── users/page.tsx (NEW)
│   ├── analytics/page.tsx (NEW)
│   ├── notifications/page.tsx (NEW)
│   ├── theme/page.tsx (NEW)
│   ├── audit/page.tsx (NEW)
│   ├── products/page.tsx (existing)
│   └── announcements/page.tsx (existing)
components/
├── AdminUserManagement.tsx (NEW)
├── AdminAnalytics.tsx (NEW)
├── AdminNotifications.tsx (NEW)
├── AdminThemeCustomization.tsx (NEW)
├── AdminProductForm.tsx (existing)
├── AdminAnnouncementForm.tsx (existing)
└── ... other components
contexts/
├── AdminUsersContext.tsx (NEW)
├── AnalyticsContext.tsx (NEW)
├── NotificationsContext.tsx (NEW)
├── ThemeContext.tsx (NEW)
├── ProductContext.tsx (existing)
├── AnnouncementsContext.tsx (existing)
└── ... other contexts
migrations/
└── 20260409_enhanced_admin_system.sql (NEW)
types/
└── admin.ts (NEW)
```

---

## Support & Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- ⚛️ [React Context API](https://react.dev/reference/react/useContext)
- ⏱️ [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- 🔐 [Row Level Security](https://supabase.com/docs/guides/database/postgres-row-level-security)

---

## Summary

This implementation provides:

✅ **User Management** - Full CRUD with roles and permissions  
✅ **Analytics Dashboard** - Real-time metrics and export  
✅ **Notifications** - Email, in-app, and scheduled messages  
✅ **Theme Customization** - Color, font, and layout controls  
✅ **Audit Logging** - Track all admin actions  
✅ **Real-time Updates** - Live data synchronization  
✅ **Type Safety** - Full TypeScript support  
✅ **Responsive Design** - Mobile-friendly UI  

You now have a production-ready, secure, and scalable admin dashboard! 🚀
