'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, BoxIcon, StarIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Modern');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isPremium, setIsPremium] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setThemes(data.themes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_theme',
          themeData: {
            name,
            category,
            description,
            previewImage: previewImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
            themeConfig: {
              primaryColor,
              backgroundColor: '#090d16',
              textColor: '#f8fafc',
              fontFamily,
            },
            isPremium,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName('');
        setDescription('');
        setPreviewImage('');
        fetchThemes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (themeId) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_theme', themeId }),
      });
      fetchThemes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (themeId) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_theme', themeId }),
      });
      fetchThemes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <Link href="/admin" className="hover:underline">← Admin Overview</Link>
            <span>/</span>
            <span>Design Presets</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <BoxIcon className="w-6 h-6 text-rose-500" />
            <span>Theme & Template Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create, moderate, and publish visual design system presets for multi-tenant portfolios.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all self-start"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Theme</span>
        </button>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading themes...
          </div>
        ) : themes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No themes found. Add your first theme above.
          </div>
        ) : (
          themes.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] relative bg-slate-950 overflow-hidden">
                  <img
                    src={t.previewImage}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {t.isPremium && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1">
                        <StarIcon filled className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {t.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{t.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <button
                  onClick={() => handleToggle(t.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    t.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {t.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Theme Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Add New Theme Preset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Theme Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quartz Ultra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Modern">Modern</option>
                    <option value="Dark Mode">Dark Mode</option>
                    <option value="Creative">Creative</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-white/10 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preview Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Aesthetic notes and target creators..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrem"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded bg-slate-950 border-white/10 text-rose-600 focus:ring-0"
                />
                <label htmlFor="isPrem" className="text-xs text-slate-300 cursor-pointer">
                  Require Pro Studio or Enterprise tier (Premium Theme)
                </label>
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
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  {saving ? 'Publishing...' : 'Save Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
