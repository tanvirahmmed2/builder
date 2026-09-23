'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Context } from '@/components/helper/Context';
import Review from '../cards/Review';
import { BiStar, BiChevronRight, BiCheckShield, BiLike } from 'react-icons/bi';

const FALLBACK_REVIEWS = [
  {
    id: 'rev-1',
    creator_name: 'Sarah Chen',
    package_name: 'Studio Pro Plan',
    rating: 5,
    title: 'Cut our client delivery time in half',
    comment:
      'We moved our entire agency portfolio workflow to this platform. The visual canvas is blazing fast and our clients love the built-in appointment scheduler.',
  },
  {
    id: 'rev-2',
    creator_name: 'Liam Gallagher',
    package_name: 'E-commerce Plan',
    rating: 5,
    title: 'Sold $12k of digital assets in month one',
    comment:
      'Frictionless checkout and instant digital file delivery without paying 30% marketplace cuts. The live analytics dashboard gives us exact conversion stats.',
  },
  {
    id: 'rev-3',
    creator_name: 'Elena Rostova',
    package_name: 'Creator Starter',
    rating: 5,
    title: 'The cleanest typography and themes',
    comment:
      'As a creative director, aesthetic precision is everything. Every theme feels bespoke and the mobile responsive breakpoints are flawless.',
  },
  {
    id: 'rev-4',
    creator_name: 'David Okafor',
    package_name: 'Enterprise Agency',
    rating: 5,
    title: 'Live chat turned our visitors into leads',
    comment:
      'Having live chat, WhatsApp messaging, and appointment booking integrated directly into our site increased our discovery call volume by over 140%.',
  },
];

export default function Reviews() {
  const { reviews = [] } = useContext(Context) || {};

  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold uppercase tracking-wider">
            <BiStar className="text-amber-500 text-sm fill-current" />
            <span>Verified Social Proof</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            Trusted by creators, agencies, and online stores worldwide
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Discover how creative professionals and modern businesses use our platform to build their online authority, sell products, and streamline operations.
          </p>

          {/* Aggregate Rating Pill */}
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex text-amber-400 text-base">
              {[...Array(5)].map((_, i) => (
                <BiStar key={i} className="fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">4.9 / 5.0 Average Rating</span>
            <span className="text-xs text-slate-400">&bull; 950+ Verified Reviews</span>
          </div>
        </div>

        {/* Reviews Horizontal Scrolling Carousel / Row */}
        <div className="w-full overflow-x-auto pb-4 pt-2 px-1 scrollbar-none flex flex-row gap-5 justify-start md:justify-center">
          {displayReviews.slice(0, 6).map((r) => (
            <Review key={r.id} review={r} />
          ))}
        </div>

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