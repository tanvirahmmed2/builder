'use client';
import React, { useContext } from 'react';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiBuildingHouse, BiLinkExternal } from 'react-icons/bi';

export default function StorePartnersPage() {
  const { website } = useContext(WebsiteContext) || {};
  const siteName = website?.settings?.site_name || website?.name || 'Our Company';

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Ecosystem</span>
        <h1 className="text-4xl font-extrabold text-white">Our Partners & Collaborators</h1>
        <p className="text-sm text-slate-400">Strategic relationships driving technology, supply chain, and innovation with {siteName}.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: 'CloudScale Infrastructure', type: 'Technology Partner' },
          { name: 'Apex Logistics Global', type: 'Fulfillment Partner' },
          { name: 'SecurePay Networks', type: 'Payment Processing' },
          { name: 'Vanguard Media Labs', type: 'Creative Agency' }
        ].map((p, i) => (
          <div key={i} className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 p-8 text-center hover:bg-slate-900/80 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-3 border border-blue-500/20">
              <BiBuildingHouse className="text-2xl" />
            </div>
            <h4 className="font-bold text-white text-sm">{p.name}</h4>
            <p className="text-[11px] text-slate-500 mt-1">{p.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

