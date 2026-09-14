'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import PackageFeatureForm from '@/components/admin/forms/PackageFeatureForm';

export default function AdminPackagesFeaturesPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=packages_feature');
      const data = await res.json();
      if (data.success) {
        setLinks(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <AdminTableLayout
      title="Packages Feature Mapping"
      subtitle="Matrix connecting feature capabilities to corresponding SaaS packages."
      badgeText="Package Feature"
      badgeColor="primary"
      tableName="packages_feature"
      records={links}
      loading={loading}
      onRefresh={fetchLinks}
      FormComponent={PackageFeatureForm}
      searchPlaceholder="Search by package ID or feature ID..."
      filterPredicate={(link, q) =>
        String(link.package_id).includes(q) ||
        String(link.feature_id).includes(q) ||
        link.value?.toLowerCase().includes(q)
      }
      columns={['ID', 'Package ID', 'Feature ID', 'Configuration Value', 'Status', 'Linked Date']}
      renderRow={(link) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{link.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">Package #{link.package_id}</td>
          <td className="px-4 py-3 font-bold text-slate-700">Feature #{link.feature_id}</td>
          <td className="px-4 py-3 font-mono text-slate-600">
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              {link.value}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                link.is_enabled !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {link.is_enabled !== false ? 'Enabled' : 'Disabled'}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {link.created_at ? new Date(link.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
