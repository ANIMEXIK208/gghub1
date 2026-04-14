'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Announcement } from '../contexts/AnnouncementsContext';

interface AnnouncementSliderProps {
  announcements: Announcement[];
}

export default function AnnouncementSlider({ announcements }: AnnouncementSliderProps) {
  const [index, setIndex] = useState(0);

  // Auto-loop through announcements every 5 seconds
  useEffect(() => {
    if (announcements.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-green-500 bg-slate-950 p-6 text-center text-green-300">
        No announcements are available at this time.
      </div>
    );
  }

  const announcement = announcements[index];

  const handlePrev = () => setIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  const handleNext = () => setIndex((prev) => (prev + 1) % announcements.length);

  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-slate-950/95 to-black/90 p-8 shadow-2xl shadow-green-900/40 border border-green-500/20 text-green-100 overflow-hidden">
      {announcement.image && (
        <div className="mb-6 rounded-lg overflow-hidden border border-green-500/40 shadow-lg">
          <Image
            src={announcement.image || 'https://via.placeholder.com/800x300?text=No+Image'}
            alt={announcement.title}
            width={800}
            height={300}
            className="w-full h-auto max-h-80 object-cover"
            priority
            onError={(event) => {
              const target = event.currentTarget as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x300?text=No+Image';
            }}
          />
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4 flex-1">
          {announcement.emoji && (
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl border border-green-500 bg-green-500/10 text-4xl">
              {announcement.emoji}
            </div>
          )}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-green-300">Announcement</p>
            <h2 className="text-3xl font-bold text-white mt-3">{announcement.title}</h2>
            <p className="mt-4 max-w-2xl text-green-200 leading-7">{announcement.message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            className="h-11 min-w-[4rem] rounded-full bg-slate-900 border border-green-500/40 px-4 text-green-300 hover:bg-green-600 hover:text-black transition-colors"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="h-11 min-w-[4rem] rounded-full bg-green-600 text-black px-4 hover:bg-green-500 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
      <div className="mt-6 text-sm text-green-400">{index + 1} / {announcements.length}</div>
    </div>
  );
}
