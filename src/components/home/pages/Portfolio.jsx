'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiBriefcase,
  BiRightArrowAlt,
  BiCalendarEvent,
  BiStar,
  BiLinkExternal,
  BiCheckCircle,
  BiPalette,
} from 'react-icons/bi';

const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    category: 'design',
    categoryLabel: 'Design & Brand',
    title: 'Aura Interactive Brand System',
    author: 'Elena Rostova',
    role: 'Brand & Creative Director',
    metric: '+142% Brand Engagement',
    tags: ['Brand Identity', '3D Motion', 'Design Systems'],
    gradient: 'from-purple-600 via-pink-600 to-indigo-600',
  },
  {
    id: 2,
    category: 'engineering',
    categoryLabel: 'Engineering',
    title: 'HyperScale Cloud Platform',
    author: 'Marcus Vance',
    role: 'Lead Systems Architect',
    metric: '99.999% SLA Uptime',
    tags: ['Next.js 16', 'Distributed Systems', 'PostgreSQL'],
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
  },
  {
    id: 3,
    category: 'photography',
    categoryLabel: 'Photography',
    title: 'Vogue & Architectural Monochrome',
    author: 'Sofia Lindqvist',
    role: 'Editorial Photographer',
    metric: '2.4M Impressions',
    tags: ['Editorial Gallery', 'Client Proofing', 'Prints'],
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
  },
  {
    id: 4,
    category: 'agency',
    categoryLabel: 'Agency & Studio',
    title: 'Nexus Kinetic Creative Studio',
    author: 'Nexus Collective',
    role: 'Digital Innovation Agency',
    metric: '$4.2M Pipeline Generated',
    tags: ['Websites', 'Commercial Campaigns', 'Creative Dev'],
    gradient: 'from-emerald-500 via-teal-600 to-blue-600',
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProjects =
    activeCategory === 'all'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold uppercase tracking-wider">
            <BiBriefcase className="text-purple-500 text-sm" />
            <span>Showcase &amp; Case Studies</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Curate show-stopping portfolios that win high-value clients
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Stand out in crowded markets with magazine-grade project showcases, integrated appointment scheduling, client testimonials, and one-click contact forms.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {[
              { id: 'all', label: 'All Portfolios' },
              { id: 'design', label: 'Design & Brand' },
              { id: 'engineering', label: 'Engineering & Tech' },
              { id: 'photography', label: 'Photography' },
              { id: 'agency', label: 'Agency & Studio' },
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

        {/* Portfolio Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Banner / Visual Preview */}
              <div className={`h-48 sm:h-56 bg-linear-to-br ${project.gradient} p-6 flex flex-col justify-between relative overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                    {project.categoryLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {project.metric}
                  </span>
                </div>

                <div className="z-10 space-y-1">
                  <span className="text-[11px] font-semibold text-white/80 block">{project.author} &bull; {project.role}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                    {project.title}
                  </h3>
                </div>

                {/* Subtle Decorative Pattern Circles */}
                <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
              </div>

              {/* Card Details & Tags */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Includes responsive layout, integrated discovery call scheduling widget, high-resolution media gallery, and custom domain setup.
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link
                    href="/themes"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <span>Inspect Case Study</span>
                    <BiLinkExternal className="text-sm" />
                  </Link>

                  <Link
                    href="/creator/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Use this Template</span>
                    <BiRightArrowAlt className="text-base" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Banner: Integrated Appointments for Portfolios */}
        <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
              <BiCalendarEvent className="text-purple-300 text-sm" />
              <span>Built-in Scheduling</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Clients Book Directly from Your Portfolio</h3>
            <p className="text-xs text-purple-200 max-w-xl">
              Eliminate back-and-forth emails. Synchronize appointment availability, collect discovery call info, and send automated calendar invites right out of the box.
            </p>
          </div>

          <Link
            href="/creator/login"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-purple-50 font-bold text-xs shadow-lg transition-all"
          >
            <span>Start Building Your Portfolio</span>
            <BiRightArrowAlt className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}