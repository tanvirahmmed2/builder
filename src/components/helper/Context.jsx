'use client';
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [apps, setApps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [theme, setThemeState] = useState('light'); // default 'light'

  // Initialize theme and cached creator on client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('portfoliobuilder_theme');
      if (savedTheme === 'dark') {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      } else {
        setThemeState('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}

    try {
      const cachedCreator = localStorage.getItem('hiesci_creator');
      if (cachedCreator) {
        const parsed = JSON.parse(cachedCreator);
        if (parsed && parsed.id) {
          setCreator(parsed);
        }
      }
    } catch (_) {}
  }, []);

  const setTheme = useCallback((newTheme) => {
    const val = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(val);
    try {
      localStorage.setItem('portfoliobuilder_theme', val);
      if (val === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('portfoliobuilder_theme', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (_) {}
      return next;
    });
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/developer/me', {
        withCredentials: true,
      });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      setUser(null);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCreator = useCallback(async () => {
    try {
      const res = await axios.get('/api/creator/me', {
        withCredentials: true,
      });
      if (res.data?.success && res.data?.creator) {
        setCreator(res.data.creator);
        try {
          localStorage.setItem('hiesci_creator', JSON.stringify(res.data.creator));
        } catch (_) {}
        return res.data.creator;
      }
      setCreator(null);
      try {
        localStorage.removeItem('hiesci_creator');
      } catch (_) {}
    } catch (_) {
      setCreator(null);
      try {
        localStorage.removeItem('hiesci_creator');
      } catch (_) {}
    } finally {
      setCreatorLoading(false);
    }
  }, []);

  const fetchApps = useCallback(async () => {
    try {
      const res = await axios.get('/api/apps');
      if (res.data?.success && Array.isArray(res.data?.apps)) {
        const formatted = res.data.apps.map((app) => ({
          ...app,
          path: `/apps/${app.slug}`,
        }));
        setApps(formatted);
      }
    } catch (_) {
      // Keep empty or current apps
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get('/api/reviews');
      if (res.data?.success && Array.isArray(res.data?.reviews)) {
        setReviews(res.data.reviews);
      }
    } catch (_) {
      // Keep empty or current reviews
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchCreator();
    fetchApps();
    fetchReviews();
  }, [fetchUser, fetchCreator, fetchApps, fetchReviews]);

  const contextValues = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    reviews,
    setReviews,
    apps,
    setApps,
    refetchApps: fetchApps,
    user,
    setUser,
    loading,
    setLoading,
    refetchUser: fetchUser,
    creator,
    setCreator,
    creatorLoading,
    refetchCreator: fetchCreator,
  };

  return <Context.Provider value={contextValues}>{children}</Context.Provider>;
};