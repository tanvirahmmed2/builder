'use client';

import Link from 'next/link';
import { BoxIcon, ShieldCheckIcon, StarIcon, LayoutGridIcon } from '@/components/ui/Icons';

export default function HeroSection() {
  return (
    <section className="text-center space-y-6 pt-6 pb-12">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Multi-Tenant Drag & Drop Portfolio Builder SaaS</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
        Craft Stunning Creator Sites With{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Real-Time Drag & Drop
        </span>
      </h1>

      <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Complete multi-tenant SaaS platform featuring built-in <strong>Blogging</strong>,{' '}
        <strong>Appointment Booking</strong>, <strong>Experience Timelines</strong>, and verified{' '}
        <strong>Client Reviews</strong>.
      </p>

      {/* Action CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link
          href="/creator/register"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white text-sm font-bold shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
        >
          Get Started as Creator →
        </Link>
        <Link
          href="/admin/login"
          className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-sm font-semibold transition-all hover:border-white/20"
        >
          Super Admin Login
        </Link>
        <Link
          href="/sites/alex-design"
          target="_blank"
          className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
        >
          Live Demo Site
        </Link>
      </div>
    </section>
  );
}
