'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';

interface LiveChatProps {
  username: string | null;
  userId: string | null;
  onLoginRequired: () => void;
}

const getMessageAge = (createdAt: string): { text: string; isOld: boolean } => {
  const messageTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const hoursDiff = (currentTime - messageTime) / (1000 * 60 * 60);
  const isNearing24h = hoursDiff > 20; // Warn when 20+ hours old

  return {
    text: formatDistanceToNow(new Date(createdAt), { addSuffix: true }),
    isOld: isNearing24h,
  };
};

export const LiveChat: React.FC<LiveChatProps> = ({ username, userId, onLoginRequired }) => {
  const { messages, addMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !userId) {
      onLoginRequired();
      return;
    }

    if (!inputValue.trim()) return;

    setIsSending(true);
    try {
      addMessage(username, inputValue, userId);
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 border-b border-pink-500/20 p-6 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white mb-2">🎮 Gaming Community Chat</h1>
        <p className="text-pink-200/70">Real-time public chat for gamers • No private messages • Text only • Messages auto-delete after 24 hours</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-2xl mb-2">💬 Be the first to chat!</p>
              <p className="text-slate-400">Start a conversation with the gaming community</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const age = getMessageAge(msg.createdAt);
            return (
              <div
                key={msg.id}
                className={`group rounded-lg p-4 border transition-all duration-200 ${
                  age.isOld
                    ? 'bg-slate-800/50 border-yellow-500/30 hover:border-yellow-500/50'
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-pink-500/30 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-semibold text-pink-300">{msg.username}</span>
                  <span
                    className={`text-xs ${
                      age.isOld ? 'text-yellow-500 font-semibold' : 'text-slate-500'
                    }`}
                    title={`Will be deleted in ${24 - Math.floor((new Date().getTime() - new Date(msg.createdAt).getTime()) / (1000 * 60 * 60))} hours`}
                  >
                    {age.text}
                    {age.isOld && ' ⚠️'}
                  </span>
                </div>
                <p className="text-slate-100 break-words">{msg.message}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/80 border-t border-pink-500/20 p-4 backdrop-blur-sm">
        {!username || !userId ? (
          <div className="text-center py-4">
            <p className="text-slate-300 mb-3">
              Sign in to join the conversation
            </p>
            <button
              onClick={onLoginRequired}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Sign In to Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message... (text only, no images)"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                disabled={isSending}
                maxLength={500}
              />
              <div className="text-xs text-slate-500 mt-1">
                {inputValue.length}/500
              </div>
            </div>
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
