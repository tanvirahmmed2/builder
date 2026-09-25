'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiSearch, BiPlus, BiTrash, BiRefresh, BiEdit, BiLoaderAlt } from 'react-icons/bi';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreateDefaultTheme = async () => {
    if (creating) return;
    try {
      setCreating(true);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch('/api/developer/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Untitled Theme',
          title: 'Untitled Theme',
          slug: `untitled-theme-${randomSuffix}`,
          category: 'Modern',
          is_active: false,
          is_premium: false,
        }),
      });
      const data = await res.json();
      if (data.success && data.record?.slug) {
        router.push(`/developer/themes/${data.record.slug}`);
      } else {
        alert(data.error || 'Failed to create theme.');
        setCreating(false);
      }
    } catch (e) {
      alert(e.message || 'Error creating theme.');
      setCreating(false);
    }
  };

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/themes');
      const data = await res.json();
      if (data.success) {
        setThemes(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/developer/themes?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchThemes();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = themes.filter((t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.slug?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Themes &amp; Templates</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Theme
            </span>
          </div>
          <p className="text-xs text-slate-500">Gallery of pre-styled portfolio builder themes, layouts, and typography presets.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchThemes}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh table data"
          >
            <BiRefresh className="text-lg" />
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={handleCreateDefaultTheme}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-secondary hover:bg-secondary-dark text-white cursor-pointer disabled:opacity-60"
            title="Create Theme"
          >
            {creating ? <BiLoaderAlt className="animate-spin text-base" /> : <BiPlus className="text-base" />}
            <span>{creating ? 'Creating...' : 'Create Theme'}</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search themes by name, slug, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {themes.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Preview</th>
                <th className="px-4 py-3 whitespace-nowrap">Theme Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Application</th>
                <th className="px-4 py-3 whitespace-nowrap">Category</th>
                <th className="px-4 py-3 whitespace-nowrap">Tier Access</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Created Date</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">Loading themes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">No themes found.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">#{t.id}</td>
                    <td className="px-4 py-3">
                      {t.preview_image ? (
                        <img
                          src={t.preview_image}
                          alt={t.name}
                          className="w-14 h-10 object-cover rounded-md border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/developer/themes/${t.slug}`}
                        className="font-bold text-slate-800 hover:text-secondary block truncate"
                        title="Open Theme Workspace"
                      >
                        {t.name}
                      </Link>
                      <div className="font-mono text-[11px] text-slate-400">/{t.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {t.app_title ? (
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {t.app_title}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">General</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {t.category || 'Modern'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.is_premium
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.is_premium ? '★ Premium Tier' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/developer/themes/${t.slug}`}
                          className="text-slate-400 hover:text-secondary p-1.5 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
                          title="Edit Theme in Workspace"
                        >
                          <BiEdit className="text-base" />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === t.id}
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <BiTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
