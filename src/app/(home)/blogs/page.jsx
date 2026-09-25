'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BiSearch,
  BiBookOpen,
  BiCalendar,
  BiUser,
  BiImage,
  BiRocket,
  BiRightArrowAlt,
  BiLoaderAlt,
  BiRefresh,
} from 'react-icons/bi';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else {
        setError(data.error || 'Failed to load blog articles.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching blog articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setError(data.error || 'Failed to load blog articles.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error fetching blog articles.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (blog.title || '').toLowerCase().includes(q) ||
      (blog.summary || '').toLowerCase().includes(q) ||
      (blog.author_name || '').toLowerCase().includes(q) ||
      (blog.app_title || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50/60 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-20 px-4 lg:px-8 border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <BiBookOpen className="text-sm text-secondary" />
            <span>Articles, Guides &amp; Insights</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            The Creator &amp; Builder{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-light via-primary to-secondary">
              Knowledge Hub
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            In-depth tutorials, product playbooks, design system trends, and ecosystem announcements curated for web professionals.
          </p>

          {/* Search Bar */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search articles by title, topic, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all shadow-lg backdrop-blur-md"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-md bg-white/10 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BiBookOpen className="text-primary text-2xl" /> Latest Articles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredBlogs.length} published article{filteredBlogs.length === 1 ? '' : 's'}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <BiRefresh className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchBlogs}
              className="text-rose-600 hover:underline font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="aspect-16/10 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-full" />
                <div className="h-3 bg-slate-100 rounded-md w-4/5" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center my-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto mb-4">
              <BiBookOpen />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchTerm ? 'No Matching Articles' : 'No Published Articles Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {searchTerm
                ? `No articles matched "${searchTerm}". Try searching for another topic or keyword.`
                : 'Articles published in the developer dashboard will appear here.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Blogs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredBlogs.map((blog) => {
              const imageCount = Array.isArray(blog.images) ? blog.images.length : 0;
              const dateStr = blog.published_at
                ? new Date(blog.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <article
                  key={blog.id}
                  className="group bg-white border border-slate-200 hover:border-secondary/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <Link href={`/blogs/${blog.slug}`} className="block relative aspect-16/10 overflow-hidden bg-slate-100">
                      {blog.cover_image ? (
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/600x400/f1f5f9/94a3b8?text=Article+Cover';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <BiBookOpen className="text-4xl" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {blog.app_title ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-900/80 text-indigo-200 backdrop-blur-md border border-indigo-500/30">
                            <BiRocket className="text-xs" /> {blog.app_title}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-200 backdrop-blur-md border border-white/10">
                            <BiBookOpen className="text-xs text-primary" /> Guide
                          </span>
                        )}

                        {imageCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                            <BiImage className="text-xs" /> {imageCount}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {dateStr && (
                          <span className="flex items-center gap-1">
                            <BiCalendar className="text-sm" />
                            {dateStr}
                          </span>
                        )}
                        {blog.author_name && (
                          <span className="flex items-center gap-1">
                            <BiUser className="text-sm" />
                            {blog.author_name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-secondary transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h3>

                      {blog.summary && (
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {blog.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                      /{blog.slug}
                    </span>

                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-secondary hover:text-secondary-dark transition-colors cursor-pointer"
                    >
                      <span>Read Article</span>
                      <BiRightArrowAlt className="text-base transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Newsletter / CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 mt-20">
        <div className="bg-linear-to-r from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">
              Stay ahead with platform updates &amp; strategies
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Launch your portfolio today and discover modern builder techniques designed to grow your audience.
            </p>
          </div>
          <Link
            href="/creator/login"
            className="px-6 py-3.5 rounded-2xl bg-secondary hover:bg-secondary-dark text-white font-bold text-sm shadow-xl flex items-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
          >
            <span>Start Building Free</span>
            <BiRightArrowAlt className="text-lg" />
          </Link>
        </div>
      </section>
    </main>
  );
}
