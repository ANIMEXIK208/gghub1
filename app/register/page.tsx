'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../contexts/UserContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    email: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/account');
    }
  }, [isLoggedIn, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setStatusMessage('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setStatusMessage('Username must be at least 3 characters long');
      return false;
    }
    if (!formData.password) {
      setStatusMessage('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setStatusMessage('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatusMessage('Passwords do not match');
      return false;
    }
    if (!formData.email.trim()) {
      setStatusMessage('Email is required for account verification');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setStatusMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const success = await register(
        formData.username.trim(),
        formData.password,
        formData.displayName.trim() || formData.username.trim(),
        formData.email.trim()
      );

      if (success) {
        setStatusMessage('Account created successfully! Please check your email and click the verification link before signing in.');
        setTimeout(() => {
          router.push('/account');
        }, 3000);
      } else {
        setStatusMessage('Registration failed. This username may already be taken or there was a server error. Please try again.');
      }
    } catch (error) {
      setStatusMessage(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-green-900/20">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                GGHub
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-green-300 hover:text-green-100 transition-colors">
                Home
              </Link>
              <Link href="/#products" className="text-green-300 hover:text-green-100 transition-colors">
                Shop
              </Link>
              <Link href="/#games" className="text-green-300 hover:text-green-100 transition-colors">
                Games
              </Link>
              <Link href="/account" className="text-green-300 hover:text-green-100 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-xl text-green-200 mb-6">
              Create your account to manage orders and get fast support.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-black/80 backdrop-blur-sm rounded-3xl border border-green-500/30 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {statusMessage && (
                <div className={`p-4 rounded-2xl text-center ${
                  statusMessage.includes('successfully')
                    ? 'bg-green-900/50 border border-green-500 text-green-100'
                    : 'bg-red-900/50 border border-red-500 text-red-100'
                }`}>
                  {statusMessage}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-green-200 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Choose a unique username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-green-200 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="How others will see you"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-200 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-green-200 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-200 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-green-500/30 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-green-300">
                Already have an account?{' '}
                <Link href="/account" className="text-green-400 hover:text-green-300 font-semibold underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-black/40 rounded-2xl p-6 border border-green-500/20">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-green-100 mb-2">Track Progress</h3>
                <p className="text-green-300 text-sm">Monitor your orders and view your service activity in one place.</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-green-500/20">
                <div className="text-3xl mb-3">🛒</div>
                <h3 className="font-bold text-green-100 mb-2">Shop Gear</h3>
                <p className="text-green-300 text-sm">Browse premium gaming accessories and exclusive deals</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-green-500/20">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-bold text-green-100 mb-2">Join the Network</h3>
                <p className="text-green-300 text-sm">Stay connected with updates, offers, and service information.</p>
              </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-500/20 bg-black/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-green-400">
            <p>&copy; 2024 GGHub. Trusted gaming accessories and support.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}