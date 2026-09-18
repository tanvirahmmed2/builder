'use client';

import { useState, useEffect } from 'react';
import { BiCube, BiCheck, BiX, BiDollar, BiEdit, BiPlus, BiLayer } from 'react-icons/bi';

export default function PackageForm({
  initialData = null,
  onSuccess,
  onCancel,
  apiEndpoint = '/api/developer/packages',
}) {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price_in_cents: initialData?.price_in_cents !== undefined ? initialData.price_in_cents : 2900,
    currency: initialData?.currency || 'USD',
    billing_interval: initialData?.billing_interval || 'MONTHLY',
    max_portfolios: initialData?.max_portfolios !== undefined ? initialData.max_portfolios : 1,
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    app_id: initialData?.app_id || '',
  });

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug));

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        price_in_cents: initialData.price_in_cents !== undefined ? initialData.price_in_cents : 2900,
        currency: initialData.currency || 'USD',
        billing_interval: initialData.billing_interval || 'MONTHLY',
        max_portfolios: initialData.max_portfolios !== undefined ? initialData.max_portfolios : 1,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        app_id: initialData.app_id || '',
      });
      setIsCustomSlug(true);
    }
  }, [initialData]);

  useEffect(() => {
    // Load existing apps for optional association
    fetch('/api/developer/apps')
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setApps(data.records);
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, name: val };
      if (!isCustomSlug && !isEditing) {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = (
      formData.slug ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    );

    const payloadData = {
      ...formData,
      slug,
      price_in_cents: Math.max(0, parseInt(formData.price_in_cents, 10) || 0),
      max_portfolios: Math.max(1, parseInt(formData.max_portfolios, 10) || 1),
      app_id: formData.app_id ? parseInt(formData.app_id, 10) : null,
    };

    try {
      const bodyPayload = isEditing
        ? { action: 'update_record', id: initialData.id, data: payloadData }
        : { action: 'create_record', data: payloadData };

      const res = await fetch(apiEndpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: initialData.id, ...payloadData } : bodyPayload),
      });

      const data = await res.json();
      if (data.success) {
        if (!isEditing) {
          setFormData({
            name: '',
            slug: '',
            description: '',
            price_in_cents: 2900,
            currency: 'USD',
            billing_interval: 'MONTHLY',
            max_portfolios: 1,
            is_active: true,
            app_id: '',
          });
          setIsCustomSlug(false);
        }
        if (onSuccess) onSuccess(data.record || data.package);
      } else {
        setError(data.error || 'Failed to save package');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred while saving package.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = ((formData.price_in_cents || 0) / 100).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 transition-all">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20">
            {isEditing ? <BiEdit className="text-2xl" /> : <BiCube className="text-2xl" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {isEditing ? `Edit Package: ${initialData.name}` : 'Create Platform Package'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Updating subscription package #${initialData.id}. Changes apply immediately.`
                : 'Configure new subscription tiers, pricing intervals, and website portfolio limits.'}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Form"
          >
            <BiX className="text-2xl" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Package Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pro Studio Pass"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Slug Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. pro-studio-pass"
              value={formData.slug}
              onChange={(e) => {
                setIsCustomSlug(true);
                setFormData({ ...formData, slug: e.target.value });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>
        </div>

        {/* Pricing & Billing Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Price in Cents</span>
              <span className="text-secondary font-mono font-bold">${formattedPrice}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">¢</span>
              <input
                type="number"
                min={0}
                required
                placeholder="2900"
                value={formData.price_in_cents}
                onChange={(e) => setFormData({ ...formData, price_in_cents: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all font-mono font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Example: 2900 = $29.00 USD</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all font-medium cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Billing Interval</label>
            <select
              value={formData.billing_interval}
              onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all font-medium cursor-pointer"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="LIFETIME">Lifetime</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Portfolios</label>
            <input
              type="number"
              min={1}
              required
              value={formData.max_portfolios}
              onChange={(e) => setFormData({ ...formData, max_portfolios: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">Sites a creator can publish</p>
          </div>
        </div>

        {/* Associated App (Optional) & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description &amp; Highlights</label>
            <textarea
              rows={3}
              placeholder="Highlight package limits, priority features, and targeted creator tier..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Linked Ecosystem App (Optional)</label>
              <select
                value={formData.app_id}
                onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white focus:ring-1 focus:ring-secondary transition-all cursor-pointer font-medium"
              >
                <option value="">-- No Specific App (Global Plan) --</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.title} (#{app.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="relative flex items-center gap-3 cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Active &amp; Available</div>
                  <div className="text-[11px] text-slate-500">Visible during checkout for creators</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            {isEditing ? <BiCheck className="text-lg" /> : <BiPlus className="text-lg" />}
            <span>{loading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Package' : 'Create Package'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
