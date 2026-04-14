'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartPanel from './CartPanel';

export default function Header() {
  const { cartCount } = useCart();
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        // Check if user is admin (you might want to move this to AuthContext)
        const envEmails = process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS
          ? process.env.NEXT_PUBLIC_GGHUB_ADMIN_EMAILS.split(',').map((email) => email.trim()).filter(Boolean)
          : [];
        const defaultAdminEmails = ['ikechukwunelson31@gmail.com'];
        const adminEmails = Array.from(new Set([...envEmails, ...defaultAdminEmails]));
        const userEmail = (user.email || '').trim();
        const isAdminUser = adminEmails.includes(userEmail);

        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <header className="bg-black text-green-300 shadow-2xl shadow-green-900/40 border-b border-green-600 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-green-800">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-400">🚚 Free shipping on orders over ₦20,000</span>
              <span className="hidden md:inline text-green-500">•</span>
              <span className="hidden md:inline text-green-400">Reliable delivery and service</span>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4">
            <Link href="/" className="text-3xl font-black tracking-wider hover:text-green-400 transition-colors">
              🎮 GGHub
            </Link>

            <div className="hidden lg:flex flex-1 justify-center px-6">
              <div className="relative w-full max-w-2xl">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-green-400">🔍</span>
                <input
                  type="search"
                  placeholder="Search products, controllers, headsets, keyboards..."
                  className="w-full rounded-full border border-green-600 bg-slate-950 py-3 pl-12 pr-5 text-green-100 placeholder:text-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-500/25 focus:outline-none"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-green-300 hover:text-white transition-colors font-medium">
                Home
              </Link>
              <Link href="/about" className="text-green-300 hover:text-white transition-colors font-medium">
                About
              </Link>
              <Link href="/#products" className="text-green-300 hover:text-white transition-colors font-medium">
                Products
              </Link>
              <Link href="/#games" className="text-green-300 hover:text-white transition-colors font-medium">
                Games
              </Link>
              <Link href="/contact" className="text-green-300 hover:text-white transition-colors font-medium">
                Contact
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCartOpen(true)}
                className="bg-green-600 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors relative"
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <Link
                  href="/account"
                  className="bg-green-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors hidden md:inline-block"
                >
                  My Account
                </Link>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-green-600 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors hidden md:inline-block"
                >
                  Sign In
                </button>
              )}

              {!adminLoading && isAdmin && (
                <Link
                  href="/admin"
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors hidden md:inline-block"
                  title="Go to Admin Panel"
                >
                  👨‍💼 Admin
                </Link>
              )}

              {!user && !adminLoading && (
                <Link
                  href="/admin/login"
                  className="bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 transition-colors hidden md:inline-block"
                  title="Admin Login"
                >
                  Admin Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-green-300 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-green-800 py-4">
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  Home
                </Link>
                <Link href="/about" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  About
                </Link>
                <Link href="/#products" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  Products
                </Link>
                <Link href="/#games" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  Games
                </Link>
                <Link href="/contact" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  Contact
                </Link>
                {user && (
                  <Link href="/account" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                    My Account
                  </Link>
                )}
                {!adminLoading && isAdmin && (
                  <>
                    <div className="border-t border-green-800 pt-3 mt-3">
                      <Link href="/admin" className="text-purple-300 hover:text-purple-200 transition-colors font-medium py-2 block">
                        👨‍💼 Admin Panel
                      </Link>
                    </div>
                  </>
                )}
                <div className="border-t border-green-800 pt-3 mt-3">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="text-green-400 hover:text-white transition-colors font-medium py-2"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="bg-green-600 text-black px-4 py-2 rounded font-semibold hover:bg-green-500 transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}