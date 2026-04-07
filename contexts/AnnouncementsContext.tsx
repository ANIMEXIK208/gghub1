'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  editAnnouncement: (id: number, updated: Partial<Announcement>) => void;
  deleteAnnouncement: (id: number) => void;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);
const STORAGE_KEY = 'gghub-announcements';

export const useAnnouncements = () => {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
};

// Sample announcements to start with
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Exclusive Gaming Offer',
    message: 'Explore premium accessories and reliable service for your next order.',
    emoji: '🎮',
  },
  {
    id: 2,
    title: 'Service Savings Event',
    message: 'Save on select accessories with smart pricing and fast delivery.',
    emoji: '💼',
  },
  {
    id: 3,
    title: 'Customer Support Update',
    message: 'Our support team is ready to help with orders and account questions.',
    emoji: '📞',
  },
  {
    id: 4,
    title: 'Free Shipping Offer',
    message: 'Enjoy free shipping on all orders over ₦20,000 this weekend.',
    emoji: '📦',
  },
];

export const AnnouncementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAnnouncements(JSON.parse(stored));
        } else {
          // Initialize with default announcements
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
        }
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    try {
      const id = Math.max(0, ...announcements.map(a => a.id), 0) + 1;
      const newAnnouncement: Announcement = {
        id,
        ...announcement,
      };
      const updated = [newAnnouncement, ...announcements];
      setAnnouncements(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  };

  const editAnnouncement = (id: number, updated: Partial<Announcement>) => {
    try {
      const updatedList = announcements.map(item =>
        item.id === id ? { ...item, ...updated } : item
      );
      setAnnouncements(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const deleteAnnouncement = (id: number) => {
    try {
      const updated = announcements.filter(item => item.id !== id);
      setAnnouncements(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  return (
    <AnnouncementsContext.Provider value={{
      announcements,
      loading,
      addAnnouncement,
      editAnnouncement,
      deleteAnnouncement
    }}>
      {children}
    </AnnouncementsContext.Provider>
  );
};