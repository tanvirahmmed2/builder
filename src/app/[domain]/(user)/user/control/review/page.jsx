'use client';
import React from 'react';
import { BiStar } from 'react-icons/bi';

export default function CustomerReviewHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">My Reviews & Ratings</h1>
        <p className="text-xs text-slate-400 mt-1">Review feedback you have submitted for products and services.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-16 text-center text-slate-500">
        <BiStar className="mx-auto text-4xl mb-2 text-slate-600" />
        <p>You have not submitted any reviews yet.</p>
      </div>
    </div>
  );
}

