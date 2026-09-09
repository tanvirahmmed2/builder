'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BoxIcon, PlusIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // New package modal state
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priceInCents, setPriceInCents] = useState(2900);
  const [interval, setInterval] = useState('MONTHLY');
  const [maxPortfolios, setMaxPortfolios] = useState(3);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

  // New feature modal state
  const [showFeatModal, setShowFeatModal] = useState(false);
  const [featName, setFeatName] = useState('');
  const [featDesc, setFeatDesc] = useState('');

  const fetchPackagesAndFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
        setFeatures(data.features || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesAndFeatures();
  }, []);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_package',
          packageData: {
            name,
            description: desc,
            priceInCents: Number(priceInCents),
            billingInterval: interval,
            maxPortfolios: Number(maxPortfolios),
            featureIds: selectedFeatureIds,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowPkgModal(false);
        setName('');
        setDesc('');
        setSelectedFeatureIds([]);
        fetchPackagesAndFeatures();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFeature = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_feature',
          featureData: { name: featName, description: featDesc },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowFeatModal(false);
        setFeatName('');
        setFeatDesc('');
        fetchPackagesAndFeatures();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-indigo-400 hover:underline">← Admin Overview</Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">Pricing & Features</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Packages & Features Architecture</h1>
          <p className="text-xs text-slate-400">
            Define SaaS subscription packages, master platform features, and configure package_features junction data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFeatModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            + Add Master Feature
          </button>
          <button
            onClick={() => setShowPkgModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            + Create Package
          </button>
        </div>
      </div>

      {/* PACKAGES GRID */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BoxIcon className="w-4 h-4 text-indigo-400" />
          <span>Configured Subscription Packages ({packages.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {pkg.billingInterval}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{pkg.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{pkg.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    ${(pkg.priceInCents / 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">USD / month</span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold">Included Features (package_features):</div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {pkg.packageFeatures?.map((pf) => (
                      <li key={pf.id} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{pf.feature?.name || 'Feature'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 flex justify-between">
                <span>Max Portfolios: {pkg.maxPortfolios}</span>
                <span className="font-mono">slug: {pkg.slug}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MASTER FEATURES LIST */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h2 className="text-base font-bold text-white">Platform Master Features ({features.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feat) => (
            <div key={feat.id} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{feat.name}</span>
                <span className="text-[10px] text-indigo-400 font-mono">{feat.key}</span>
              </div>
              <p className="text-[11px] text-slate-400">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE PACKAGE MODAL */}
      {showPkgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create Package & Link Features</h3>
              <button onClick={() => setShowPkgModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agency Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Target user base and perks..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price in Cents</label>
                  <input
                    type="number"
                    value={priceInCents}
                    onChange={(e) => setPriceInCents(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Interval</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                    <option value="LIFETIME">LIFETIME</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Features (package_features)</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-white/10">
                  {features.map((feat) => {
                    const checked = selectedFeatureIds.includes(feat.id);
                    return (
                      <label key={feat.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatureIds([...selectedFeatureIds, feat.id]);
                            } else {
                              setSelectedFeatureIds(selectedFeatureIds.filter((id) => id !== feat.id));
                            }
                          }}
                          className="rounded bg-slate-900 border-white/10 text-indigo-600"
                        />
                        <span>{feat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FEATURE MODAL */}
      {showFeatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Add Master Feature</h3>
              <button onClick={() => setShowFeatModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateFeature} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feature Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priority Support Desk"
                  value={featName}
                  onChange={(e) => setFeatName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={featDesc}
                  onChange={(e) => setFeatDesc(e.target.value)}
                  placeholder="Feature entitlement details..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFeatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Create Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
