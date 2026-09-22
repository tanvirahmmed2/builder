'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiLoaderAlt } from 'react-icons/bi';
import Package from '@/components/home/cards/Package';

const DEFAULT_PACKAGES = [
  {
    id: 1,
    name: 'Starter Creator',
    slug: 'starter-creator',
    description: 'Essential toolkit for emerging independent talent, junior developers, and freelancers.',
    monthlyPrice: 15,
    yearlyPrice: 12,
    maxPortfolios: 1,
    popular: false,
    features: [
      'Visual Drag & Drop Canvas Studio',
      'Single Isolated Subdomain (yourname.platform)',
      'Experience Timeline & Milestones',
      'Client Review Moderation',
      'Standard Edge SSL Encryption',
      'Community Forum Support',
    ],
    cta: 'Start with Starter',
  },
  {
    id: 2,
    name: 'Pro Studio',
    slug: 'pro-studio',
    description: 'Complete power for senior architects, boutique agencies, and consultants who need bookings and blogging.',
    monthlyPrice: 35,
    yearlyPrice: 28,
    maxPortfolios: 5,
    popular: true,
    features: [
      'Everything in Starter Creator',
      'Full Blog & Case Studies Module',
      'Interactive Appointment Booking Engine',
      'Custom Domain Access (e.g. yourbrand.com)',
      'Assign Managers with Edit Permissions',
      'Priority Ticket Resolution (< 4h SLA)',
      'Unlimited Monthly Visitors',
    ],
    cta: 'Claim Pro Studio Pass',
  },
  {
    id: 3,
    name: 'Agency Enterprise',
    slug: 'agency-enterprise',
    description: 'Tailored infrastructure with dedicated reverse proxies, custom database isolation, and team management.',
    monthlyPrice: 89,
    yearlyPrice: 72,
    maxPortfolios: 25,
    popular: false,
    features: [
      'Everything in Pro Studio',
      'Up to 25 Isolated website Portfolios',
      'Multi-Admin & Manager RBAC Governance',
      'White-label Custom Email Invites',
      'Dedicated SLA & Solution Architect',
      'PostgreSQL Database Direct Sync',
    ],
    cta: 'Deploy Enterprise Tier',
  },
];

export default function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          const mapped = data.packages.map((p, idx) => {
            const monthly = Math.round(Number(p.price_in_cents || 0) / 100) || 15;
            const yearly = Math.round(monthly * 0.8);
            const feats = Array.isArray(p.features) && p.features.length > 0
              ? p.features.map(f => f.name || f.description || f)
              : (Array.isArray(p.allowed_modules) && p.allowed_modules.length > 0
                ? p.allowed_modules.map(m => `Includes ${m} Module`)
                : DEFAULT_PACKAGES[idx % DEFAULT_PACKAGES.length].features);

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
          setPackages(DEFAULT_PACKAGES);
        }
      })
      .catch(() => {
        setPackages(DEFAULT_PACKAGES);
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
