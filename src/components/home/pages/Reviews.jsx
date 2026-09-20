'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Context } from '@/components/helper/Context';
import Review from '../cards/Review';
import { BiStar, BiChevronRight } from 'react-icons/bi';

export default function Reviews() {
  const { reviews = [] } = useContext(Context);

  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full flex flex-col items-center justify-center gap-8 rounded-3xl py-16 px-4">
      <div className="text-center space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
          <BiStar className="text-amber-500" />
          <span>Verified Social Proof</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          What Creators Say About Us
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Discover genuine reviews and feedback from creative professionals using our platform.
        </p>
      </div>

      {/* Horizontally scrollable row */}
      <div className="w-full overflow-x-auto pb-4 pt-2 px-2 scrollbar-none flex flex-row gap-5 justify-start md:justify-center">
        {reviews.slice(0, 6).map((r) => (
          <Review key={r.id} review={r} />
        ))}
      </div>

      <div className="pt-2">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>View All Approved Reviews</span>
          <BiChevronRight className="text-base" />
        </Link>
      </div>
    </section>
  );
}