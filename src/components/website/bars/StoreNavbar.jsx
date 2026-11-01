'use client';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { WebsiteContext, useTenantBasePrefix } from '@/components/website/context/WebsiteContext';
import {
  BiShoppingBag,
  BiSun,
  BiMoon,
  BiUser,
  BiMenu,
  BiX,
  BiChevronRight
} from 'react-icons/bi';

export default function StoreNavbar() {
  const { website, theme, toggleTheme, cart = [] } = useContext(WebsiteContext) || {};
  const params = useParams();
  const pathname = usePathname();
  const domain = params?.domain || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const basePrefix = useTenantBasePrefix();
  const siteName = website?.settings?.site_name || website?.name || 'Store';
  const siteType = website?.website_type || 'ecommerce';

  const navLinks = [
    { label: 'Home', href: `${basePrefix}/` },
    ...(siteType === 'ecommerce'
      ? [
          { label: 'Products', href: `${basePrefix}/products` },
          { label: 'About', href: `${basePrefix}/about` }
        ]
      : []),
    ...(siteType === 'restaurant'
      ? [
          { label: 'Menu', href: `${basePrefix}/products` },
          { label: 'Reservation', href: `${basePrefix}/appointments` }
        ]
      : []),
    ...(siteType === 'portfolio'
      ? [
          { label: 'Projects', href: `${basePrefix}/products` },
          { label: 'Services', href: `${basePrefix}/services` },
          { label: 'About', href: `${basePrefix}/about` }
        ]
      : []),
    ...(siteType === 'organization'
      ? [
          { label: 'Team', href: `${basePrefix}/about` },
          { label: 'Careers', href: `${basePrefix}/services` }
        ]
      : []),
    { label: 'Blogs', href: `${basePrefix}/blogs` },
    { label: 'Contact', href: `${basePrefix}/contacts` },
    { label: 'FAQs', href: `${basePrefix}/faqs` }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <Link href={`${basePrefix}/`} className="flex items-center gap-2.5">
          {website?.settings?.logo_url ? (
            <img src={website.settings.logo_url} alt={siteName} className="h-9 w-auto rounded object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-md shadow-blue-500/20">
              {siteName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-white">{siteName}</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Theme toggler */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <BiSun className="text-lg" /> : <BiMoon className="text-lg" />}
          </button>

          {/* Cart button */}
          <Link
            href={`${basePrefix}/cart`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            title="Shopping Cart"
          >
            <BiShoppingBag className="text-lg" />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Customer Portal Link */}
          <Link
            href={`${basePrefix}/user/control`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:text-white"
          >
            <BiUser className="text-sm" />
            <span className="hidden sm:inline">Account</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 md:hidden"
          >
            {mobileMenuOpen ? <BiX className="text-xl" /> : <BiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <span>{link.label}</span>
                <BiChevronRight className="text-slate-500" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

