'use client';

import Link from 'next/link';
import { BiShieldQuarter } from 'react-icons/bi';

export default function TenantFooter({ website }) {
  const settings = website?.settings || {};
  const siteTitle = settings.site_title || website?.name || 'Studio Brand';
  const primaryColor = settings.primary_color || website?.theme_config?.primaryColor || '#6366f1';
  const subdomain = website?.subdomain || 'site';
  const socialLinks = settings.social_links || {};

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {siteTitle}
            </h3>
            <p className="text-slate-500 max-w-sm text-xs">
              {settings.tagline || 'Custom built flagship portfolio & digital e-commerce website.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-slate-900 dark:hover:text-white transition-colors">Services</a>
            <a href="#experiences" className="hover:text-slate-900 dark:hover:text-white transition-colors">Experience</a>
            <a href="#products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Store</a>
            <a href="#gallery" className="hover:text-slate-900 dark:hover:text-white transition-colors">Gallery</a>
            <a href="#blogs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a>
            <a href="#appointments" className="hover:text-slate-900 dark:hover:text-white transition-colors">Book</a>
            <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} {siteTitle}. Powered by{' '}
            <strong className="text-slate-700 dark:text-slate-200 font-semibold">Multi-Tenant Platform</strong>.
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/website/${subdomain}/dashboard`}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              <BiShieldQuarter />
              <span>Owner Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
