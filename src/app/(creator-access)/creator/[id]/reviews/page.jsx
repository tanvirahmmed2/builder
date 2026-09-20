'use client';

import { useState } from 'react';
import { useCreator } from '../layout';
import {
  BiStar,
  BiPlus,
  BiCheckCircle,
  BiMessageRoundedDetail,
  BiUser,
  BiTrash,
  BiCheck,
  BiX,
} from 'react-icons/bi';

export default function CreatorReviewsPage() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Sarah Jenkins',
      role: 'Head of Product at LinearLab',
      rating: 5,
      comment:
        'Alex built an outstanding design system and flagship portfolio for our creative studio. Truly top tier execution and communication.',
      date: '2026-09-12',
      status: 'APPROVED',
    },
    {
      id: 2,
      author: 'David Zhang',
      role: 'Founder at HyperScale AI',
      rating: 5,
      comment:
        'The interactive 3D canvas and snappy page load times exceeded our expectations. Our inbound client conversions surged by 45%.',
      date: '2026-09-08',
      status: 'APPROVED',
    },
    {
      id: 3,
      author: 'Elena Rostova',
      role: 'Creative Director at Nomad Studios',
      rating: 4,
      comment:
        'Super clean aesthetic, modern typography choices, and frictionless responsive layouts on mobile devices.',
      date: '2026-09-02',
      status: 'PENDING',
    },
  ]);

  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;

    const review = {
      id: Date.now(),
      author: newAuthor,
      role: newRole || 'Client',
      rating: Number(newRating),
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
    };

    setReviews([review, ...reviews]);
    setNewAuthor('');
    setNewRole('');
    setNewComment('');
    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, status: r.status === 'APPROVED' ? 'PENDING' : 'APPROVED' } : r
      )
    );
  };

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Testimonials</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Social Proof
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Curate authentic client feedback, ratings, and endorsements to showcase on your portfolio sites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
        >
          <BiPlus className="text-base" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Rating</span>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{avgRating}</span>
            <div className="flex text-amber-400 text-sm">
              {'★'.repeat(Math.round(Number(avgRating)))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">From verified client inquiries</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published Reviews</span>
          <div className="text-2xl font-bold text-slate-900">
            {reviews.filter((r) => r.status === 'APPROVED').length} / {reviews.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Currently visible on live portfolios</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trust Reputation</span>
          <div className="text-2xl font-bold text-slate-900">High Trust</div>
          <p className="text-[11px] text-slate-500">Embedded in your portfolio theme</p>
        </div>
      </div>

      {/* Reviews Cards Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BiMessageRoundedDetail className="text-slate-500 text-lg" />
            <span>Testimonial Entries</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">{reviews.length} total entries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                    {'★'.repeat(rev.rating)}
                    <span className="text-xs text-slate-500 font-mono ml-1">{rev.rating}.0</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      rev.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {rev.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.author}</h4>
                    <p className="text-[11px] text-slate-500">{rev.role}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{rev.date}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(rev.id)}
                    className="px-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {rev.status === 'APPROVED' ? 'Mark Pending' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                    title="Delete testimonial"
                  >
                    <BiTrash className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-lg w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-800">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <BiX className="text-2xl" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Client Testimonial</h3>
              <p className="text-xs text-slate-500">Record a new testimonial from a customer or client project.</p>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. VP Design at Stripe"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Quote *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the client testimonial text..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
