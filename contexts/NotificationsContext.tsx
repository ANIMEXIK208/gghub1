'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { Notification, NotificationTemplate, NotificationForm } from '@/types/admin';

interface NotificationsContextType {
  notifications: Notification[];
  templates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  sendNotification: (notification: NotificationForm) => Promise<void>;
  scheduleNotification: (notification: NotificationForm, scheduledAt: string) => Promise<void>;
  createTemplate: (template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTemplate: (templateId: number, template: Partial<NotificationTemplate>) => Promise<void>;
  deleteTemplate: (templateId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  clearError: () => void;
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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: notificationData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: templateData, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifError) {
        if (
          notifError.message.includes('does not exist') ||
          notifError.code === '42P01'
        ) {
          setError(
            'Database not initialized. Please run the migration in Supabase SQL Editor first.'
          );
          return;
        }
        throw notifError;
      }
      if (templateError) {
        if (
          templateError.message.includes('does not exist') ||
          templateError.code === '42P01'
        ) {
          setError(
            'Database not initialized. Please run the migration in Supabase SQL Editor first.'
          );
          return;
        }
        throw templateError;
      }

      setNotifications((notificationData as Notification[]) || []);
      setTemplates((templateData as NotificationTemplate[]) || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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
  }, [fetchNotifications, supabase]);

  const sendNotification = useCallback(
    async (notification: NotificationForm) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        const { error } = await supabase.from('notifications').insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          recipient_type: notification.recipient_type,
          recipient_ids: notification.recipient_ids || null,
          template_id: notification.template_id || null,
          created_by: sessionData.session?.user?.id,
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send notification';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const scheduleNotification = useCallback(
    async (notification: NotificationForm, scheduledAt: string) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        const { error } = await supabase.from('notifications').insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          recipient_type: notification.recipient_type,
          recipient_ids: notification.recipient_ids || null,
          template_id: notification.template_id || null,
          created_by: sessionData.session?.user?.id,
          scheduled_at: scheduledAt,
          status: 'pending',
        });

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to schedule notification';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const createTemplate = useCallback(
    async (
      template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>
    ) => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

        const { error } = await supabase.from('notification_templates').insert({
          name: template.name,
          subject: template.subject,
          body: template.body,
          template_type: template.template_type,
          variables: template.variables,
          created_by: sessionData.session?.user?.id,
        });

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create template';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const updateTemplate = useCallback(
    async (templateId: number, template: Partial<NotificationTemplate>) => {
      try {
        const { error } = await supabase
          .from('notification_templates')
          .update({
            name: template.name,
            subject: template.subject,
            body: template.body,
            template_type: template.template_type,
            variables: template.variables,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId);

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update template';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const deleteTemplate = useCallback(
    async (templateId: number) => {
      try {
        const { error } = await supabase
          .from('notification_templates')
          .delete()
          .eq('id', templateId);

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete template';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;

        await fetchNotifications();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete notification';
        setError(errorMessage);
        throw err;
      }
    },
    [supabase, fetchNotifications]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        templates,
        loading,
        error,
        sendNotification,
        scheduleNotification,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        deleteNotification,
        clearError,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
