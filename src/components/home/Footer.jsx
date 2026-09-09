'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  BoxIcon,
  LayoutGridIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  StarIcon,
} from '@/components/ui/Icons';

export default function HomeFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 backdrop-blur-2xl text-slate-400">
      {/* Top Newsletter / Banner Bar */}
      <div className="border-b border-white/5 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              Ready to launch your multi-tenant portfolio?
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Instant Provisioning
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Create an account, pick your plan, and have your custom portfolio site live in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creator/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <span>Get Started Now</span>
              <span>→</span>
            </Link>
            <Link
              href="/sites/alex-design"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>View Demo Site</span>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-pink-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base leading-tight tracking-tight">PortfolioCraft</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Multi-Tenant SaaS</span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation portfolio builder engineered with PostgreSQL multi-tenant isolation, real-time visual drag-and-drop studio, interactive booking, verified client reviews, and role-based access control for Creators and Managers.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Systems Operational</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-500">PostgreSQL Ready</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product & Studio</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/builder/d0000000-0000-0000-0000-000000000001" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <BoxIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Visual Canvas Builder</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <LayoutGridIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Creator Workspace</span>
                </Link>
              </li>
              <li>
                <Link href="/sites/alex-design" target="_blank" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ExternalLinkIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Live Demo Portfolio</span>
                </Link>
              </li>
              <li>
                <Link href="/creator/register" className="hover:text-white transition-colors">
                  Pricing Plans & Packages
                </Link>
              </li>
              <li>
                <Link href="/dashboard/blog" className="hover:text-white transition-colors">
                  Blog & Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Tenant Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tenant Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/appointments" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Appointment Booking</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/experiences" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Experience Timeline</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reviews" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <StarIcon className="w-3.5 h-3.5 text-amber-400" filled />
                  <span>Verified Reviews Moderation</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/team" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Creator & Manager Roles</span>
                </Link>
              </li>
              <li>
                <Link href="/creator/checkout" className="hover:text-white transition-colors">
                  Package Subscription Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administration</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 text-rose-400">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>Super Admin Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/packages" className="hover:text-white transition-colors">
                  Package Management
                </Link>
              </li>
              <li>
                <Link href="/admin/subscriptions" className="hover:text-white transition-colors">
                  Subscriptions & Billing
                </Link>
              </li>
              <li>
                <Link href="/admin/reports" className="hover:text-white transition-colors">
                  Issue Reports Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Admin Gateway Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PortfolioCraft SaaS. Multi-tenant portfolio infrastructure.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/creator/register" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/creator/register" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/admin/reports" className="hover:text-slate-300 transition-colors">
              Support & Reports
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
