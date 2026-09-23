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
  BiCheck,
} from 'react-icons/bi';

export default function Ecommerce() {
  const [selectedPlan, setSelectedPlan] = useState('single');
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Turn your passion into a thriving online commerce store
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Whether you sell digital assets, physical merchandise, paid workshops, or recurring subscriptions, our built-in commerce engine takes care of checkout, inventory, and automated fulfillment.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Feature Capabilities */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                  <BiCreditCard />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seamless Checkouts</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Support credit cards, Apple Pay, Google Pay, and Stripe with bank-grade security and zero redirect lag.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                  <BiPackage />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digital &amp; Physical Goods</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deliver instant encrypted download links or manage physical inventory, SKUs, and shipping tracking numbers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
                  <BiTag />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Coupons &amp; Flash Sales</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Drive conversions with percentage discounts, fixed-value vouchers, free shipping thresholds, and countdown timers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                  <BiTrendingUp />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Revenue Analytics</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Monitor live gross volume, refund rates, average order values, and repeat buyers from your creator dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <BiCheckCircle className="text-emerald-500 text-base shrink-0" />
                <span>Automated PDF invoice generation and branded email receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <BiCheckCircle className="text-emerald-500 text-base shrink-0" />
                <span>Built-in tax collection and currency conversion for international sales</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Launch Your Online Store</span>
                <BiRightArrowAlt className="text-base" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Live Product & Checkout Preview */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xl space-y-6">
              {/* Product Card Showcase */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Featured Digital Product
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Ultimate Portfolio &amp; Agency UI Kit
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    120+ components, responsive blocks, and Figma source files.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedPlan === 'single' ? '$49' : '$149'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">one-time payment</span>
                </div>
              </div>

              {/* License Variant Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select License Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('single')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === 'single'
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">Standard License</div>
                    <div className="text-[10px] text-slate-400">Personal or single commercial site</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('agency')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === 'agency'
                        ? 'bg-white dark:bg-slate-900 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">Agency Extended</div>
                    <div className="text-[10px] text-slate-400">Unlimited client projects</div>
                  </button>
                </div>
              </div>

              {/* Add to Cart Simulation */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white'
                }`}
              >
                {addedToCart ? (
                  <>
                    <BiCheck className="text-lg" />
                    <span>Added to Cart! Instant Delivery Ready</span>
                  </>
                ) : (
                  <>
                    <BiCart className="text-lg" />
                    <span>Purchase &amp; Download Instantly</span>
                  </>
                )}
              </button>

              {/* Trust footer inside widget */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <BiCheckShield className="text-emerald-500 text-sm" />
                  <span>256-bit Encrypted Checkout</span>
                </span>
                <span>Instant Cloud Download</span>
              </div>
            </div>

            {/* Floating Store Sales Badge */}
            <div className="hidden sm:flex absolute -bottom-5 -right-4 items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg font-bold">
                <BiTrendingUp />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">$18,450.00</p>
                <p className="text-[10px] text-slate-500">Live Monthly Store Volume</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}