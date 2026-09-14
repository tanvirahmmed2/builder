'use client';

import { useState } from 'react';
import { BiLayer, BiCheck, BiX } from 'react-icons/bi';

export default function PackageFeatureForm({ packages = [], features = [], onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    package_id: packages[0]?.id || 1,
    feature_id: features[0]?.id || 1,
    value: 'true',
    is_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'packages_feature',
          data: {
            ...formData,
            package_id: Number(formData.package_id),
            feature_id: Number(formData.feature_id),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData({
          package_id: packages[0]?.id || 1,
          feature_id: features[0]?.id || 1,
          value: 'true',
          is_enabled: true,
        });
        if (onSuccess) onSuccess(data.record);
      } else {
        setError(data.error || 'Failed to link package feature');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
            <BiLayer className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Map Feature to Package</h3>
            <p className="text-xs text-slate-500">Enable or configure a specific feature within a platform subscription tier.</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <BiX className="text-xl" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Package ID</label>
            <input
              type="number"
              required
              placeholder="e.g. 1"
              value={formData.package_id}
              onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feature ID</label>
            <input
              type="number"
              required
              placeholder="e.g. 1"
              value={formData.feature_id}
              onChange={(e) => setFormData({ ...formData, feature_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Config Value</label>
            <input
              type="text"
              required
              placeholder="e.g. true, unlimited, or 10GB"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="feat_enabled"
              checked={formData.is_enabled}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary mr-2"
            />
            <label htmlFor="feat_enabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Feature is currently enabled for this package
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <BiCheck className="text-base" />
            <span>{loading ? 'Saving...' : 'Link Feature'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
