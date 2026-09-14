'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import TenantForm from '@/components/admin/forms/TenantForm';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=tenant');
      const data = await res.json();
      if (data.success) {
        setTenants(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <AdminTableLayout
      title="Tenant Portfolio Sites"
      subtitle="Multi-tenant containers, custom domains, storage usage, and published sites."
      badgeText="Tenant"
      badgeColor="secondary"
      tableName="tenant"
      records={tenants}
      loading={loading}
      onRefresh={fetchTenants}
      FormComponent={TenantForm}
      searchPlaceholder="Search tenants by name, subdomain, or domain..."
      filterPredicate={(t, q) =>
        t.name?.toLowerCase().includes(q) ||
        t.subdomain?.toLowerCase().includes(q) ||
        t.custom_domain?.toLowerCase().includes(q) ||
        String(t.creator_id).includes(q)
      }
      columns={['ID', 'Tenant Space', 'Subdomain', 'Custom Domain', 'Storage', 'Status', 'Published']}
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
