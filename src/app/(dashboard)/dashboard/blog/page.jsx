'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@/components/ui/Icons';

export default function DashboardBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creator');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_blog',
          blogData: {
            portfolioId: 'd0000000-0000-0000-0000-000000000001',
            title,
            summary,
            content,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setTitle('');
        setSummary('');
        setContent('');
        fetchBlogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_blog', id }),
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="text-indigo-400 hover:underline">← Dashboard</Link>
            <span>/</span>
            <span>Modules</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
            <div>
              <h1 className="text-2xl font-bold text-white">Blog & Case Studies Module</h1>
              <p className="text-xs text-slate-400">
                Creators and Managers can publish long-form architectural breakdowns, case studies, and news.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all self-start"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Write Blog Post</span>
            </button>
          </div>
        </div>

        {/* Blog Post Cards */}
        <div className="space-y-4">
          {blogs.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20">Published</span>
                  <span className="text-slate-500 font-mono">/blog/{b.slug}</span>
                </div>
                <h3 className="text-lg font-bold text-white pt-1">{b.title}</h3>
                <p className="text-xs text-slate-300">{b.summary}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Published: {new Date(b.publishedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(b.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      {/* CREATE BLOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create Blog Post</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaling Distributed Canvas Engines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief synopsis for readers..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Article Body</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detailed case study and insights..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
