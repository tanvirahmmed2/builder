'use client';

import React from 'react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import {
  BiRocket,
  BiCheckCircle,
  BiStar,
  BiShieldQuarter,
  BiArrowBack,
  BiCube,
  BiGlobe,
  BiCart,
} from 'react-icons/bi';

export default function CreatorAuthLayout({
  badge = 'Creator Studio',
  headline = 'Build Your Identity on Web',
  description = 'The visual website builder and unified commerce engine designed for ambitious creators, developers, and modern agencies.',
  features = [
    'Pixel-perfect drag & drop canvas with instant cloud publishing',
    'Integrated store engine with 0% platform cuts and instant payouts',
    'Automated appointment bookings, lead management, and live chat',
  ],
  stats = [
    { label: 'Active Creators', value: '23k+' },
    { label: 'Websites Built', value: '54k+' },
    { label: 'Uptime SLA', value: '99.99%' },
  ],
  quote = {
    text: 'Moving our entire agency portfolio and client booking funnel here cut our setup time in half.',
    author: 'Elena Rostova',
    role: 'Creative Director, Studio Aura',
  },
  topRightLink,
  children,
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors lg:flex lg:flex-row">
      {/* ======================================================== */}
      {/* LEFT COLUMN: Brand Hero, Visual Showcase & Social Proof  */}
      {/* Shown ONLY on larger screens (lg: and above)             */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden bg-slate-950 text-white p-8 sm:p-12 lg:p-16 flex-col justify-between border-r border-slate-800 shrink-0">
        {/* Ambient decorative background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none" />

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-black tracking-tight text-white hover:text-slate-200 transition-colors inline-block"
          >
            {SITE_NAME}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <BiArrowBack className="text-sm" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center: Headline & Creator Value Pillars */}
        <div className="relative z-10 my-10 sm:my-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary-light text-xs font-bold uppercase tracking-wider">
            <BiRocket className="text-secondary text-sm" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {headline}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-lg font-normal">
            {description}
          </p>

          {/* Feature Checklist */}
          <div className="space-y-3 pt-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <BiCheckCircle className="text-emerald-400 text-base shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* 3 Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md pt-4">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="text-lg sm:text-xl font-black text-white font-mono">{s.value}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Social Proof Testimonial Card */}
        <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex text-amber-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <BiStar key={i} className="fill-current" />
            ))}
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <div className="pt-1 text-[11px] text-slate-400">
            <span className="font-bold text-white">{quote.author}</span> &bull; {quote.role}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Interactive Form Content & Flow Controls   */}
      {/* On smaller screen: behaves like before (centered single  */}
      {/* card in min-h-screen).                                   */}
      {/* On lg+ screens: full-page split layout with top switcher */}
      {/* and legal footer.                                        */}
      {/* ======================================================== */}
      <div className="flex-1 min-h-screen flex flex-col justify-center lg:justify-between px-4 py-8 sm:px-6 lg:p-12 xl:p-16 bg-slate-50 dark:bg-slate-950 lg:bg-slate-50/70 lg:dark:bg-slate-900/60 overflow-y-auto">
        {/* Top Switcher Navigation (visible on lg+) */}
        <div className="w-full hidden lg:flex items-center justify-between gap-3 text-xs mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <BiArrowBack className="text-sm" />
            <span>Home</span>
          </Link>

          {topRightLink && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span>{topRightLink.prompt}</span>
              <Link
                href={topRightLink.href}
                className="font-bold text-secondary hover:text-secondary-dark dark:hover:text-secondary-light hover:underline ml-1"
              >
                {topRightLink.text}
              </Link>
            </div>
          )}
        </div>

        {/* Form Container (Centered with max-w-md width) */}
        <div className="max-w-md w-full mx-auto my-auto py-2 sm:py-4">
          {children}
        </div>

        {/* Bottom Security / Privacy Footer (visible on lg+) */}
        <div className="w-full hidden lg:block pt-8 text-center text-[11px] text-slate-400 dark:text-slate-500">
          <p>
            Protected by bank-grade 256-bit SSL encryption. By continuing, you agree to our{' '}
            <Link href="/faqs" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/faqs" className="underline hover:text-slate-600 dark:hover:text-slate-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
