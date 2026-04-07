'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface ContactContextType {
  messages: ContactMessage[];
  loading: boolean;
  addMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => void;
  markMessageAsRead: (id: number) => void;
  deleteMessage: (id: number) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);
const STORAGE_KEY = 'gghub-contact-messages';

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

const DEFAULT_MESSAGES: ContactMessage[] = [];

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing contact messages:', error);
        setMessages(DEFAULT_MESSAGES);
      }
    } else {
      setMessages(DEFAULT_MESSAGES);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
      }
    }
    setLoading(false);
  }, []);

  const persistMessages = (nextMessages: ContactMessage[]) => {
    setMessages(nextMessages);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMessages));
    }
  };

  const addMessage = (message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
    const id = Math.max(0, ...messages.map((item) => item.id), 0) + 1;
    const newMessage: ContactMessage = {
      id,
      createdAt: new Date().toISOString(),
      read: false,
      ...message,
    };
    persistMessages([newMessage, ...messages]);
  };

  const markMessageAsRead = (id: number) => {
    const nextMessages = messages.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    persistMessages(nextMessages);
  };

  const deleteMessage = (id: number) => {
    const nextMessages = messages.filter((item) => item.id !== id);
    persistMessages(nextMessages);
  };

  return (
    <ContactContext.Provider value={{ messages, loading, addMessage, markMessageAsRead, deleteMessage }}>
      {children}
    </ContactContext.Provider>
  );
};
