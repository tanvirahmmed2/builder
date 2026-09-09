'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BoxIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  StarIcon,
} from '@/components/ui/Icons';

export default function ThemesPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const themes = [
    {
      id: 't-1',
      name: 'Obsidian Slate',
      slug: 'obsidian-slate',
      category: 'DARK',
      description: 'Sleek, deep obsidian aesthetic tailored for senior digital architects, systems engineers, and CTOs.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      colors: ['#090d16', '#6366f1', '#a855f7', '#f8fafc'],
      font: 'Inter / JetBrains Mono',
      isPremium: false,
    },
    {
      id: 't-2',
      name: 'Cyber Neon',
      slug: 'cyber-neon',
      category: 'CREATIVE',
      description: 'High-voltage cyberpunk aesthetics with glowing neon cyan accents, translucent cards, and glassmorphic headers.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      colors: ['#050814', '#06b6d4', '#ec4899', '#e2e8f0'],
      font: 'JetBrains Mono / Space Grotesk',
      isPremium: true,
    },
    {
      id: 't-3',
      name: 'Nordic Minimal',
      slug: 'nordic-minimal',
      category: 'MINIMAL',
      description: 'High-whitespace editorial layout designed for creative directors, UI/UX researchers, and design leaders.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
      colors: ['#0a0f12', '#10b981', '#14b8a6', '#f1f5f9'],
      font: 'Outfit / Plus Jakarta Sans',
      isPremium: false,
    },
    {
      id: 't-4',
      name: 'Studio Vanguard',
      slug: 'studio-vanguard',
      category: 'AGENCY',
      description: 'Bold editorial typography with dynamic portfolio carousels, verified testimonial widgets, and smooth micro-interactions.',
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
      colors: ['#0f0715', '#ec4899', '#f43f5e', '#faf5ff'],
      font: 'Syne / Inter',
      isPremium: true,
    },
    {
      id: 't-5',
      name: 'Emerald Matrix',
      slug: 'emerald-matrix',
      category: 'DARK',
      description: 'Fintech and blockchain-focused aesthetic featuring clean metric telemetry counters and timeline cards.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      colors: ['#02120e', '#10b981', '#059669', '#ecfdf5'],
      font: 'Geist / Fira Code',
      isPremium: false,
    },
    {
      id: 't-6',
      name: 'Solaris Warmth',
      slug: 'solaris-warmth',
      category: 'CREATIVE',
      description: 'Warm sunset amber gradients crafted for digital illustrators, 3D artists, and motion designers.',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      colors: ['#170e06', '#f59e0b', '#ef4444', '#fffbeb'],
      font: 'Plus Jakarta Sans',
      isPremium: true,
    },
  ];

  const categories = [
    { id: 'ALL', label: 'All Themes' },
    { id: 'DARK', label: 'Dark Mode' },
    { id: 'MINIMAL', label: 'Minimalist' },
    { id: 'CREATIVE', label: 'Creative & 3D' },
    { id: 'AGENCY', label: 'Boutique Agency' },
  ];

  const filteredThemes =
    selectedCategory === 'ALL'
      ? themes
      : themes.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400">
          <BoxIcon className="w-3.5 h-3.5" />
          <span>Curated Multi-Tenant Templates</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Portfolio Themes & Visual Systems
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select from meticulously crafted design presets. Switch themes with 1-click in the drag-and-drop studio while retaining your appointments, blogs, and reviews.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredThemes.map((t) => (
          <div
            key={t.id}
            className="group rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-2xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                {t.isPremium ? (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow flex items-center gap-1">
                    <StarIcon filled className="w-3 h-3 text-slate-950" />
                    PREMIUM
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-white/10 text-white font-bold text-[10px] uppercase">
                    INCLUDED
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">{t.name}</h3>
                  <span className="text-[11px] text-indigo-400 font-mono font-semibold uppercase">
                    {t.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>

                {/* Color Palette & Font */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {t.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{t.font}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex items-center gap-2">
              <a
                href="/sites/alex-design"
                target="_blank"
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1 border border-white/10 transition-all"
              >
                <span>Live Demo</span>
                <ExternalLinkIcon className="w-3 h-3 text-pink-400" />
              </a>

              <Link
                href="/builder/d0000000-0000-0000-0000-000000000001"
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center shadow-md shadow-indigo-600/25 transition-all"
              >
                Use in Studio
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
