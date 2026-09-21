'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BiMenu,
  BiX,
  BiShoppingBag,
  BiCalendar,
  BiShieldQuarter,
} from 'react-icons/bi';

export default function WebsiteNavbar({ website, onOpenCart, cartCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const settings = website?.settings || {};
  const siteTitle = settings.site_title || website?.name || 'Creator Studio';
  const primaryColor = settings.primary_color || website?.theme_config?.primaryColor || '#6366f1';
  const subdomain = website?.subdomain || 'site';

  const navLinks = [
    { label: 'Home', href: `/website/${subdomain}` },
    { label: 'Services', href: `/website/${subdomain}/services` },
    { label: 'Experience', href: `/website/${subdomain}/experiences` },
    { label: 'Products', href: `/website/${subdomain}/products` },
    { label: 'Gallery', href: `/website/${subdomain}/gallery` },
    { label: 'Blog', href: `/website/${subdomain}/blogs` },
    { label: 'Appointments', href: `/website/${subdomain}/appointments` },
    { label: 'Contact', href: `/website/${subdomain}/contact` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href={`/website/${subdomain}`} className="flex items-center gap-2.5 group">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={siteTitle}
              className="h-8 w-auto object-contain rounded-md"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {siteTitle.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight group-hover:opacity-90">
            {siteTitle}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Quick Actions (Cart, Book, Dashboard) */}
        <div className="flex items-center gap-2.5">
          {/* Cart Trigger */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Cart"
            >
              <BiShoppingBag className="text-lg" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white leading-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Book Quick CTA */}
          <Link
            href={`/website/${subdomain}/appointments`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs transition-transform hover:scale-102"
            style={{ backgroundColor: primaryColor }}
          >
            <BiCalendar className="text-sm" />
            <span>Book Now</span>
          </Link>

          {/* Website Dashboard Shortcut */}
          <Link
            href={`/website/${subdomain}/dashboard`}
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Website Owner Management"
          >
            <BiShieldQuarter className="text-sm" />
            <span>Dashboard</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <BiX className="text-2xl" /> : <BiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href={`/website/${subdomain}/appointments`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              Book an Appointment
            </Link>
            <Link
              href={`/website/${subdomain}/dashboard`}
              className="w-full text-center py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              Website Owner Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
