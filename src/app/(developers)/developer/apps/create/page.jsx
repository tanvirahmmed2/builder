'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiArrowBack, BiGridAlt, BiLoaderAlt, BiCheckCircle } from 'react-icons/bi';

export default function CreateAppPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('App title is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/developer/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.record) {
        router.push(`/developer/apps/${data.record.slug || formData.slug}`);
      } else {
        setError(data.error || 'Failed to create application.');
      }
    } catch (err) {
      setError(err.message || 'Network error creating app.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/developer" className="hover:text-secondary">Dashboard</Link>
            <span>/</span>
            <Link href="/developer/apps" className="hover:text-secondary">Ecosystem Apps</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Create</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl">
              <BiGridAlt />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                New Ecosystem App
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Register a new modular application or vertical solution for creators and websites.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/developer/apps"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer w-fit"
        >
          <BiArrowBack className="text-base" />
          <span>Back to Apps</span>
        </Link>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              App Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Portfolio Pro, Storefront Plus"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="portfolio-pro"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Short Tagline / Summary
          </label>
          <input
            type="text"
            placeholder="A single sentence describing the core value of this app..."
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Description &amp; Features
          </label>
          <textarea
            rows={6}
            placeholder="Comprehensive description of tools, integrations, and capabilities..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-medium leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
          />
          <label htmlFor="is_published" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            Publish Immediately to Marketplace
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/developer/apps"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiCheckCircle className="text-base" />}
            <span>Save &amp; Open Workspace</span>
          </button>
        </div>
      </form>
    </div>
  );
}
