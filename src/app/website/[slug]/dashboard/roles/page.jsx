'use client';

import { use } from 'react';
import WebsiteRolesManager from '@/components/website/forms/WebsiteRolesManager';

export default function RolesPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  return (
    <div className="space-y-6">
      <WebsiteRolesManager slug={slug} />
    </div>
  );
}
