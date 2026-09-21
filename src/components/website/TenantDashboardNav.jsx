'use client';

import Link from 'next/link';
import { BiDesktop, BiGlobe, BiLinkExternal, BiShieldQuarter } from 'react-icons/bi';

export default function TenantDashboardNav({ website }) {
  const settings = website?.settings || {};
  const siteTitle = settings.site_title || website?.name || 'My Website';
  const subdomain = website?.subdomain || 'site';
  const customDomain = website?.custom_domain;
  const primaryColor = settings.primary_color || '#6366f1';

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs"
          style={{ backgroundColor: primaryColor }}
        >
          {siteTitle.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {siteTitle}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase">
              Tenant Portal
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block">
            {subdomain}.saasplatform.com
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <a
          href={`/website/${subdomain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>Live Site</span>
          <BiLinkExternal className="text-sm text-slate-400" />
        </a>

        {customDomain && (
          <a
            href={`https://${customDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium items-center gap-1"
          >
            <BiGlobe className="text-sm text-emerald-600" />
            <span>{customDomain}</span>
          </a>
        )}
      </div>
    </header>
  );
}
