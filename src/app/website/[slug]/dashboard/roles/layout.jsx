'use client';

import Link from 'next/link';
import { use } from 'react';
import { BiChevronRight, BiShield } from 'react-icons/bi';

export default function RolesLayout({ children, params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            href={`/website/${slug}/dashboard`}
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <BiChevronRight className="text-slate-400 text-sm" />
          <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
            <BiShield className="text-indigo-500 text-base" /> Roles & Module Permissions
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
