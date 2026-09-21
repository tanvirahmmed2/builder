'use client';

import { use, useEffect, useState } from 'react';
import WebsiteNavbar from '@/components/website/bars/WebsiteNavbar';
import WebsiteFooter from '@/components/website/bars/WebsiteFooter';

export default function SupportPublicLayout({ children, params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [website, setWebsite] = useState(null);

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error(err));
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <WebsiteNavbar website={website} />
      <div className="flex-1">
        {children}
      </div>
      <WebsiteFooter website={website} />
    </div>
  );
}
