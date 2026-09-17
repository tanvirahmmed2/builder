'use client';

import { useState, useEffect } from 'react';
import { BiSearch, BiPlus, BiMinus, BiTrash, BiRefresh } from 'react-icons/bi';
import PackageForm from '@/components/developer/forms/PackageForm';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/packages');
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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/developer/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_record', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPackages();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = packages.filter((pkg) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      pkg.name?.toLowerCase().includes(q) ||
      pkg.slug?.toLowerCase().includes(q) ||
      pkg.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Packages &amp; Plans</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Package
            </span>
          </div>
          <p className="text-xs text-slate-500">Configure SaaS subscription plans, quota tiers, and billing frequencies.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPackages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh table data"
          >
            <BiRefresh className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showForm
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-secondary hover:bg-secondary-dark text-white'
            }`}
          >
            {showForm ? <BiMinus className="text-base" /> : <BiPlus className="text-base" />}
            <span>{showForm ? 'Hide Form' : 'Add Package'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <PackageForm
          apiEndpoint="/api/developer/packages"
          onSuccess={() => {
            setShowForm(false);
            fetchPackages();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search packages by name, slug, or price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {packages.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Tier Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Price</th>
                <th className="px-4 py-3 whitespace-nowrap">Interval</th>
                <th className="px-4 py-3 whitespace-nowrap">Max Portfolios</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Created At</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading packages...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No packages found.</td>
                </tr>
              ) : (
                filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pkg.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {pkg.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={deletingId === pkg.id}
                        onClick={() => handleDelete(pkg.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <BiTrash className="text-base" />
                      </button>
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
