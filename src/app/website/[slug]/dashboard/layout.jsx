'use client';

import { use, useEffect, useState } from 'react';
import WebsiteDashboardNav from '@/components/website/bars/WebsiteDashboardNav';
import WebsiteDashboardSidebar from '@/components/website/bars/WebsiteDashboardSidebar';
import { BiLoaderAlt } from 'react-icons/bi';

export default function WebsiteDashboardLayout({ children, params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/webites/${slug}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setWebsite(data.website);
        }
      })
      .catch((err) => console.error('Error fetching dashboard layout info:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading && !website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 gap-3">
        <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <WebsiteDashboardNav website={website} slug={slug} />
      <div className="flex-1 flex overflow-hidden">
        <WebsiteDashboardSidebar slug={slug} website={website} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
