'use client';

import { use } from 'react';
import TenantRolesManager from '@/components/website/forms/TenantRolesManager';

export default function RolesPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  return (
    <div className="space-y-6">
      <TenantRolesManager slug={slug} />
    </div>
  );
}
