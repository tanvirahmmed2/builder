'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BiBell,
  BiCalendar,
  BiArrowBack,
  BiRightArrowAlt,
  BiLoaderAlt,
  BiCheckCircle,
} from 'react-icons/bi';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        setLoading(true);
        const res = await fetch('/api/updates');
        const data = await res.json();
        if (data.success && Array.isArray(data.updates)) {
          setUpdates(data.updates);
        }
      } catch (err) {
        console.error('Failed to load updates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUpdates();
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <BiBell className="text-base" />
            <span>Changelog & Releases</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Product Updates
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Follow our journey as we continuously enhance the portfolio builder. Discover our latest feature releases, performance boosts, and design studio tools.
          </p>
        </div>

        {/* Updates Feed */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <BiLoaderAlt className="animate-spin text-3xl text-emerald-600" />
            <p className="text-xs text-slate-500 font-medium">Fetching recent release logs...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <BiBell />
            </div>
            <h3 className="text-base font-bold text-slate-800">No updates announced yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Stay tuned! Exciting features and platform upgrades will be announced here soon.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-10">
            {updates.map((item) => {
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[31px] sm:-left-[47px] top-6 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white border-2 border-emerald-600 group-hover:scale-125 transition-transform" />

                  {/* Card Content */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <BiCalendar className="text-emerald-600 text-base" />
                        <span>{formattedDate}</span>
                      </div>
                      <span className="text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Release
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4 group-hover:text-emerald-700 transition-colors">
                      <Link href={`/updates/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h2>

                    {/* Excerpt formatted from TipTap HTML */}
                    <div
                      className="prose prose-sm prose-slate max-w-none text-slate-600 line-clamp-3 mb-6"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/updates/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors group/link"
                      >
                        <span>Read complete update</span>
                        <BiRightArrowAlt className="text-base group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
