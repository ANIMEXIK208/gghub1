'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../contexts/ProductContext';
import { formatNairaPrice } from '../utils/currency';

interface ProductSliderProps {
  products: Product[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
  const [index, setIndex] = useState(0);

  // Filter only trending products
  const trendingProducts = products.filter(p => p.trending);

  // Auto-loop through products every 5 seconds
  useEffect(() => {
    if (trendingProducts.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % trendingProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [trendingProducts.length]);

  if (trendingProducts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-green-600/20 bg-[#020406]/95 p-8 text-center text-green-300 shadow-2xl shadow-green-500/15">
        <p>No trending products at this time. Mark products as trending in the admin panel.</p>
      </div>
    );
  }

  const product = trendingProducts[index];

  const handlePrev = () => setIndex((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length);
  const handleNext = () => setIndex((prev) => (prev + 1) % trendingProducts.length);

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-green-600/20 bg-[#020406]/95 shadow-2xl shadow-green-500/15">
      <div className="absolute left-6 top-6 rounded-full bg-slate-900/80 border border-green-500/60 px-6 py-3 text-base text-green-200 font-bold shadow-lg backdrop-blur-sm z-10">
        🔥 Trending Now
      </div>
      <div className="h-full p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-green-600/20">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={320}
              className="w-full h-80 object-cover"
              priority
            />
          </div>
          <div className="space-y-3">
            <span className="text-green-400 uppercase text-xs tracking-[0.3em]">Featured Product</span>
            <h2 className="text-3xl font-bold text-white">{product.name}</h2>
            <p className="text-green-200/90 leading-relaxed">{product.description}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-center mt-6">
          <div>
            <p className="text-sm text-green-400">Price</p>
            <p className="text-4xl font-extrabold text-white">{formatNairaPrice(product.price)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="flex-1 rounded-full bg-slate-900 border border-green-500/40 px-4 py-2 text-green-300 hover:bg-green-600 hover:text-black transition-colors font-semibold"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-full bg-green-600 text-black px-4 py-2 hover:bg-green-500 transition-colors font-semibold"
            >
              Next
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-green-400 text-center">{index + 1} / {trendingProducts.length}</div>
      </div>
    </div>
  );
}
