'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiLoaderAlt } from 'react-icons/bi';
import Package from '@/components/home/cards/Package';

export default function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages)) {
          const mapped = data.packages.map((p, idx) => {
            const monthly = Math.round(Number(p.price_in_cents || 0) / 100) || 0;
            const yearly = Math.round(monthly * 0.8);
            const feats = Array.isArray(p.features) && p.features.length > 0
              ? p.features.map((f) => f.name || f.description || f)
              : Array.isArray(p.allowed_modules) && p.allowed_modules.length > 0
                ? p.allowed_modules.map((m) => `Includes ${m} Module`)
                : ['Standard Website Provisioning', 'Creator Dashboard Access'];

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description || 'Complete portfolio builder package.',
              monthlyPrice: monthly,
              yearlyPrice: yearly,
              maxPortfolios: p.max_portfolios || 1,
              popular: idx === 1,
              features: feats,
              cta: `Get ${p.name}`,
            };
          });
          setPackages(mapped);
        } else {
          setPackages([]);
        }
      })
      .catch(() => {
        setPackages([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-semibold text-primary">
          Invest in Your Digital Identity
        </h1>
        <p className="text-sm max-w-2xl mx-auto text-slate-500">
          Every tier includes zero-latency multi-website portfolio isolation, real-time drag-and-drop canvas studio, and instant subdomain activation.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-white/10 inline-flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                billingCycle === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'YEARLY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <BiLoaderAlt className="animate-spin text-4xl text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading available packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto space-y-2 bg-slate-900 border border-white/10 rounded-3xl p-8">
          <h3 className="text-base font-bold text-white">No Subscription Packages Available</h3>
          <p className="text-xs text-slate-400">
            Subscription tiers will appear here once published in the administrative system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
            const price = billingCycle === 'YEARLY' ? pkg.yearlyPrice : pkg.monthlyPrice;
            return (
              <Package key={pkg.id} price={price} pkg={pkg} />
            );
          })}
        </div>
      )}

      <div className="p-4 rounded-xl bg-primary text-center space-y-3 max-w-3xl mx-auto">
        <h4 className="font-bold text-light text-base">All packages include instant website provisioning</h4>
        <p className="text-xs text-light leading-relaxed">
          When you complete checkout, your unpaid invoice is generated with Payoneer settlement. Once paid, your subscription activates and your dedicated subdomain website is provisioned immediately.
        </p>
      </div>
    </div>
  );
}
