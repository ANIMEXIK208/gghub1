'use client';

import ProductCard from '../components/ProductCard';
import AnnouncementSlider from '../components/AnnouncementSlider';
import ProductSlider from '../components/ProductSlider';
import GameChallenges from '../components/GameChallenges';
import { useProducts } from '../contexts/ProductContext';
import { useAnnouncements } from '../contexts/AnnouncementsContext';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { addToCart, loading: cartLoading } = useCart();
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  return (
    <div className="relative min-h-screen text-green-100 anime-bg overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient anime-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_28%)]"></div>
        <div className="absolute inset-0 opacity-60 animate-background-lines"></div>
        <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-cyan-500/15 blur-3xl"></div>
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div className="space-y-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-[#041204]/70 px-4 py-2 text-sm text-green-200 font-semibold tracking-[0.2em] uppercase shadow-sm shadow-green-500/10 animate-pulse">
                <span className="text-pink-300">Exclusive Gaming Promo</span> • Premium accessories and reliable service
              </p>
              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight animate-neon-flicker">
                  Premium Gaming Gear for Every Gamer
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-green-200/85 leading-relaxed">
                  Discover premium accessories, clear ordering, and dependable service with a clean shopping experience.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="#products" className="btn-primary inline-flex justify-center">
                  Shop Top Gear
                </a>
                <a href="#games" className="btn-secondary inline-flex justify-center">
                  View Challenges
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="rounded-3xl border border-green-600/30 bg-[#071007]/90 p-5 shadow-2xl shadow-green-500/10 backdrop-blur-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-green-400">Fast delivery</p>
                  <p className="mt-2 text-xl font-semibold text-white">Next-day shipping</p>
                </div>
                <div className="rounded-3xl border border-green-600/30 bg-[#071007]/90 p-5 shadow-2xl shadow-green-500/10 backdrop-blur-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-green-400">Secure checkout</p>
                  <p className="mt-2 text-xl font-semibold text-white">Safe and easy payments</p>
                </div>
              </div>
            </div>

            <ProductSlider products={products} />
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {['🎮', '🕹️', '🎧'].map((icon, index) => (
              <div key={index} className="rounded-3xl border border-green-600/20 bg-[#020507]/90 p-6 text-center shadow-2xl shadow-green-500/10">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 text-4xl">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{index === 0 ? 'Pro Controller' : index === 1 ? 'Performance Pad' : 'Audio Console'}</h3>
                <p className="mt-3 text-sm text-green-300">
                  High-end gear built for precision, reliability, and consistent performance.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-gradient-to-b from-black to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-green-400 mb-2">Latest Updates</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-glow">Shop Announcements</h2>
            <p className="text-green-300 text-lg max-w-2xl mx-auto">
              See our latest offers, promotions, and service updates for reliable shopping.
            </p>
          </div>
          <AnnouncementSlider announcements={announcements} />
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-green-400 mb-2">Challenge Programs</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-neon-flicker">Simple Tasks for Rewards</h2>
            <p className="text-green-300 text-lg max-w-2xl mx-auto">
              Take part in easy challenge tasks, unlock achievements, and enjoy fast-paced reward journeys.
            </p>
          </div>

          <div className="mb-16">
            <GameChallenges />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-green-400 mb-2">Premium Gear</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 animate-glow">Premium Accessories</h2>
            <p className="text-green-300 text-lg max-w-2xl mx-auto">
              Browse premium accessories selected for performance, quality, and long-lasting use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productsLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-green-500 bg-slate-900 p-6 animate-pulse">
                  <div className="aspect-square bg-slate-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded mb-4"></div>
                  <div className="h-8 bg-slate-700 rounded"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-green-300 text-lg">No products available at the moment.</p>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 via-black to-green-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Upgrade Your Gear?
          </h2>
          <p className="text-green-300 text-xl mb-8 max-w-2xl mx-auto">
            Shop trusted accessories with clear service, fast delivery, and support you can count on.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#products"
              className="bg-green-600 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-green-500 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}