'use client';

import { use, useEffect, useState } from 'react';
import WebsiteBlogs from '@/components/website/cards/WebsiteBlogs';
import { BiLoaderAlt, BiBookOpen, BiSearch } from 'react-icons/bi';

export default function PublicBlogsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Articles...</p>
      </div>
    );
  }

  const { website, blogs = [] } = data || {};
  const primaryColor = website?.settings?.primary_color || '#6366f1';

  const filtered = blogs.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span
          className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white inline-block"
          style={{ backgroundColor: primaryColor }}
        >
          Insights & Publications
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Articles, Stories & Guides
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Read the latest writeups, tutorials, and thought pieces from {website?.name || 'Creator'}.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
        <input
          type="text"
          placeholder="Search articles by title or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Blog Cards */}
      <WebsiteBlogs
        blogs={filtered}
        primaryColor={primaryColor}
      />
    </div>
  );
}
