'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import FeatureForm from '@/components/admin/forms/FeatureForm';

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/feature');
      const data = await res.json();
      if (data.success) {
        setFeatures(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return (
    <AdminTableLayout
      title="Platform Features"
      subtitle="Catalog of modular builder capabilities that can be bundled into packages."
      badgeText="Feature"
      badgeColor="secondary"
      tableName="feature"
      apiEndpoint="/api/admin/feature"
      records={features}
      loading={loading}
      onRefresh={fetchFeatures}
      FormComponent={FeatureForm}
      searchPlaceholder="Search features by name or key..."
      filterPredicate={(feat, q) =>
        feat.name?.toLowerCase().includes(q) ||
        feat.key?.toLowerCase().includes(q) ||
        feat.description?.toLowerCase().includes(q)
      }
      columns={['ID', 'Feature Name', 'Key Identifier', 'Description', 'Created At']}
      renderRow={(feat) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{feat.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">{feat.name}</td>
          <td className="px-4 py-3 font-mono text-slate-600">
            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              {feat.key}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-600 max-w-sm truncate">{feat.description || '—'}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {feat.created_at ? new Date(feat.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
