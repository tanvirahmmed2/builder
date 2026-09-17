'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (reviewId, status) => {
    try {
      await fetch('/api/developer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate_review', reviewId, status }),
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Permanently delete this review from the website?')) return;
    try {
      await fetch('/api/developer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_review', reviewId }),
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <Link href="/developer" className="hover:underline">← Developer Overview</Link>
          <span>/</span>
          <span>Quality & Trust</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
          <StarIcon filled className="w-6 h-6 text-amber-400" />
          <span>Global Reviews & Testimonials Oversight</span>
        </h1>
        <p className="text-xs text-slate-400">
          Super Admin moderation for client testimonials submitted across all portfolio websites.
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/10 text-slate-500 text-xs">
            No reviews submitted yet across portfolios.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <StarIcon key={i} filled className="w-3.5 h-3.5" />
                    ))}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      rev.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {rev.status}
                  </span>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Website: alex-design
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{rev.reviewTitle}</h3>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{rev.reviewText}"
                </p>

                <div className="text-[11px] text-slate-400">
                  By <strong className="text-white">{rev.clientName}</strong> ({rev.clientEmail})
                  <span className="text-slate-600 ml-2">•</span>
                  <span className="text-slate-500 ml-2">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {rev.status !== 'APPROVED' ? (
                  <button
                    onClick={() => handleModerate(rev.id, 'APPROVED')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleModerate(rev.id, 'REJECTED')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold transition-all border border-amber-500/30"
                  >
                    Reject
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
