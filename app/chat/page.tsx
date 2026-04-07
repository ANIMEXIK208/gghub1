'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LiveChat } from '@/components/LiveChat';

export default function ChatPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Once auth finishes loading, mark as ready
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  const handleLoginRequired = () => {
    router.push('/login');
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveChat
      username={userProfile?.display_name || userProfile?.username || user?.email || null}
      userId={user?.id || null}
      onLoginRequired={handleLoginRequired}
    />
  );
}
