'use client';

import { useState } from 'react';
import { BiPalette } from 'react-icons/bi';
import Theme from '@/components/home/cards/Theme';

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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight">
          Portfolio Themes &amp; Visual Systems
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select from meticulously crafted design presets. Switch themes with 1-click in the drag-and-drop studio while retaining your appointments, blogs, and reviews.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-secondary text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredThemes.map((t) => (
          <Theme key={t.id} theme={t} />
        ))}
      </div>
    </div>
  );
}
