'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';
import { normalizeSupabaseImageUrl } from '@/utils/supabase/storage';

export interface Announcement {
  id: number;
  title: string;
  message: string;
  image?: string;
  emoji?: string;
}

interface AnnouncementsContextType {
  announcements: Announcement[];
  loading: boolean;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => Promise<void>;
  editAnnouncement: (id: number, updated: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

export const useAnnouncements = () => {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
};

export const AnnouncementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAnnouncements();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload: any) => {
          console.log('Announcement change detected:', payload.eventType);
          // Refetch announcements when changes occur
          fetchAnnouncements();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time announcement updates enabled');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Real-time subscription error, will retry');
        }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      if (data) {
        const formattedAnnouncements: Announcement[] = (data as any[]).map(item => ({
          id: item.id,
          title: item.title,
          message: item.description || '',
          image: normalizeSupabaseImageUrl(item.image_url, 'announcement-images') || '',
          emoji: item.emoji || '',
        }));
        setAnnouncements(formattedAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcement.title,
          description: announcement.message,
          image_url: announcement.image || null,
          emoji: announcement.emoji || null,
        });

      if (error) {
        console.error('Error adding announcement:', error);
        throw error;
      }

      // fetchAnnouncements will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error adding announcement:', error);
      throw error;
    }
  };

  const editAnnouncement = async (id: number, updated: Partial<Announcement>) => {
    try {
      const updateData: any = {};
      if (updated.title !== undefined) updateData.title = updated.title;
      if (updated.message !== undefined) updateData.description = updated.message;
      if (updated.image !== undefined) updateData.image_url = updated.image;
      if (updated.emoji !== undefined) updateData.emoji = updated.emoji;

      const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating announcement:', error);
        throw error;
      }

      // fetchAnnouncements will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting announcement:', error);
        throw error;
      }

      // fetchAnnouncements will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  };

  return (
    <AnnouncementsContext.Provider value={{
      announcements,
      loading,
      addAnnouncement,
      editAnnouncement,
      deleteAnnouncement,
    }}>
      {children}
    </AnnouncementsContext.Provider>
  );
};