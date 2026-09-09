'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  BoxIcon,
  LayoutGridIcon,
  UsersIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from '@/components/ui/Icons';

export default function AboutPage() {
  const pillars = [
    {
      icon: BoxIcon,
      title: 'Multi-Tenant Isolation',
      desc: 'Architected with dedicated tenant routing and PostgreSQL relational guarantees. Every creator portfolio functions as an isolated digital entity.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: LayoutGridIcon,
      title: 'Real-Time Visual Studio',
      desc: 'Optimistic UI state reconciliations ensure drag-and-drop section adjustments feel fluid, instantaneous, and zero-latency.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: UsersIcon,
      title: 'Creator & Manager Delegation',
      desc: 'Built for collaborative growth. Independent creators can assign verified managers with fine-grained permissions to maintain their portfolios.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Trust & Security',
      desc: 'Role-based access control, PostgreSQL row-level security readiness, spam moderation pipelines, and end-to-end SSL edge delivery.',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const milestones = [
    { year: '2024', title: 'The Multi-Tenant Vision', desc: 'Conceptualized to eliminate monolithic website builders with isolated tenant architectures.' },
    { year: '2025', title: 'Real-Time Canvas Engine', desc: 'Shipped drag-and-drop studio with native appointment scheduling and verified testimonial engines.' },
    { year: '2026', title: 'Global Scale & Ecosystem', desc: 'Over 10,000+ creators, designers, and software engineers hosting their digital homes.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>Architected for the Modern Creator Economy</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Empowering Creators with High-Performance Multi-Tenant Portfolios
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          PortfolioCraft is engineered from the ground up for software architects, digital designers, and creative directors who demand high aesthetic standards, relational data integrity, and collaborative management.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all hover:translate-y-[-2px] space-y-3 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-base">{pillar.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
              <div className="pt-2 text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>Production Ready</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Journey */}
      <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Engineering Roadmap</h2>
          <p className="text-xs text-slate-400">
            From single-tenant prototypes to a scalable SaaS ecosystem supporting thousands of independent subdomains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {milestones.map((m, idx) => (
            <div key={idx} className="space-y-3 p-6 rounded-2xl bg-slate-950/70 border border-white/5 relative">
              <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-mono">
                {m.year}
              </span>
              <h4 className="font-bold text-white text-sm">{m.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Bar */}
      <div className="text-center rounded-3xl bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 p-10 space-y-6 shadow-2xl">
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ready to experience the next evolution in portfolio creation?
        </h3>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Sign up today, choose your package, and deploy your custom-branded portfolio with live appointment bookings and verified testimonials.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/packages"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
          >
            Explore Pricing & Packages →
          </Link>
          <Link
            href="/themes"
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
          >
            Browse Themes Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
