'use client';

import { use, useEffect, useState } from 'react';
import TenantExperiences from '@/components/website/cards/TenantExperiences';
import { BiLoaderAlt } from 'react-icons/bi';

export default function PublicExperiencesPage({ params }) {
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
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Experience...</p>
      </div>
    );
  }

  const { website, experiences = [], skills = [] } = data || {};
  const primaryColor = website?.settings?.primary_color || '#6366f1';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span
          className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white inline-block"
          style={{ backgroundColor: primaryColor }}
        >
          Track Record
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Career Path & Core Competencies
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A chronology of roles held, companies advised, and technical proficiencies developed.
        </p>
      </div>

      {/* Experience & Skills */}
      <TenantExperiences
        experiences={experiences}
        skills={skills}
        primaryColor={primaryColor}
      />
    </div>
  );
}
