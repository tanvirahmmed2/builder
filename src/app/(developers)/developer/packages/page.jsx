'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BiSearch,
  BiPlus,
  BiMinus,
  BiTrash,
  BiRefresh,
  BiEdit,
  BiCube,
  BiCheckCircle,
  BiXCircle,
  BiDollarCircle,
  BiLayer,
  BiTrendingUp,
} from 'react-icons/bi';
import PackageForm from '@/components/developer/forms/PackageForm';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [intervalFilter, setIntervalFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.records || []);
      }
    } catch (e) {
      console.error('Failed to fetch packages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);


  
  const handleEditClick = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateClick = () => {
    setEditingPackage(null);
    setShowForm((prev) => !prev);
  };

  const handleToggleStatus = async (pkg) => {
    setTogglingId(pkg.id);
    try {
      const res = await fetch('/api/developer/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pkg.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages((prev) =>
          prev.map((item) => (item.id === pkg.id ? { ...item, is_active: !item.is_active } : item))
        );
        showFeedback(`Package "${pkg.name}" status updated.`);
      } else {
        alert(data.error || 'Failed to toggle status');
      }
    } catch (e) {
      console.error('Error toggling package status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete package "${name || `#${id}`}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch('/api/developer/packages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
        if (editingPackage?.id === id) {
          setEditingPackage(null);
          setShowForm(false);
        }
        showFeedback(`Package "${name}" was successfully deleted.`);
      } else {
        alert(data.error || 'Failed to delete package');
      }
    } catch (e) {
      console.error('Error deleting package:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        !searchTerm.trim() ||
        pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.app_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && pkg.is_active !== false) ||
        (statusFilter === 'DISABLED' && pkg.is_active === false);

      const matchesInterval =
        intervalFilter === 'ALL' ||
        (pkg.billing_interval || 'MONTHLY').toUpperCase() === intervalFilter;

      return matchesSearch && matchesStatus && matchesInterval;
    });
  }, [packages, searchTerm, statusFilter, intervalFilter]);

  // Statistics calculation
  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.is_active !== false).length;
  const avgMonthlyPrice =
    packages.length > 0
      ? (
          packages.reduce((acc, p) => acc + (p.price_in_cents || 0), 0) /
          packages.length /
          100
        ).toFixed(2)
      : '0.00';
  const highestMaxPortfolios = packages.reduce(
    (max, p) => Math.max(max, p.max_portfolios || 1),
    1
  );

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-fade-in">
          <BiCheckCircle className="text-emerald-400 text-base" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Platform Packages &amp; Plans
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Billing Tiers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, update, and govern SaaS subscription packages, pricing models, and website builder quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPackages}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            title="Refresh packages"
          >
            <BiRefresh className="text-xl" />
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showForm && !editingPackage
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-secondary hover:bg-secondary-dark text-white'
            }`}
          >
            {showForm && !editingPackage ? <BiMinus className="text-lg" /> : <BiPlus className="text-lg" />}
            <span>{showForm && !editingPackage ? 'Hide Form' : 'Add Package'}</span>
          </button>
        </div>
      </div>

      {/* Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Plans</span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <BiCube className="text-xl" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPackages}</div>
          <p className="text-[11px] text-slate-400 mt-1">Configured in database</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Tiers</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BiCheckCircle className="text-xl" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{activePackages}</div>
          <p className="text-[11px] text-slate-400 mt-1">Available for checkout</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Base Price</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BiDollarCircle className="text-xl" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">${avgMonthlyPrice}</div>
          <p className="text-[11px] text-slate-400 mt-1">Average per package</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Portfolios</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BiLayer className="text-xl" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{highestMaxPortfolios} Sites</div>
          <p className="text-[11px] text-slate-400 mt-1">Top tier allowance</p>
        </div>
      </div>

      {/* Package Form (Create or Edit) */}
      {showForm && (
        <PackageForm
          initialData={editingPackage}
          onSuccess={(savedPkg) => {
            showFeedback(
              editingPackage
                ? `Package "${savedPkg.name}" updated successfully.`
                : `Package "${savedPkg.name}" created successfully.`
            );
            setShowForm(false);
            setEditingPackage(null);
            fetchPackages();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingPackage(null);
          }}
        />
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search packages by name, slug, or ecosystem app..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>

            {/* Interval Filter */}
            <select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="ALL">All Intervals</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="LIFETIME">Lifetime</option>
            </select>

            <div className="text-xs text-slate-500 font-medium pl-2 hidden sm:block">
              <span className="font-bold text-slate-800">{filtered.length}</span> of {packages.length}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3.5 whitespace-nowrap">ID</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Package Tier</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Price &amp; Currency</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Interval</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Max Portfolios</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Ecosystem App</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Created</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading packages from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BiCube className="text-3xl text-slate-300" />
                      <span className="text-xs font-semibold">No packages found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((pkg) => {
                  const isRowActive = pkg.is_active !== false;
                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        editingPackage?.id === pkg.id ? 'bg-secondary/5' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-slate-500">#{pkg.id}</td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{pkg.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{pkg.slug}</div>
                        {pkg.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                            {pkg.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          ${((pkg.price_in_cents || 0) / 100).toFixed(2)}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">
                          {pkg.currency || 'USD'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider uppercase">
                          {pkg.billing_interval || 'MONTHLY'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {pkg.max_portfolios} {pkg.max_portfolios === 1 ? 'Site' : 'Sites'}
                        </div>
                        <div className="text-[10px] text-slate-400">Allowed limit</div>
                      </td>

                      <td className="px-5 py-4">
                        {pkg.app_title ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            <BiLayer className="text-xs" />
                            <span>{pkg.app_title}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Global Tier</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={togglingId === pkg.id}
                          onClick={() => handleToggleStatus(pkg)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            isRowActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {isRowActive ? (
                            <BiCheckCircle className="text-xs text-emerald-600" />
                          ) : (
                            <BiXCircle className="text-xs text-slate-400" />
                          )}
                          <span>{togglingId === pkg.id ? 'Updating...' : isRowActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditClick(pkg)}
                            className="p-1.5 text-slate-500 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit package"
                          >
                            <BiEdit className="text-base" />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === pkg.id}
                            onClick={() => handleDelete(pkg.id, pkg.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete package"
                          >
                            <BiTrash className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
