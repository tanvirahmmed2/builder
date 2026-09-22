'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({ children, slug = '', initialWebsite = null, initialData = null }) {
  const [website, setWebsite] = useState(initialWebsite);
  const [data, setData] = useState(initialData);
  const [theme, setThemeState] = useState('light'); // Default light mood
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const storageKey = useMemo(() => {
    return slug ? `website_theme_${slug}` : 'website_theme';
  }, [slug]);

  // Read saved theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme === 'dark') {
        setThemeState('dark');
      } else {
        setThemeState('light');
      }
    } catch (_) {}
  }, [storageKey]);

  // Set theme explicitly
  const setTheme = useCallback((newTheme) => {
    const val = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(val);
    try {
      localStorage.setItem(storageKey, val);
    } catch (_) {}
  }, [storageKey]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(storageKey, next);
      } catch (_) {}
      return next;
    });
  }, [storageKey]);

  // Cart operations
  const addToCart = useCallback((product) => {
    setCart((prev) => [...prev, product]);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price_in_cents || 0) / 100), 0);
  }, [cart]);

  const allowedModules = useMemo(() => {
    return Array.isArray(website?.allowed_modules) ? website.allowed_modules : [];
  }, [website?.allowed_modules]);

  const isModuleAllowed = useCallback(
    (moduleName) => {
      if (!allowedModules || allowedModules.length === 0) return true;
      const target = String(moduleName || '').toLowerCase().trim();
      return allowedModules.some((m) => {
        const mod = String(m || '').toLowerCase().trim();
        return mod === target || target.includes(mod) || mod.includes(target);
      });
    },
    [allowedModules]
  );

  const value = {
    slug,
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    website,
    setWebsite,
    data,
    setData,
    cart,
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    cartOpen,
    setCartOpen,
    cartTotal,
    allowedModules,
    isModuleAllowed,
  };

  return (
    <WebsiteContext.Provider value={value}>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} transition-colors duration-200`} data-theme={theme}>
        {children}
      </div>
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  return context || {};
}
