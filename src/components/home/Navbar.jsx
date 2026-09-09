'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheckIcon, ExternalLinkIcon, LayoutGridIcon, BoxIcon } from '@/components/ui/Icons';

export default function HomeNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base leading-tight tracking-tight">PortfolioCraft</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Multi-Tenant SaaS</span>
            </div>
          </Link>

          {/* Marketing Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/sites/alex-design" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Live Tenant Demo</span>
              <ExternalLinkIcon className="w-3 h-3 text-pink-400" />
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1 text-slate-300">
              <LayoutGridIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Creator Workspace</span>
            </Link>
            <Link href="/builder/d0000000-0000-0000-0000-000000000001" className="hover:text-white transition-colors flex items-center gap-1 text-slate-300">
              <BoxIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Drag & Drop Builder</span>
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-1 text-slate-400">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Gateway</span>
            </Link>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/creator/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            Creator Sign In
          </Link>

          <Link
            href="/creator/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
          >
            Get Started Free →
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 py-3 space-y-2">
          <Link
            href="/sites/alex-design"
            target="_blank"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
          >
            <span>Live Tenant Demo</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            <LayoutGridIcon className="w-4 h-4 text-emerald-400" />
            <span>Creator Workspace</span>
          </Link>
          <Link
            href="/builder/d0000000-0000-0000-0000-000000000001"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            <BoxIcon className="w-4 h-4 text-amber-400" />
            <span>Canvas Builder</span>
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            <ShieldCheckIcon className="w-4 h-4 text-rose-400" />
            <span>Admin Gateway</span>
          </Link>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/creator/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-center text-xs font-semibold text-slate-300 bg-white/5"
            >
              Creator Sign In
            </Link>
            <Link
              href="/creator/register"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-center text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
