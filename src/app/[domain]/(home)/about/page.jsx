'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiAward, BiShieldCheck, BiGroup, BiRocket } from 'react-icons/bi';

export default function StoreAboutPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const siteName = website?.settings?.site_name || website?.name || 'Our Company';
  const description =
    website?.settings?.description ||
    'We are dedicated to delivering world-class quality, reliability, and seamless digital experiences across every customer touchpoint.';

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">About Us</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Crafting Excellence at {siteName}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {[
          { icon: BiShieldCheck, title: 'Trusted Quality', desc: 'Enterprise-grade reliability and vetted standards in every release.' },
          { icon: BiRocket, title: 'Fast Delivery', desc: 'Seamless logistics and hyper-responsive customer fulfillment.' },
          { icon: BiGroup, title: 'Customer First', desc: '24/7 dedicated assistance ensuring complete user satisfaction.' },
          { icon: BiAward, title: 'Proven Results', desc: 'Consistently rated high by verified clients and industry partners.' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-3 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <item.icon className="text-2xl" />
            </div>
            <h3 className="font-bold text-white text-base">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-8 sm:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to partner with us?</h2>
        <p className="mt-2 text-sm text-slate-300">
          Get in touch today to explore products, custom inquiries, or corporate solutions.
        </p>
        <Link
          href={`${basePrefix}/contacts`}
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
}

