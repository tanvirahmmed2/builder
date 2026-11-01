'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { BiSearch, BiGridAlt, BiRefresh, BiRocket, BiRightArrowAlt, BiStar, BiCube } from 'react-icons/bi';
import HomeServiceCard from '@/components/saas/home/cards/ServiceCard';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchPublishedServices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/saas/home/services');
      if (res.data?.success && Array.isArray(res.data?.services)) {
        setServices(res.data.services);
      } else {
        setError(res.data?.error || 'Failed to load services.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error fetching ecosystem services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    axios
      .get('/api/saas/home/services')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data?.services)) {
          setServices(res.data.services);
        } else {
          setError(res.data?.error || 'Failed to load services.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.error || err.message || 'Error fetching ecosystem services.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = services.filter((srv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (srv.title || '').toLowerCase().includes(q) ||
      (srv.short_description || '').toLowerCase().includes(q) ||
      (srv.slug || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50/60 pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-primary text-white pt-20 pb-20 px-4 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
            <BiCube className="text-secondary" />
            <span>Turnkey Website Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
            Ecosystem Services Built for Modern Creators &amp; Enterprises
          </h1>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Expand your digital presence with pre-integrated storefronts, restaurant POS, agency portfolios, and organization directories ready to deploy.
          </p>

          {/* Search Bar */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search services by title, capability, or use case..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-secondary focus:bg-white/15 transition-all shadow-lg backdrop-blur-md placeholder:text-white/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold hover:text-white px-2 py-1 rounded-md bg-white/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid List */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-8 gap-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Explore Available Services
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any service to view compatible themes, modules, and pricing tiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchPublishedServices}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-colors"
              title="Refresh"
            >
              <BiRefresh className="text-lg" />
            </button>
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-secondary mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading ecosystem services...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center space-y-3">
            <p className="text-xs font-semibold text-rose-500">{error}</p>
            <button
              type="button"
              onClick={fetchPublishedServices}
              className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto text-2xl">
              <BiCube />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Services Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No services matched your search &ldquo;{search}&rdquo;. Try another search keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredServices.map((service) => (
              <HomeServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

