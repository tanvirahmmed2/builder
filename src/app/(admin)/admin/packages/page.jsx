'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import PackageForm from '@/components/admin/forms/PackageForm';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <AdminTableLayout
      title="Platform Packages & Plans"
      subtitle="Configure SaaS subscription plans, quota tiers, and billing frequencies."
      badgeText="Package"
      badgeColor="primary"
      tableName="packages"
      records={packages}
      loading={loading}
      onRefresh={fetchPackages}
      FormComponent={PackageForm}
      searchPlaceholder="Search packages by name, slug, or price..."
      filterPredicate={(pkg, q) =>
        pkg.name?.toLowerCase().includes(q) ||
        pkg.slug?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)
      }
      columns={['ID', 'Tier Name', 'Price', 'Interval', 'Max Portfolios', 'Status', 'Created At']}
      renderRow={(pkg) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{pkg.id}</td>
          <td className="px-4 py-3">
            <div className="font-bold text-slate-800">{pkg.name}</div>
            <div className="font-mono text-[11px] text-slate-400">{pkg.slug}</div>
          </td>
          <td className="px-4 py-3 font-bold text-slate-900">
            ${((pkg.price_in_cents || 0) / 100).toFixed(2)} {pkg.currency || 'USD'}
          </td>
          <td className="px-4 py-3">
            <span className="text-[11px] font-semibold text-slate-600 uppercase">
              {pkg.billing_interval || 'MONTHLY'}
            </span>
          </td>
          <td className="px-4 py-3 font-semibold text-slate-700">
            {pkg.max_portfolios} {pkg.max_portfolios === 1 ? 'Site' : 'Sites'}
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pkg.is_active !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {pkg.is_active !== false ? 'Active' : 'Disabled'}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
