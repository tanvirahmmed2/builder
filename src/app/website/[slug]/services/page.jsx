'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import TenantServices from '@/components/website/cards/TenantServices';
import { BiLoaderAlt, BiCalendar, BiLayer } from 'react-icons/bi';

export default function PublicServicesPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Services...</p>
      </div>
    );
  }

  const { website, services = [] } = data || {};
  const primaryColor = website?.settings?.primary_color || '#6366f1';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span
          className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white inline-block"
          style={{ backgroundColor: primaryColor }}
        >
          Our Offerings
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Services & Consultation Packages
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tailored solutions designed to help you scale, build, and optimize your business goals.
        </p>
      </div>

      {/* Services List */}
      {services.length > 0 ? (
        <TenantServices
          services={services}
          primaryColor={primaryColor}
        />
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiLayer className="mx-auto text-4xl text-slate-400 mb-2" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No services listed currently</h3>
          <p className="text-xs text-slate-400 mt-1">Please check back soon for updated offerings.</p>
        </div>
      )}

      {/* Booking CTA Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
        <h2 className="text-2xl sm:text-3xl font-black">Need a custom scope or partnership?</h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          We offer bespoke consulting engagements and custom enterprise solutions tailored to your unique specifications.
        </p>
        <div>
          <Link
            href={`/website/${slug}/appointments`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <BiCalendar className="text-base" />
            <span>Book an Introductory Call</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
