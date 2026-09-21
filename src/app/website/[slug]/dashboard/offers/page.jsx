'use client';

import { use, useEffect, useState } from 'react';
import {
  BiTag,
  BiSearch,
  BiPlus,
  BiTrash,
  BiLoaderAlt,
  BiCheckCircle,
} from 'react-icons/bi';

export default function OffersPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [slug]);

  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_offer',
          title,
          discount_percentage: Number(discountPercent || 10),
          terms: `Use code ${code?.toUpperCase() || 'SAVE10'} at checkout`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setTitle('');
        setCode('');
        setDiscountPercent('15');
        fetchOffers();
      } else {
        alert(data.error || 'Failed to add offer');
      }
    } catch (err) {
      alert('Error adding offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_offer', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOffers();
      } else {
        alert(data.error || 'Failed to delete offer');
      }
    } catch (err) {
      alert('Error deleting offer');
    }
  };

  const filtered = offers.filter((o) =>
    o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.terms?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Special Offers & Coupon Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Run seasonal promotional campaigns, percent discounts, and special coupons.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <BiPlus className="text-base" />
          <span>Create Offer</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search offers by title or promo terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> active offers
        </div>
      </div>

      {/* Offers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading offers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiTag className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No active offers</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create discount offers to incentivize shoppers and boost conversions.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Campaign Title</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Promo Terms / Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <BiTag className="text-indigo-500 text-base" />
                      <span>{o.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                      {o.discount_percentage || 10}% OFF
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {o.terms || 'General Discount'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <BiCheckCircle /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Offer"
                    >
                      <BiTrash className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleAddOffer}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Offer</h3>
              <p className="text-xs text-slate-500 mt-1">Add a promotional discount coupon for your customers.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Launch Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. LAUNCH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full uppercase font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
