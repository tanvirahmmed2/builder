'use client';

import { useState, useEffect, useContext } from 'react';
import { Context } from '@/components/helper/Context';
import TiptapEditor from '@/components/ui/TiptapEditor';
import slugify from 'slugify';
import {
  BiSearch,
  BiPlus,
  BiEdit,
  BiTrash,
  BiRefresh,
  BiBell,
  BiX,
  BiCheckCircle,
  BiErrorCircle,
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

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', description: '' });
  const [manualSlugEdit, setManualSlugEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

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

  const openCreateModal = () => {
    if (!canManage) {
      alert('Access denied: updates permission required.');
      return;
    }
    setEditingUpdate(null);
    setFormData({ title: '', slug: '', description: '' });
    setManualSlugEdit(false);
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    if (!canManage) {
      alert('Access denied: updates permission required.');
      return;
    }
    setEditingUpdate(item);
    setFormData({
      title: item.title || '',
      slug: item.slug || '',
      description: item.description || '',
    });
    setManualSlugEdit(true);
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUpdate(null);
    setFormData({ title: '', slug: '', description: '' });
    setManualSlugEdit(false);
  };

  const handleTitleChange = (val) => {
    const updated = { ...formData, title: val };
    if (!manualSlugEdit) {
      updated.slug = slugify(val, { lower: true, strict: true, trim: true });
    }
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) {
      setFeedback({ type: 'error', message: 'Access denied: updates permission required to publish or edit updates.' });
      return;
    }

    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Title is required.' });
      return;
    }
    if (!formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Please write an update description using the rich text editor.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const method = editingUpdate ? 'PUT' : 'POST';
      const payload = editingUpdate ? { id: editingUpdate.id, ...formData } : formData;

      const res = await fetch('/api/developer/updates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: editingUpdate ? 'Update saved successfully!' : 'Update published successfully!',
        });
        await fetchUpdates();
        setTimeout(() => closeModal(), 900);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Operation failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) {
      alert('Access denied: updates permission required.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this update announcement?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/developer/updates?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchUpdates();
      } else {
        alert(data.error || 'Failed to delete update.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred while deleting update.');
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
            Publish, edit, and manage product feature releases and changelogs formatted with TipTap rich text.
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
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <BiPlus className="text-base" />
              <span>Post New Update</span>
            </button>
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
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary-dark transition-colors cursor-pointer shadow-xs"
            >
              <BiPlus />
              <span>Post First Update</span>
            </button>
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
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>
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
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg text-slate-500 hover:text-secondary hover:bg-secondary/10 transition-colors text-base cursor-pointer"
                    title="Edit Update"
                  >
                    <BiEdit />
                  </button>
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

      {/* Create / Edit Modal with TipTap Editor */}
      {modalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center text-lg">
                  <BiBell />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingUpdate ? 'Edit Product Update' : 'Publish New Product Update'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            {feedback.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <BiCheckCircle className="text-base shrink-0" />
                ) : (
                  <BiErrorCircle className="text-base shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Release v2.1: Instant Canvas Preview"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug <span className="text-slate-400 font-normal">(auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., release-v2-1-instant-canvas-preview"
                    value={formData.slug}
                    onChange={(e) => {
                      setManualSlugEdit(true);
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Update Description <span className="text-rose-500">*</span>{' '}
                  <span className="text-slate-400 font-normal">(Rich Text powered by TipTap)</span>
                </label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <TiptapEditor
                    value={formData.description}
                    onChange={(html) => setFormData({ ...formData, description: html })}
                    placeholder="Describe the new features, bug fixes, or platform enhancements in detail..."
                    minHeight="220px"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting && <BiLoaderAlt className="animate-spin text-sm" />}
                  <span>{editingUpdate ? 'Save Changes' : 'Publish Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
