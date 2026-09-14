'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import ThemeForm from '@/components/admin/forms/ThemeForm';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=themes');
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

  return (
    <AdminTableLayout
      title="Platform Themes & Templates"
      subtitle="Gallery of pre-styled portfolio builder themes, layouts, and typography presets."
      badgeText="Theme"
      badgeColor="secondary"
      tableName="themes"
      records={themes}
      loading={loading}
      onRefresh={fetchThemes}
      FormComponent={ThemeForm}
      searchPlaceholder="Search themes by name, slug, or category..."
      filterPredicate={(t, q) =>
        t.name?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      }
      columns={['ID', 'Preview', 'Theme Name', 'Category', 'Tier Access', 'Status', 'Created Date']}
      renderRow={(t) => (
        <>
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
            <div className="font-bold text-slate-800">{t.name}</div>
            <div className="font-mono text-[11px] text-slate-400">/{t.slug}</div>
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
        </>
      )}
    />
  );
}
