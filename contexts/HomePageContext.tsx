'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface HomePageSettings {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  trendingTag: string;
  trendingTitle: string;
  trendingDescription: string;
  trendingPrice: string;
  trendingImage: string;
}

interface HomePageContextType {
  homePageSettings: HomePageSettings;
  updateHomePageSettings: (settings: Partial<HomePageSettings>) => void;
}

const HomePageContext = createContext<HomePageContextType | undefined>(undefined);

const defaultSettings: HomePageSettings = {
  heroBadge: 'Flash Sale',
  heroTitle: 'Dark Mode Drops for Elite Gamers',
  heroDescription: 'Shop the most immersive gaming setup with premium controllers, headsets, and accessories built for peak performance and style.',
  heroPrimaryCta: 'Shop Best Sellers',
  heroSecondaryCta: 'Explore Challenges',
  trendingTag: 'Trending Product',
  trendingTitle: 'GGHub Elite Controller Set',
  trendingDescription: 'A complete professional-grade controller kit built for precision, comfort, and style.',
  trendingPrice: '₦12,499',
  trendingImage: 'https://images.unsplash.com/photo-1606813901964-ccf69434d053?auto=format&fit=crop&w=900&q=80',
};

export const useHomePage = () => {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePage must be used within a HomePageProvider');
  }
  return context;
};

export const HomePageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homePageSettings, setHomePageSettings] = useState<HomePageSettings>(defaultSettings);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('gghub-homepage-settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as HomePageSettings;
          setHomePageSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('Failed to load homepage settings:', error);
          setHomePageSettings(defaultSettings);
        }
      }
    }
  }, []);

  const updateHomePageSettings = (settings: Partial<HomePageSettings>) => {
    setHomePageSettings((current) => {
      const next = { ...current, ...settings };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('gghub-homepage-settings', JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <HomePageContext.Provider value={{ homePageSettings, updateHomePageSettings }}>
      {children}
    </HomePageContext.Provider>
  );
};
