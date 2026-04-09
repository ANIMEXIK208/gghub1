'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { NotificationForm } from '@/types/admin';

export const AdminNotifications: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    sendNotification,
    scheduleNotification,
    deleteNotification,
    clearError,
  } = useNotifications();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'in_app',
    recipient_type: 'all_users',
  });
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, schedule: boolean = false) => {
    e.preventDefault();
    try {
      setSubmitError(null);

      if (!formData.title || !formData.message) {
        setSubmitError('Please fill in all required fields');
        return;
      }

      if (schedule && !scheduledDate) {
        setSubmitError('Please select a date and time for scheduling');
        return;
      }

      if (schedule) {
        await scheduleNotification(
          formData,
          scheduledDate
        );
      } else {
        await sendNotification(formData);
      }

      setFormData({
        title: '',
        message: '',
        type: 'in_app',
        recipient_type: 'all_users',
      });
      setScheduledDate('');
      setIsFormOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send notification';
      setSubmitError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Notifications</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
        >
          {isFormOpen ? '✕ Close' : '+ Send Notification'}
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
        <form className="bg-slate-800 p-6 rounded-lg space-y-4 border border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                placeholder="Notification message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as NotificationForm['type'],
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Type
              </label>
              <select
                value={formData.recipient_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recipient_type: e.target.value as NotificationForm['recipient_type'],
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all_users">All Users</option>
                <option value="specific_users">Specific Users</option>
                <option value="role_based">Role Based</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-gray-400 text-xs mt-1">
                Leave empty to send immediately
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-medium"
            >
              🚀 Send Now
            </button>
            {scheduledDate && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium"
              >
                ⏰ Schedule
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setFormData({
                  title: '',
                  message: '',
                  type: 'in_app',
                  recipient_type: 'all_users',
                });
                setScheduledDate('');
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Recent Notifications */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Notifications
        </h3>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notif) => (
              <div
                key={notif.id}
                className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">
                      {notif.title}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1 max-h-10 overflow-hidden">
                      {notif.message}
                    </p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full">
                        {notif.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notif.status === 'sent'
                            ? 'bg-green-900/50 text-green-300'
                            : notif.status === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {notif.status}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded-full">
                        {notif.recipient_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {notif.sent_at
                        ? `Sent: ${new Date(notif.sent_at).toLocaleString()}`
                        : notif.scheduled_at
                        ? `Scheduled: ${new Date(notif.scheduled_at).toLocaleString()}`
                        : `Created: ${new Date(notif.created_at).toLocaleString()}`}
                    </p>
                  </div>
                  {notif.status === 'pending' && (
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-red-400 hover:text-red-300 transition text-sm font-medium whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Create your first notification to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
