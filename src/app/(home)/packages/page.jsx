'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BiLoaderAlt, BiGridAlt, BiLayer, BiPackage, BiRefresh } from 'react-icons/bi';
import Package from '@/components/home/cards/Package';

export default function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [packages, setPackages] = useState([]);
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchPackagesAndApps = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        const mapped = data.packages.map((p, idx) => {
          const monthly = Math.round(Number(p.price_in_cents || 0) / 100) || 0;
          const yearly = Math.round(monthly * 0.8);
          const feats =
            Array.isArray(p.features) && p.features.length > 0
              ? p.features.map((f) => f.name || f.description || f)
              : Array.isArray(p.allowed_modules) && p.allowed_modules.length > 0
              ? p.allowed_modules.map((m) => `Includes ${m} Module`)
              : ['Standard Website Provisioning', 'Creator Dashboard Access'];

          return {
            id: p.id,
            app_id: p.app_id,
            app_title: p.app_title,
            app_slug: p.app_slug,
            name: p.name,
            slug: p.slug,
            description: p.description || 'Complete website & portfolio creation package.',
            monthlyPrice: monthly,
            yearlyPrice: yearly,
            maxPortfolios: p.max_portfolios || 1,
            popular: idx === 1 || Boolean(p.is_popular),
            features: feats,
            cta: `Get ${p.name}`,
          };
        });
        setPackages(mapped);
        setApps(data.apps || []);
      } else {
        setPackages([]);
        setApps([]);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setPackages([]);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesAndApps();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('app') || params.get('app_id');
      if (q) setSelectedApp(q);
    }
  }, []);

  const filteredPackages = useMemo(() => {
    if (selectedApp === 'ALL') return packages;
    return packages.filter((p) => String(p.app_id) === String(selectedApp) || p.app_slug === selectedApp);
  }, [packages, selectedApp]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
          <BiPackage className="text-sm" /> Subscription Plans
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Invest in Your Digital Identity
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Select subscription packages categorized by application. Every tier includes zero-latency portfolio isolation, real-time drag-and-drop studio, and instant subdomain activation.
        </p>

        {/* Application Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setSelectedApp('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedApp === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BiGridAlt className="text-sm" />
            <span>All Applications</span>
            <span className="text-[10px] opacity-75 ml-0.5">({packages.length})</span>
          </button>

          {apps.map((app) => {
            const count = packages.filter((p) => String(p.app_id) === String(app.id)).length;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedApp(String(app.id))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedApp === String(app.id)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BiLayer className="text-sm" />
                <span>{app.title}</span>
                <span className="text-[10px] opacity-75 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 inline-flex items-center gap-2 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'YEARLY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid or Empty State */}
      {loading ? (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-xl mx-auto">
          <BiLoaderAlt className="animate-spin text-4xl text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">Loading available packages...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center text-indigo-500 text-2xl">
            <BiPackage />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Packages Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {selectedApp !== 'ALL'
              ? 'There are currently no active packages registered under this application.'
              : 'Subscription tiers will appear here once published in the administrative system.'}
          </p>
          {selectedApp !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedApp('ALL')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
            >
              View All Applications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 max-w-6xl mx-auto">
            <span>
              Showing {filteredPackages.length} of {packages.length} packages
            </span>
            <button
              type="button"
              onClick={fetchPackagesAndApps}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <BiRefresh className="text-sm" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {filteredPackages.map((pkg) => {
              const price = billingCycle === 'YEARLY' ? pkg.yearlyPrice : pkg.monthlyPrice;
              return (
                <Package
                  key={pkg.id}
                  price={price}
                  pkg={pkg}
                  billingCycle={billingCycle}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Guarantee Banner */}
      <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 text-center space-y-2 max-w-3xl mx-auto shadow-xs">
        <h4 className="font-bold text-slate-900 dark:text-white text-base">
          All packages include instant website provisioning
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          When you complete checkout, your invoice is generated with Payoneer settlement. Once paid, your subscription activates and your dedicated subdomain website is provisioned immediately.
        </p>
      </div>
    </div>
  );
}
