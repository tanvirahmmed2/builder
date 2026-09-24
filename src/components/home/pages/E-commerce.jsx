'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiCart,
  BiCreditCard,
  BiCheckCircle,
  BiTrendingUp,
  BiPackage,
  BiTag,
  BiCheckShield,
  BiRightArrowAlt,
  BiDollarCircle,
  BiBarChartAlt2,
  BiLineChart,
  BiRefresh,
  BiShieldQuarter,
  BiShoppingBag,
  BiStore,
} from 'react-icons/bi';

// Business Growth Models & Telemetry
const GROWTH_MODELS = [
  {
    id: 'digital',
    title: 'Digital Goods & Software',
    subtitle: 'Templates, UI Kits, eBooks, Audio & Presets',
    icon: BiPackage,
    accent: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    grossMargin: '94%',
    avgConversion: '5.6%',
    paybackDays: 'Instant (0 Days)',
    revenueLift: '+65% MoM',
    growthDrivers: [
      'Encrypted instant cloud download delivery right after payment',
      'Tiered licensing (Personal, Commercial, Extended Agency)',
      'Automated affiliate referral engine turning customers into promoters',
    ],
    sampleRevenue: '$14,800/mo',
    sampleOrders: '380 orders',
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions & Memberships',
    subtitle: 'Paid Communities, Newsletters & Recurring Content',
    icon: BiRefresh,
    accent: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    grossMargin: '89%',
    avgConversion: '4.2%',
    paybackDays: 'Predictable MRR',
    revenueLift: '3.8x LTV Multiplier',
    growthDrivers: [
      'Automated failed card dunning and smart email recovery sequences',
      'Annual billing upfront discount incentives to maximize cashflow',
      'Gated members-only portals with instant auto-provisioning',
    ],
    sampleRevenue: '$28,400 MRR',
    sampleOrders: '420 subscribers',
  },
  {
    id: 'services',
    title: 'Services & Consultations',
    subtitle: 'Agencies, Freelancers, Advisory & Coaching',
    icon: BiBriefcaseGrowth,
    accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    grossMargin: '82%',
    avgConversion: '8.4%',
    paybackDays: 'Immediate Deposit',
    revenueLift: '+140% Bookings',
    growthDrivers: [
      'Integrated discovery call scheduler requiring upfront booking deposit',
      'Automated intake questionnaires capturing project scope upfront',
      'Custom invoice generation and milestone retainer payments',
    ],
    sampleRevenue: '$42,500/mo',
    sampleOrders: '18 retainers',
  },
  {
    id: 'merchandise',
    title: 'Physical Goods & Merch',
    subtitle: 'Apparel, Printed Books, Art Prints & Goods',
    icon: BiShoppingBag,
    accent: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    grossMargin: '68%',
    avgConversion: '3.9%',
    paybackDays: '24h Fulfillment',
    revenueLift: '-48% Cart Drops',
    growthDrivers: [
      'Abandoned checkout auto-recovery emails with dynamic single-use coupons',
      'Real-time inventory thresholds triggering scarcity and purchase urgency',
      'Automated carrier tracking links and branded delivery updates',
    ],
    sampleRevenue: '$21,900/mo',
    sampleOrders: '520 shipments',
  },
];

function BiBriefcaseGrowth(props) {
  return <BiStore {...props} />;
}

export default function Ecommerce() {
  const [activeGrowthModel, setActiveGrowthModel] = useState('digital');

  const currentModel =
    GROWTH_MODELS.find((m) => m.id === activeGrowthModel) || GROWTH_MODELS[0];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold uppercase tracking-wider">
            <BiCart className="text-emerald-500 text-sm" />
            <span>High-Converting Store &amp; Revenue Engine</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Turn your website into a high-growth online commerce powerhouse
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Whether you sell digital assets, physical merchandise, recurring subscriptions, or client retainers, our platform provides the proven conversion tools and telemetry needed to scale your business.
          </p>
        </div>

        {/* 4 Core Growth Metrics KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Checkout Conversion</span>
              <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-base">
                <BiTrendingUp />
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">+42.8%</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Average checkout uplift</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              One-click checkout and auto-saved cards eliminate purchase friction.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">GMV Processed</span>
              <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-base">
                <BiDollarCircle />
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">$4.8M+</div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Across platform stores</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Zero marketplace cuts means 100% of your revenues go to you.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-600 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Order Value</span>
              <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-base">
                <BiBarChartAlt2 />
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">+28.5%</div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">Higher basket size</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Smart order bumps and post-checkout upsells maximize each order.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-300 dark:hover:border-amber-600 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Transaction Reliability</span>
              <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-base">
                <BiCheckShield />
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">99.98%</div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">Global payment success</p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Multi-gateway routing ensures zero dropped customer checkouts.
            </p>
          </div>
        </div>

        {/* Interactive Business Growth Benchmarks & Telemetry Component */}
        <div className="rounded-3xl p-6 sm:p-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-700/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <BiLineChart className="text-xs" />
                <span>Growth Telemetry by Business Model</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Explore Revenue Growth Benchmarks for Your Industry
              </h3>
            </div>

            {/* Model Switcher Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {GROWTH_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setActiveGrowthModel(model.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeGrowthModel === model.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-102'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {model.title.split('&')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Model Growth Metrics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Benchmarks & Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${currentModel.accent}`}>
                    {currentModel.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    &bull; {currentModel.subtitle}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-2">
                  Primary Revenue Drivers &amp; Scalability
                </h4>
              </div>

              {/* 4 Quick Stat Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Margin</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentModel.grossMargin}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Conversion Rate</span>
                  <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {currentModel.avgConversion}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payback Cycle</span>
                  <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 truncate block">
                    {currentModel.paybackDays}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Growth Multiplier</span>
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 truncate block">
                    {currentModel.revenueLift}
                  </span>
                </div>
              </div>

              {/* List of Growth Levers */}
              <div className="space-y-2.5 pt-1">
                {currentModel.growthDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <BiCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Simulated Revenue Telemetry Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">Live Store Growth Velocity</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Real-time Telemetry</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400">Monthly Volume Benchmark</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5">
                      {currentModel.sampleRevenue}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Based on {currentModel.sampleOrders} with automated checkout optimization.
                    </span>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Conversion Funnel Health</span>
                      <span className="text-emerald-400 font-bold">96.4% Optimized</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-indigo-500 w-[96%]" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Direct-to-Bank Payouts</span>
                    <span className="text-white font-bold">Zero Marketplace Fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Store Infrastructure & Scaling Capabilities */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Enterprise Store Infrastructure Built for Conversion
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Everything required to launch, market, and fulfill orders without cobbling together disparate plugins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                <BiCreditCard />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Seamless Checkouts</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Accept credit cards, Apple Pay, Google Pay, and Stripe with bank-grade 256-bit encryption and zero redirect delay.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
                <BiPackage />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Digital &amp; Physical Goods</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deliver instant encrypted cloud download links or manage inventory, SKUs, and shipping tracking numbers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-600 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl">
                <BiTag />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Coupons &amp; Flash Sales</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drive conversions with percentage discounts, fixed-value vouchers, free shipping thresholds, and countdown timers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-300 dark:hover:border-amber-600 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
                <BiTrendingUp />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Revenue Analytics</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Monitor live gross volume, refund rates, average order values, and repeat buyers from your creator dashboard.
              </p>
            </div>
          </div>

          {/* Trust points and CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <BiCheckCircle className="text-emerald-500 text-base shrink-0" />
                <span>Automated PDF invoice generation &amp; branded receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <BiCheckCircle className="text-emerald-500 text-base shrink-0" />
                <span>Built-in tax collection &amp; multi-currency conversion</span>
              </div>
              <div className="flex items-center gap-2">
                <BiCheckCircle className="text-emerald-500 text-base shrink-0" />
                <span>Instant direct payouts via Stripe to your bank account</span>
              </div>
            </div>

            <Link
              href="/packages"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Launch Your Online Store</span>
              <BiRightArrowAlt className="text-base" />
            </Link>
          </div>
        </div>

        {/* Marketplaces vs Your Store Comparison Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/40">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <BiShieldQuarter className="text-emerald-400 text-sm" />
              <span>Direct-to-Consumer Advantage</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Keep 100% of Your Earnings &amp; Customer Data</h3>
            <p className="text-xs text-emerald-200 max-w-xl leading-relaxed">
              Third-party marketplaces take 30% cuts and hide your buyers&apos; emails. With your native online store, you own the relationship, enjoy instant payouts, and build lasting enterprise value.
            </p>
          </div>

          <Link
            href="/packages"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-emerald-50 font-bold text-xs shadow-lg transition-all"
          >
            <span>Start Selling Today</span>
            <BiRightArrowAlt className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}