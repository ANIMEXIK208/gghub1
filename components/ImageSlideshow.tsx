'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getSafeImageUrl } from '@/utils/supabase/storage';

interface ImageSlideshowProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function ImageSlideshow({ images, productName, className = '' }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-slate-800 w-full h-48 flex items-center justify-center ${className}`}>
        <span className="text-slate-400">No image available</span>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const imageUrl = getSafeImageUrl(currentImage);
  const hasMultiple = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className={`relative overflow-hidden bg-slate-800 ${className}`}>
      <Image
        src={loadError ? getSafeImageUrl(null) : imageUrl}
        alt={`${productName} - Image ${currentIndex + 1}`}
        width={400}
        height={192}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        priority={currentIndex === 0}
        onError={() => setLoadError(true)}
      />

      {/* Navigation arrows - only show if multiple images */}
      {hasMultiple && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image indicators/dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-green-400 w-6' : 'bg-green-600/50 hover:bg-green-600'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Image counter */}
          <div className="absolute top-3 right-3 bg-black/60 text-green-400 px-2 py-1 rounded text-xs font-semibold">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
