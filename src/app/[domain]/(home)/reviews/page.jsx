'use client';
import React, { useContext } from 'react';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiStar } from 'react-icons/bi';

export default function StoreReviewsPage() {
  const { website } = useContext(WebsiteContext) || {};
  const siteName = website?.settings?.site_name || website?.name || 'Our Store';

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Testimonials</span>
        <h1 className="text-4xl font-extrabold text-white">Client & Customer Reviews</h1>
        <p className="text-sm text-slate-400">Verified feedback and ratings from customers of {siteName}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Sarah Jenkins', role: 'Verified Customer', text: 'Exceptional service and top quality. The items arrived quickly and exceeded all my expectations.', rating: 5 },
          { name: 'Michael Chang', role: 'Enterprise Client', text: 'Flawless communication and smooth delivery. Truly enterprise-grade capability.', rating: 5 },
          { name: 'Elena Rostova', role: 'Retail Shopper', text: 'Love the clean design, fast checkout, and responsive support. Will definitely order again.', rating: 5 }
        ].map((rev, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[...Array(rev.rating)].map((_, idx) => (
                  <BiStar key={idx} />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.text}"</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <h4 className="font-semibold text-white text-sm">{rev.name}</h4>
              <p className="text-[11px] text-slate-500">{rev.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

