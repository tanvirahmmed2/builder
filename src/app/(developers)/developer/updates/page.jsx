'use client';

import { useState, useEffect, useContext } from 'react';
import { Context } from '@/components/helper/Context';
import {
  BiSearch,
  BiPlus,
  BiEdit,
  BiTrash,
  BiRefresh,
  BiBell,
  BiCheckCircle,
  BiLoaderAlt,
  BiShieldQuarter,
  BiCalendar,
  BiLinkExternal,
  BiLockAlt,
} from 'react-icons/bi';
import Link from 'next/link';

export default function DeveloperUpdatesPage() {
  const { user } = useContext(Context);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canManage = permissions.includes('updates');

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/updates');
      const data = await res.json();
      if (data.success) {
        setUpdates(data.records || []);
      }
    } catch (err) {
      console.error('Failed to fetch updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleDelete = async (id) => {
    if (!canManage) {
      alert('Access denied: updates permission required.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this update?')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/developer/updates?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUpdates((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || 'Failed to delete update');
      }
    } catch (err) {
      console.error('Error deleting update:', err);
      alert(err.message || 'Error deleting update');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.title?.toLowerCase().includes(term) ||
      u.slug?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Product Updates &amp; Changelog</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Admin &amp; Manager
            </span>
            {!canManage && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <BiLockAlt className="text-xs" />
                <span>Read-Only</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish, edit, and manage product feature releases and changelogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchUpdates}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors text-sm cursor-pointer"
            title="Refresh Updates"
          >
            <BiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage ? (
            <Link
              href="/developer/updates/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Publish Update in Full-Page Studio"
            >
              <BiPlus className="text-base" />
              <span>Post Update</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <BiLockAlt className="text-sm" />
              <span>Admin / Manager Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Permission Warning if not admin or manager */}
      {!canManage && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 rounded-xl p-4 flex items-center gap-3 text-xs">
          <BiShieldQuarter className="text-lg text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            You are viewing updates in read-only mode. Only <strong>Admin</strong> and <strong>Manager</strong> accounts can post, edit, or delete updates.
          </span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search updates by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary shadow-xs transition-colors"
          />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Published Updates</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">{updates.length}</span>
        </div>
      </div>

      {/* Updates List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <BiLoaderAlt className="animate-spin text-3xl text-secondary" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading product updates...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            <BiBell />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Updates Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchTerm ? `No updates matched "${searchTerm}".` : 'No product changelog updates published yet.'}
          </p>
          {canManage && !searchTerm && (
            <Link
              href="/developer/updates/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-dark transition-colors cursor-pointer shadow-xs"
            >
              <BiPlus />
              <span>Post First Update</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Link
                    href={`/developer/updates/${item.slug}`}
                    className="hover:underline"
                    title="Open Dedicated Update Workspace"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight hover:text-secondary dark:hover:text-secondary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    /{item.slug}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <BiCalendar className="text-sm text-secondary" />
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Link
                    href={`/updates/${item.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-secondary hover:text-secondary-dark font-medium"
                  >
                    <span>View Live</span>
                    <BiLinkExternal className="text-xs" />
                  </Link>
                </div>

                {/* Description preview rendered from HTML with truncated height */}
                <div
                  className="prose prose-xs max-w-none text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 self-end md:self-start shrink-0">
                  <Link
                    href={`/developer/updates/${item.slug}`}
                    className="p-2 rounded-lg text-slate-500 hover:text-secondary hover:bg-secondary/10 transition-colors text-base cursor-pointer"
                    title="Open Dedicated Update Workspace"
                  >
                    <BiEdit />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-base disabled:opacity-50 cursor-pointer"
                    title="Delete Update"
                  >
                    {deletingId === item.id ? <BiLoaderAlt className="animate-spin" /> : <BiTrash />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
