'use client';

import { use, useEffect, useState } from 'react';
import {
  BiGlobe,
  BiPalette,
  BiSave,
  BiCheckCircle,
  BiCopy,
  BiInfoCircle,
  BiLoaderAlt,
} from 'react-icons/bi';

export default function SettingsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [customDomain, setCustomDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        const w = data.website || {};
        const s = w.settings || {};
        setTitle(s.site_title || w.name || '');
        setTagline(s.tagline || '');
        setBio(s.bio || '');
        setPrimaryColor(s.primary_color || w.theme_config?.primaryColor || '#6366f1');
        setFontFamily(s.font_family || w.theme_config?.fontFamily || 'Inter');
        setCustomDomain(w.custom_domain || '');
        setContactEmail(s.contact_email || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [slug]);

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/webites/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          custom_domain: customDomain || null,
          theme_config: {
            primaryColor,
            fontFamily,
          },
          settings: {
            site_title: title,
            tagline,
            bio,
            primary_color: primaryColor,
            font_family: fontFamily,
            contact_email: contactEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Website settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (err) {
      alert('Error updating settings');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
        <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
        <p className="text-xs font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Website Branding & Custom Domain
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize typography, brand colors, contact channels, and attach your own domain name.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2">
          <BiCheckCircle className="text-lg" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bio / About Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Styling & Theme */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BiPalette className="text-indigo-500" /> Theme & Aesthetics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 font-mono w-32"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Roboto">Roboto (Geometric Sans)</option>
                <option value="Outfit">Outfit (Avant-Garde Display)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Domain Configuration */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BiGlobe className="text-indigo-500" /> Custom Domain Connection
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Domain (e.g. www.yourdomain.com)
            </label>
            <input
              type="text"
              placeholder="e.g. portfolio.mybrand.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <BiInfoCircle /> DNS Configuration Instructions
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              To connect your custom domain, create the following DNS record with your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
            </p>
            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[10px]">
              <div><span className="text-slate-400">Type:</span> CNAME</div>
              <div><span className="text-slate-400">Host:</span> @ or www</div>
              <div><span className="text-slate-400">Points to:</span> cname.saasplatform.com</div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <BiSave className="text-base" />
            <span>{updating ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
