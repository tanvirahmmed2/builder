'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  BiGridAlt,
  BiSearch,
  BiCheckCircle,
  BiLinkExternal,
  BiCodeAlt,
  BiPlus,
  BiTrash,
  BiEdit,
  BiTimeFive,
  BiRefresh,
  BiImage,
  BiGlobe,
  BiLoaderAlt,
  BiShieldQuarter,
} from 'react-icons/bi';
import { Context } from '@/components/helper/Context';
import DeveloperAppCard from '@/components/developer/card/AppCard';

export default function DeveloperAppsPage() {
  const { user } = useContext(Context);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFTS'
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canManage = permissions.includes('apps');
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleCreateDefaultApp = async () => {
    if (!canManage || creating) return;
    try {
      setCreating(true);
      setActionError('');
      const res = await axios.post('/api/developer/apps', {
        title: 'Untitled App',
      });
      if (res.data?.success && (res.data.app || res.data.record)) {
        const newApp = res.data.app || res.data.record;
        router.push(`/developer/apps/${newApp.slug}`);
      } else {
        setActionError(res.data?.error || 'Failed to create application.');
        setCreating(false);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error creating application.');
      setCreating(false);
    }
  };

  const fetchApps = async () => {
    try {
      setLoading(true);
      setActionError('');
      const res = await axios.get('/api/developer/apps');
      if (res.data?.success) {
        setApps(res.data.records || []);
      } else {
        setActionError(res.data?.error || 'Failed to fetch applications.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error loading ecosystem apps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Delete App using axios
  const handleDeleteApp = async (id, title) => {
    if (!canManage) return;
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setDeletingId(id);
    setActionError('');

    try {
      const res = await axios.delete(`/api/developer/apps?id=${id}`);

      if (res.data?.success) {
        setApps((prev) => prev.filter((a) => a.id !== id));
      } else {
        setActionError(res.data?.error || 'Failed to delete application.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error deleting application.');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle publish status inline using axios
  const handleTogglePublish = async (app) => {
    if (!canManage) return;
    const newStatus = !app.is_published;

    try {
      const res = await axios.put('/api/developer/apps', {
        id: app.id,
        title: app.title,
        slug: app.slug,
        short_description: app.short_description,
        description: app.description,
        is_published: newStatus,
      });

      if (res.data?.success && res.data?.record) {
        setApps((prev) => prev.map((a) => (a.id === app.id ? res.data.record : a)));
      } else {
        setActionError(res.data?.error || 'Failed to toggle publishing status.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error updating status.');
    }
  };

  // Filter apps
  const filteredApps = apps.filter((app) => {
    if (filterTab === 'PUBLISHED' && !app.is_published) return false;
    if (filterTab === 'DRAFTS' && app.is_published) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (app.title || '').toLowerCase().includes(q) ||
      (app.slug || '').toLowerCase().includes(q) ||
      (app.short_description || '').toLowerCase().includes(q) ||
      (app.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Ecosystem Apps</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Ecosystem
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Catalog of plug-and-play vertical applications and integrations. Admin and Manager roles can manage, draft, and publish apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApps}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <BiRefresh className="text-lg" />
          </button>

          {canManage ? (
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateDefaultApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-secondary hover:bg-secondary-dark text-white cursor-pointer disabled:opacity-60"
              title="Create New Application"
            >
              {creating ? <BiLoaderAlt className="animate-spin text-base" /> : <BiPlus className="text-base" />}
              <span>{creating ? 'Creating...' : 'Create App'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <BiShieldQuarter className="text-sm text-slate-400" />
              <span>Read Only</span>
            </div>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-rose-500 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search apps by title, slug, or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {[
            { key: 'ALL', label: `All (${apps.length})` },
            { key: 'PUBLISHED', label: `Published (${apps.filter((a) => a.is_published).length})` },
            { key: 'DRAFTS', label: `Drafts (${apps.filter((a) => !a.is_published).length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === tab.key
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl">
          <BiLoaderAlt className="animate-spin text-3xl text-secondary" />
          <p className="text-xs text-slate-500 font-semibold">Loading applications catalog...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-6">
          <BiGridAlt className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm
              ? `No apps matching "${searchTerm}". Try a different keyword.`
              : 'There are currently no ecosystem applications in this view.'}
          </p>
          {canManage && (
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateDefaultApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary-dark text-white cursor-pointer shadow-xs disabled:opacity-60"
            >
              {creating ? <BiLoaderAlt className="animate-spin text-base" /> : <BiPlus className="text-base" />}
              <span>{creating ? 'Creating...' : 'Create Your First App'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <DeveloperAppCard
              key={app.id}
              app={app}
              canManage={canManage}
              deletingAppId={deletingId}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDeleteApp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
