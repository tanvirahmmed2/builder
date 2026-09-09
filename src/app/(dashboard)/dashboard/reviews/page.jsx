'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon } from '@/components/ui/Icons';

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creator');
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

  const handleModerate = async (id, status) => {
    try {
      await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate_review', id, status }),
      });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="text-indigo-400 hover:underline">← Dashboard</Link>
            <span>/</span>
            <span>Modules</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Client Reviews & Testimonials Module</h1>
          <p className="text-xs text-slate-400">
            Ratings and feedback submitted by portfolio visitors. Creators and Managers can approve or reject testimonials.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" filled />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{rev.clientName}</span>
                  <span className="text-xs text-slate-500">({rev.clientEmail})</span>
                </div>

                <h3 className="text-base font-bold text-white">&quot;{rev.reviewTitle}&quot;</h3>
                <p className="text-xs text-slate-300 leading-relaxed">&quot;{rev.reviewText}&quot;</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rev.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {rev.status}
                </span>

                <button
                  onClick={() => handleModerate(rev.id, 'APPROVED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModerate(rev.id, 'REJECTED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
