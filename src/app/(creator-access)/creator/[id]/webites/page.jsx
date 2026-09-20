'use client';

import { useState } from 'react';
import { useCreator } from '../layout';
import {
  BiDesktop,
  BiPlus,
  BiLinkExternal,
  BiPalette,
  BiTrash,
  BiEdit,
  BiCheckCircle,
  BiGlobe,
  BiHdd,
  BiLoaderAlt,
  BiX,
} from 'react-icons/bi';

export default function CreatorWebsitesPage() {
  const {
    creatorId,
    websites = [],
    activeSubscription,
    stats = {},
    refetch,
    openCreateWebsiteModal,
  } = useCreator();

  const [editingWebsite, setEditingWebsite] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editCustomDomain, setEditCustomDomain] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#6366f1');
  const [editFontFamily, setEditFontFamily] = useState('Inter');
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateErr, setUpdateErr] = useState('');

  const [deletingId, setDeletingId] = useState(null);

  const maxWebsites = stats?.maxWebsites || activeSubscription?.max_portfolios || 1;

  const handleOpenEdit = (w) => {
    setEditingWebsite(w);
    setEditName(w.name);
    setEditSubdomain(w.subdomain);
    setEditCustomDomain(w.custom_domain || '');
    setEditPrimaryColor(w.theme_config?.primaryColor || '#6366f1');
    setEditFontFamily(w.theme_config?.fontFamily || 'Inter');
    setEditIsPublished(w.is_published !== false);
    setUpdateMsg('');
    setUpdateErr('');
  };

  const handleSaveWebsite = async (e) => {
    e.preventDefault();
    if (!editingWebsite) return;
    setUpdating(true);
    setUpdateMsg('');
    setUpdateErr('');

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_website',
          id: editingWebsite.id,
          creatorId: Number(creatorId),
          name: editName,
          subdomain: editSubdomain,
          custom_domain: editCustomDomain || null,
          is_published: editIsPublished,
          theme_config: {
            primaryColor: editPrimaryColor,
            fontFamily: editFontFamily,
            mode: 'dark',
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUpdateMsg('Website updated successfully!');
        await refetch();
        setTimeout(() => {
          setEditingWebsite(null);
          setUpdateMsg('');
        }, 1000);
      } else {
        setUpdateErr(json.error || 'Failed to update website.');
      }
    } catch (err) {
      setUpdateErr('Network error.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteWebsite = async (websiteId, websiteName) => {
    if (!confirm(`Are you sure you want to delete website "${websiteName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(websiteId);
    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_website',
          id: websiteId,
          creatorId: Number(creatorId),
        }),
      });
      const json = await res.json();
      if (json.success) {
        await refetch();
      } else {
        alert(json.error || 'Failed to delete website.');
      }
    } catch (err) {
      alert('Error deleting website.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BiDesktop className="text-slate-800 text-2xl" />
            <span>Hosted Portfolio Websites</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your websites, configure bespoke subdomains, edge SSL, and visual themes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 font-semibold shadow-xs">
            <span>Quota: </span>
            <strong className="text-slate-900 font-mono">
              {websites.length} of {maxWebsites} Used
            </strong>
          </div>

          <button
            type="button"
            onClick={openCreateWebsiteModal}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <BiPlus className="text-base" />
            <span>New Website</span>
          </button>
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((w) => {
          const primaryColor = w.theme_config?.primaryColor || '#6366f1';
          const fontFamily = w.theme_config?.fontFamily || 'Inter';

          return (
            <div
              key={w.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              {/* Header preview bar */}
              <div
                className="h-20 p-4 flex items-start justify-between relative overflow-hidden bg-slate-50 border-b border-slate-100"
              >
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    w.is_published
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {w.is_published ? '● Live' : 'Draft'}
                </span>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-xs">
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-[10px] text-slate-600 font-medium">{fontFamily}</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-6 space-y-4 flex-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {w.name}
                  </h3>
                  <a
                    href={`/sites/${w.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-secondary hover:underline flex items-center gap-1 mt-1 font-semibold"
                  >
                    <span>{w.subdomain}.saasplatform.com</span>
                    <BiLinkExternal className="text-sm" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <BiGlobe className="text-sm text-slate-600" />
                      <span>Custom Domain:</span>
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {w.custom_domain || 'Not configured'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <BiHdd className="text-sm text-slate-600" />
                      <span>Storage Quota:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{w.storage_used_mb || 12} MB</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(w)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Configure Website Settings"
                >
                  <BiEdit className="text-lg" />
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`/sites/${w.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Live</span>
                    <BiLinkExternal className="text-sm text-secondary" />
                  </a>

                  <a
                    href={`/builder/${w.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <BiPalette className="text-sm" />
                    <span>Builder</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteWebsite(w.id, w.name)}
                    disabled={deletingId === w.id}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Website"
                  >
                    {deletingId === w.id ? (
                      <BiLoaderAlt className="animate-spin text-lg" />
                    ) : (
                      <BiTrash className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Website Modal */}
      {editingWebsite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-800">
            <button
              type="button"
              onClick={() => setEditingWebsite(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <BiX className="text-2xl" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Edit Website Settings</h3>
              <p className="text-xs text-slate-500">
                Update domain, visual theme, and publication visibility.
              </p>
            </div>

            {updateErr && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {updateErr}
              </div>
            )}

            {updateMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <BiCheckCircle className="text-lg" />
                <span>{updateMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveWebsite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subdomain</label>
                <input
                  type="text"
                  required
                  value={editSubdomain}
                  onChange={(e) => setEditSubdomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Domain
                </label>
                <input
                  type="text"
                  placeholder="www.yourname.com"
                  value={editCustomDomain}
                  onChange={(e) => setEditCustomDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 px-3">
                    <input
                      type="color"
                      value={editPrimaryColor}
                      onChange={(e) => setEditPrimaryColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-700">{editPrimaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={editFontFamily}
                    onChange={(e) => setEditFontFamily(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-800"
                  >
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Roboto">Roboto (Classic)</option>
                    <option value="Playfair Display">Playfair (Editorial)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="published_toggle"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-0 cursor-pointer accent-slate-900"
                />
                <label htmlFor="published_toggle" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Website is Published and Publicly Accessible
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingWebsite(null)}
                  className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {updating ? <BiLoaderAlt className="animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
