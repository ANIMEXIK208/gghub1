'use client';

import React, { useState } from 'react';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import { AdminUserForm } from '@/types/admin';

export const AdminUserManagement: React.FC = () => {
  const {
    users,
    roles,
    loading,
    error,
    addUser,
    editUser,
    deleteUser,
    suspendUser,
    activateUser,
    clearError,
  } = useAdminUsers();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminUserForm>({
    email: '',
    first_name: '',
    last_name: '',
    role_id: 0,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenForm = (userId?: string) => {
    if (userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setEditingUserId(userId);
        setFormData({
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role_id: user.role_id,
        });
      }
    } else {
      setEditingUserId(null);
      setFormData({ email: '', first_name: '', last_name: '', role_id: 0 });
    }
    setIsFormOpen(true);
    setSubmitError(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUserId(null);
    setFormData({ email: '', first_name: '', last_name: '', role_id: 0 });
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitError(null);

      if (formData.role_id === 0) {
        setSubmitError('Please select a role');
        return;
      }

      if (editingUserId) {
        await editUser(editingUserId, formData);
      } else {
        await addUser(formData as AdminUserForm);
      }

      handleCloseForm();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save user';
      setSubmitError(errorMessage);
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      try {
        await deleteUser(userId);
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await suspendUser(userId);
    } catch (err) {
      console.error('Error suspending user:', err);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
    } catch (err) {
      console.error('Error activating user:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error?.includes('Database not initialized')) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">⚠️ Database Setup Required</h3>
        <p className="text-yellow-200 mb-6">
          The admin system needs to be initialized in your Supabase database.
        </p>
        <div className="bg-slate-800 rounded p-4 mb-6 text-sm text-left">
          <p className="text-yellow-300 font-bold mb-3">📋 Setup Steps:</p>
          <ol className="list-decimal list-inside space-y-2 text-yellow-100">
            <li>Go to your Supabase Dashboard</li>
            <li>Navigate to SQL Editor</li>
            <li>Open: <code className="bg-slate-900 px-2 py-1 rounded font-mono">migrations/20260409_enhanced_admin_system.sql</code></li>
            <li>Copy the entire SQL code</li>
            <li>Paste into the SQL Editor and click <strong>Run</strong></li>
            <li>Go back and refresh this page</li>
          </ol>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
        >
          🔄 Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">User Management</h2>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
        >
          + Add User
        </button>
      </div>

      {(error || submitError) && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex justify-between items-start">
          <span>Error: {error || submitError}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-lg space-y-4 border border-slate-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
                disabled={!!editingUserId}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role *
              </label>
              <select
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role_id: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value={0}>Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-medium"
            >
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-700 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.first_name || user.last_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.role?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-900/50 text-green-300'
                            : user.status === 'suspended'
                            ? 'bg-red-900/50 text-red-300'
                            : 'bg-gray-900/50 text-gray-300'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleOpenForm(user.id)}
                        className="text-indigo-400 hover:text-indigo-300 transition text-xs font-medium"
                      >
                        Edit
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="text-yellow-400 hover:text-yellow-300 transition text-xs font-medium"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="text-green-400 hover:text-green-300 transition text-xs font-medium"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300 transition text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No users found. Create your first admin user!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
