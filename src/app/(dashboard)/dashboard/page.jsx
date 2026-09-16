'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGridIcon,
  BoxIcon,
  UsersIcon,
  MessageSquareIcon,
  StarIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from '@/components/ui/Icons';

export default function CreatorDashboardOverview() {
  const [data, setData] = useState({
    creator: null,
    portfolio: null,
    creators: [],
    blogs: [],
    appointments: [],
    experiences: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/creator')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  const portfolio = data.portfolio || {
    id: 'd0000000-0000-0000-0000-000000000001',
    title: 'Alex Vance – Design Architect',
    subdomain: 'alex-design',
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-8 rounded-3xl border border-white/10 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Website Portal
              </span>
              <span className="text-xs text-slate-400">
                Subdomain: <strong className="text-white font-mono">{portfolio.subdomain}.platform</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{portfolio.title}</h1>
            <p className="text-xs text-slate-400">
              Creators and Managers can update every module of this site and adjust layout in the visual drag-drop builder.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/sites/${portfolio.subdomain}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Live Site</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>

            <Link
              href={`/builder/${portfolio.id}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
            >
              <BoxIcon className="w-4 h-4" />
              <span>Launch Canvas Builder</span>
            </Link>
          </div>
        </div>

        {/* Modular Task Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Portfolio Modules & Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog */}
            <Link
              href="/dashboard/blog"
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BoxIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">{data.blogs.length} Posts</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-indigo-300">Blog & Case Studies</h3>
              <p className="text-xs text-slate-400">
                Publish long-form technical write-ups and project deep dives with instant public rendering.
              </p>
              <span className="text-xs font-bold text-indigo-400 pt-1 block">Manage Articles →</span>
            </Link>

            {/* Appointments */}
            <Link
              href="/dashboard/appointments"
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <LayoutGridIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">{data.appointments.length} Bookings</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-purple-300">Appointment Bookings</h3>
              <p className="text-xs text-slate-400">
                Confirm, review, or reschedule strategy sessions requested by prospective clients.
              </p>
              <span className="text-xs font-bold text-purple-400 pt-1 block">Manage Appointments →</span>
            </Link>

            {/* Experience */}
            <Link
              href="/dashboard/experiences"
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">{data.experiences.length} Positions</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-300">Experience Timeline</h3>
              <p className="text-xs text-slate-400">
                Maintain your professional roadmap, companies, roles, and major engineering accomplishments.
              </p>
              <span className="text-xs font-bold text-amber-400 pt-1 block">Manage Experiences →</span>
            </Link>

            {/* Reviews */}
            <Link
              href="/dashboard/reviews"
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-pink-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <StarIcon className="w-5 h-5" filled />
                </div>
                <span className="text-xs font-bold text-slate-400">{data.reviews.length} Reviews</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-pink-300">Client Reviews</h3>
              <p className="text-xs text-slate-400">
                Moderate 1-5 star ratings and testimonials submitted by website visitors.
              </p>
              <span className="text-xs font-bold text-pink-400 pt-1 block">Moderate Reviews →</span>
            </Link>

            {/* Team Roles */}
            <Link
              href="/dashboard/team"
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">{data.creators.length} Members</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-300">Team & Roles</h3>
              <p className="text-xs text-slate-400">
                Creator and Manager roles can both manage every module of the portfolio website.
              </p>
              <span className="text-xs font-bold text-emerald-400 pt-1 block">Manage Team & Roles →</span>
            </Link>

            {/* Visual Canvas Builder */}
            <Link
              href={`/builder/${portfolio.id}`}
              className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center">
                  <BoxIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Live Editor</span>
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-indigo-300">Drag & Drop Canvas</h3>
              <p className="text-xs text-slate-400">
                Visual reordering, style adjustments, device viewports, and instant 1-click publishing.
              </p>
              <span className="text-xs font-bold text-indigo-400 pt-1 block">Open Builder →</span>
            </Link>
          </div>
      </div>
    </div>
  );
}
