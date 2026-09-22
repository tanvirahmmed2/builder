'use client';

import { use } from 'react';
import { WebsiteProvider } from '@/components/website/context/WebsiteContext';

export default function TenantWebsiteLayout({ children, params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || '';

  return (
    <WebsiteProvider slug={slug}>
      {children}
    </WebsiteProvider>
  );
}
