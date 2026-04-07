'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (username: string, message: string, userId: string) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'gghub-chat-messages';
const MESSAGE_EXPIRY_HOURS = 24;

const isMessageExpired = (createdAt: string): boolean => {
  const messageTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const hoursDiff = (currentTime - messageTime) / (1000 * 60 * 60);
  return hoursDiff > MESSAGE_EXPIRY_HOURS;
};

const filterExpiredMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return messages.filter((msg) => !isMessageExpired(msg.createdAt));
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on mount and filter expired ones
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = filterExpiredMessages(parsed);
        setMessages(filtered);
        // Update localStorage with only non-expired messages
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  }, []);

  // Cleanup expired messages every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setMessages((prev) => {
        const filtered = filterExpiredMessages(prev);
        if (filtered.length !== prev.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
        return filtered;
      });
    }, 60000); // Run every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const addMessage = useCallback((username: string, message: string, userId: string) => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      username,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      // Filter expired messages before adding new one
      const filtered = filterExpiredMessages(prev);
      const updated = [newMessage, ...filtered].slice(0, 500); // Keep last 500 messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
