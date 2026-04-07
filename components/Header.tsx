'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import CartPanel from './CartPanel';

export default function Header() {
  const { isAuthenticated, signInWithGoogle, signOut, userProfile } = useAuth();
  const { user, isLoggedIn, logout: logoutUser } = useUser();
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
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
            <div className="flex items-center space-x-4">
              {/* Authentication Section */}
              {isAuthenticated && userProfile ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                  >
                    {userProfile.avatar_url ? (
                      <Image 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full border border-green-500"
                      />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                    <span className="text-sm hidden md:inline">{userProfile.display_name || 'Profile'}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-green-600 rounded-lg shadow-lg z-50">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-green-400 hover:bg-slate-800 hover:text-green-300 rounded-t-lg"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        👤 View Profile
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-green-400 hover:bg-slate-800 hover:text-green-300"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        ✏️ Edit Profile
                      </Link>
                      <button
                        onClick={async () => {
                          await logoutUser();
                          await signOut();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-green-400 hover:bg-slate-800 hover:text-green-300 rounded-b-lg border-t border-green-600"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="bg-green-600 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden md:inline">Sign in</span>
                </button>
              )}
              
              <Link href="/admin/login" className="text-green-400 hover:text-green-300 text-sm transition-colors">
                Admin
              </Link>
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
              <Link href="/chat" className="text-green-300 hover:text-white transition-colors font-medium flex items-center space-x-1">
                <span>💬</span>
                <span>Chat</span>
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

              {isLoggedIn && (
                <div className="hidden md:flex items-center space-x-3">
                  <span className="text-green-400 text-sm hidden md:inline">
                    Logged in as <span className="text-white font-semibold">{user?.displayName || user?.username}</span>
                  </span>
                  <button
                    onClick={logoutUser}
                    className="bg-slate-800 text-green-200 px-4 py-2 rounded-full border border-green-500 hover:bg-slate-900 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
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
                <Link href="/chat" className="text-green-300 hover:text-white transition-colors font-medium py-2 flex items-center space-x-1">
                  <span>💬</span>
                  <span>Chat</span>
                </Link>
                <Link href="/contact" className="text-green-300 hover:text-white transition-colors font-medium py-2">
                  Contact
                </Link>
                {isLoggedIn && (
                  <div className="flex flex-col space-y-2 pt-3 border-t border-green-800">
                    <div className="text-green-400 text-sm py-2">
                      Signed in as: <span className="text-white font-semibold">{user?.displayName || user?.username}</span>
                    </div>
                    <button
                      onClick={logoutUser}
                      className="bg-slate-800 text-green-200 px-4 py-2 rounded-full border border-green-500 hover:bg-slate-900 transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}