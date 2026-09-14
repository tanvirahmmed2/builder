'use client';

import { useState } from 'react';
import { BiFile, BiCheck, BiX } from 'react-icons/bi';

export default function BlogForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image: '',
    is_published: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'blogs',
          data: { ...formData, slug },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ title: '', slug: '', summary: '', content: '', cover_image: '', is_published: true });
        if (onSuccess) onSuccess(data.record);
      } else {
        setError(data.error || 'Failed to create blog post');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BiFile className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Publish Platform Blog Article</h3>
            <p className="text-xs text-slate-500">Create authoritative guides, news, and release notes for creators.</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <BiX className="text-xl" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Title</label>
            <input
              type="text"
              required
              placeholder="e.g. 10 Portfolio Trends Dominating 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL identifier)</label>
            <input
              type="text"
              placeholder="e.g. 10-portfolio-trends-2026 (auto-generated if empty)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Brief Summary</label>
          <textarea
            rows={2}
            placeholder="Short hook for card previews and social snippets..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Article Body Content</label>
          <textarea
            rows={4}
            required
            placeholder="Write full article content (Markdown supported)..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_published"
            checked={formData.is_published}
            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
          />
          <label htmlFor="is_published" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Publish immediately (live for visitors)
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-900 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <BiCheck className="text-base" />
            <span>{loading ? 'Publishing...' : 'Save Blog Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
