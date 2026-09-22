'use client';

import { use, useEffect, useState } from 'react';
import WebsiteNavbar from '@/components/website/bars/WebsiteNavbar';
import WebsiteFooter from '@/components/website/bars/WebsiteFooter';

export default function WebsiteLoginLayout({ children, params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || '';

  const [website, setWebsite] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error('Error loading website in login layout:', err));
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <WebsiteNavbar website={website} />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>
      <WebsiteFooter website={website} />
    </div>
  );
}
