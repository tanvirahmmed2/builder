'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiPalette,
  BiStar,
  BiLinkExternal,
  BiRightArrowAlt,
} from 'react-icons/bi';

const THEMES = [
  {
    id: 'theme-1',
    name: 'Aura Studio',
    category: 'agency',
    categoryLabel: 'Agency & Studio',
    description: 'Ultra-clean layout with full-bleed imagery and interactive case study layouts for modern digital agencies.',
    font: 'Outfit / Inter',
    isPremium: true,
    colors: ['#0f172a', '#6366f1', '#ec4899', '#f8fafc'],
    gradient: 'from-slate-900 via-indigo-950 to-purple-950',
  },
  {
    id: 'theme-2',
    name: 'Nova Commerce',
    category: 'ecommerce',
    categoryLabel: 'E-commerce & Retail',
    description: 'High-converting storefront template with sticky cart drawer, instant filters, and product carousels.',
    font: 'Plus Jakarta Sans',
    isPremium: false,
    colors: ['#047857', '#10b981', '#f0fdf4', '#1e293b'],
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
  },
  {
    id: 'theme-3',
    name: 'Kinetics Creative',
    category: 'portfolio',
    categoryLabel: 'Portfolio & Bio',
    description: 'Editorial-grade portfolio designed for photographers, 3D artists, and creative directors to showcase high-res media.',
    font: 'Cabinet Grotesk',
    isPremium: true,
    colors: ['#18181b', '#f59e0b', '#ef4444', '#fafafa'],
    gradient: 'from-stone-950 via-amber-950 to-neutral-950',
  },
  {
    id: 'theme-4',
    name: 'DevFlow SaaS',
    category: 'saas',
    categoryLabel: 'Tech & SaaS',
    description: 'Modern software product landing page with interactive feature breakdowns, code syntax blocks, and pricing calculator.',
    font: 'Inter / JetBrains Mono',
    isPremium: false,
    colors: ['#0284c7', '#38bdf8', '#0f172a', '#ffffff'],
    gradient: 'from-sky-950 via-blue-950 to-slate-950',
  },
  {
    id: 'theme-5',
    name: 'Lumina Minimalist',
    category: 'portfolio',
    categoryLabel: 'Portfolio & Bio',
    description: 'Distraction-free personal portfolio focusing strictly on typography, thought leadership essays, and project archives.',
    font: 'Newsreader / Inter',
    isPremium: false,
    colors: ['#000000', '#71717a', '#e4e4e7', '#ffffff'],
    gradient: 'from-zinc-950 via-slate-900 to-zinc-900',
  },
  {
    id: 'theme-6',
    name: 'Apex Consulting',
    category: 'agency',
    categoryLabel: 'Business & Booking',
    description: 'Professional service firm template with built-in appointment scheduler, client onboarding forms, and team bios.',
    font: 'DM Sans',
    isPremium: true,
    colors: ['#4338ca', '#818cf8', '#312e81', '#f5f3ff'],
    gradient: 'from-indigo-950 via-violet-950 to-slate-950',
  },
];

export default function Themes() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredThemes =
    activeCategory === 'all'
      ? THEMES
      : THEMES.filter((t) => t.category === activeCategory);

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold uppercase tracking-wider">
            <BiPalette className="text-purple-500 text-sm" />
            <span>Curated Theme Showcase</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Award-winning themes engineered for maximum conversion
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Every theme is built from the ground up with fluid responsiveness, accessible contrast ratios, dynamic color palettes, and Google Lighthouse 95+ performance scores.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {[
              { id: 'all', label: 'All Themes' },
              { id: 'portfolio', label: 'Portfolios' },
              { id: 'ecommerce', label: 'E-commerce' },
              { id: 'agency', label: 'Agencies' },
              { id: 'saas', label: 'Tech & SaaS' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.slice(0, 6).map((theme) => (
            <div
              key={theme.id}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Theme Mockup Viewport */}
              <div>
                <div className={`relative h-48 bg-linear-to-br ${theme.gradient} p-5 flex flex-col justify-between overflow-hidden`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                      {theme.categoryLabel}
                    </span>
                    {theme.isPremium ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <BiStar className="text-slate-950 fill-current" />
                        <span>PREMIUM</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-[10px] uppercase">
                        INCLUDED
                      </span>
                    )}
                  </div>

                  <div className="z-10">
                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow-xs">
                      {theme.name}
                    </h3>
                  </div>

                  {/* Decorative glow circles */}
                  <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[2.5rem]">
                    {theme.description}
                  </p>

                  {/* Swatches and Font */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      {theme.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-2xs"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {theme.font}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 flex items-center gap-2.5">
                <Link
                  href="/themes"
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Preview</span>
                  <BiLinkExternal className="text-sm" />
                </Link>

                <Link
                  href="/creator/login"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center shadow-xs transition-colors"
                >
                  Use in Studio
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Themes CTA */}
        <div className="text-center pt-4">
          <Link
            href="/themes"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-lg transition-all"
          >
            <span>Browse All Themes &amp; Templates</span>
            <BiRightArrowAlt className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}