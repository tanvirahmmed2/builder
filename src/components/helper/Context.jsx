'use client';
import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [apps, setApps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    fetchApps();
    fetchReviews();
  }, [fetchUser, fetchApps, fetchReviews]);

  const contextValues = {
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
  };

  return <Context.Provider value={contextValues}>{children}</Context.Provider>;
};