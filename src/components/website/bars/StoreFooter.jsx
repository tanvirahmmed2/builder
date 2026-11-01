'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';

export default function StoreFooter() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const siteName = website?.settings?.site_name || website?.name || 'Store';
  const tagline = website?.settings?.tagline || 'Powered by Next-Gen Multi-Type SaaS Engine';

  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                {siteName.charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-bold text-white">{siteName}</span>
            </div>
            <p className="max-w-md text-sm text-slate-400">{tagline}</p>
            {website?.settings?.contact_email && (
              <p className="text-xs text-slate-500">Contact: {website.settings.contact_email}</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${basePrefix}/products`} className="hover:text-white transition-colors">
                  Catalog
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/about`} className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/blogs`} className="hover:text-white transition-colors">
                  Blog & News
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/faqs`} className="hover:text-white transition-colors">
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / User Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Customer</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`${basePrefix}/user/control`} className="hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/privacy-policy`} className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/contacts`} className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href={`${basePrefix}/panel/control/overview`} className="hover:text-blue-400 transition-colors">
                  Staff Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Multi-Tenant SaaS Architecture</p>
        </div>
      </div>
    </footer>
  );
}

