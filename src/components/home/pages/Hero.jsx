'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiRocket,
  BiCheckCircle,
  BiStar,
  BiDesktop,
  BiMobileAlt,
  BiLaptop,
  BiTrendingUp,
  BiLockAlt,
  BiCheckShield,
  BiRightArrowAlt,
} from 'react-icons/bi';

export default function Hero() {
  const [devicePreview, setDevicePreview] = useState('desktop');

  return (
    <section className="relative overflow-hidden w-full bg-linear-to-b from-primary/10 via-slate-50 to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800/80 transition-colors">
      {/* Background ambient decorative blurs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-secondary/15 dark:bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none">
              Build Your Digital Identity.{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary to-purple-600 dark:from-secondary-light dark:to-purple-400">
                Beyond Limits.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Effortlessly build, modify, and upgrade websites, portfolios, stores, and appointment systems in minutes.
              Intuitive drag-and-drop studio paired with powerful business operations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/creator/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-secondary hover:bg-secondary-dark text-white font-bold text-sm shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/35 transition-all duration-200 cursor-pointer"
              >
                <span>Get Started Free</span>
                <BiRightArrowAlt className="text-lg" />
              </Link>
              <Link
                href="/themes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-bold text-sm transition-all duration-200 shadow-xs"
              >
                <span>Explore Live Themes</span>
              </Link>
            </div>

          </div>

          
        </div>
      </div>
    </section>
  );
}