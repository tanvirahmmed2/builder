'use client';

import React from 'react';
import Link from 'next/link';
import { BiCheckCircle, BiStar, BiLayer } from 'react-icons/bi';

export default function Package({ pkg, price, billingCycle = 'MONTHLY' }) {
  if (!pkg) return null;

  return (
    <div
      key={pkg.id}
      className={`relative rounded-3xl p-8 border bg-slate-900 border-white/10 flex flex-col justify-between shadow-2xl transition-all hover:translate-y-[-4px] hover:border-indigo-500/40`}
    >
      {pkg.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
          <BiStar className="text-sm fill-current text-slate-950" />
          <span>Most Popular</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          {pkg.app_title && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                <BiLayer className="text-xs" />
                <span>{pkg.app_title}</span>
              </span>
            </div>
          )}
          <h3 className="text-2xl font-bold text-white tracking-tight">{pkg.name}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black text-white font-mono">${price}</span>
          <span className="text-xs text-slate-400 font-medium">/ month</span>
          {billingCycle === 'YEARLY' && (
            <span className="text-[10px] text-emerald-400 font-bold ml-2 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              billed annually
            </span>
          )}
        </div>

        <div className="text-xs text-indigo-300 bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 w-fit font-semibold">
          {pkg.maxPortfolios} {pkg.maxPortfolios === 1 ? 'Website Portfolio' : 'Website Portfolios'} Included
        </div>

        <div className="border-t border-white/10 pt-6 space-y-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            What is included:
          </span>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {Array.isArray(pkg.features) &&
              pkg.features.map((feat, fidx) => (
                <li key={fidx} className="flex items-start gap-2.5 leading-relaxed">
                  <BiCheckCircle className="text-base text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="pt-8">
        <Link
          href={`/creator/checkout?packageId=${pkg.id}`}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
            pkg.popular
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <span>{pkg.cta || `Get ${pkg.name}`}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}