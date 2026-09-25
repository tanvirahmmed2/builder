'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Context } from '@/components/helper/Context';
import Review from '../cards/Review';
import { BiStar, BiChevronRight } from 'react-icons/bi';

export default function Reviews() {
  const { reviews = [] } = useContext(Context) || {};
  const totalReviews = reviews?.length || 0;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) /
          totalReviews
        ).toFixed(1)
      : null;

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="w-full space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
            Trusted by creators, agencies, and online stores worldwide
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Discover how creative professionals and modern businesses use our platform to build their online authority, sell products, and streamline operations.
          </p>

          {/* Dynamic Aggregate Rating Pill */}
          {totalReviews > 0 && avgRating && (
            <div className="inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex text-amber-400 text-base">
                {[...Array(Math.min(5, Math.max(1, Math.round(Number(avgRating)))))].map((_, i) => (
                  <BiStar key={i} className="fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {avgRating} / 5.0 Average Rating
              </span>
              <span className="text-xs text-slate-400">
                &bull; {totalReviews} Verified Review{totalReviews === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Reviews Horizontal Scrolling Carousel / Row */}
        {totalReviews > 0 ? (
          <div className="w-full overflow-x-auto pb-4 pt-2 px-1 scrollbar-none flex flex-row gap-5 justify-start md:justify-center">
            {reviews.slice(0, 6).map((r) => (
              <Review key={r.id} review={r} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center max-w-md mx-auto space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              No approved reviews published yet. Real client and creator reviews will appear here as they are verified.
            </p>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md"
          >
            <span>View All Approved Reviews</span>
            <BiChevronRight className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
}