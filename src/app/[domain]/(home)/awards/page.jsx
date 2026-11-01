'use client';
import React, { useContext } from 'react';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiAward, BiTrophy, BiMedal } from 'react-icons/bi';

export default function StoreAwardsPage() {
  const { website } = useContext(WebsiteContext) || {};
  const siteName = website?.settings?.site_name || website?.name || 'Our Company';

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Honors</span>
        <h1 className="text-4xl font-extrabold text-white">Awards & Recognition</h1>
        <p className="text-sm text-slate-400">Industry accolades celebrating innovation and quality at {siteName}.</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: BiTrophy, title: 'Excellence in Digital Innovation', year: '2025', org: 'Global Tech Summit', desc: 'Recognized for pioneering multi-tenant architecture and rapid fulfillment.' },
          { icon: BiAward, title: 'Best Customer Satisfaction', year: '2024', org: 'Retail & Service Association', desc: 'Awarded highest score in verified client reviews and retention.' },
          { icon: BiMedal, title: 'Sustainable Operations Leader', year: '2024', org: 'Green Commerce Initiative', desc: 'Commended for eco-friendly packaging and carbon-offset logistics.' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <item.icon className="text-2xl" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{item.title}</h3>
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">{item.year}</span>
              </div>
              <p className="text-xs text-blue-400 mt-0.5">{item.org}</p>
              <p className="text-xs text-slate-400 mt-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

