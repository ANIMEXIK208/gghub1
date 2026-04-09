'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { AdminUser, Role, AdminUserForm } from '@/types/admin';

interface AdminUsersContextType {
  users: AdminUser[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  addUser: (userData: AdminUserForm) => Promise<void>;
  editUser: (id: string, userData: Partial<AdminUserForm>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  assignRole: (userId: string, roleId: number) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  clearError: () => void;
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

  const fetchUsersAndRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admin users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users')
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          role_id,
          status,
          last_login,
          two_fa_enabled,
          created_at,
          updated_at,
          role:roles(
            id,
            name,
            description,
            permissions,
            created_at,
            updated_at
          )
        `
        )
        .order('created_at', { ascending: false });

      if (usersError) {
        if (
          usersError.message.includes('does not exist') ||
          usersError.code === '42P01'
        ) {
          setError(
            'Database not initialized. Please run the migration in Supabase SQL Editor first.'
          );
          return;
        }
        throw usersError;
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      if (rolesError) {
        if (
          rolesError.message.includes('does not exist') ||
          rolesError.code === '42P01'
        ) {
          setError(
            'Database not initialized. Please run the migration in Supabase SQL Editor first.'
          );
          return;
        }
        throw rolesError;
      }

      setUsers((usersData as any[]) || []);
      setRoles((rolesData as Role[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users and roles';
      setError(errorMessage);
      console.error('Error fetching users and roles:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsersAndRoles();

    // Real-time subscription for admin users
    const channel = supabase
      .channel('admin_users_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_users' },
        () => {
          fetchUsersAndRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsersAndRoles, supabase]);

  const addUser = useCallback(
    async (userData: AdminUserForm) => {
      try {
        const { error } = await supabase
          .from('admin_users')
          .insert({
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role_id: userData.role_id,
            status: userData.status || 'active',
            two_fa_enabled: false,
          });

        if (error) throw error;

        // Log audit action
        await logAuditAction('create', 'admin_users', userData.email, userData);

        await fetchUsersAndRoles();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add user';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchUsersAndRoles]
  );

  const editUser = useCallback(
    async (id: string, userData: Partial<AdminUserForm>) => {
      try {
        const { error } = await supabase
          .from('admin_users')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            role_id: userData.role_id,
            status: userData.status,
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
    },
    [supabase, fetchUsersAndRoles]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('admin_users').delete().eq('id', id);

        if (error) throw error;

        await logAuditAction('delete', 'admin_users', id, {});
        await fetchUsersAndRoles();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchUsersAndRoles]
  );

  const assignRole = useCallback(
    async (userId: string, roleId: number) => {
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
    },
    [supabase, fetchUsersAndRoles]
  );

  const suspendUser = useCallback(
    async (userId: string) => {
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
    },
    [supabase, fetchUsersAndRoles]
  );

  const activateUser = useCallback(
    async (userId: string) => {
      try {
        const { error } = await supabase
          .from('admin_users')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;

        await logAuditAction('update', 'admin_users', userId, { status: 'active' });
        await fetchUsersAndRoles();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to activate user';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchUsersAndRoles]
  );

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
          resource_id: isNaN(parseInt(resourceId)) ? null : parseInt(resourceId),
          changes: changes || {},
        });
      }
    } catch (err) {
      console.error('Failed to log audit action:', err);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AdminUsersContext.Provider
      value={{
        users,
        roles,
        loading,
        error,
        addUser,
        editUser,
        deleteUser,
        assignRole,
        suspendUser,
        activateUser,
        clearError,
      }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
};
