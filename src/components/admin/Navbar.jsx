'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ShieldCheckIcon,
  LayoutGridIcon,
  BoxIcon,
  UsersIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
} from '@/components/ui/Icons';

export default function AdminNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutGridIcon, exact: true },
    { href: '/admin/admins', label: 'Admin Team', icon: UsersIcon },
    { href: '/admin/packages', label: 'Packages & Features', icon: BoxIcon },
    { href: '/admin/subscriptions', label: 'Subscriptions & Pay', icon: ShieldCheckIcon },
    { href: '/admin/reports', label: 'Reports Helpdesk', icon: AlertCircleIcon },
  ];

  const isLinkActive = (link) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-500/20 bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-rose-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-tight flex items-center gap-1.5">
                Admin Center
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  SUPER
                </span>
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-rose-300/70">
                Multi-Tenant Governance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold shadow-sm shadow-rose-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right CTA & Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-full text-[11px] text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="font-mono font-bold">ROOT ADMIN</span>
          </div>

          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
            title="Switch to Creator Workspace"
          >
            <LayoutGridIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Creator Portal</span>
          </Link>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
            title="View Platform Landing Page"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Home</span>
          </Link>

          <Link
            href="/admin/login"
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all"
          >
            Sign In / Out
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950 px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  active
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-rose-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300 flex items-center gap-2"
            >
              <LayoutGridIcon className="w-4 h-4 text-emerald-400" />
              <span>Creator Workspace</span>
            </Link>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300 flex items-center gap-2"
            >
              <ExternalLinkIcon className="w-4 h-4 text-indigo-400" />
              <span>Platform Home</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
