'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BiBriefcase,
  BiBuilding,
  BiGlobe,
  BiUser,
  BiPalette,
  BiRightArrowAlt,
  BiCalendarEvent,
  BiLinkExternal,
  BiCheckCircle,
  BiTrendingUp,
  BiAward,
  BiLayer,
} from 'react-icons/bi';

const PORTFOLIO_PROJECTS = [
  // 1. Company
  {
    id: 1,
    category: 'company',
    categoryLabel: 'Company & Enterprise',
    categoryIcon: BiBuilding,
    title: 'HyperScale Cloud Systems',
    author: 'HyperScale Inc.',
    role: 'B2B Enterprise SaaS & Cloud Infra',
    metric: '$28M Pipeline Generated',
    description:
      'Enterprise corporate presence featuring investor relations, interactive system architecture diagrams, and an automated client inquiry funnel.',
    tags: ['Enterprise Cloud', 'Security Whitepapers', 'Client Portal', 'Multi-Region CDN'],
    gradient: 'from-slate-900 via-blue-950 to-indigo-950',
    stats: [
      { label: 'Monthly Visitors', value: '240k+' },
      { label: 'Conversion Rate', value: '6.4%' },
      { label: 'SLA Uptime', value: '99.99%' },
    ],
  },
  {
    id: 2,
    category: 'company',
    categoryLabel: 'Company & Enterprise',
    categoryIcon: BiBuilding,
    title: 'Apex Strategy Partners',
    author: 'Apex Global Advisory',
    role: 'Management & Financial Consulting',
    metric: '+185% Inbound RFPs',
    description:
      'Sophisticated corporate portfolio showcasing industry case studies, leadership governance, and a secure stakeholder data room.',
    tags: ['Corporate Governance', 'Executive Team', 'RFP System', 'Press & Media'],
    gradient: 'from-zinc-900 via-stone-900 to-slate-900',
    stats: [
      { label: 'Client Retention', value: '94%' },
      { label: 'Inbound RFPs', value: '185%' },
      { label: 'Global Offices', value: '12' },
    ],
  },

  // 2. Organization
  {
    id: 3,
    category: 'organization',
    categoryLabel: 'Organization & NGO',
    categoryIcon: BiGlobe,
    title: 'Horizon Conservation Foundation',
    author: 'Horizon NGO',
    role: 'Global Rainforest & Marine Alliance',
    metric: '$4.2M Donor Funds Raised',
    description:
      'Impact-driven portal with transparent fund allocation dashboards, automated recurring micro-donations, and field expedition journals.',
    tags: ['Donation Engine', 'Impact Telemetry', 'Annual Reports', 'Volunteer CRM'],
    gradient: 'from-teal-950 via-emerald-950 to-slate-950',
    stats: [
      { label: 'Active Supporters', value: '120k+' },
      { label: 'Fund Transparency', value: '100%' },
      { label: 'Active Grants', value: '42' },
    ],
  },
  {
    id: 4,
    category: 'organization',
    categoryLabel: 'Organization & NGO',
    categoryIcon: BiGlobe,
    title: 'Open Health Research Initiative',
    author: 'OpenHealth Consortium',
    role: 'Medical Open Data & Public Health',
    metric: '180+ Peer Reviewed Papers',
    description:
      'Academic and institutional portfolio organizing open clinical datasets, symposium registration, and global fellowship applications.',
    tags: ['Research Archive', 'Symposia Tickets', 'Public Datasets', 'Fellowship Intake'],
    gradient: 'from-sky-950 via-cyan-950 to-slate-950',
    stats: [
      { label: 'Fellow Researchers', value: '1,400+' },
      { label: 'Open Datasets', value: '85 TB' },
      { label: 'Partner Countries', value: '54' },
    ],
  },

  // 3. Personal
  {
    id: 5,
    category: 'personal',
    categoryLabel: 'Personal & Expert',
    categoryIcon: BiUser,
    title: 'Dr. Evelyn Vance',
    author: 'Evelyn Vance, Ph.D.',
    role: 'AI Ethics Fellow & Keynote Speaker',
    metric: '35k+ Newsletter Readers',
    description:
      'Personal thought leadership hub featuring published essays, media press kit, speaking engagement bookings, and podcast appearances.',
    tags: ['Keynote Booking', 'Substack Sync', 'Media Presskit', 'Consulting Retainers'],
    gradient: 'from-indigo-950 via-purple-950 to-slate-950',
    stats: [
      { label: 'Keynotes Delivered', value: '48+' },
      { label: 'Audience Rating', value: '5.0 / 5' },
      { label: 'Avg Speaking Fee', value: '$12.5k' },
    ],
  },
  {
    id: 6,
    category: 'personal',
    categoryLabel: 'Personal & Expert',
    categoryIcon: BiUser,
    title: 'Marcus Sterling',
    author: 'Marcus Sterling',
    role: 'Staff Systems Engineer & Open Source Author',
    metric: '22k+ GitHub Stars',
    description:
      'Technical personal portfolio with live interactive coding sandbox, tech stack benchmarks, technical writings, and mentorship booking.',
    tags: ['Next.js Architecture', 'Live Demo Lab', 'Mentorship Slots', 'GitHub Sponsors'],
    gradient: 'from-blue-950 via-slate-900 to-indigo-950',
    stats: [
      { label: 'Open Source Repos', value: '64' },
      { label: 'Sponsorship MRR', value: '$3.2k/mo' },
      { label: 'Article Reads', value: '180k' },
    ],
  },

  // 4. Creative
  {
    id: 7,
    category: 'creative',
    categoryLabel: 'Creative & Studio',
    categoryIcon: BiPalette,
    title: 'Kinetics Visual Direction',
    author: 'Elena & Lucas',
    role: '3D Motion Studio & Brand Architects',
    metric: 'Awwwards Site of the Year',
    description:
      'Stunning full-bleed portfolio with fluid WebGL interactions, interactive client project proofing, and a commercial reel cinema theater.',
    tags: ['3D WebGL', 'Commercial Motion', 'Brand Identity', 'Awwwards Winner'],
    gradient: 'from-purple-950 via-pink-950 to-rose-950',
    stats: [
      { label: 'Industry Awards', value: '14' },
      { label: 'Reel Impressions', value: '2.8M' },
      { label: 'Enterprise Clients', value: 'Fortune 100' },
    ],
  },
  {
    id: 8,
    category: 'creative',
    categoryLabel: 'Creative & Studio',
    categoryIcon: BiPalette,
    title: 'Vogue & Architectural Monochrome',
    author: 'Sofia Lindqvist',
    role: 'Editorial & Architectural Photographer',
    metric: '18 Magazine Covers',
    description:
      'High-definition editorial portfolio with private client proofing galleries, automated print ordering checkout, and license rights manager.',
    tags: ['High-Res Gallery', 'Print Store', 'Client Proofing', 'Licensing Engine'],
    gradient: 'from-amber-950 via-stone-900 to-neutral-950',
    stats: [
      { label: 'Solo Exhibitions', value: '26' },
      { label: 'Prints Sold', value: '1,240+' },
      { label: 'Avg Print Order', value: '$320' },
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Portfolios', icon: BiBriefcase },
  { id: 'company', label: 'Company', icon: BiBuilding },
  { id: 'organization', label: 'Organization', icon: BiGlobe },
  { id: 'personal', label: 'Personal', icon: BiUser },
  { id: 'creative', label: 'Creative', icon: BiPalette },
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
            Tailored portfolio architectures for every industry and scale
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Whether you are establishing an enterprise company presence, running an impact organization, highlighting your personal thought leadership, or curating creative client works.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count =
                cat.id === 'all'
                  ? PORTFOLIO_PROJECTS.length
                  : PORTFOLIO_PROJECTS.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-102'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeCategory === cat.id
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const CatIcon = project.categoryIcon || BiBriefcase;
            return (
              <div
                key={project.id}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Card Banner / Visual Preview */}
                <div
                  className={`h-52 sm:h-60 bg-linear-to-br ${project.gradient} p-6 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between z-10 gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
                      <CatIcon className="text-xs" />
                      <span>{project.categoryLabel}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                      {project.metric}
                    </span>
                  </div>

                  <div className="z-10 space-y-1">
                    <span className="text-[11px] font-semibold text-white/80 block">
                      {project.author} &bull; {project.role}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                      {project.title}
                    </h3>
                  </div>

                  {/* Subtle Decorative Pattern Circles */}
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
                </div>

                {/* Card Details, Stats & Tags */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Live Metric Stats Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                      {project.stats.map((s, idx) => (
                        <div key={idx} className="text-center">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                            {s.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[2.5rem]">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <Link
                      href="/themes"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>Explore Live Demo</span>
                      <BiLinkExternal className="text-sm" />
                    </Link>

                    <Link
                      href="/creator/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Use this Structure</span>
                      <BiRightArrowAlt className="text-base" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Banner: Integrated Operations by Portfolio Type */}
        <div className="rounded-3xl p-6 sm:p-8 bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
              <BiCalendarEvent className="text-purple-300 text-sm" />
              <span>Native Booking &amp; Lead Ingestion</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Turn Portfolio Visitors into Confirmed Clients</h3>
            <p className="text-xs text-purple-200 max-w-xl leading-relaxed">
              Every portfolio type includes automated discovery call booking, donation intakes, RFP request routing, or private client project proofing with zero external plugin subscription fees.
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