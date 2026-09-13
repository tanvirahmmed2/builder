'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  BoxIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@/components/ui/Icons';

export default function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState('MONTHLY');

  const packages = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
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
      color: 'from-slate-800 to-slate-900 border-white/10',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
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
      color: 'from-indigo-950/60 via-purple-950/40 to-slate-900 border-indigo-500/50 shadow-indigo-500/20',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
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
      color: 'from-slate-800 to-slate-900 border-white/10',
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        
        <h1 className="text-4xl sm:text-5xl font-semibold text-primary">
          Invest in Your Digital Identity
        </h1>
        <p className="text-sm max-w-2xl mx-auto">
          Every tier includes zero-latency multi-website portfolio isolation, real-time drag-and-drop canvas studio, and instant subdomain activation.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-white/10 inline-flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
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

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {packages.map((pkg) => {
          const price = billingCycle === 'YEARLY' ? pkg.yearlyPrice : pkg.monthlyPrice;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 border bg-gradient-to-b ${pkg.color} flex flex-col justify-between shadow-2xl transition-all hover:translate-y-[-4px]`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <StarIcon filled className="w-3 h-3 text-amber-300" />
                  <span>Most Popular Choice</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">${price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                  {billingCycle === 'YEARLY' && (
                    <span className="text-[10px] text-emerald-400 font-bold ml-2">billed annually</span>
                  )}
                </div>

                <div className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 w-fit font-medium">
                  {pkg.maxPortfolios} {pkg.maxPortfolios === 1 ? 'website Portfolio' : 'website Portfolios'} Included
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    What is included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {pkg.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={`/checkout?packageId=${pkg.id}`}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white hover:opacity-95 shadow-indigo-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>{pkg.cta}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-primary text-center space-y-3 max-w-3xl mx-auto">
        <h4 className="font-bold text-light text-base">All packages include instant website provisioning</h4>
        <p className="text-xs text-light leading-relaxed">
          When you complete checkout, our background orchestrator generates your isolated PostgreSQL database website, assigns your dedicated subdomain, and links your custom drag-and-drop studio canvas immediately.
        </p>
      </div>
    </div>
  );
}
