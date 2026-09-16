'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import WebsiteForm from '@/components/admin/forms/WebsiteForm';

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=websites');
      const data = await res.json();
      if (data.success) {
        setWebsites(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return (
    <AdminTableLayout
      title="Website Portfolio Sites"
      subtitle="Multi-website containers, custom domains, storage usage, and published sites."
      badgeText="Websites"
      badgeColor="secondary"
      tableName="websites"
      records={websites}
      loading={loading}
      onRefresh={fetchWebsites}
      FormComponent={WebsiteForm}
      searchPlaceholder="Search websites by name, subdomain, or domain..."
      filterPredicate={(t, q) =>
        t.name?.toLowerCase().includes(q) ||
        t.subdomain?.toLowerCase().includes(q) ||
        t.custom_domain?.toLowerCase().includes(q) ||
        String(t.creator_id).includes(q)
      }
      columns={['ID', 'Website Space', 'Subdomain', 'Custom Domain', 'Storage', 'Status', 'Published']}
      renderRow={(t) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{t.id}</td>
          <td className="px-4 py-3">
            <div className="font-bold text-slate-800">{t.name}</div>
            <div className="text-[11px] text-slate-400">Creator #{t.creator_id}</div>
          </td>
          <td className="px-4 py-3 font-mono text-slate-700">
            <span className="text-secondary font-semibold">{t.subdomain}</span>.portfoliobuilder.app
          </td>
          <td className="px-4 py-3 font-mono text-slate-600">{t.custom_domain || '—'}</td>
          <td className="px-4 py-3 text-slate-600 font-medium">{t.storage_used_mb || 0} MB</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                t.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {t.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                t.is_published !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {t.is_published !== false ? 'Live' : 'Draft'}
            </span>
          </td>
        </>
      )}
    />
  );
}
