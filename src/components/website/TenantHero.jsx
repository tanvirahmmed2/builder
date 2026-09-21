'use client';

import { BiArrowToBottom, BiCalendarCheck, BiCheckCircle, BiRightArrowAlt } from 'react-icons/bi';

export default function TenantHero({ website, stats = {} }) {
  const settings = website?.settings || {};
  const siteTitle = settings.site_title || website?.name || 'Studio Brand';
  const tagline = settings.tagline || 'Full-Stack Developer, Designer & Creator';
  const bio = settings.bio || 'Building world-class digital products, web experiences, and scalable solutions for ambitious clients and high-growth businesses.';
  const primaryColor = settings.primary_color || website?.theme_config?.primaryColor || '#6366f1';

  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Dynamic Background Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-15 blur-[100px] pointer-events-none rounded-full"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Available for Projects & Consultations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
          {siteTitle}
        </h1>

        {/* Tagline */}
        <p
          className="text-lg sm:text-xl font-bold tracking-tight"
          style={{ color: primaryColor }}
        >
          {tagline}
        </p>

        {/* Bio */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {bio}
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href="#appointments"
            className="px-6 py-3 rounded-full text-xs font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-102 flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <BiCalendarCheck className="text-base" />
            <span>Book an Appointment</span>
          </a>

          <a
            href="#products"
            className="px-6 py-3 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Products</span>
            <BiRightArrowAlt className="text-base" />
          </a>

          <a
            href="#contact"
            className="px-6 py-3 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Contact Directly
          </a>
        </div>

        {/* Highlights Row */}
        <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">99.9%</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Uptime Guarantee</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">50+</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Completed Projects</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">5.0 ★</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Client Rating</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white">24/7</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Priority Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
