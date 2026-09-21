'use client';

import { useState } from 'react';
import { BiCalendar, BiRightArrowAlt, BiShow, BiX } from 'react-icons/bi';

export default function WebsiteBlogs({ blogs = [], primaryColor = '#6366f1' }) {
  const [activeArticle, setActiveArticle] = useState(null);

  if (!blogs || blogs.length === 0) return null;

  return (
    <section id="blogs" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Insights & Engineering
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Latest Articles & Blog Posts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Deep-dives into software architecture, scalable web technologies, and lessons learned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <article
              key={b.id}
              onClick={() => setActiveArticle(b)}
              className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <BiCalendar />
                    <span>{new Date(b.published_at || b.created_at).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <BiShow />
                    <span>{b.views_count || 1} views</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                  {b.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {b.excerpt || b.content?.replace(/<[^>]+>/g, '').slice(0, 140)}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                <span
                  className="text-xs font-bold flex items-center gap-1 group-hover:underline"
                  style={{ color: primaryColor }}
                >
                  <span>Read Article</span>
                  <BiRightArrowAlt className="text-base group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Published Article
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeArticle.title}
                </h2>
                <span className="text-xs text-slate-500 block">
                  {new Date(activeArticle.published_at || activeArticle.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <BiX className="text-2xl" />
              </button>
            </div>

            <div
              className="prose dark:prose-invert text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: activeArticle.content }}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-full text-xs font-bold text-white cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
